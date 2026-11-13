/** v2 store tests: migration, quadrants/inbox, subtasks, settings, category icons. */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createStore } from '../lib/store.js'

/** A v1 document shaped exactly like the one the plugin actually shipped. */
const V1 = {
  version: 1,
  todos: [
    {
      id: 't_mw00uzdu_52dd',
      title: '跟磊哥过一下经营分析框架',
      note: '',
      priority: 'high',
      category: '重要且紧急',
      dueDate: '2026-11-03',
      dueTime: '11:00',
      done: false,
      repeat: null,
      completions: {},
      doneAt: null,
      doneBy: null,
      verifiedAt: null,
      createdAt: '2026-11-03T01:41:30.402Z',
      updatedAt: '2026-11-03T01:42:35.353Z',
    },
  ],
}

async function freshStore(doc) {
  const dir = await mkdtemp(join(tmpdir(), 'todo-test-'))
  const file = join(dir, 'todos.json')
  if (doc !== undefined) await writeFile(file, JSON.stringify(doc, null, 2), 'utf8')
  return { store: createStore({ file }), file, dir }
}

test('v1 -> v3: legacy quadrant name in category moves to quadrant', async () => {
  const { store } = await freshStore(V1)
  const res = await store.load()
  assert.equal(res.corrupt, false)
  assert.equal(res.migrated.from, 1)
  assert.equal(res.migrated.to, 5)
  assert.equal(res.migrated.movedQuadrants, 1)

  const { items } = await store.list({ view: 'open' })
  assert.equal(items.length, 1)
  assert.equal(items[0].quadrant, 'urgent_important')
  assert.equal(items[0].category, null, 'legacy category name is cleared')
  assert.deepEqual(items[0].subtasks, [])
  assert.equal(items[0].title, '跟磊哥过一下经营分析框架', 'Chinese title survives migration')
  assert.equal(items[0].startTime, '11:00', 'legacy dueTime is folded into startTime')
  assert.equal(items[0].dueTime, null, 'dueTime is no longer stored')
})

test('v1 -> v3: writes back the current version and keeps a v1 backup', async () => {
  const { store, file } = await freshStore(V1)
  await store.load()
  const written = JSON.parse(await readFile(file, 'utf8'))
  assert.equal(written.version, 5)
  assert.deepEqual(written.settings.notify.quietHours, { enabled: false, start: '22:00', end: '08:00' })
  assert.deepEqual(written.categories, {})
  const dir = file.replace(/[\\/]todos\.json$/, '')
  const backups = (await readdir(dir)).filter((f) => f.startsWith('todos.v1-backup-'))
  assert.equal(backups.length, 1, 'exactly one v1 backup')
  const backup = JSON.parse(await readFile(join(dir, backups[0]), 'utf8'))
  assert.equal(backup.version, 1, 'backup is the untouched original')
})

test('a current-version document loads without a migration record', async () => {
  const { store } = await freshStore({ version: 5, todos: [], categories: {}, settings: {} })
  const res = await store.load()
  assert.equal(res.migrated, null)
})

test('missing file starts empty, not corrupt', async () => {
  const { store } = await freshStore(undefined)
  const res = await store.load()
  assert.equal(res.corrupt, false)
  assert.equal((await store.list({})).items.length, 0)
})

test('corrupt file is backed up and reported', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'todo-test-'))
  const file = join(dir, 'todos.json')
  await writeFile(file, '{ not json', 'utf8')
  const store = createStore({ file })
  const res = await store.load()
  assert.equal(res.corrupt, true)
  const { notices } = await store.list({})
  assert.ok(notices.includes('corrupt'))
})

test('inbox = quadrant null; setting a quadrant removes it from the inbox', async () => {
  const { store } = await freshStore()
  await store.load()
  const a = await store.create({ title: '收件箱里的' })
  await store.create({ title: '已归类', quadrant: 'neither' })
  assert.equal(a.quadrant, null)
  assert.equal((await store.list({})).inboxCount, 1)

  await store.setQuadrant(a.id, 'urgent_important')
  assert.equal((await store.list({})).inboxCount, 0)
  const inbox = await store.list({ quadrant: '__inbox__' })
  assert.equal(inbox.items.length, 0)
  const ui = await store.list({ quadrant: 'urgent_important' })
  assert.equal(ui.items.length, 1)
  assert.equal(ui.items[0].id, a.id)
})

