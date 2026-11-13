/** v4: single time source, due presets, overdue handling, and the new recurrence kinds. */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createStore } from '../lib/store.js'
import { createApi } from '../lib/api.js'
import { createNotifier, collectDue, collectAbandonable } from '../lib/notify.js'
import { isWorkday, EBBINGHAUS_OFFSETS } from '../lib/repeat.js'

const NOTIFY = { system: true, feishu: false, leadMinutes: 0, overdueDaily: true, quietHours: { enabled: false, start: '22:00', end: '08:00' } }
const at = (y, m, d, hh = 0, mm = 0) => new Date(y, m - 1, d, hh, mm, 0)

async function make(doc) {
  const dir = await mkdtemp(join(tmpdir(), 'todo-v4-'))
  const file = join(dir, 'todos.json')
  if (doc !== undefined) await writeFile(file, JSON.stringify(doc, null, 2), 'utf8')
  return { store: createStore({ file }), file }
}
async function fresh(doc) {
  const { store, file } = await make(doc)
  await store.load()
  return { store, file, api: createApi(store) }
}

// ------------------------------------------------- 「时间」只剩一个事实源

test('create folds dueTime into startTime and does not store dueTime', async () => {
  const { store } = await fresh()
  const t = await store.create({ title: 'x', dueDate: '2026-11-03', dueTime: '11:00' })
  assert.equal(t.startTime, '11:00', 'dueTime is an alias for startTime')
  assert.equal(t.dueTime, null, 'dueTime is not persisted separately')
})

test('an explicit startTime wins over a legacy dueTime', async () => {
  const { store } = await fresh()
  const t = await store.create({ title: 'x', startTime: '08:00', dueTime: '11:00' })
  assert.equal(t.startTime, '08:00')
})

test('patching startTime also keeps dueTime null (no second displayed time)', async () => {
  const { store, api } = await fresh()
  const t = await store.create({ title: 'x', dueDate: '2026-11-03', dueTime: '11:00' })
  const moved = await api.update({ id: t.id, patch: { startTime: '13:00', endTime: '14:00' } })
  assert.equal(moved.startTime, '13:00')
  assert.equal(moved.endTime, '14:00')
  assert.equal(moved.dueTime, null)
})

// ------------------------------------------------- 完成期限预设 / 超期处理

test('duePreset accepts the four presets and rejects anything else', async () => {
  const { store, api } = await fresh()
  for (const p of ['today', 'this_week', 'this_work_week', 'custom']) {
    const t = await api.create({ title: 'x', dueDate: '2026-11-03', duePreset: p })
    assert.equal(t.duePreset, p)
  }
  await assert.rejects(() => store.create({ title: 'x', duePreset: 'someday' }), /完成期限预设/)
})

test('onOverdue defaults to none and only accepts none/abandon', async () => {
  const { store } = await fresh()
  assert.equal((await store.create({ title: 'x' })).onOverdue, 'none')
  assert.equal((await store.create({ title: 'y', onOverdue: 'abandon' })).onOverdue, 'abandon')
  await assert.rejects(() => store.create({ title: 'z', onOverdue: 'delete' }), /超期处理/)
})

test('abandon marks, is listed, and can be undone', async () => {
  const { store, api } = await fresh()
  const t = await store.create({ title: '不想做了' })
  const a = await api.setAbandoned({ id: t.id })
  assert.equal(a.abandoned, true)
  assert.ok(a.abandonedAt, 'abandonedAt stamped')
  assert.equal((await store.list({})).items.length, 1, 'abandoned rows stay visible')

  const back = await api.setAbandoned({ id: t.id, abandoned: false })
  assert.equal(back.abandoned, false)
  assert.equal(back.abandonedAt, null)
})

test('abandoned tasks are never notified', async () => {
  const { store } = await fresh()
  const t = await store.create({ title: '放弃的', dueDate: '2026-11-03', startTime: '11:00' })
  await store.setAbandoned(t.id, true)
  assert.equal(collectDue((await store.list({})).items, at(2026, 11, 3, 11, 0), NOTIFY).length, 0)
})

test('onOverdue=abandon auto-abandons once the deadline passes, and stops nagging', async () => {
  const { store } = await fresh()
  const notifier = createNotifier({ store, logger: { warn() {} } })
  await notifier._loadLedger()
  const t = await store.create({ title: '超期就放弃', dueDate: '2026-11-03', endTime: null, startTime: '09:00', onOverdue: 'abandon' })

  assert.deepEqual(collectAbandonable((await store.list({})).items, at(2026, 11, 3, 8, 0)), [], 'nothing before the deadline')
  assert.deepEqual(collectAbandonable((await store.list({})).items, at(2026, 11, 3, 9, 30)), [t.id])

  const res = await notifier._tick(at(2026, 11, 3, 9, 30))
  assert.equal(res.abandoned, 1, 'tick applies the abandonment')
  const row = (await store.list({})).items.find((i) => i.id === t.id)
  assert.equal(row.abandoned, true)
  assert.equal((await notifier._tick(at(2026, 11, 3, 10, 0))).fired, 0, 'no nag afterwards')
})

