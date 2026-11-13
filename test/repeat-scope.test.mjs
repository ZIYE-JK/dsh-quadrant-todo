/**
 * 重复待办的三种保存范围：整个系列 / 仅本次 / 本次及未来。
 *
 * 这一组是真实需求直接长出来的：老板在「每月 13 号」的任务上把完成期限改到 11-16，
 * 结果整条从 11 月消失了 —— 因为起点晚于当月锚点，11-13 被跳过。
 * 于是补了三选一，并要求「仅本次」能把某一次挪到别的日子。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createStore } from '../lib/store.js'

async function harness() {
  const dir = await mkdtemp(join(tmpdir(), 'todo-scope-'))
  const store = createStore({ file: join(dir, 'todos.json') })
  await store.load()
  return store
}

/** 每月 13 号、从 2026-11-13 开始的系列。 */
async function monthly13(store) {
  return store.create({
    title: '月度经营分析',
    quadrant: 'urgent_important',
    dueDate: '2026-11-13',
    repeat: { freq: 'monthly', monthDay: 13 },
  })
}

const datesOf = (items) => items.map((i) => i.date)
const dayOf = async (store, from, to) => datesOf((await store.occurrences({ from, to })).items)

test('整个系列：改日期时锚点跟着走，当月不再被吞掉', async () => {
  const store = await harness()
  const todo = await monthly13(store)
  // 起点 11-13、锚点 13 → 11 月应有这一次
  assert.deepEqual(await dayOf(store, '2026-11-01', '2026-11-30'), ['2026-11-13'])

  const after = await store.update(todo.id, { dueDate: '2026-11-16' })
  assert.equal(after.repeat.monthDay, 16, '锚点跟随新起始日')
  assert.deepEqual(await dayOf(store, '2026-11-01', '2026-11-30'), ['2026-11-16'], '11-16 出现，不再消失')
  assert.deepEqual(await dayOf(store, '2026-12-01', '2026-12-31'), ['2026-12-16'])
})

test('整个系列：只改规则不动日期时，不覆盖用户选的「每月几号」', async () => {
  const store = await harness()
  const todo = await monthly13(store)
  const after = await store.update(todo.id, { repeat: { freq: 'monthly', monthDay: 20 } })
  assert.equal(after.dueDate, '2026-11-13', '日期没动')
  assert.equal(after.repeat.monthDay, 20, '规则是用户选的 20 号，不许被日期同步回 13')
  assert.deepEqual(await dayOf(store, '2026-11-01', '2026-11-30'), ['2026-11-20'])
})

test('仅本次：把这一次挪到 11-16，其余仍按 13 号', async () => {
  const store = await harness()
  const todo = await monthly13(store)
  await store.overrideOccurrence(todo.id, '2026-11-13', { dueDate: '2026-11-16', title: '月度经营分析（顺延）' })

  const nov = (await store.occurrences({ from: '2026-11-01', to: '2026-11-30' })).items
  assert.deepEqual(datesOf(nov), ['2026-11-16'], '这一次挪到了 16 号')
  assert.equal(nov[0].title, '月度经营分析（顺延）', '标题也按覆盖走')
  assert.equal(nov[0].occurrenceDate, '2026-11-13', '身份仍是原来的 13 号')
  assert.equal(nov[0].overridden, true)

  assert.deepEqual(await dayOf(store, '2026-12-01', '2026-12-31'), ['2026-12-13'], '其余月份不受影响')
  const stored = (await store.list({})).items.find((i) => i.id === todo.id)
  assert.equal(stored.repeat.monthDay, 13, '系列规则没被改')
})

test('仅本次：勾选按原始发生日记账，不受挪期影响', async () => {
  const store = await harness()
  const todo = await monthly13(store)
  await store.overrideOccurrence(todo.id, '2026-11-13', { dueDate: '2026-11-16' })
  // 用身份日 11-13 勾选（界面就是这么传的），不能报「不是发生日」
  const done = await store.complete(todo.id, true, 'user', '2026-11-13')
  assert.equal(done.completions['2026-11-13'] !== undefined, true)
  const nov = (await store.occurrences({ from: '2026-11-01', to: '2026-11-30' })).items
  assert.equal(nov[0].done, true, '挪到 16 号的那次也显示为已完成')
})

test('仅本次：非发生日拒绝写入', async () => {
  const store = await harness()
  const todo = await monthly13(store)
  await assert.rejects(
    () => store.overrideOccurrence(todo.id, '2026-11-14', { title: 'x' }),
    /不是这条循环任务的发生日/,
  )
})

test('本次及未来：拆系列，旧段截到前一天，新段从分界日重新开始', async () => {
  const store = await harness()
  const todo = await monthly13(store)
  // 先完成 11 月这一次，验证历史留在旧段
  await store.complete(todo.id, true, 'user', '2026-11-13')

  const created = await store.splitSeries(todo.id, '2026-12-13', {
    title: '月度经营分析（新版）',
    repeat: { freq: 'monthly', monthDay: 20 },
  })
  assert.notEqual(created.id, todo.id, '新段是新 id')
  assert.equal(created.dueDate, '2026-12-13')
  assert.equal(created.title, '月度经营分析（新版）')

  const all = (await store.list({})).items
  const old = all.find((i) => i.id === todo.id)
  assert.equal(old.repeat.until, '2026-12-12', '旧段截到分界前一天')
  assert.ok(old.completions['2026-11-13'], '11 月的完成记录留在旧段')

  // 旧段只到 12-12，所以 12 月只有新段的 12-20
  assert.deepEqual(await dayOf(store, '2026-12-01', '2026-12-31'), ['2026-12-20'])
  assert.deepEqual(await dayOf(store, '2027-01-01', '2027-01-31'), ['2027-01-20'])
})

test('本次及未来：分界就是第一次时等价于整条替换，不拆出新记录', async () => {
  const store = await harness()
  const todo = await monthly13(store)
  const before = (await store.list({})).items.length
  const out = await store.splitSeries(todo.id, '2026-11-13', { title: '改名' })
  assert.equal(out.id, todo.id, '还是同一条')
  assert.equal((await store.list({})).items.length, before, '没有多出一条')
  assert.equal(out.title, '改名')
})

test('本次及未来：非发生日拒绝拆分', async () => {
  const store = await harness()
  const todo = await monthly13(store)
  await assert.rejects(
    () => store.splitSeries(todo.id, '2026-12-14', { title: 'x' }),
    /不是这条循环任务的发生日/,
  )
})

test('普通待办走这两个动作会被明确拒绝', async () => {
  const store = await harness()
  const plain = await store.create({ title: '一次性', dueDate: '2026-11-13' })
  await assert.rejects(() => store.overrideOccurrence(plain.id, '2026-11-13', { title: 'x' }), /不是循环任务/)
  await assert.rejects(() => store.splitSeries(plain.id, '2026-11-13', { title: 'x' }), /不是循环任务/)
})