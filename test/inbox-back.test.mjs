/**
 * 收集箱那屏必须有「返回四象限」的出口。
 *
 * 真实反馈：「点了收集箱以后，没有返回的按钮」。
 * 根因：收集箱是 activeFilter === '__inbox__' 时**单独渲染的一屏**，
 * 而左栏「做计划」只切 rail、不清筛选 —— 进去以后除了左栏「全部分类」
 * 没有别的路可回，用户找不到。
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
  src = src.replace(marker, 'globalThis.__EXPOSED__ = { InboxArea, dict };\r\n    return {\r\n      inject:')

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
  return { ...sandbox.__EXPOSED__, reset() { hookIdx = 0 } }
}

function walk(node, fn) {
  if (!node || typeof node !== 'object') return
  fn(node)
  for (const c of node.children || []) walk(c, fn)
}

const collectText = (node) => {
  const out = []
  walk(node, (n) => { for (const c of n.children || []) if (typeof c === 'string') out.push(c) })
  return out.join(' ')
}

const fakeT = (key) => ({ inbox: '收集箱', empty: '还没有待办', addTodo: '新建', backToMatrix: '← 返回四象限' }[key] ?? key)

test('收集箱那屏渲染出「返回四象限」按钮', () => {
  const h = load()
  const tree = h.InboxArea({ t: fakeT, items: [], onSelect() {}, selectedId: null, onToggle() {}, onAdd() {}, onBack() {} })
  assert.ok(collectText(tree).includes('← 返回四象限'), '必须能看到返回入口')
})

test('点「返回四象限」回调被调用（= 把筛选切回全部）', () => {
  const h = load()
  let back = 0
  const tree = h.InboxArea({ t: fakeT, items: [], onSelect() {}, selectedId: null, onToggle() {}, onAdd() {}, onBack: () => { back += 1 } })
  let btn = null
  walk(tree, (n) => { if (!btn && n.type === 'button' && typeof n.props.onClick === 'function' && collectText(n).includes('返回四象限')) btn = n })
  assert.ok(btn, '找到返回按钮')
  btn.props.onClick()
  assert.equal(back, 1)
})

test('没有传 onBack 也不炸（兼容旧调用）', () => {
  const h = load()
  const tree = h.InboxArea({ t: fakeT, items: [], onSelect() {}, selectedId: null, onToggle() {}, onAdd() {} })
  let btn = null
  walk(tree, (n) => { if (!btn && n.type === 'button' && collectText(n).includes('返回四象限')) btn = n })
  assert.ok(btn)
  assert.doesNotThrow(() => btn.props.onClick())
})

test('中英文字典都有 backToMatrix', () => {
  const h = load()
  assert.equal(typeof h.dict.zh.backToMatrix, 'string')
  assert.ok(h.dict.zh.backToMatrix.trim() !== '')
  assert.equal(typeof h.dict.en.backToMatrix, 'string')
  assert.ok(h.dict.en.backToMatrix.trim() !== '')
})