// ------------------------------------------------- 新增重复类型

test('yearly repeats on the same month/day as the series start', async () => {
  const { store } = await fresh()
  await store.create({ title: '年检', dueDate: '2026-11-03', repeat: { freq: 'yearly' } })
  const { items } = await store.occurrences({ from: '2026-11-01', to: '2028-12-31' })
  const dates = items.filter((i) => i.title === '年检').map((i) => i.date)
  assert.deepEqual(dates, ['2026-11-03', '2027-11-03', '2028-11-03'])
})

test('workday repeats Monday-Friday and skips the weekend', async () => {
  const { store } = await fresh()
  await store.create({ title: '日报', dueDate: '2026-11-02', repeat: { freq: 'workday' } })
  const { items } = await store.occurrences({ from: '2026-11-02', to: '2026-11-08' })
  assert.deepEqual(items.map((i) => i.date), ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'])
  // 11-07 / 11-08 是周六周日
  assert.equal(isWorkday('2026-11-07'), false)
  assert.equal(isWorkday('2026-11-08'), false)
  assert.equal(isWorkday('2026-11-06'), true)
})

test('ebbinghaus follows the fixed review offsets from the start date', async () => {
  const { store } = await fresh()
  await store.create({ title: '背单词', dueDate: '2026-11-01', repeat: { freq: 'ebbinghaus' } })
  const { items } = await store.occurrences({ from: '2026-11-01', to: '2027-01-05' })
  const dates = items.map((i) => i.date)
  assert.equal(dates.length, EBBINGHAUS_OFFSETS.length)
  assert.equal(dates[0], '2026-11-01')
  assert.equal(dates[1], '2026-11-02', '+1 day')
  assert.equal(dates[2], '2026-11-03', '+2 days')
  assert.equal(dates[3], '2026-11-05', '+4 days')
  assert.equal(dates[4], '2026-11-08', '+7 days')
})

test('unknown frequencies are rejected', async () => {
  const { store } = await fresh()
  await assert.rejects(() => store.create({ title: 'x', repeat: { freq: 'fortnightly' } }), /repeat\.freq/)
})

test('yearly can be pinned to an explicit month/day', async () => {
  const { store } = await fresh()
  await store.create({ title: '元旦', dueDate: '2026-01-01', repeat: { freq: 'yearly', month: 12, monthDay: 31 } })
  const { items } = await store.occurrences({ from: '2026-12-01', to: '2027-12-31' })
  assert.deepEqual(items.map((i) => i.date), ['2026-12-31', '2027-12-31'])
})

// ------------------------------------------------- v3 -> v4 迁移

test('v3 -> v4 migrates dueTime into startTime and adds the new fields', async () => {
  const v3 = {
    version: 3,
    todos: [
      { id: 'a', title: '有 dueTime', quadrant: 'neither', subtasks: [], dueDate: '2026-11-03', dueTime: '11:00', startTime: null, endTime: null, done: false, completions: {}, repeat: null, createdAt: '2026-11-03T00:00:00.000Z', updatedAt: '2026-11-03T00:00:00.000Z' },
      { id: 'b', title: '已有 startTime', quadrant: null, subtasks: [], dueDate: '2026-11-03', dueTime: '09:00', startTime: '08:00', endTime: '09:30', done: false, completions: {}, repeat: null, createdAt: '2026-11-03T00:00:00.000Z', updatedAt: '2026-11-03T00:00:00.000Z' },
    ],
    categories: {}, settings: {},
  }
  const { store, file } = await make(v3)
  const res = await store.load()
  assert.equal(res.migrated.from, 3)
  assert.equal(res.migrated.to, 5)
  assert.equal(res.migrated.movedTimes, 1, 'only the row that had no startTime is folded')

  const byId = Object.fromEntries((await store.list({})).items.map((t) => [t.id, t]))
  assert.equal(byId.a.startTime, '11:00', 'dueTime became startTime')
  assert.equal(byId.a.dueTime, null)
  assert.equal(byId.b.startTime, '08:00', 'existing startTime untouched')
  assert.equal(byId.b.endTime, '09:30')
  assert.equal(byId.a.onOverdue, 'none')
  assert.equal(byId.a.abandoned, false)
  assert.equal(byId.a.duePreset, null)
  assert.equal(JSON.parse(await readFile(file, 'utf8')).version, 5)
})

test('the migration backup is named after its real source version', async () => {
  const { store, file } = await make({ version: 3, todos: [], categories: {}, settings: {} })
  await store.load()
  const dir = file.replace(/[\\/]todos\.json$/, '')
  const { readdir } = await import('node:fs/promises')
  const backups = (await readdir(dir)).filter((f) => f.includes('-backup-'))
  assert.equal(backups.length, 1)
  assert.match(backups[0], /^todos\.v3-backup-/, `expected a v3-named backup, got ${backups[0]}`)
})
