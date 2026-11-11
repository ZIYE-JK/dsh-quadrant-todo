/**
 * 主任务 ⇄ 子任务 的双向联动。
 *
 * 规则（老板确认的口径）：
 *   子任务全部完成    → 主任务完成
 *   任一子任务取消    → 主任务取消完成
 *   主任务标记完成    → 子任务全部勾上
 *   主任务取消完成    → 子任务全部取消
 * 最后一条不是多余的：双向规则下若不这么做，「全完成→完成」会立刻把主任务又勾回去。
 *
 * 边界：**循环任务不参与**。它的子任务是整个系列共享的，与某一次发生无关。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createStore } from '../lib/store.js'

async function harness() {
  const dir = await mkdtemp(join(tmpdir(), 'todo-subtask-sync-'))
  const store = createStore({ file: join(dir, 'todos.json') })
  await store.load()
  return store
}

/** 建一条带 n 个子任务的任务。 */
async function withSubtasks(store, n, extra = {}) {
  const todo = await store.create({ title: '带子计划', quadrant: 'urgent_important', ...extra })
  let current = todo
  for (let i = 1; i <= n; i += 1) current = await store.subtaskAdd(todo.id, `第 ${i} 步`)
  return current
}

async function setDone(store, todo, index, done) {
  return store.subtaskUpdate(todo.id, todo.subtasks[index].id, { done })
}

test('子任务全部完成 → 主任务自动完成', async () => {
  const store = await harness()
  const todo = await withSubtasks(store, 2)
  assert.equal(todo.done, false)

  const afterFirst = await setDone(store, todo, 0, true)
  assert.equal(afterFirst.done, false, '只完成一半，主任务仍未完成')

  const afterSecond = await setDone(store, afterFirst, 1, true)
  assert.equal(afterSecond.done, true, '全部完成 → 主任务完成')
  assert.ok(afterSecond.doneAt, '完成时间要写上')
  assert.equal(afterSecond.doneBy, 'user')
})

test('任一子任务取消 → 主任务回到未完成', async () => {
  const store = await harness()
  let todo = await withSubtasks(store, 2)
  todo = await setDone(store, todo, 0, true)
  todo = await setDone(store, todo, 1, true)
  assert.equal(todo.done, true)

  const undone = await setDone(store, todo, 0, false)
  assert.equal(undone.done, false, '取消一个子任务 → 主任务取消完成')
  assert.equal(undone.doneAt, null)
  assert.equal(undone.doneBy, null)
})

test('主任务标记完成 → 子任务全部勾上', async () => {
  const store = await harness()
  const todo = await withSubtasks(store, 3)
  assert.ok(todo.subtasks.every((s) => s.done !== true))

  const done = await store.complete(todo.id, true)
  assert.equal(done.done, true)
  assert.ok(done.subtasks.every((s) => s.done === true), '所有子任务被勾上')
  assert.ok(done.subtasks.every((s) => s.doneAt), '子任务也带完成时间')
})

test('主任务取消完成 → 子任务全部取消（否则会来回弹）', async () => {
  const store = await harness()
  const todo = await withSubtasks(store, 2)
  await store.complete(todo.id, true)
  const undone = await store.complete(todo.id, false)
  assert.equal(undone.done, false)
  assert.ok(undone.subtasks.every((s) => s.done !== true), '子任务全部取消')
})

test('新增未完成的子任务会把主任务拉回未完成', async () => {
  const store = await harness()
  let todo = await withSubtasks(store, 2)
  todo = await setDone(store, todo, 0, true)
  todo = await setDone(store, todo, 1, true)
  assert.equal(todo.done, true)

  const added = await store.subtaskAdd(todo.id, '又想到一步')
  assert.equal(added.done, false, '新子任务是未完成的 → 主任务回到未完成')
})

test('删掉最后一个未完成的子任务 → 主任务完成', async () => {
  const store = await harness()
  let todo = await withSubtasks(store, 2)
  todo = await setDone(store, todo, 0, true)
  const pending = todo.subtasks[1]
  const removed = await store.subtaskRemove(todo.id, pending.id)
  assert.equal(removed.done, true, '剩下的都完成了 → 主任务完成')
})

test('没有子任务的任务：勾主任务不受联动影响', async () => {
  const store = await harness()
  const plain = await store.create({ title: '没有子计划', quadrant: 'neither' })
  const done = await store.complete(plain.id, true)
  assert.equal(done.done, true)
  assert.deepEqual(done.subtasks, [])
})

test('循环任务不参与联动：完成一次不会勾子任务', async () => {
  const store = await harness()
  const todo = await withSubtasks(store, 2, {
    repeat: { freq: 'daily', interval: 1, until: null },
    dueDate: '2026-11-11',
  })
  const done = await store.complete(todo.id, true, 'user', '2026-11-11')
  // 循环任务的 done 是派生值（看 completions），子任务保持原样
  assert.ok(done.subtasks.every((s) => s.done !== true), '循环任务的子任务不该被勾上')
})

test('拖动排序经 update 改 subtasks 时，顺序保留且不影响完成状态', async () => {
  const store = await harness()
  let todo = await withSubtasks(store, 3)
  const [a, b, c] = todo.subtasks
  const reordered = [c, a, b]
  const after = await store.update(todo.id, { subtasks: reordered })
  assert.deepEqual(after.subtasks.map((s) => s.id), [c.id, a.id, b.id], '顺序按传入数组保留')
  assert.equal(after.done, false, '都还没完成，主任务不动')
})
