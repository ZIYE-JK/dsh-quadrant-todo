/** Completed tasks must stay visible; overdue must nag at most once per day. */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createStore } from '../lib/store.js'
import { createNotifier } from '../lib/notify.js'

const at = (y, m, d, hh = 0, mm = 0) => new Date(y, m - 1, d, hh, mm, 0)
const todayKey = () => {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}
const shift = (key, days) => {
  const [y, m, d] = key.split('-').map(Number)
  const t = new Date(y, m - 1, d)
  t.setDate(t.getDate() + days)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

async function fresh() {
  const dir = await mkdtemp(join(tmpdir(), 'todo-done-'))
  const store = createStore({ file: join(dir, 'todos.json') })
  await store.load()
  return store
}

// ------------------------------------------------- 完成后不消失

test('a completed one-off task stays in the list, checked', async () => {
  const store = await fresh()
  const t = await store.create({ title: '买咖啡', dueDate: todayKey() })
  await store.complete(t.id, true, 'user')
  const { items } = await store.list({})
  const row = items.find((i) => i.id === t.id)
  assert.ok(row, 'completed task must NOT vanish from the list')
  assert.equal(row.done, true)
  assert.equal(row.bucket, 'done')
  assert.ok(row.doneAt, 'doneAt stamped')
})

test('a completed repeating task stays for the current period, checked', async () => {
  const store = await fresh()
  const t = await store.create({ title: '每日站会', dueDate: todayKey(), repeat: { freq: 'daily' } })
  await store.complete(t.id, true, 'user', todayKey())

  const { items } = await store.list({})
  const row = items.find((i) => i.id === t.id)
  assert.ok(row, 'a completed repeating task must stay visible for this period')
  assert.equal(row.done, true)
  assert.equal(row.dueDate, todayKey(), 'shows the occurrence that was completed')
  assert.equal(row.isRepeating, true)
  assert.equal(row.bucket, 'done')
})

test('a completed repeating task is excluded from the open view but kept in the full list', async () => {
  const store = await fresh()
  const t = await store.create({ title: '每日站会', dueDate: todayKey(), repeat: { freq: 'daily' } })
  await store.complete(t.id, true, 'user', todayKey())
  assert.equal((await store.list({ view: 'open' })).items.length, 0, 'open view still excludes it')
  assert.equal((await store.list({})).items.length, 1, 'unfiltered list keeps it')
})

test('un-completing restores the repeating row to open', async () => {
  const store = await fresh()
  const t = await store.create({ title: '每日站会', dueDate: todayKey(), repeat: { freq: 'daily' } })
  await store.complete(t.id, true, 'user', todayKey())
  await store.complete(t.id, false, 'user', todayKey())
  const row = (await store.list({})).items.find((i) => i.id === t.id)
  assert.equal(row.done, false)
  assert.equal((await store.list({ view: 'open' })).items.length, 1)
})

test('the row reverts to pending once the period rolls over', async () => {
  const store = await fresh()
  // monthly series, completed in a PAST month -> this month is a fresh, open occurrence
  const t = await store.create({ title: '月度复盘', dueDate: '2026-10-05', repeat: { freq: 'monthly', monthDay: 5 } })
  await store.complete(t.id, true, 'user', '2026-10-05')
  const row = (await store.list({})).items.find((i) => i.id === t.id)
  assert.equal(row.done, false, 'a new period is not the completed one')
  assert.notEqual(row.dueDate, '2026-10-05')
})

test('a completed task never triggers a notification', async () => {
  const store = await fresh()
  const notifier = createNotifier({ store, logger: { warn() {} } })
  await notifier._loadLedger()
  const t = await store.create({ title: '做完了的', dueDate: todayKey(), startTime: '00:01' })
  await store.complete(t.id, true, 'user')
  const res = await notifier._tick(new Date())
  assert.equal(res.fired, 0, 'done rows are skipped by the scheduler')
})

// ------------------------------------------------- 逾期一天只提醒一次

test('overdue nags at most once per day, then again the next day', async () => {
  const store = await fresh()
  const notifier = createNotifier({ store, logger: { warn() {} } })
  await notifier._loadLedger()
  await store.create({ title: '逾期任务', dueDate: '2026-11-01' })

  assert.equal((await notifier._tick(at(2026, 11, 3, 8, 59))).fired, 1, 'a past-due task nags as soon as the app runs')
  assert.equal((await notifier._tick(at(2026, 11, 3, 9, 0))).fired, 0, 'but only once that day')
  assert.equal((await notifier._tick(at(2026, 11, 3, 9, 30))).fired, 0, 'no repeat 30 minutes later')
  assert.equal((await notifier._tick(at(2026, 11, 3, 14, 0))).fired, 0, 'no repeat in the afternoon')
  assert.equal((await notifier._tick(at(2026, 11, 3, 23, 59))).fired, 0, 'no repeat late at night')
  assert.equal(notifier.ledgerSize(), 1, 'exactly one ledger entry for the day')

  assert.equal((await notifier._tick(at(2026, 11, 4, 9, 0))).fired, 1, 'next day nags once more')
  assert.equal(notifier.ledgerSize(), 2)
  assert.equal((await notifier._tick(at(2026, 11, 4, 12, 0))).fired, 0)
})

test('overdue nagging stops when the task is completed', async () => {
  const store = await fresh()
  const notifier = createNotifier({ store, logger: { warn() {} } })
  await notifier._loadLedger()
  const t = await store.create({ title: '逾期任务', dueDate: '2026-11-01' })

  assert.equal((await notifier._tick(at(2026, 11, 3, 9, 0))).fired, 1)
  await store.complete(t.id, true, 'user')
  assert.equal((await notifier._tick(at(2026, 11, 4, 9, 0))).fired, 0, 'done tasks stop nagging')
})

test('a completed-and-restored overdue task does not re-nag the same day', async () => {
  const store = await fresh()
  const notifier = createNotifier({ store, logger: { warn() {} } })
  await notifier._loadLedger()
  const t = await store.create({ title: '反复横跳', dueDate: '2026-11-01' })

  assert.equal((await notifier._tick(at(2026, 11, 3, 9, 0))).fired, 1)
  await store.complete(t.id, true, 'user')
  await store.complete(t.id, false, 'user')
  assert.equal((await notifier._tick(at(2026, 11, 3, 10, 0))).fired, 0, 'same day stays quiet')
})
