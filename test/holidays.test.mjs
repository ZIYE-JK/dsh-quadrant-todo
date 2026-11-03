/** 法定工作日：解析、缓存、年度刷新，以及注入后对「工作日」重复的影响。 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  createHolidayService, parseYearDoc, isWeekdayByCalendar, firstWorkdayOfDecember, dateKeyOf,
} from '../lib/holidays.js'
import { setWorkdayTables, isWorkday, isDueOn } from '../lib/repeat.js'

/** 2026 的真实国务院安排（节选）：元旦 1/1-1/3 放假，1/4 调休上班（周日）。 */
const DOC_2026 = {
  year: 2026,
  papers: ['https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm'],
  days: [
    { name: '元旦', date: '2026-01-01', isOffDay: true },
    { name: '元旦', date: '2026-01-02', isOffDay: true },
    { name: '元旦', date: '2026-01-03', isOffDay: true },
    { name: '元旦', date: '2026-01-04', isOffDay: false },
    { name: '劳动节', date: '2026-05-01', isOffDay: true },
    { name: '劳动节', date: '2026-05-09', isOffDay: false },
  ],
}

/** 2027 的示意数据：解析器会按年份过滤，所以日期必须真的是 2027 年。 */
const DOC_2027 = {
  year: 2027,
  papers: ['https://www.gov.cn/zhengce/zhengceku/202611/content_0000000.htm'],
  days: [
    { name: '元旦', date: '2027-01-01', isOffDay: true },
    { name: '元旦', date: '2027-01-02', isOffDay: true },
    { name: '元旦', date: '2027-01-03', isOffDay: true },
    { name: '劳动节', date: '2027-05-01', isOffDay: true },
    { name: '劳动节', date: '2027-05-08', isOffDay: false },
  ],
}

const silent = { info() {}, warn() {} }

async function makeFile(doc) {
  const dir = await mkdtemp(join(tmpdir(), 'todo-holiday-'))
  const file = join(dir, 'holidays.json')
  if (doc !== undefined) await writeFile(file, JSON.stringify(doc), 'utf8')
  return file
}

/** 记录调用次数的假 fetch。 */
function fakeFetch(handler) {
  const calls = []
  const impl = async (url) => {
    calls.push(url)
    const body = handler(url)
    if (body === undefined) return { ok: false, status: 404, json: async () => null }
    return { ok: true, status: 200, json: async () => body }
  }
  impl.calls = calls
  return impl
}

test.afterEach(() => { setWorkdayTables(null) })   // 不让注入的表漏到别的用例

// ------------------------------------------------- 纯函数

test('parseYearDoc accepts the published shape and rejects mismatched years', () => {
  const parsed = parseYearDoc(DOC_2026, 2026)
  assert.deepEqual(parsed.holiday, ['2026-01-01', '2026-01-02', '2026-01-03', '2026-05-01'])
  assert.deepEqual(parsed.makeup, ['2026-01-04', '2026-05-09'])
  assert.equal(parsed.papers.length, 1)
  assert.equal(parseYearDoc(DOC_2026, 2027), null, 'year mismatch is not usable')
  assert.equal(parseYearDoc({ year: 2026 }, 2026), null, 'missing days')
  assert.equal(parseYearDoc(null), null)
})

test('parseYearDoc drops dates that do not belong to the declared year', () => {
  const parsed = parseYearDoc({ year: 2026, days: [{ date: '2027-01-01', isOffDay: true }, { date: 'nonsense', isOffDay: true }] }, 2026)
  assert.deepEqual(parsed.holiday, [])
})

test('weekend rule: Monday-Friday', () => {
  assert.equal(isWeekdayByCalendar('2026-11-02'), true)   // 周一
  assert.equal(isWeekdayByCalendar('2026-11-06'), true)   // 周五
  assert.equal(isWeekdayByCalendar('2026-11-07'), false)  // 周六
  assert.equal(isWeekdayByCalendar('2026-11-08'), false)  // 周日
})

test('firstWorkdayOfDecember lands on the first December workday', () => {
  // 12/1 是周二
  assert.equal(firstWorkdayOfDecember(2026, isWeekdayByCalendar), '2026-12-01')
  // 假设 12/1-12/3 放假，则应跳到 12/4（周五）
  const fake = (k) => ['2026-12-01', '2026-12-02', '2026-12-03'].includes(k) ? false : isWeekdayByCalendar(k)
  assert.equal(firstWorkdayOfDecember(2026, fake), '2026-12-04')
})

// ------------------------------------------------- 注入后影响重复展开

