/** v3 time-range tests: start/end block, editability, migration, week-view feed, notify trigger. */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createStore } from '../lib/store.js'
import { createApi } from '../lib/api.js'
import { collectDue } from '../lib/notify.js'

const NOTIFY = { system: true, feishu: false, leadMinutes: 0, overdueDaily: true, quietHours: { enabled: false, start: '22:00', end: '08:00' } }

async function make(doc) {
  const dir = await mkdtemp(join(tmpdir(), 'todo-time-'))
  const file = join(dir, 'todos.json')
  if (doc !== undefined) await writeFile(file, JSON.stringify(doc, null, 2), 'utf8')
  return { store: createStore({ file }), file }
}

/** 大多数用例要一份已加载的空库；迁移用例自己控制 load 的时机。 */
async function fresh(doc) {
  const { store, file } = await make(doc)
  await store.load()
  return { store, file, api: createApi(store) }
}

test('create accepts a start-end block', async () => {
  const { store } = await fresh()
  const t = await store.create({ title: '写周报', dueDate: '2026-11-03', startTime: '08:00', endTime: '09:30' })
  assert.equal(t.startTime, '08:00')
  assert.equal(t.endTime, '09:30')
})

test('a start without an end is allowed (open-ended block)', async () => {
  const { store } = await fresh()
  const t = await store.create({ title: 'x', startTime: '14:00' })
  assert.equal(t.startTime, '14:00')
  assert.equal(t.endTime, null)
})

test('end must be strictly after start', async () => {
  const { store } = await fresh()
  await assert.rejects(() => store.create({ title: 'x', startTime: '10:00', endTime: '10:00' }), /结束时间必须晚于开始时间/)
  await assert.rejects(() => store.create({ title: 'x', startTime: '11:00', endTime: '09:00' }), /结束时间必须晚于开始时间/)
})

test('updating the time after creation works (the reported regression)', async () => {
  const { store, api } = await fresh()
  const t = await store.create({ title: '排期', dueDate: '2026-11-03', dueTime: '11:00' })
  const moved = await api.update({ id: t.id, patch: { startTime: '08:00', endTime: '09:00' } })
  assert.equal(moved.startTime, '08:00')
  assert.equal(moved.endTime, '09:00')
  // only the start changes; the end must survive
  const shifted = await api.update({ id: t.id, patch: { startTime: '07:30' } })
  assert.equal(shifted.startTime, '07:30')
  assert.equal(shifted.endTime, '09:00')
})

test('clearing the block with nulls works', async () => {
  const { store, api } = await fresh()
  const t = await store.create({ title: 'x', startTime: '08:00', endTime: '09:00' })
  const cleared = await api.update({ id: t.id, patch: { startTime: null, endTime: null } })
  assert.equal(cleared.startTime, null)
  assert.equal(cleared.endTime, null)
})

test('a bad end on update is rejected and leaves the record untouched', async () => {
  const { store, api } = await fresh()
  const t = await store.create({ title: 'x', startTime: '08:00', endTime: '09:00' })
  await assert.rejects(() => api.update({ id: t.id, patch: { endTime: '07:00' } }), /结束时间必须晚于开始时间/)
  const rows = (await store.list({})).items
  assert.equal(rows[0].endTime, '09:00', 'failed patch must not corrupt stored state')
})

test('v2 -> v3 migration adds null blocks and sanitizes bad values', async () => {
  const v2 = {
    version: 2,
    todos: [
      { id: 'a', title: '正常', quadrant: null, subtasks: [], dueDate: '2026-11-03', dueTime: '11:00', done: false, completions: {}, repeat: null, createdAt: '2026-11-03T00:00:00.000Z', updatedAt: '2026-11-03T00:00:00.000Z' },
      { id: 'b', title: '坏时间段', quadrant: null, subtasks: [], startTime: '25:99', endTime: 'oops', done: false, completions: {}, repeat: null, createdAt: '2026-11-03T00:00:00.000Z', updatedAt: '2026-11-03T00:00:00.000Z' },
      { id: 'c', title: '倒序', quadrant: null, subtasks: [], startTime: '15:00', endTime: '09:00', done: false, completions: {}, repeat: null, createdAt: '2026-11-03T00:00:00.000Z', updatedAt: '2026-11-03T00:00:00.000Z' },
    ],
    categories: {}, settings: {},
  }
  const { store, file } = await make(v2)
  const res = await store.load()
  assert.equal(res.migrated.from, 2)
  assert.equal(res.migrated.to, 4)
  const byId = Object.fromEntries((await store.list({})).items.map((t) => [t.id, t]))
  assert.equal(byId.a.startTime, '11:00', 'a v2 row with only dueTime gets it folded into startTime')
  assert.equal(byId.a.endTime, null)
  assert.equal(byId.b.startTime, null, 'malformed time is cleared')
  assert.equal(byId.b.endTime, null)
  assert.equal(byId.c.endTime, null, 'reversed range drops the end, keeps the start')
  assert.equal(byId.c.startTime, '15:00')
  const written = JSON.parse(await readFile(file, 'utf8'))
  assert.equal(written.version, 4)
  assert.equal(byId.a.dueTime, null, 'v4 folds dueTime into startTime and stops storing it')
})

