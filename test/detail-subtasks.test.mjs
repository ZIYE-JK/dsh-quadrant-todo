/**
 * 详情面板的子计划：完成度显示 + 拖动排序。
 *
 * 用 vm 加载**真实 client.js**，mock React 渲染 DetailPanel 的元素树。
 * 断言的是结构（文字、draggable、回调收到的顺序），不是截图 ——
 * 截图能看布局，但证明不了「拖完顺序真的传回去了」。
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
  src = src.replace(marker, 'globalThis.__EXPOSED__ = { DetailPanel };\r\n    return {\r\n      inject:')

  const hookStore = []
  let hookIdx = 0
  const react = {
    createElement: (type, props, ...children) => ({
      type, props: props || {}, children: children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false),
    }),
    useState(init) {
      const i = hookIdx++
      if (!(i in hookStore)) hookStore[i] = typeof init === 'function' ? init() : init
      return [hookStore[i], (v) => { hookStore[i] = typeof v === 'function' ? v(hookStore[i]) : v }]
    },
    useEffect() {},
    useRef: (v) => ({ current: v }),
    useMemo: (fn) => fn(),
    useCallback: (fn) => fn,
    Fragment: 'Fragment',
  }

  const sandbox = {
    react,
    fetch: async () => ({ json: async () => ({ ok: true, result: {} }) }),
    URL,
    console: { error() {}, warn() {}, log() {} },
    JSON, Math, Date, Number, String, Boolean, Array, Object, Set, Map, Promise, RegExp, Error, Intl,
    window: { __ModuleLoader__: { load: ({ factory }) => { sandbox.__factory = factory } }, setTimeout: () => 0, clearTimeout() {} },
    document: {
      baseURI: 'http://127.0.0.1:1/',
      querySelector: () => null,
      addEventListener() {}, removeEventListener() {},
      createElement: () => ({ dataset: {}, appendChild() {}, setAttribute() {}, style: {} }),
      head: { appendChild() {} },
      body: { appendChild() {} },
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
    render(props) { hookIdx = 0; return sandbox.__EXPOSED__.DetailPanel(props) },
    reset() { hookStore.length = 0 },
  }
}

const todo = (subtasks) => ({
  id: 't1', title: 'Performance制表', dueDate: '2026-11-09', startTime: '10:00', endTime: '16:00',
  quadrant: 'urgent_important', category: 'Performance', done: false, subtasks,
})

const BASE = {
  t: (k) => ({ noSubtasks: '暂无子计划', add: '添加', subtaskPlaceholder: '输入子计划…', dismiss: '关闭', save: '保存', remove: '删除' }[k] ?? k),
  categories: [],
  onCreateCategory: async () => {},
  onAddSubtask: async () => {},
  onToggleSubtask: async () => {},
  onRemoveSubtask: async () => {},
  onReorderSubtasks: async () => {},
  onSave: async () => {},
  onRemove: async () => {},
  onClose: () => {},
}

function walk(node, fn) {
  if (!node || typeof node !== 'object') return
  fn(node)
  for (const c of node.children || []) walk(c, fn)
}

function textOf(node) {
  const out = []
  walk(node, (n) => { for (const c of n.children || []) if (typeof c === 'string') out.push(c) })
  return out.join(' ')
}

/** 找到某条子计划对应的行（行内含该标题文本）。 */
function rowOf(tree, title) {
  let hit = null
  walk(tree, (n) => {
    if (hit || !n.props || n.props.draggable !== true) return
    if (textOf(n).includes(title)) hit = n
  })
  return hit
}

const fakeDragEvent = () => ({
  preventDefault() {},
  dataTransfer: { setData() {}, get effectAllowed() { return '' }, set effectAllowed(v) {}, dropEffect: '' },
})

test('完成度按条数均分显示：1/3 · 33%', () => {
  const h = load()
  h.reset()
  const tree = h.render({ ...BASE, item: todo([
    { id: 's1', title: 'Wholesale', done: true },
    { id: 's2', title: 'EU-Temu', done: false },
    { id: 's3', title: 'JP-Amazon', done: false },
  ]) })
  const text = textOf(tree)
  assert.ok(text.includes('1/3 · 33%'), `应显示 1/3 · 33%，实际：${text.slice(0, 200)}`)
})

test('全部完成显示 100%', () => {
  const h = load()
  h.reset()
  const tree = h.render({ ...BASE, item: todo([
    { id: 's1', title: 'A', done: true },
    { id: 's2', title: 'B', done: true },
  ]) })
  assert.ok(textOf(tree).includes('2/2 · 100%'))
})

test('没有子计划时不显示完成度', () => {
  const h = load()
  h.reset()
  const tree = h.render({ ...BASE, item: todo([]) })
  assert.ok(!/·?\s*\d+%/.test(textOf(tree)), '无子计划不应出现百分比')
  assert.ok(textOf(tree).includes('暂无子计划'))
})

test('子计划行可拖动', () => {
  const h = load()
  h.reset()
  const tree = h.render({ ...BASE, item: todo([
    { id: 's1', title: 'Wholesale', done: false },
    { id: 's2', title: 'EU-Temu', done: false },
  ]) })
  assert.ok(rowOf(tree, 'Wholesale'), '第 1 行 draggable')
  assert.ok(rowOf(tree, 'EU-Temu'), '第 2 行 draggable')
})

test('把第 1 条拖到第 2 条上 → 回调收到交换后的顺序', () => {
  const h = load()
  h.reset()
  const received = []
  const props = {
    ...BASE,
    onReorderSubtasks: (next) => received.push(next.map((s) => s.id)),
    item: todo([
      { id: 's1', title: 'Wholesale', done: false },
      { id: 's2', title: 'EU-Temu', done: false },
      { id: 's3', title: 'JP-Amazon', done: false },
    ]),
  }
  // 第一遍：拿到 dragStart 处理器
  let tree = h.render(props)
  rowOf(tree, 'Wholesale').props.onDragStart(fakeDragEvent())
  // 第二遍：draggingId 已写入 state，重新渲染拿到能接受 drop 的处理器
  tree = h.render(props)
  rowOf(tree, 'JP-Amazon').props.onDrop(fakeDragEvent())
  assert.deepEqual(received, [['s2', 's3', 's1']], '第 1 条移到第 3 条位置')
})
