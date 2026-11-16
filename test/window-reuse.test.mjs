/**
 * 窗口实例复用：点日期不该「先空一下再填上」。
 *
 * 真实反馈：在小日历上点不同日期，四象限里的待办会跳闪一下。
 * 原因是换日期时 windowRange 立刻变了，但实例数据还是上一次那份，
 * 旧 map 套新范围 → 0 行 → 请求回来才填上，就成了「闪一下」。
 *
 * 迷你日历本来就按整月取过一次数据，单日 / 当月窗口全落在它里面，
 * 直接复用即可：不发请求，也就没有空帧。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(HERE, '..', 'client.js')

function load() {
  let src = fs.readFileSync(SRC, 'utf8')
  const marker = /return \{\r?\n\s*inject:/
  assert.ok(marker.test(src), 'factory return not found')
  src = src.replace(marker, 'globalThis.__EXPOSED__ = { rangeCovers, buildOccurrenceMap, windowRangeOf };\r\n    return {\r\n      inject:')

  const sandbox = {
    react: { createElement: () => null, useState: (v) => [v, () => {}], useEffect() {}, useRef: () => ({ current: null }), useMemo: (f) => f(), useCallback: (f) => f, Fragment: 'F' },
    fetch: async () => ({ json: async () => ({ ok: true, result: {} }) }),
    URL, console: { error() {}, warn() {}, log() {} },
    JSON, Math, Date, Number, String, Boolean, Array, Object, Set, Map, Promise, RegExp, Error, Intl,
    window: { __ModuleLoader__: { load: ({ factory }) => { sandbox.__factory = factory } }, setTimeout: () => 0 },
    document: { baseURI: 'http://127.0.0.1:1/', querySelector: () => null, addEventListener() {}, removeEventListener() {}, createElement: () => ({ dataset: {}, appendChild() {}, setAttribute() {}, style: {} }), head: { appendChild() {} }, body: { appendChild() {} } },
    location: { href: 'http://127.0.0.1:1/' }, navigator: {}, localStorage: { getItem: () => null, setItem() {} },
    setInterval: () => 0, clearInterval() {}, setTimeout: () => 0, clearTimeout() {},
  }
  sandbox.globalThis = sandbox
  vm.createContext(sandbox)
  vm.runInContext(src, sandbox)
  sandbox.__factory((name) => {
    if (name === 'react') return sandbox.react
    throw new Error('unexpected require: ' + name)
  })
  return sandbox.__EXPOSED__
}

test('单日窗口落在月历范围内 → 直接复用，不再请求', () => {
  const { rangeCovers, windowRangeOf } = load()
  // 月历网格：2026-11 的 42 格
  const month = { from: '2026-10-26', to: '2026-12-06' }
  const day = windowRangeOf('day', '2026-11-16', { year: 2026, month: 10 })
  const mon = windowRangeOf('month', null, { year: 2026, month: 10 })
  assert.equal(rangeCovers(month, day), true, '点某一天：已覆盖')
  assert.equal(rangeCovers(month, mon), true, '当月：已覆盖')
})

test('当年窗口超出月历范围 → 需要单独请求', () => {
  const { rangeCovers, windowRangeOf } = load()
  const month = { from: '2026-10-26', to: '2026-12-06' }
  const year = windowRangeOf('year', null, { year: 2026, month: 10 })
  assert.equal(rangeCovers(month, year), false, '整年不能靠一个月的数据')
})

test('数据还没到（null）时不算覆盖', () => {
  const { rangeCovers, windowRangeOf } = load()
  const day = windowRangeOf('day', '2026-11-16', { year: 2026, month: 10 })
  assert.equal(rangeCovers(null, day), false)
  assert.equal(rangeCovers(undefined, day), false)
})

test('buildOccurrenceMap 按 todoId → 日期两级归拢，并带上身份日', () => {
  const { buildOccurrenceMap } = load()
  const map = buildOccurrenceMap([
    { todoId: 't1', date: '2026-11-16', done: true, occurrenceDate: '2026-11-13', overridden: true },
    { todoId: 't1', date: '2026-12-13', done: false, occurrenceDate: '2026-12-13' },
    { todoId: 't2', date: '2026-11-16', done: false },
  ])
  assert.equal(map.size, 2)
  assert.equal(map.get('t1').size, 2)
  // 跨 realm 造的对象原型不同，deepEqual 会判不等 —— 逐字段比。
  const moved = map.get('t1').get('2026-11-16')
  assert.equal(moved.done, true)
  assert.equal(moved.occurrenceDate, '2026-11-13', '身份日保留原始的 13 号')
  assert.equal(moved.overridden, true)
  // 没给 occurrenceDate 时退回落位日
  const plain = map.get('t2').get('2026-11-16')
  assert.equal(plain.done, false)
  assert.equal(plain.occurrenceDate, '2026-11-16')
  assert.equal(plain.overridden, false)
})