test('occurrences feed carries the block for the week view', async () => {
  const { store } = await fresh()
  await store.create({ title: '排期任务', dueDate: '2026-11-03', startTime: '08:00', endTime: '09:30' })
  const { items } = await store.occurrences({ from: '2026-11-01', to: '2026-11-30' })
  const row = items.find((i) => i.title === '排期任务')
  assert.equal(row.date, '2026-11-03')
  assert.equal(row.startTime, '08:00')
  assert.equal(row.endTime, '09:30')
})

test('a recurring task expands every occurrence with its block', async () => {
  const { store } = await fresh()
  await store.create({ title: '每日站会', dueDate: '2026-11-02', startTime: '09:00', endTime: '09:15', repeat: { freq: 'daily' } })
  const { items } = await store.occurrences({ from: '2026-11-02', to: '2026-11-06' })
  assert.equal(items.length, 5)
  for (const it of items) {
    assert.equal(it.startTime, '09:00')
    assert.equal(it.endTime, '09:15')
    assert.ok(it.repeat, 'week view needs repeat to route it to the all-day band')
  }
})

test('a 时间段 fires 到期 at its START (the reminder follows the start, not the end)', async () => {
  // v5 起提醒点 = 开始时间：「09:30–10:00」在 09:30 提醒，不再等到 10:00。
  const item = { id: 't1', title: '排期任务', dueDate: '2026-11-03', startTime: '08:00', endTime: '18:00', bucket: 'today' }
  const at = (h, m) => new Date(2026, 10, 3, h, m, 0)
  assert.equal(collectDue([item], at(7, 59), NOTIFY).length, 0, 'nothing before the block starts')
  const fired = collectDue([item], at(8, 0), NOTIFY)
  assert.equal(fired.length, 1, 'fires the moment the block starts')
  assert.equal(fired[0].kind, 'due')
  assert.equal(fired[0].dueTime, '08:00', 'and reports the start, not the 18:00 end')
  // collectDue 只负责「到点了就该产出」；同一分钟里的多次 tick 由通知账本去重。
  assert.equal(collectDue([item], at(12, 0), NOTIFY)[0].kind, 'due', 'mid-block is still 到期, not 逾期')
  assert.equal(collectDue([item], at(18, 0), NOTIFY)[0].dueTime, '08:00', 'the end is no longer the trigger')
  assert.equal(collectDue([item], new Date(2026, 10, 4, 9, 0, 0), NOTIFY)[0].kind, 'overdue', '逾期从提醒点的第二天开始')
})

test('the reminder point is the start; an all-day row keeps the 09:00 fallback', () => {
  const at = (h, m) => new Date(2026, 10, 3, h, m, 0)
  const block = { id: 'b1', title: '写周报', dueDate: '2026-11-03', startTime: '09:30', endTime: '10:00', bucket: 'today' }
  assert.equal(collectDue([block], at(9, 29), NOTIFY).length, 0)
  assert.equal(collectDue([block], at(9, 30), NOTIFY)[0].dueTime, '09:30', '时间段按开始时间提醒')
  const allDay = { id: 'b2', title: '全天任务', dueDate: '2026-11-03', startTime: null, endTime: null, bucket: 'today' }
  assert.equal(collectDue([allDay], at(8, 59), NOTIFY).length, 0)
  assert.equal(collectDue([allDay], at(9, 0), NOTIFY)[0].dueTime, '09:00', '全天保留默认的 09:00，不能默默不提醒')
})

test('a 时间点 fires 到期 at that point (point IS the deadline)', async () => {
  const item = { id: 't2', title: '交周报', dueDate: '2026-11-03', startTime: '09:30', endTime: null, bucket: 'today' }
  const at = (h, m) => new Date(2026, 10, 3, h, m, 0)
  assert.equal(collectDue([item], at(9, 29), NOTIFY).length, 0)
  const fired = collectDue([item], at(9, 30), NOTIFY)
  assert.equal(fired.length, 1)
  assert.equal(fired[0].dueTime, '09:30')
})

