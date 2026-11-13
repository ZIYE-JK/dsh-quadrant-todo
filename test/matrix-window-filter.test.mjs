/**
 * 左栏「状态 × 窗口」筛选：数字与列表必须同口径。
 *
 * 真实踩到的两个坑，都由这里的函数负责兜住：
 * 1. `list()` 对循环任务只返回「今天之后的下一次」，拿它比窗口里的日期永远对不上，
 *    于是「每月 3 号」只在系列起点那个月出现在矩阵里（别的月份一片空白，日历却有点）；
 * 2. 标签上的数字如果另算一套（比如服务端全量累计），就会出现「写着 2，点进去 3 条」。
 *
 * 所以：展开与计数吃**同一份行**，条数天然恒等。
 * 测试从 client.js 源码里抠真实函数，不复制实现。
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

const names = ['asText', 'dateKeyOf', 'windowRangeOf', 'expandRowsForWindow', 'matchesStatus', 'countRowsByCategory']
const bundle = names.map(extractFn).join('\n')
// eslint-disable-next-line no-new-func
const api = new Function(`${bundle}; return { windowRangeOf, expandRowsForWindow, matchesStatus, countRowsByCategory }`)()
const { windowRangeOf, expandRowsForWindow, matchesStatus, countRowsByCategory } = api

const monthly = {
  id: 't_rep', title: '需要日亚物流提供食品届备案费', isRepeating: true,
  dueDate: '2026-12-03', done: false, quadrant: 'urgent_important', category: 'JP Amazon',
}
const once = {
  id: 't_one', title: 'Performance制表', isRepeating: false,
  dueDate: '2026-11-09', done: false, quadrant: 'urgent_important', category: 'Performance',
}

/** occurrences 的真实形状：Map<todoId, Map<date, done>> */
const occ = (entries) => {
  const map = new Map()
  for (const [id, pairs] of entries) {
    // 值形状已升级为「那次发生的全部信息」：done / 原始日期 / 是否被单次覆盖。
    // 测试里允许写成 [date, done] 或 [date, {done, occurrenceDate}] 两种。
    map.set(id, new Map(pairs.map(([day, value]) => [
      day,
      typeof value === 'object' && value !== null
        ? { done: value.done === true, occurrenceDate: value.occurrenceDate ?? day, overridden: value.overridden === true }
        : { done: value === true, occurrenceDate: day, overridden: false },
    ])))
  }
  return map
}

test('当天窗口：循环任务在它发生的每一天都出得来，不只在系列起点', () => {
  const range = windowRangeOf('day', '2027-01-03', null)
  assert.deepEqual(range, { from: '2027-01-03', to: '2027-01-03' })
  const rows = expandRowsForWindow([monthly], range, occ([['t_rep', [['2027-01-03', false]]]]))
  assert.equal(rows.length, 1)
  assert.equal(rows[0].dueDate, '2027-01-03', '行被换成那一天的实例')
  assert.equal(rows[0].done, false)
})

test('当月窗口：每周一次的任务在一个月里展开成多行', () => {
  const range = windowRangeOf('month', null, { year: 2026, month: 10 }) // 2026-11
  assert.deepEqual(range, { from: '2026-11-01', to: '2026-11-30' })
  const rows = expandRowsForWindow([monthly], range, occ([['t_rep', [
    ['2026-11-03', true], ['2026-11-10', false], ['2026-11-17', false], ['2026-11-24', false],
    ['2026-12-01', false],
  ]]]))
  assert.deepEqual(rows.map((r) => r.dueDate), ['2026-11-03', '2026-11-10', '2026-11-17', '2026-11-24'])
  assert.equal(rows[0].done, true, '已完成的那次按那一天算')
  assert.equal(rows[1].done, false)
})

test('当年窗口：短月要算到最后一天', () => {
  assert.deepEqual(windowRangeOf('year', null, { year: 2027, month: 1 }), { from: '2027-01-01', to: '2027-12-31' })
  // 2027-02 只有 28 天
  assert.deepEqual(windowRangeOf('month', null, { year: 2027, month: 1 }), { from: '2027-02-01', to: '2027-02-28' })
})

test('状态筛选：全部 / 已完成 / 待办', () => {
  assert.equal(matchesStatus({ done: false }, 'all'), true)
  assert.equal(matchesStatus({ done: true }, 'all'), true)
  assert.equal(matchesStatus({ done: true }, 'done'), true)
  assert.equal(matchesStatus({ done: false }, 'done'), false)
  assert.equal(matchesStatus({ done: false }, 'todo'), true)
  assert.equal(matchesStatus({ done: true }, 'todo'), false)
})

test('数字和列表条数恒等：分类计数来自展开后的同一份行', () => {
  const range = windowRangeOf('month', null, { year: 2026, month: 10 })
  const rows = expandRowsForWindow(
    [monthly, once],
    range,
    occ([
      ['t_rep', [['2026-11-03', false], ['2026-11-17', true]]],
      ['t_one', [['2026-11-09', false]]],
    ]),
  )
  const counts = countRowsByCategory(rows)
  assert.equal(counts.get('JP Amazon'), 2, '两个月度实例')
  assert.equal(counts.get('Performance'), 1)
  // 关键不变式：每个分类的数字 == 该分类的行数
  for (const [name, count] of counts) {
    assert.equal(rows.filter((r) => r.category === name).length, count)
  }
  assert.equal(counts.get('JP Amazon') + counts.get('Performance'), rows.length)
})

test('无分类用空串做 key', () => {
  const rows = [{ id: 'a', category: null }, { id: 'b', category: '' }, { id: 'c', category: 'B2B' }]
  const counts = countRowsByCategory(rows)
  assert.equal(counts.get(''), 2)
  assert.equal(counts.get('B2B'), 1)
})

test('实例还没取到时退回按 dueDate 落在窗口内，不清空整屏', () => {
  const range = windowRangeOf('month', null, { year: 2026, month: 10 })
  const rows = expandRowsForWindow([monthly, once], range, null)
  assert.deepEqual(rows.map((r) => r.id), ['t_one'], '循环任务退让，非循环仍然正确')
})