test('a weekday holiday is skipped and a weekend makeup day is worked', () => {
  setWorkdayTables({ holidays: ['2026-01-01', '2026-01-02'], makeups: ['2026-01-04'] })
  assert.equal(isWorkday('2026-01-01'), false, '元旦放假，即使是周四')
  assert.equal(isWorkday('2026-01-02'), false)
  assert.equal(isWorkday('2026-01-04'), true, '调休上班，即使是周日')
  assert.equal(isWorkday('2026-01-05'), true, '普通周一')
})

test('workday recurrence expands against the injected calendar', () => {
  setWorkdayTables({ holidays: ['2026-01-01', '2026-01-02'], makeups: ['2026-01-04'] })
  const todo = { id: 't', title: '日报', dueDate: '2026-01-01', repeat: { freq: 'workday' }, completions: {} }
  assert.equal(isDueOn(todo, '2026-01-01'), false, 'holiday')
  assert.equal(isDueOn(todo, '2026-01-04'), true, 'makeup Sunday')
})

test('with no tables injected, workday is plain Monday-Friday', () => {
  setWorkdayTables(null)
  assert.equal(isWorkday('2026-01-01'), true, 'a Thursday falls back to the weekend rule')
  assert.equal(isWorkday('2026-01-04'), false, 'a Sunday falls back to the weekend rule')
})

// ------------------------------------------------- 服务：缓存与刷新

test('ensure fetches the current year when the cache is empty', async () => {
  const file = await makeFile()
  const impl = fakeFetch(() => DOC_2026)
  const svc = createHolidayService({ file, logger: silent, fetchImpl: impl, now: () => new Date(2026, 10, 3, 12, 0) })
  await svc.load()
  const res = await svc.ensure(new Date(2026, 10, 3, 12, 0))

  assert.equal(res.actions.length, 1)
  assert.equal(res.actions[0].ok, true)
  assert.equal(res.actions[0].year, 2026)
  assert.equal(impl.calls.length, 1)
  assert.equal(svc.status().currentYearLoaded, true)
  // 落盘了
  const written = JSON.parse(await readFile(file, 'utf8'))
  assert.ok(written.years['2026'].updatedAt, 'timestamp recorded')
  assert.equal(written.years['2026'].holiday.length, 4)
})

test('the cached table is used on the next load without any network call', async () => {
  const file = await makeFile()
  const first = fakeFetch(() => DOC_2026)
  const svc1 = createHolidayService({ file, logger: silent, fetchImpl: first, now: () => new Date(2026, 10, 3, 12, 0) })
  await svc1.load()
  await svc1.ensure(new Date(2026, 10, 3, 12, 0))

  const second = fakeFetch(() => DOC_2026)
  const svc2 = createHolidayService({ file, logger: silent, fetchImpl: second, now: () => new Date(2026, 10, 3, 12, 0) })
  await svc2.load()
  await svc2.ensure(new Date(2026, 10, 3, 12, 0))
  assert.equal(second.calls.length, 0, 'no fetch when the year is already cached')
  assert.equal(svc2.isWorkday('2026-01-01'), false, 'the cached holiday still applies')
})

// ------------------------------------------------- 年度刷新（核心需求）

test('on the first workday of December it fetches NEXT year, and never before', async () => {
  const file = await makeFile()
  const impl = fakeFetch((url) => (url.includes('/2027.json') ? DOC_2027 : DOC_2026))
  const svc = createHolidayService({ file, logger: silent, fetchImpl: impl, now: () => new Date(2026, 11, 1) })
  await svc.load()
  // 先补当年
  await svc.ensure(new Date(2026, 10, 3, 12, 0))
  const afterNovember = impl.calls.length

  // 11 月 30 日：不该抓次年
  await svc.ensure(new Date(2026, 10, 30, 12, 0))
  assert.equal(impl.calls.length, afterNovember, 'nothing fetched in November')

  // 12 月的第一个工作日（12/1 是周二）：抓次年
  const res = await svc.ensure(new Date(2026, 11, 1, 9, 0))
  assert.equal(res.actions.length, 1)
  assert.equal(res.actions[0].year, 2027)
  assert.ok(impl.calls.some((u) => u.includes('/2027.json')), 'requested next year')
  assert.equal(svc.status().years['2027'].holiday, 4)
})

