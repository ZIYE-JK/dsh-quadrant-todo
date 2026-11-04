/**
 * 统一排序（compareTodoOrder）+ occurrences 带 createdAt 的回归测试。
 *
 * compareTodoOrder 住在 client.js 的模块作用域里（不对外导出，改了会破坏插件的
 * `window.__ModuleLoader__.load({ factory })` 信封）。所以这里从源码里按**具名函数 + 花括号配对**
 * 把它和它依赖的纯函数抠出来，拼成一个可执行的函数体来测——测的是真实源码，不是抄一份副本。
 * 被抠出来的四个函数体内没有「字符串 / 注释里出现花括号」的写法，配对是可靠的。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createStore } from '../lib/store.js'

const CLIENT_SOURCE = await readFile(new URL('../client.js', import.meta.url), 'utf8')

/** 抠出一个具名函数声明的完整源码（从 `function name(` 到配对的 `}`）。 */
function extractFunction(source, name) {
  const match = new RegExp(`^[ \\t]*function ${name}\\(`, 'm').exec(source)
  assert.ok(match, `client.js 必须定义 function ${name}`)
  const start = match.index + match[0].indexOf('function')
  const open = source.indexOf('{', start)
  assert.notEqual(open, -1, `${name} 必须有函数体`)
  let depth = 0
  for (let index = open; index < source.length; index += 1) {
    const ch = source[index]
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return source.slice(start, index + 1)
    }
  }
  return assert.fail(`提取 ${name} 时花括号不配对`)
}

const CLIENT_HELPERS = ['asText', 'splitTimeKey', 'minutesOfTime', 'compareTodoOrder']
  .map((name) => extractFunction(CLIENT_SOURCE, name))
  .join('\n')

const { compareTodoOrder } = new Function(`${CLIENT_HELPERS}\nreturn { compareTodoOrder }`)()

/** 按统一排序排一份副本，方便断言最终顺序。 */
const order = (rows) => rows.slice().sort(compareTodoOrder).map((row) => row.title)

test('compareTodoOrder: 未完成在上，已完成在下（即使已完成的时间更早）', () => {
  const rows = [
    { title: 'done-early', done: true, startTime: '07:00', createdAt: '2026-10-01T00:00:00.000Z' },
    { title: 'open-late', done: false, startTime: '20:00', createdAt: '2026-11-01T00:00:00.000Z' },
    { title: 'open-none', done: false, startTime: null, createdAt: '2026-11-02T00:00:00.000Z' },
    { title: 'done-none', done: true, startTime: null, createdAt: '2026-10-02T00:00:00.000Z' },
  ]
  assert.deepEqual(order(rows), ['open-none', 'open-late', 'done-none', 'done-early'])
})

test('compareTodoOrder: 没有时间的（全天）排在有时间的前面', () => {
  const rows = [
    { title: 'timed', done: false, startTime: '00:01', createdAt: '2026-11-01T00:00:00.000Z' },
    { title: 'untimed', done: false, startTime: null, createdAt: '2026-11-02T00:00:00.000Z' },
    { title: 'empty-string', done: false, startTime: '', createdAt: '2026-11-03T00:00:00.000Z' },
  ]
  // 空串和 null 一样是「全天」，都排在有时间的前面；它们之间再按创建日期。
  assert.deepEqual(order(rows), ['untimed', 'empty-string', 'timed'])
})

test('compareTodoOrder: 有时间的按时间点 / 开始时间升序', () => {
  const rows = [
    { title: 'p3', done: false, startTime: '18:00', createdAt: '2026-11-01T00:00:00.000Z' },
    { title: 'p1', done: false, startTime: '08:00', createdAt: '2026-11-05T00:00:00.000Z' },
    { title: 'p2', done: false, startTime: '09:30', createdAt: '2026-11-09T00:00:00.000Z' },
    { title: 'p4', done: false, startTime: '23:00', endTime: '24:00', createdAt: '2026-11-02T00:00:00.000Z' },
  ]
  assert.deepEqual(order(rows), ['p1', 'p2', 'p3', 'p4'])
})

