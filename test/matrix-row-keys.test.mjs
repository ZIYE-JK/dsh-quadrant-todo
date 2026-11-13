/**
 * 矩阵 / 收集箱的兄弟节点 key 必须唯一。
 *
 * 真实踩到的：窗口展开后同一条循环任务会产出多行（同一个 id、不同 dueDate），
 * 而渲染用的是 `key: item.id` —— 兄弟间 key 重复。React 无法正确对账，
 * 切换「当月/当年/当天」时旧节点不被卸载，DOM 越堆越多，
 * 看着就像「同一条待办重复出现了十几次」，而表头计数（来自数据）却是对的。
 *
 * 这个测试断言兄弟 key 唯一，不依赖 React 内部行为。
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
  src = src.replace(marker, 'globalThis.__EXPOSED__ = { MatrixArea, InboxArea, rowKeyOf };\r\n    return {\r\n      inject:')

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
    useEffect() {}, useRef: (v) => ({ current: v }), useMemo: (fn) => fn(), useCallback: (fn) => fn,
    Fragment: 'Fragment',
  }

  const sandbox = {
    react,
    fetch: async () => ({ json: async () => ({ ok: true, result: {} }) }),
    URL, console: { error() {}, warn() {}, log() {} },
    JSON, Math, Date, Number, String, Boolean, Array, Object, Set, Map, Promise, RegExp, Error, Intl,
    window: { __ModuleLoader__: { load: ({ factory }) => { sandbox.__factory = factory } }, setTimeout: () => 0 },
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
    exposed: sandbox.__EXPOSED__,
    reset() { hookStore.length = 0 },
  }
}

const T = (key) => ({
  urgent_important: '重要且紧急', urgent_not_important: '紧急不重要',
  important_not_urgent: '重要不紧急', neither: '不重要不紧急', inbox: '收集箱',
  quadrantEmptyUrgentImportant: '立刻去做', quadrantEmptyUrgentNotImportant: '交给别人或自己做',
  quadrantEmptyImportantNotUrgent: '规划后再做', quadrantEmptyNeither: '有空再做',
  empty: '暂无待办', addTodo: '新建',
}[key] ?? key)

// expandRowsForWindow 的产物形状：同一 id、不同 dueDate
const instances = (id, title, dates, quadrant) => dates.map((dueDate) => ({
  id, title, quadrant, dueDate, done: false, startTime: null, createdAt: '2026-11-01T00:00:00.000Z',
}))

function walk(node, fn) {
  if (!node || typeof node !== 'object') return
  fn(node)
  for (const c of node.children || []) walk(c, fn)
}

test('rowKeyOf 把实例日期并进 key，同 id 不同日期不再撞车', () => {
  const h = load()
  const a = { id: 't1', dueDate: '2026-11-10' }
  const b = { id: 't1', dueDate: '2026-12-10' }
  assert.notEqual(h.exposed.rowKeyOf(a), h.exposed.rowKeyOf(b))
  assert.equal(h.exposed.rowKeyOf(a), h.exposed.rowKeyOf({ id: 't1', dueDate: '2026-11-10' }))
})

test('矩阵里同一条循环任务的多行，兄弟 key 必须唯一', () => {
  const h = load()
  h.reset()
  const items = [
    ...instances('t_rep', 'Performance合并', ['2026-11-10', '2026-12-10'], 'urgent_important'),
    ...instances('t_hr', '提供HR月度营业收入', ['2026-11-12', '2026-12-12'], 'urgent_important'),
  ]
  const tree = h.exposed.MatrixArea({ t: T, items, onSelect() {}, selectedId: null, onToggle() {}, onAdd() {} })
  // 只数待办行：象限卡片自己也带 key（q.key），别混进来。
  const keys = []
  walk(tree, (n) => { if (n.props && n.props.key !== undefined && n.props.item !== undefined) keys.push(n.props.key) })
  const dupes = keys.filter((k, i) => keys.indexOf(k) !== i)
  assert.deepEqual(dupes, [], `兄弟 key 重复: ${dupes.join(', ')}`)
  assert.equal(keys.length, 4, '4 个实例行都渲染出来了')
})

test('收集箱里同一条循环任务的多行，兄弟 key 也必须唯一', () => {
  const h = load()
  h.reset()
  const items = instances('t_rep', '月度复盘', ['2026-11-10', '2026-12-10', '2026-11-20'], null)
  const tree = h.exposed.InboxArea({ t: T, items, onSelect() {}, selectedId: null, onToggle() {}, onAdd() {} })
  const keys = []
  walk(tree, (n) => { if (n.props && n.props.key !== undefined && n.props.item !== undefined) keys.push(n.props.key) })
  const dupes = keys.filter((k, i) => keys.indexOf(k) !== i)
  assert.deepEqual(dupes, [], `兄弟 key 重复: ${dupes.join(', ')}`)
  assert.equal(keys.length, 3)
})