test('a second run the same day does not re-fetch next year', async () => {
  const file = await makeFile()
  const impl = fakeFetch((url) => (url.includes('/2027.json') ? DOC_2027 : DOC_2026))
  const at = new Date(2026, 11, 1, 9, 0)
  const svc = createHolidayService({ file, logger: silent, fetchImpl: impl, now: () => at })
  await svc.load()
  await svc.ensure(at)
  const n = impl.calls.length
  await svc.ensure(new Date(2026, 11, 1, 18, 0))
  assert.equal(impl.calls.length, n, 'next year already cached, no repeat fetch')
})

test('a failed fetch keeps the old cache, records the error, and never throws', async () => {
  const file = await makeFile()
  const good = fakeFetch(() => DOC_2026)
  const svc = createHolidayService({ file, logger: silent, fetchImpl: good, now: () => new Date(2026, 10, 3, 12, 0) })
  await svc.load()
  await svc.ensure(new Date(2026, 10, 3, 12, 0))
  assert.equal(svc.isWorkday('2026-01-01'), false)

  // 次年抓取全失败（两个源都 404）
  const broken = fakeFetch(() => undefined)
  const svc2 = createHolidayService({ file, logger: silent, fetchImpl: broken, now: () => new Date(2026, 11, 1, 9, 0) })
  await svc2.load()
  const res = await svc2.ensure(new Date(2026, 11, 1, 9, 0))
  assert.equal(res.actions[0].ok, false)
  assert.ok(res.lastError, 'error recorded')
  assert.equal(svc2.isWorkday('2026-01-01'), false, 'the existing year is still applied')
  assert.equal(broken.calls.length, 2, 'tried both sources')
})

test('failed fetches back off instead of hammering the network', async () => {
  const file = await makeFile()
  const impl = fakeFetch(() => undefined)
  const svc = createHolidayService({ file, logger: silent, fetchImpl: impl, now: () => new Date(2026, 10, 3, 12, 0) })
  await svc.load()
  await svc.ensure(new Date(2026, 10, 3, 12, 0))
  const afterFirst = impl.calls.length
  // 一小时后（小时巡检会走到这里）：仍在退避窗口内
  await svc.ensure(new Date(2026, 10, 3, 13, 0))
  assert.equal(impl.calls.length, afterFirst, 'no retry within the backoff window')
  // 超过 6 小时后：重试
  await svc.ensure(new Date(2026, 10, 3, 19, 0))
  assert.ok(impl.calls.length > afterFirst, 'retries after the window')
})

test('a corrupt cache file starts empty rather than breaking the plugin', async () => {
  const file = await makeFile({ years: 'nonsense' })
  const svc = createHolidayService({ file, logger: silent, fetchImpl: fakeFetch(() => DOC_2026), now: () => new Date(2026, 10, 3, 12, 0) })
  await svc.load()
  assert.equal(svc.status().currentYearLoaded, false)
  assert.equal(svc.isWorkday('2026-11-02'), true, 'falls back to the weekend rule')
})

test('jsDelivr is used when the primary source fails', async () => {
  const file = await makeFile()
  const impl = async (url) => {
    impl.calls.push(url)
    if (url.includes('raw.githubusercontent')) return { ok: false, status: 500, json: async () => null }
    return { ok: true, status: 200, json: async () => DOC_2026 }
  }
  impl.calls = []
  const svc = createHolidayService({ file, logger: silent, fetchImpl: impl, now: () => new Date(2026, 10, 3, 12, 0) })
  await svc.load()
  const res = await svc.ensure(new Date(2026, 10, 3, 12, 0))
  assert.equal(res.actions[0].ok, true)
  assert.ok(impl.calls[1].includes('jsdelivr'), 'fell back to the mirror')
  assert.ok(svc.status().years['2026'].source.includes('jsdelivr'))
})

test('status reports what the UI needs', async () => {
  const file = await makeFile()
  const svc = createHolidayService({ file, logger: silent, fetchImpl: fakeFetch(() => DOC_2026), now: () => new Date(2026, 10, 3, 12, 0) })
  await svc.load()
  await svc.ensure(new Date(2026, 10, 3, 12, 0))
  const st = svc.status()
  assert.equal(st.currentYear, 2026)
  assert.equal(st.currentYearLoaded, true)
  assert.equal(st.nextRefreshAfter, '2026-12-01', 'first workday of December')
  assert.equal(st.years['2026'].holiday, 4)
  assert.equal(st.years['2026'].makeup, 2)
})

test('dateKeyOf pads month and day', () => {
  assert.equal(dateKeyOf(new Date(2026, 0, 4)), '2026-01-04')
  assert.equal(dateKeyOf(new Date(2026, 10, 23)), '2026-11-23')
})
