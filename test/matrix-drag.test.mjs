/**
 * 矩阵里拖动待办换象限：松手即保存。
 *
 * 需求原文：「在四象限里的待办，我可以随意拖动，比如某待办我拖动到不重要不紧急，
 * 拖动到对应象限里，自动保存」。
 *
 * 断言的是**结构与回调**（谁被拖、落到哪一格、回调收到什么），不是像素：
 * 截图能看高亮，但证明不了「松手后真的把目标象限传回去了」。
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
  src = src.replace(marker, 'globalThis.__EXPOSED__ = { MatrixArea, InboxArea, QUADRANTS };\r\n    return {\r\n      inject:')

  const hookStore = []
  let hookIdx = 0
  const react = {
    // 函数组件直接展开：MatrixArea 返回的是 <TodoRow> 描述符，
    // 不展开就看不到行本身（而行才是要被拖的东西）。TodoRow/Icon 都不用 hook，安全。
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
    fetch: async () => ({ json: async () => ({ ok: true, result: {} }) }),
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
    render(props) { hookIdx = 0; return sandbox.__EXPOSED__.MatrixArea(props) },
    renderInbox(props) { hookIdx = 0; return sandbox.__EXPOSED__.InboxArea(props) },
    reset() { hookStore.length = 0 },
  }
}

function walk(node, fn) {
  if (!node || typeof node !== 'object') return
  fn(node)
  for (const c of node.children || []) walk(c, fn)
}

const textOf = (node) => {
  const out = []
  walk(node, (n) => { for (const c of n.children || []) if (typeof c === 'string') out.push(c) })
  return out.join(' ')
}

const T = (key) => ({
  quadrantUrgentImportant: '重要且紧急',
  quadrantUrgentNotImportant: '紧急不重要',
  quadrantImportantNotUrgent: '重要不紧急',
  quadrantNeither: '不重要不紧急',
  addTodo: '新建',
}[key] ?? key)

const row = (id, quadrant, extra = {}) => ({
  id, title: '任务 ' + id, quadrant, done: false, dueDate: '2026-11-16',
  occurrenceDate: '2026-11-16', isRepeating: false, ...extra,
})

/** 找到某标题对应的行（可拖的那个 div）。 */
function rowOf(tree, id) {
  let hit = null
  walk(tree, (n) => {
    if (hit || !n.props || n.props.className !== 'td-todo-row') return
    if (textOf(n).includes('任务 ' + id)) hit = n
  })
  return hit
}

/** 找到某象限卡片（标题精确匹配、且带 onDrop 的那层）。 */
function cardOf(tree, label) {
  // 注意不能用 includes：'不重要不紧急' 里含 '重要不紧急'，会串格。
  let hit = null
  walk(tree, (n) => {
    if (hit || typeof n.props?.onDrop !== 'function') return
    let exact = false
    walk(n, (m) => {
      for (const c of m.children || []) if (typeof c === 'string' && c === label) exact = true
    })
    if (exact) hit = n
  })
  return hit
}

const fakeEvent = () => ({ preventDefault() {}, dataTransfer: { setData() {}, effectAllowed: '' } })

test('矩阵里的行是可拖的，且带上抓取光标', () => {
  const h = load()
  h.reset()
  const tree = h.render({ t: T, items: [row('a', 'urgent_important')], onSelect() {}, selectedId: null, onToggle() {}, onAdd() {}, onMove() {} })
  const r = rowOf(tree, 'a')
  assert.ok(r, '找到这一行')
  assert.equal(r.props.draggable, true)
  assert.ok(r.props.style.cursor === 'grab', '光标提示可拖')
})

test('从「重要且紧急」拖到「不重要不紧急」→ 回调收到目标象限', () => {
  const h = load()
  h.reset()
  const moves = []
  const props = {
    t: T,
    items: [row('a', 'urgent_important')],
    onSelect() {}, selectedId: null, onToggle() {}, onAdd() {},
    onMove: (dragged, quadrant) => { moves.push([dragged.id, dragged.occurrenceDate, dragged.fromQuadrant, quadrant]) },
  }
  // 第一遍：触发 dragStart，写入拖动状态
  let tree = h.render(props)
  rowOf(tree, 'a').props.onDragStart(fakeEvent())
  // 第二遍：dragging 已就位，落点卡片才能收 drop
  tree = h.render(props)
  const target = cardOf(tree, '不重要不紧急')
  assert.ok(target, '找到目标象限卡片')
  target.props.onDragOver(fakeEvent())
  tree = h.render(props)
  cardOf(tree, '不重要不紧急').props.onDrop(fakeEvent())
  assert.deepEqual(moves, [['a', '2026-11-16', 'urgent_important', 'neither']])
})

test('拖回原来那一格 → 不写库', () => {
  const h = load()
  h.reset()
  const moves = []
  const props = {
    t: T, items: [row('a', 'urgent_important')],
    onSelect() {}, selectedId: null, onToggle() {}, onAdd() {},
    onMove: (d, q) => moves.push([d.id, q]),
  }
  let tree = h.render(props)
  rowOf(tree, 'a').props.onDragStart(fakeEvent())
  tree = h.render(props)
  cardOf(tree, '重要且紧急').props.onDrop(fakeEvent())
  assert.deepEqual(moves, [], '原地放下不该产生写入')
})

test('循环待办拖动时带走「这一次」的身份日', () => {
  const h = load()
  h.reset()
  const moves = []
  const repeatRow = row('r', 'urgent_important', { isRepeating: true, dueDate: '2026-11-16', occurrenceDate: '2026-11-13' })
  const props = {
    t: T, items: [repeatRow],
    onSelect() {}, selectedId: null, onToggle() {}, onAdd() {},
    onMove: (d, q) => moves.push([d.id, d.occurrenceDate, d.isRepeating, q]),
  }
  let tree = h.render(props)
  rowOf(tree, 'r').props.onDragStart(fakeEvent())
  tree = h.render(props)
  cardOf(tree, '重要不紧急').props.onDrop(fakeEvent())
  assert.deepEqual(moves, [['r', '2026-11-13', true, 'important_not_urgent']])
})

test('dragStart 缺 dataTransfer 也不炸（老浏览器）', () => {
  const h = load()
  h.reset()
  const tree = h.render({ t: T, items: [row('a', 'urgent_important')], onSelect() {}, selectedId: null, onToggle() {}, onAdd() {}, onMove() {} })
  assert.doesNotThrow(() => rowOf(tree, 'a').props.onDragStart({ preventDefault() {} }))
})

test('收集箱里的行不可拖（拖拽只服务于象限归位）', () => {
  const h = load()
  const tree = h.renderInbox({ t: (k) => ({ inbox: '收集箱', empty: '还没有待办', addTodo: '新建', backToMatrix: '返回' }[k] ?? k), items: [row('a', null)], onSelect() {}, selectedId: null, onToggle() {}, onAdd() {} })
  assert.equal(rowOf(tree, 'a').props.draggable, undefined)
})