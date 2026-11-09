/**
 * 月视图与左栏迷你日历必须共用同一个月份状态。
 *
 * 以前两边各存一份（主视图 cursor / 左栏 monthCursor）：翻主视图时左栏纹丝不动，
 * 于是「左边某天有红点、右边那个月没任务」看起来像数据 bug，其实两边指的月份不同。
 * 这里用 vm 加载**真实 client.js**，断言 CalendarView 是受控的、且翻页走父组件的回调。
 *
 * 为什么用 vm 而不是直接 import：client.js 是 `window.__ModuleLoader__.load({factory})`
 * 信封，组件都在闭包里且不导出。注入一行把组件挂到 globalThis 上，测的仍是真实源码。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(HERE, '..', 'client.js')

function loadCalendarView() {
  let src = fs.readFileSync(SRC, 'utf8')
  const marker = /return \{\r?\n\s*inject:/
  assert.ok(marker.test(src), 'factory return not found — client.js envelope changed')
  src = src.replace(marker, 'globalThis.__EXPOSED__ = { CalendarView, monthGrid };\r\n    return {\r\n      inject:')

  const hookStore = []
  let hookIdx = 0
  const pending = []
  const react = {
    createElement: (type, props, ...children) => ({
      type, props: props || {}, children: children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false),
    }),
    useState(init) {
      const i = hookIdx++
      if (!(i in hookStore)) hookStore[i] = typeof init === 'function' ? init() : init
      return [hookStore[i], (v) => { hookStore[i] = typeof v === 'function' ? v(hookStore[i]) : v }]
    },
    useEffect(fn) { pending.push(fn) },
    useRef: (v) => ({ current: v }),
    useMemo: (fn) => fn(),
    useCallback: (fn) => fn,
    Fragment: 'Fragment',
  }

  const sandbox = {
    react,
    fetch: async () => ({ json: async () => ({ ok: true, result: { items: [] } }) }),
    URL,
    console: { error() {}, warn() {}, log() {} },
    JSON, Math, Date, Number, String, Boolean, Array, Object, Set, Map, Promise, RegExp, Error, Intl,
    window: { __ModuleLoader__: { load: ({ factory }) => { sandbox.__factory = factory } } },
    document: {
      baseURI: 'http://127.0.0.1:1/',
      querySelector: () => null,
      createElement: () => ({ dataset: {}, appendChild() {}, setAttribute() {} }),
      head: { appendChild() {} },
    },
    location: { href: 'http://127.0.0.1:1/' },
    navigator: {}, localStorage: { getItem: () => null, setItem() {} },
    setInterval: () => 0, clearInterval() {}, setTimeout: () => 0, clearTimeout() {},
  }
  sandbox.globalThis = sandbox
  vm.createContext(sandbox)
  vm.runInContext(src, sandbox)

  const factory = sandbox.__factory
  assert.ok(factory, 'factory not captured')
  factory((name) => {
    if (name === 'react') return react
    throw new Error('unexpected require: ' + name)
  })
  assert.ok(sandbox.__EXPOSED__, 'components not exposed')

  // 每次渲染重置 hook 指针
  return {
    CalendarView: sandbox.__EXPOSED__.CalendarView,
    monthGrid: sandbox.__EXPOSED__.monthGrid,
    render(props) { hookIdx = 0; pending.length = 0; const tree = sandbox.__EXPOSED__.CalendarView(props); return tree },
    reset() { hookStore.length = 0 },
  }
}

const BASE_PROPS = {
  t: (k) => k,
  selectedDay: null,
  onPickDay: () => {},
  version: 1,
  onSelect: () => {},
  selectedId: null,
}

function walk(node, fn) {
  if (!node || typeof node !== 'object') return
  fn(node)
  for (const c of node.children || []) walk(c, fn)
}

function findCell(tree, key) {
  let hit = null
  walk(tree, (n) => { if (!hit && n.props && n.props['data-date'] === key) hit = n })
  return hit
}

function findByLabel(tree, label) {
  let hit = null
  walk(tree, (n) => { if (!hit && n.props && n.props['aria-label'] === label) hit = n })
  return hit
}

// 「今天」按钮没有 aria-label，靠文本
function findButtonByText(tree, text) {
  let hit = null
  walk(tree, (n) => {
    if (hit || n.type !== 'button') return
    const flat = (n.children || []).filter((c) => typeof c === 'string')
    if (flat.includes(text)) hit = n
  })
  return hit
}

test('CalendarView is controlled: the month comes from the parent, not local state', () => {
  const h = loadCalendarView()
  h.reset()
  const tree = h.render({ ...BASE_PROPS, monthCursor: { year: 2027, month: 0 }, onMonthChange: () => {} })
  // 2027-01 的网格必须包含 1 月 3 日，且不含其它月的同一天
  assert.ok(findCell(tree, '2027-01-03'), 'January cell rendered')
  assert.ok(findCell(tree, '2026-12-28'), 'grid starts on the Monday before Jan 1')
  assert.equal(findCell(tree, '2026-12-03'), null, 'a December day outside the grid is not rendered')
})

test('the ‹ › buttons and 今天 go through onMonthChange, so the left panel follows', () => {
  const h = loadCalendarView()
  h.reset()
  const calls = []
  const tree = h.render({
    ...BASE_PROPS,
    monthCursor: { year: 2027, month: 0 },
    onMonthChange: (delta) => calls.push(delta),
  })
  const prev = findByLabel(tree, 'prevMonth')
  const next = findByLabel(tree, 'nextMonth')
  const today = findButtonByText(tree, 'today')
  assert.ok(prev, 'prev button rendered')
  assert.ok(next, 'next button rendered')
  assert.ok(today, 'today button rendered')
  prev.props.onClick()
  next.props.onClick()
  today.props.onClick()
  assert.deepEqual(calls, [-1, 1, 0], 'deltas are forwarded, including 0 for 今天')
})

test('a month the parent picks is the month actually drawn', () => {
  const h = loadCalendarView()
  for (const [year, month, key] of [[2026, 11, '2026-12-03'], [2027, 1, '2027-02-03'], [2027, 2, '2027-03-03']]) {
    h.reset()
    const tree = h.render({ ...BASE_PROPS, monthCursor: { year, month }, onMonthChange: () => {} })
    assert.ok(findCell(tree, key), `${year}-${month + 1} renders ${key}`)
  }
})