test('REGRESSION: a 09:30-10:00 block created at 09:33 must not fire immediately', async () => {
  // 实际遇到的：建完 22 秒就弹「到期 · 截止 09:30」。
  // v5 起提醒点就是开始时间 09:30；建单时它已经过去 → staleAtBirth 压掉当天，
  // 第二天才作为逾期提醒一次，不会在创建后几秒补一条。
  const item = {
    id: 't3', title: '提供B2B数据图表-PPT用', dueDate: '2026-11-04',
    startTime: '09:30', endTime: '10:00', bucket: 'today',
    createdAt: '2026-11-04T01:33:13.449Z',   // = 09:33:13 本地
  }
  const at = (h, m) => new Date(2026, 10, 4, h, m, 0)
  assert.equal(collectDue([item], at(9, 33), NOTIFY).length, 0, 'not 22 seconds after creation')
  assert.equal(collectDue([item], at(9, 40), NOTIFY).length, 0, '开始时间在建单时就已过去')
  assert.equal(collectDue([item], at(9, 59), NOTIFY).length, 0)
  assert.equal(collectDue([item], at(10, 0), NOTIFY).length, 0, '同一天内不再补发（staleAtBirth）')
  const nextDay = collectDue([item], new Date(2026, 10, 5, 9, 0, 0), NOTIFY)
  assert.equal(nextDay.length, 1, '第二天才是一次真正的逾期提醒')
  assert.equal(nextDay[0].kind, 'overdue')
})

test('a same-day deadline already past at creation is not nagged on creation', async () => {
  // 09:30 建一条今天、没填时间的待办：默认时限 09:00 早已过去，不该立刻弹。
  const item = {
    id: 't4', title: '无时间的今日待办', dueDate: '2026-11-04',
    startTime: null, endTime: null, bucket: 'today',
    createdAt: '2026-11-04T01:30:00.000Z',   // = 09:30 本地
  }
  const at = (h, m) => new Date(2026, 10, 4, h, m, 0)
  assert.equal(collectDue([item], at(9, 31), NOTIFY).length, 0, 'no instant nag')
  // 但跨天的过期不受影响：第二天照常进逾期
  const nextDay = new Date(2026, 10, 5, 9, 30, 0)
  const events = collectDue([item], nextDay, NOTIFY)
  assert.equal(events.length, 1)
  assert.equal(events[0].kind, 'overdue')
})

test('with no time at all it falls back to 09:00 that day', async () => {
  const item = { id: 't1', title: 'x', dueDate: '2026-11-03', startTime: null, endTime: null, bucket: 'today' }
  const at = (h, m) => new Date(2026, 10, 3, h, m, 0)
  assert.equal(collectDue([item], at(8, 59), NOTIFY).length, 0)
  assert.equal(collectDue([item], at(9, 0), NOTIFY).length, 1)
})

test('a time point defaulting to "now" at creation does not self-notify', async () => {
  // 新建时时间点默认就是此刻 → 时限正好等于创建时刻，不该在创建后几秒弹一次。
  const base = {
    id: 't5', title: '刚建的', dueDate: '2026-11-04',
    startTime: '13:30', endTime: null, bucket: 'today',
    createdAt: '2026-11-04T05:30:27.000Z',   // = 13:30:27 本地
  }
  const at = (h, m, s = 0) => new Date(2026, 10, 4, h, m, s)
  assert.equal(collectDue([base], at(13, 30, 30), NOTIFY).length, 0, 'same minute as creation')
  assert.equal(collectDue([base], at(13, 35), NOTIFY).length, 0)
  // 但真正在未来的时限照常提醒
  const later = { ...base, startTime: '14:00' }
  assert.equal(collectDue([later], at(13, 59), NOTIFY).length, 0)
  const fired = collectDue([later], at(14, 0), NOTIFY)
  assert.equal(fired.length, 1)
  assert.equal(fired[0].dueTime, '14:00')
})

// --- 当天结束：24:00 只能当结束时间（23:32 之后新建时间段的默认值就是 23:00 → 24:00） ---

test('24:00 is accepted as an end (the last instant of the day)', async () => {
  const { store } = await fresh()
  const t = await store.create({ title: '收尾', dueDate: '2026-11-03', startTime: '23:00', endTime: '24:00' })
  assert.equal(t.startTime, '23:00')
  assert.equal(t.endTime, '24:00')
  const { items } = await store.occurrences({ from: '2026-11-01', to: '2026-11-30' })
  assert.equal(items.find((i) => i.title === '收尾').endTime, '24:00', 'the week view must get the real end')
})

