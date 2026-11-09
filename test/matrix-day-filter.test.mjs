/**
 * 按天筛矩阵 / 收集箱：循环任务必须按「那一天有没有发生」判断，不能比 dueDate。
 *
 * 真实踩到的：新建「每月 3 号」的重复任务（dueDate 只是系列起点 2026-12-03），
 * 在矩阵里选中 2027-01-03 一片空白，而左栏迷你日历那天有红点 —— 因为
 * `list()` 对循环任务只返回「今天之后的下一次」，拿它比选中日永远对不上。
 *
 * 这里从 client.js 源码里抠出真实的 `asText` / `filterRowsByDay` 来测，
 * 不复制一份实现。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = fs.readFileSync(path.join(HERE, '..', 'client.js'), 'utf8')

/** 按「具名函数 + 花括号配对」从源码里取一个函数体。 */
function extractFn(name) {
  const start = SRC.indexOf(`function ${name}(`)
  assert.ok(start >= 0, `${name} not found in client.js`)
  let depth = 0
  let i = SRC.indexOf('{', start)
  const open = i
  for (; i < SRC.length; i += 1) {
    if (SRC[i] === '{') depth += 1
    else if (SRC[i] === '}') {
      depth -= 1
      if (depth === 0) break
    }
  }
  assert.ok(depth === 0, `${name} braces unbalanced`)
  return SRC.slice(start, i + 1)
}

const bundle = [extractFn('asText'), extractFn('filterRowsByDay')].join('\n')
// eslint-disable-next-line no-new-func
const make = new Function(`${bundle}; return filterRowsByDay;`)
const filterRowsByDay = make()

// 真实形状：list() 给循环任务的是「今天之后的下一次」
const repeating = {
  id: 't_rep', title: '需要日亚物流提供食品届备案费', isRepeating: true,
  dueDate: '2026-12-03', done: false, quadrant: 'urgent_important', startTime: null,
}
const once = { id: 't_one', title: 'Performance制表', isRepeating: false, dueDate: '2027-01-03', done: false, quadrant: 'urgent_important' }

const occMap = (pairs) => new Map(pairs.map(([id, date, done]) => [id, { todoId: id, date, done }]))

test('a monthly task shows on its occurrence day, not only on the series start', () => {
  const rows = [repeating, once]
  const occ = occMap([['t_rep', '2027-01-03', false], ['t_one', '2027-01-03', false]])
  const out = filterRowsByDay(rows, '2027-01-03', occ)
  assert.equal(out.length, 2)
  const rep = out.find((r) => r.id === 't_rep')
  assert.ok(rep, 'the repeating task is present on 2027-01-03')
  // 行被换成那一天的实例，勾选才不会写到系列起点
  assert.equal(rep.dueDate, '2027-01-03')
  assert.equal(rep.done, false)
})

test('a day the series does not fall on stays empty', () => {
  const occ = occMap([['t_rep', '2027-01-03', false]])
  assert.deepEqual(filterRowsByDay([repeating], '2027-01-05', occ), [])
})

test('the per-date done flag comes from the occurrence, not from the series row', () => {
  const occ = occMap([['t_rep', '2027-01-03', true]])
  const out = filterRowsByDay([repeating], '2027-01-03', occ)
  assert.equal(out[0].done, true, 'completed on that date only')
})

test('no day filter means no filtering', () => {
  assert.deepEqual(filterRowsByDay([repeating, once], null, null), [repeating, once])
})

test('before the occurrences arrive it falls back to the dueDate compare instead of blanking out', () => {
  // 取不到实例时不能把整屏清空：非循环任务仍然按 dueDate 正确命中
  const out = filterRowsByDay([repeating, once], '2027-01-03', null)
  assert.deepEqual(out.map((r) => r.id), ['t_one'])
})
