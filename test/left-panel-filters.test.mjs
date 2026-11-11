/**
 * 左栏筛选 UI 的结构验证：两排按钮、默认选中、分类数字。
 *
 * 用 vm 加载**真实 client.js**，配最小 React mock，直接渲染 LeftPanel：
 * 断言 DOM 结构而不是截图 —— 截图能看布局，但说不清「点了会不会变」。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(HERE, '..', 'client.js')

function loadLeftPanel() {
  let src = fs.readFileSync(SRC, 'utf8')
  const marker = /return \{\r?\n\s*inject:/
  assert.ok(marker.test(src), 'factory return not found')
  src = src.replace(marker, 'globalThis.__EXPOSED__ = { LeftPanel };\r\n    return {\r\n      inject:')

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
  sandbox.__factory((name) => {
    if (name === 'react') return react
    throw new Error('unexpected require: ' + name)
  })
  return {
    render(props) { hookIdx = 0; pending.length = 0; return sandbox.__EXPOSED__.LeftPanel(props) },
    reset() { hookStore.length = 0 },
  }
}

const T = (key) => ({
  all: '全部', allCategories: '全部分类', uncategorized: '无分类',
  statusAll: '全部', statusDone: '已完成', statusTodo: '待办',
  rangeMonth: '当月', rangeYear: '当年',
  newCategory: '新建分类', inbox: '收集箱', today: '今天', backToToday: '回到今天',
  prevMonth: 'prevMonth', nextMonth: 'nextMonth', categoryNamePlaceholder: '分类名',
}[key] ?? key)

const BASE = {
  t: T,
  activeFilter: 'all',
  onFilterChange: () => {},
  categories: [
    { name: 'JP Amazon', count: 3, icon: null },
    { name: 'B2B', count: 0, icon: null },
  ],
  inboxCount: 0,
  uncategorizedCount: 2,
  onCreateCategory: () => {},
  onInboxFilter: () => {},
  monthCursor: { year: 2026, month: 10 },
  onMonthChange: () => {},
  calendarItems: [],
  onSelectDay: () => {},
  selectedDay: '2026-11-11',
  statusFilter: 'all',
  onStatusChange: () => {},
  rangeMode: 'day',
  onRangeChange: () => {},
}

function walk(node, fn) {
  if (!node || typeof node !== 'object') return
  fn(node)
  for (const c of node.children || []) walk(c, fn)
}

function buttons(tree) {
  const out = []
  walk(tree, (n) => { if (n.type === 'button') out.push(n) })
  return out
}

function textOf(node) {
  const parts = []
  walk(node, (n) => { for (const c of n.children || []) if (typeof c === 'string') parts.push(c) })
  return parts.join(' ')
}

test('两排筛选按钮都在，且默认「全部」高亮、「当月/当年」都不高亮', () => {
  const h = loadLeftPanel()
  h.reset()
  const tree = h.render(BASE)
  const labels = buttons(tree).map(textOf)
  for (const want of ['全部', '已完成', '待办', '当月', '当年']) {
    assert.ok(labels.some((l) => l.includes(want)), `缺少按钮 ${want}`)
  }
  const pressed = buttons(tree).filter((b) => b.props['aria-pressed'] === 'true').map(textOf)
  assert.deepEqual(pressed, ['全部'], '默认只有状态「全部」按下；范围都不按下（默认按天）')
})

test('切到「待办 + 当月」后，高亮跟着走', () => {
  const h = loadLeftPanel()
  h.reset()
  const tree = h.render({ ...BASE, statusFilter: 'todo', rangeMode: 'month' })
  const pressed = buttons(tree).filter((b) => b.props['aria-pressed'] === 'true').map(textOf)
  assert.deepEqual(pressed.sort(), ['当月', '待办'].sort())
})

test('点按钮会回传取值，不是就地改状态', () => {
  const h = loadLeftPanel()
  h.reset()
  const calls = []
  const tree = h.render({
    ...BASE,
    onStatusChange: (v) => calls.push(['status', v]),
    onRangeChange: (v) => calls.push(['range', v]),
  })
  const find = (label) => buttons(tree).find((b) => textOf(b).includes(label))
  find('待办').props.onClick()
  find('已完成').props.onClick()
  find('当月').props.onClick()
  find('当年').props.onClick()
  assert.deepEqual(calls, [['status', 'todo'], ['status', 'done'], ['range', 'month'], ['range', 'year']])
})

test('分类标签显示传进来的数字（不再用服务端全量 count）', () => {
  const h = loadLeftPanel()
  h.reset()
  const tree = h.render({
    ...BASE,
    categories: [{ name: 'JP Amazon', count: 5, icon: null }],
    uncategorizedCount: 2,
    inboxCount: 1,
  })
  const all = textOf(tree)
  assert.ok(all.includes('JP Amazon'), '分类名在')
  assert.ok(all.includes('5'), '分类数字来自传入的 count')
  // 「全部分类」这条必须在，否则点进某个分类就回不去了。
  // 它是分类行（div，和别的分类行一样），不是 button —— 所以扫整棵树而不是只扫按钮。
  assert.ok(all.includes('全部分类'), '缺少「全部分类」返回入口')
})
