/**
 * 月视图 / 周视图里把待办拖到别的日期。
 *
 * 需求原文：「我想月视图和周视图选中某条待办也能拖动到对应日期」。
 *
 * 这里测两件事：
 *   1. `dayDropHandlers` —— 三处（小日历 / 月视图 / 周视图）共用的落点判定；
 *   2. 两个视图真把落点接上了：拖动中格子/列可放置并能上报日期，不拖时不抢事件。
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
  src = src.replace(marker, 'globalThis.__EXPOSED__ = { dayDropHandlers, CalendarView, WeekView };\r\n    return {\r\n      inject:')

  const hookStore = []
  let hookIdx = 0
  const react = {
    createElement: (type, props, ...children) => {
      const kids = children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false)
      const withKids = { ...(props || {}), children: kids }
      if (typeof type === 'function') return type(withKids)
      return { type, props: withKids, children: kids }
    },
    useState(init) {
      const i = hookIdx++
      if (!(i in hookStore)) hookStore[i] = typeof init === 'function' ? init() : init
      return [hookStore[i], (v) => { hookStore[i] = typeof v === 'function' ? v(hookStore[i]) : v }]
    },
    useEffect() {}, useRef: (v) => ({ current: v }), useMemo: (fn) => fn(), useCallback: (fn) => fn, Fragment: 'Fragment',
  }
  const sandbox = {
    react,
    fetch: async () => ({ json: async () => ({ ok: true, result: { items: [] } }) }),
    URL, console: { error() {}, warn() {}, log() {} },
    JSON, Math, Date, Number, String, Boolean, Array, Object, Set, Map, Promise, RegExp, Error, Intl,
    window: { __ModuleLoader__: { load: ({ factory }) => { sandbox.__factory = factory } }, setTimeout: () => 0, clearTimeout() {} },
    document: {
      baseURI: 'http://127.0.0.1:1/', querySelector: () => null,
      addEventListener() {}, removeEventListener() {},
      createElement: () => ({ dataset: {}, appendChild() {}, setAttribute() {}, style: {} }),
      head: { appendChild() {} }, body: { appendChild() {} },
    },
    location: { href: 'http://127.0.0.1:1/' }, navigator: {}, localStorage: { getItem: () => null, setItem() {} },
    setInterval: () => 0, clearInterval() {}, setTimeout: () => 0, clearTimeout() {},
  }
  sandbox.globalThis = sandbox
  vm.createContext(sandbox)
  vm.runInContext(src, sandbox)
  sandbox.__factory((name) => {
    if (name === 'react') return react
    throw new Error('unexpected require: ' + name)
  })
  return {
    ...sandbox.__EXPOSED__,
    renderCalendar(props) { hookIdx = 0; return sandbox.__EXPOSED__.CalendarView(props) },
    renderWeek(props) { hookIdx = 0; return sandbox.__EXPOSED__.WeekView(props) },
    reset() { hookStore.length = 0 },
  }
}

function walk(node, fn) {
  if (!node || typeof node !== 'object') return
  fn(node)
  for (const c of node.children || []) walk(c, fn)
}

const T = (k) => k
const fakeEvent = () => {
  let prevented = 0
  return { preventDefault() { prevented += 1 }, get prevented() { return prevented } }
}

// --- 1. 共用落点判定 ---

test('没在拖动时：不返回任何落点处理器（不抢事件）', () => {
  const h = load()
  const d = h.dayDropHandlers({ dragging: false, day: '2026-11-20', overDay: null, setOverDay() {}, onDropDay() {} })
  assert.equal(d.isOver, false)
  assert.equal(d.onDragOver, undefined)
  assert.equal(d.onDrop, undefined)
  assert.equal(d.onDragLeave, undefined)
})

test('拖动中：dragOver 必须 preventDefault 并记下悬停日', () => {
  const h = load()
  const seen = []
  const d = h.dayDropHandlers({ dragging: true, day: '2026-11-20', overDay: null, setOverDay: (v) => seen.push(v), onDropDay() {} })
  const e = fakeEvent()
  d.onDragOver(e)
  assert.equal(e.prevented, 1, '不 preventDefault 浏览器就不允许放置')
  assert.deepEqual(seen, ['2026-11-20'])
})

test('拖动中：已经在悬停这一天时不重复设状态', () => {
  const h = load()
  const seen = []
  const d = h.dayDropHandlers({ dragging: true, day: '2026-11-20', overDay: '2026-11-20', setOverDay: (v) => seen.push(v), onDropDay() {} })
  d.onDragOver(fakeEvent())
  assert.deepEqual(seen, [])
  assert.equal(d.isOver, true)
})

test('放下：上报那一天，并清掉悬停', () => {
  const h = load()
  const dropped = []
  const cleared = []
  const d = h.dayDropHandlers({
    dragging: true, day: '2026-11-25', overDay: '2026-11-25',
    setOverDay: (v) => cleared.push(v), onDropDay: (k) => dropped.push(k),
  })
  const e = fakeEvent()
  d.onDrop(e)
  assert.equal(e.prevented, 1)
  assert.deepEqual(dropped, ['2026-11-25'])
  assert.deepEqual(cleared, [null], '放下后要清悬停高亮')
})

test('拖离：只清自己那一格的高亮', () => {
  const h = load()
  const cleared = []
  const mine = h.dayDropHandlers({ dragging: true, day: '2026-11-20', overDay: '2026-11-20', setOverDay: (v) => cleared.push(v), onDropDay() {} })
  mine.onDragLeave()
  assert.deepEqual(cleared, [null])
  const other = h.dayDropHandlers({ dragging: true, day: '2026-11-20', overDay: '2026-11-21', setOverDay: (v) => cleared.push(v), onDropDay() {} })
  other.onDragLeave()
  assert.deepEqual(cleared, [null], '不是自己那格被悬停时不该清')
})

// --- 2. 月视图接线 ---

const monthProps = (extra) => ({
  t: T,
  selectedDay: null,
  onPickDay() {},
  version: 0,
  onSelect() {},
  selectedId: null,
  monthCursor: { year: 2026, month: 10 },
  onMonthChange() {},
  dragging: true,
  onDragStartItem() {},
  onDragEndItem() {},
  onDropDay() {},
  ...extra,
})

const cellOf = (tree, day) => {
  let hit = null
  walk(tree, (n) => { if (!hit && n.props && n.props['data-date'] === day) hit = n })
  return hit
}

test('月视图：拖动中每一格都能收 drop，放下上报那一天', () => {
  const h = load()
  h.reset()
  const dropped = []
  const tree = h.renderCalendar(monthProps({ onDropDay: (k) => dropped.push(k) }))
  const cell = cellOf(tree, '2026-11-20')
  assert.ok(cell, '找到 11-20 那一格')
  assert.equal(typeof cell.props.onDrop, 'function')
  cell.props.onDrop(fakeEvent())
  assert.deepEqual(dropped, ['2026-11-20'])
})

test('月视图：没在拖动时格子不接受放置（点击选日期照旧）', () => {
  const h = load()
  h.reset()
  const tree = h.renderCalendar(monthProps({ dragging: false }))
  const cell = cellOf(tree, '2026-11-20')
  assert.equal(cell.props.onDrop, undefined)
  assert.equal(typeof cell.props.onClick, 'function', '点击选日期不能被拖拽功能替代')
})

// --- 3. 周视图接线 ---

const weekProps = (extra) => ({
  t: T,
  onSelect() {},
  onReschedule() {},
  version: 0,
  dragging: true,
  onDragStartItem() {},
  onDragEndItem() {},
  onDropDay() {},
  ...extra,
})

const countDropTargets = (tree) => {
  let n = 0
  walk(tree, (m) => { if (typeof m.props?.onDrop === 'function') n += 1 })
  return n
}

test('周视图：拖动中 7 个全天列 + 7 个分时列都是落点', () => {
  const h = load()
  h.reset()
  const tree = h.renderWeek(weekProps())
  assert.equal(countDropTargets(tree), 14)
})

test('周视图：没在拖动时一个落点都不占', () => {
  const h = load()
  h.reset()
  const tree = h.renderWeek(weekProps({ dragging: false }))
  assert.equal(countDropTargets(tree), 0)
})