test('category filter, including the no-category sentinel', async () => {
  const { store } = await freshStore()
  await store.load()
  await store.create({ title: 'A', category: '工作' })
  await store.create({ title: 'B' })
  assert.equal((await store.list({ category: '__none__' })).items.length, 1)
  assert.equal((await store.list({ category: '工作' })).items.length, 1)
})

test('subtask add / update / remove round-trip', async () => {
  const { store } = await freshStore()
  await store.load()
  const t = await store.create({ title: '带子计划' })

  const added = await store.subtaskAdd(t.id, '第一步')
  assert.equal(added.subtasks.length, 1)
  const sid = added.subtasks[0].id
  assert.equal(added.subtasks[0].done, false)

  const done = await store.subtaskUpdate(t.id, sid, { done: true })
  assert.equal(done.subtasks[0].done, true)
  assert.ok(done.subtasks[0].doneAt, 'doneAt stamped on completion')

  const renamed = await store.subtaskUpdate(t.id, sid, { title: '第一步（改）' })
  assert.equal(renamed.subtasks[0].title, '第一步（改）')

  const undone = await store.subtaskUpdate(t.id, sid, { done: false })
  assert.equal(undone.subtasks[0].done, false)
  assert.equal(undone.subtasks[0].doneAt, null)

  const removed = await store.subtaskRemove(t.id, sid)
  assert.deepEqual(removed.subtasks, [])
})

test('subtask operations reject unknown ids', async () => {
  const { store } = await freshStore()
  await store.load()
  const t = await store.create({ title: 'x' })
  await assert.rejects(() => store.subtaskUpdate(t.id, 'nope', { done: true }), /子计划/)
  await assert.rejects(() => store.subtaskRemove(t.id, 'nope'), /子计划/)
  await assert.rejects(() => store.subtaskAdd('missing-todo', 'x'), /已经不在了/)
})

test('settings default, merge partially, and persist across reload', async () => {
  const { store, file } = await freshStore()
  await store.load()
  const initial = await store.settings()
  assert.equal(initial.notify.system, true)
  assert.equal(initial.notify.feishu, true)
  assert.equal(initial.notify.leadMinutes, 0)

  const saved = await store.saveSettings({ notify: { feishu: false, leadMinutes: 15 } })
  assert.equal(saved.notify.feishu, false)
  assert.equal(saved.notify.leadMinutes, 15)
  assert.equal(saved.notify.system, true, 'untouched field keeps its value')

  const reopened = createStore({ file })
  await reopened.load()
  const again = await reopened.settings()
  assert.equal(again.notify.feishu, false)
  assert.equal(again.notify.leadMinutes, 15)
})

test('bad settings values fall back to defaults instead of throwing', async () => {
  const { store } = await freshStore()
  await store.load()
  const saved = await store.saveSettings({ notify: { leadMinutes: 'abc', quietHours: { enabled: true, start: '99:99' } } })
  assert.equal(saved.notify.leadMinutes, 0)
  assert.equal(saved.notify.quietHours.start, '22:00')
  assert.equal(saved.notify.quietHours.enabled, true)
})

test('category icons: set, surface on items, follow renames, cleared on delete', async () => {
  const { store } = await freshStore()
  await store.load()
  await store.create({ title: 'A', category: '工作' })
  await store.setCategoryIcon('工作', '💻')

  const cats = await store.categories()
  assert.deepEqual(cats.items, [{ name: '工作', count: 1, icon: '💻' }])
  assert.equal((await store.list({})).items[0].categoryIcon, '💻')

  await store.renameCategory('工作', '工作2')
  const renamed = await store.categories()
  assert.deepEqual(renamed.items, [{ name: '工作2', count: 1, icon: '💻' }])

  await store.clearCategory('工作2')
  assert.deepEqual((await store.categories()).items, [])
  assert.equal((await store.list({})).items[0].categoryIcon, null)
})

test('runs of mutations persist atomically and reload cleanly', async () => {
  const { store, file } = await freshStore()
  await store.load()
  await Promise.all([
    store.create({ title: 'p1' }),
    store.create({ title: 'p2' }),
    store.create({ title: 'p3' }),
  ])
  const reopened = createStore({ file })
  await reopened.load()
  assert.equal((await reopened.list({})).items.length, 3)
})
