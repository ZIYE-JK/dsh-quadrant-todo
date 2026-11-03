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

test('notifications fire at the block start, not the deadline', async () => {
  const item = { id: 't1', title: '排期任务', dueDate: '2026-11-03', startTime: '08:00', endTime: '18:00', bucket: 'today' }
  const at = (h, m) => new Date(2026, 10, 3, h, m, 0)
  assert.equal(collectDue([item], at(7, 59), NOTIFY).length, 0)
  const fired = collectDue([item], at(8, 0), NOTIFY)
  assert.equal(fired.length, 1, 'fires at 08:00 (block start)')
  assert.equal(fired[0].kind, 'due')
})

test('with no time at all it falls back to 09:00 that day', async () => {
  const item = { id: 't1', title: 'x', dueDate: '2026-11-03', startTime: null, endTime: null, bucket: 'today' }
  const at = (h, m) => new Date(2026, 10, 3, h, m, 0)
  assert.equal(collectDue([item], at(8, 59), NOTIFY).length, 0)
  assert.equal(collectDue([item], at(9, 0), NOTIFY).length, 1)
})