test('compareTodoOrder: 同为全天时按创建日期升序', () => {
  const rows = [
    { title: 'c-late', done: false, startTime: null, createdAt: '2026-11-03T09:00:00.000Z' },
    { title: 'c-early', done: false, startTime: null, createdAt: '2026-11-01T09:00:00.000Z' },
    { title: 'c-mid', done: false, startTime: null, createdAt: '2026-11-02T09:00:00.000Z' },
  ]
  assert.deepEqual(order(rows), ['c-early', 'c-mid', 'c-late'])
})

test('compareTodoOrder: 时间相同则退回创建日期，再退回标题（顺序稳定、永远不是 undefined）', () => {
  const rows = [
    { title: 'b', done: false, startTime: '09:00', createdAt: '2026-11-01T00:00:00.000Z' },
    { title: 'a', done: false, startTime: '09:00', createdAt: '2026-11-01T00:00:00.000Z' },
    { title: 'z', done: false, startTime: '09:00', createdAt: '2026-10-31T00:00:00.000Z' },
  ]
  assert.deepEqual(order(rows), ['z', 'a', 'b'])
  // 全等对象之间必须是 0，不能是 undefined —— undefined 会让 sort 行为未定义。
  const same = { title: 'x', done: false, startTime: '09:00', createdAt: '2026-11-01T00:00:00.000Z' }
  assert.equal(compareTodoOrder(same, { ...same }), 0)
})

test('compareTodoOrder: 混合样本的最终顺序（未完成全天 → 未完成有时间 → 已完成）', () => {
  const fixture = [
    { title: 'untimed-late', done: false, createdAt: '2026-11-02T00:00:00.000Z' },
    { title: 'untimed-early', done: false, createdAt: '2026-11-01T00:00:00.000Z' },
    { title: 'timed-early', done: false, startTime: '08:00', createdAt: '2026-11-05T00:00:00.000Z' },
    { title: 'timed-late', done: false, startTime: '17:30', createdAt: '2026-11-06T00:00:00.000Z' },
    { title: 'done-untimed', done: true, createdAt: '2026-10-01T00:00:00.000Z' },
  ]
  assert.deepEqual(
    order(fixture),
    ['untimed-early', 'untimed-late', 'timed-early', 'timed-late', 'done-untimed'],
  )
})

test('occurrences() 每一行都带 createdAt（统一排序要用）', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'todo-sort-'))
  const file = join(dir, 'todos.json')
  const store = createStore({ file })
  await store.load()
  const created = await store.create({ title: '带创建时间', dueDate: '2026-11-03' })
  const recurring = await store.create({ title: '每日站会', dueDate: '2026-11-02', repeat: { freq: 'daily' } })

  const { items } = await store.occurrences({ from: '2026-11-02', to: '2026-11-04' })
  assert.ok(items.length >= 4, '两个待办都要展开出实例')
  for (const row of items) {
    assert.equal(typeof row.createdAt, 'string', `${row.title} 的 createdAt 必须是字符串`)
  }
  assert.equal(items.find((row) => row.todoId === created.id).createdAt, created.createdAt)
  const meeting = items.filter((row) => row.todoId === recurring.id)
  assert.equal(meeting.length, 3)
  for (const row of meeting) assert.equal(row.createdAt, recurring.createdAt, '循环展开的每一天都带同一个创建时间')
})

test('occurrences() 没有 createdAt 的历史行给 null，而不是 undefined', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'todo-sort-'))
  const file = join(dir, 'todos.json')
  await writeFile(file, JSON.stringify({
    version: 4,
    todos: [{
      id: 'legacy', title: '老数据', note: '', quadrant: null, priority: 'medium', category: null,
      subtasks: [], dueDate: '2026-11-03', startTime: null, endTime: null, done: false,
      repeat: null, completions: {}, doneAt: null, doneBy: null, verifiedAt: null,
      abandoned: false, updatedAt: '2026-11-03T00:00:00.000Z',
    }],
    categories: {}, settings: {},
  }, null, 2), 'utf8')
  const store = createStore({ file })
  await store.load()
  const { items } = await store.occurrences({ from: '2026-11-01', to: '2026-11-30' })
  assert.equal(items.length, 1)
  assert.equal(items[0].createdAt, null, '缺字段时是 null，排序里等价于「最早」')
})
