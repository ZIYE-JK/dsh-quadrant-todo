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

test('a 时间段 fires 到期 at its END, not its start', async () => {
  // 这条曾经断言反了：拿开始时间当截止，会让 09:30–10:00 在 09:30 就报「到期」。
  const item = { id: 't1', title: '排期任务', dueDate: '2026-11-03', startTime: '08:00', endTime: '18:00', bucket: 'today' }
  const at = (h, m) => new Date(2026, 10, 3, h, m, 0)
  assert.equal(collectDue([item], at(7, 59), NOTIFY).length, 0, 'nothing before the block')
  assert.equal(collectDue([item], at(8, 0), NOTIFY).length, 0, 'starting the block is NOT 到期')
  assert.equal(collectDue([item], at(12, 0), NOTIFY).length, 0, 'mid-block is NOT 到期')
  assert.equal(collectDue([item], at(17, 59), NOTIFY).length, 0, 'one minute before the end is NOT 到期')
  const fired = collectDue([item], at(18, 0), NOTIFY)
  assert.equal(fired.length, 1, '到期 fires when the block ENDS')
  assert.equal(fired[0].kind, 'due')
  assert.equal(fired[0].dueTime, '18:00', 'and reports the real deadline')
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
  // 老板实际遇到的：建完 22 秒就弹「到期 · 截止 09:30」。
  const item = {
    id: 't3', title: '提供B2B数据图表-PPT用', dueDate: '2026-11-04',
    startTime: '09:30', endTime: '10:00', bucket: 'today',
    createdAt: '2026-11-04T01:33:13.449Z',   // = 09:33:13 本地
  }
  const at = (h, m) => new Date(2026, 10, 4, h, m, 0)
  assert.equal(collectDue([item], at(9, 33), NOTIFY).length, 0, 'not 22 seconds after creation')
  assert.equal(collectDue([item], at(9, 40), NOTIFY).length, 0)
  assert.equal(collectDue([item], at(9, 59), NOTIFY).length, 0)
  const fired = collectDue([item], at(10, 0), NOTIFY)
  assert.equal(fired.length, 1, 'fires at the real deadline')
  assert.equal(fired[0].dueTime, '10:00', 'reports 10:00, not the 09:30 start')
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