test('24:00 is rejected as a start (a day cannot start at its own end)', async () => {
  const { store } = await fresh()
  await assert.rejects(() => store.create({ title: 'x', startTime: '24:00' }), /截止时间格式应为 HH:mm/)
  await assert.rejects(
    () => store.create({ title: 'x', startTime: '24:00', endTime: '24:00' }),
    /截止时间格式应为 HH:mm/,
    'the start is validated first and stays strictly 00:00-23:59',
  )
})

test('23:00 -> 00:00 is rejected while 23:00 -> 24:00 is the storable form of the same block', async () => {
  const { store } = await fresh()
  await assert.rejects(
    () => store.create({ title: 'x', startTime: '23:00', endTime: '00:00' }),
    /结束时间必须晚于开始时间/,
  )
  const ok = await store.create({ title: 'y', dueDate: '2026-11-03', startTime: '23:00', endTime: '24:00' })
  assert.equal(ok.endTime, '24:00')
})

test('the range check compares minutes, not strings (23:30 -> 24:00 is 30 minutes)', async () => {
  const { store, api } = await fresh()
  const t = await store.create({ title: 'x', startTime: '23:30', endTime: '24:00' })
  assert.equal(t.endTime, '24:00', '23:30 -> 24:00 must be accepted')
  // 24:00 之后没有更晚的结束时间：00:30 在字符串上「更小」，在分钟上也不是「更晚」
  await assert.rejects(() => api.update({ id: t.id, patch: { endTime: '00:30' } }), /结束时间必须晚于开始时间/)
  assert.equal((await store.list({})).items.find((i) => i.id === t.id).endTime, '24:00', 'failed patch leaves state alone')
  // 长时段同样只在分钟比较下成立
  const long = await store.create({ title: 'y', startTime: '12:00', endTime: '24:00' })
  assert.equal(long.endTime, '24:00')
})

test('24:01 / 25:00 are still rejected as an end', async () => {
  const { store } = await fresh()
  await assert.rejects(() => store.create({ title: 'x', startTime: '23:00', endTime: '24:01' }), /截止时间格式应为 HH:mm/)
  await assert.rejects(() => store.create({ title: 'x', startTime: '23:00', endTime: '25:00' }), /截止时间格式应为 HH:mm/)
})

test('update can set an end of 24:00 and still rejects 24:00 as a start', async () => {
  const { store, api } = await fresh()
  const t = await store.create({ title: 'x', dueDate: '2026-11-03', startTime: '22:00' })
  const grown = await api.update({ id: t.id, patch: { endTime: '24:00' } })
  assert.equal(grown.startTime, '22:00')
  assert.equal(grown.endTime, '24:00')
  await assert.rejects(() => api.update({ id: t.id, patch: { startTime: '24:00' } }), /截止时间格式应为 HH:mm/)
})

test('REGRESSION: 24:00 survives a reload', async () => {
  // migrate() 每次 load 都会跑；它原先用只认 00:00–23:59 的正则把 endTime 清成 null，
  // 于是「23:00–00:00」落盘后再打开就只剩开始时间了。
  const { store, file } = await fresh()
  await store.create({ title: '深夜收尾', dueDate: '2026-11-04', startTime: '23:00', endTime: '24:00' })
  assert.equal(JSON.parse(await readFile(file, 'utf8')).todos[0].endTime, '24:00', 'written as 24:00')

  const reopened = createStore({ file })
  await reopened.load()
  const row = (await reopened.list({})).items[0]
  assert.equal(row.startTime, '23:00')
  assert.equal(row.endTime, '24:00', 'still there after reload')
})

test('a block ending at 24:00 reminds at its 23:00 start, not at midnight', async () => {
  // 提醒点改成开始时间后，23:00–24:00 的提醒落在当天 23:00；
  // 24:00 仍然只是「结束/时限」，不再决定提醒时刻。
  const item = { id: 'x', title: '深夜', dueDate: '2026-11-04', startTime: '23:00', endTime: '24:00', bucket: 'today' }
  const at = (d, h, m) => new Date(2026, 10, d, h, m, 0)
  assert.equal(collectDue([item], at(4, 22, 59), NOTIFY).length, 0, 'nothing before the start')
  const fired = collectDue([item], at(4, 23, 0), NOTIFY)
  assert.equal(fired.length, 1)
  assert.equal(fired[0].kind, 'due', 'not overdue on its own day')
  assert.equal(fired[0].dueTime, '23:00', 'the start is the reminder point')
  assert.equal(collectDue([item], at(4, 23, 30), NOTIFY)[0].kind, 'due', 'still 到期 later that evening')
  assert.equal(collectDue([item], at(5, 0, 0), NOTIFY)[0].kind, 'overdue', 'overdue the day after')
})
