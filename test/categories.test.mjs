/** 分类：显式新建的分类必须能独立于待办存在，并且和「被用到的分类」一起列出。 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createStore } from '../lib/store.js'
import { createApi } from '../lib/api.js'

async function fresh(doc) {
  const dir = await mkdtemp(join(tmpdir(), 'todo-cat-'))
  const file = join(dir, 'todos.json')
  if (doc !== undefined) await writeFile(file, JSON.stringify(doc), 'utf8')
  const store = createStore({ file })
  await store.load()
  return { store, file, api: createApi(store) }
}

const names = (res) => res.items.map((row) => row.name)

test('a new category exists even with no todo using it', async () => {
  const { store } = await fresh()
  await store.addCategory('市场活动')
  const res = await store.categories()
  assert.deepEqual(names(res), ['市场活动'])
  assert.equal(res.items[0].count, 0, 'count 0 - nothing references it yet')
  assert.equal(res.items[0].icon, null)
})

test('it survives a reload (this is the whole point)', async () => {
  const { store, file } = await fresh()
  await store.addCategory('市场活动')

  const reopened = createStore({ file })
  await reopened.load()
  assert.deepEqual(names(await reopened.categories()), ['市场活动'])
})

test('adding twice is idempotent', async () => {
  const { store } = await fresh()
  await store.addCategory('市场活动')
  await store.addCategory('市场活动')
  const res = await store.categories()
  assert.equal(res.items.length, 1)
})

test('names are trimmed and validated', async () => {
  const { store } = await fresh()
  await store.addCategory('  市场活动  ')
  assert.deepEqual(names(await store.categories()), ['市场活动'])
  await assert.rejects(() => store.addCategory('   '), /分类名必填/)
  await assert.rejects(() => store.addCategory('x'.repeat(25)), /分类名过长/)
})

test('the list is the union of used and explicitly created, sorted by use', async () => {
  const { store } = await fresh()
  await store.create({ title: 'a', category: '工作' })
  await store.create({ title: 'b', category: '工作' })
  await store.create({ title: 'c', category: '生活' })
  await store.addCategory('市场活动')

  const res = await store.categories()
  assert.deepEqual(names(res), ['工作', '生活', '市场活动'], '2 uses, 1 use, 0 uses')
  assert.deepEqual(res.items.map((r) => r.count), [2, 1, 0])
})

test('clearing the icon keeps the category itself', async () => {
  const { store } = await fresh()
  await store.addCategory('市场活动')
  await store.setCategoryIcon('市场活动', '🎪')
  assert.equal((await store.categories()).items[0].icon, '🎪')

  await store.setCategoryIcon('市场活动', '')
  const after = await store.categories()
  assert.deepEqual(names(after), ['市场活动'], 'still there after the icon is cleared')
  assert.equal(after.items[0].icon, null)
})

test('a category created for a todo still shows up as before', async () => {
  const { store } = await fresh()
  const t = await store.create({ title: 'x' })
  await store.update(t.id, { category: '工作' })
  const res = await store.categories()
  assert.deepEqual(names(res), ['工作'])
  assert.equal(res.items[0].count, 1)
})

test('clearCategory removes an explicitly created category', async () => {
  const { store } = await fresh()
  await store.addCategory('市场活动')
  await store.clearCategory('市场活动')
  assert.deepEqual(names(await store.categories()), [])
})

test('renameCategory renames an explicitly created category', async () => {
  const { store } = await fresh()
  await store.addCategory('市场活动')
  await store.renameCategory('市场活动', '活动运营')
  assert.deepEqual(names(await store.categories()), ['活动运营'])
})

test('the api exposes addCategory', async () => {
  const { api, store } = await fresh()
  await api.addCategory({ name: '市场活动' })
  assert.deepEqual(names(await store.categories()), ['市场活动'])
})

test('a hand-edited file with a null icon keeps its category', async () => {
  const { store } = await fresh({
    version: 4,
    todos: [],
    categories: { 市场活动: { icon: null }, 工作: { icon: '💻' } },
    settings: {},
  })
  const res = await store.categories()
  assert.deepEqual(names(res).sort(), ['工作', '市场活动'])
  assert.equal(res.items.find((r) => r.name === '工作').icon, '💻')
  assert.equal(res.items.find((r) => r.name === '市场活动').icon, null)
})

test('what is written to disk round-trips', async () => {
  const { store, file } = await fresh()
  await store.addCategory('市场活动')
  await store.setCategoryIcon('工作', '💻')
  const written = JSON.parse(await readFile(file, 'utf8'))
  assert.deepEqual(written.categories['市场活动'], { icon: null })
  assert.deepEqual(written.categories['工作'], { icon: '💻' })
})
