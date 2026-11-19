/**
 * 左栏的隐藏 / 取消隐藏把手。
 *
 * 需求原文：「这里搞一个隐藏和取消隐藏的按钮吧，默认不隐藏。如果隐藏起来的时候，
 * 可以支持，当需要拖动待办的时候，鼠标超过左侧四象限的时候，这个可以自动取消隐藏，
 * 拖动到对应的日期后，重新隐藏」。
 *
 * 断言的是**行为**：点击切换、隐藏 + 拖动时才成为自动展开的感应区、未隐藏时不打扰。
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
  src = src.replace(marker, 'globalThis.__EXPOSED__ = { LeftHandle, dict };\r\n    return {\r\n      inject:')

  const react = {
    createElement: (type, props, ...children) => {
      const kids = children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false)
      const withKids = { ...(props || {}), children: kids }
      if (typeof type === 'function') return type(withKids)
      return { type, props: withKids, children: kids }
    },
    useState: (v) => [typeof v === 'function' ? v() : v, () => {}],
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
  return sandbox.__EXPOSED__
}

const T = (k) => ({ hideLeftPanel: '隐藏左栏', showLeftPanel: '显示左栏' }[k] ?? k)

const fakeEvent = () => {
  let prevented = 0
  return { preventDefault() { prevented += 1 }, get prevented() { return prevented } }
}

test('默认（未隐藏）时：点击 = 隐藏左栏，文案与箭头指对了', () => {
  const h = load()
  let toggles = 0
  const node = h.LeftHandle({ t: T, hidden: false, dragging: false, onToggle: () => { toggles += 1 }, onPeek() {} })
  assert.equal(node.props['aria-label'], '隐藏左栏')
  assert.equal(node.props.title, '隐藏左栏')
  node.props.onClick()
  assert.equal(toggles, 1)
})

test('已隐藏时：点击 = 取消隐藏', () => {
  const h = load()
  let toggles = 0
  const node = h.LeftHandle({ t: T, hidden: true, dragging: false, onToggle: () => { toggles += 1 }, onPeek() {} })
  assert.equal(node.props['aria-label'], '显示左栏')
  node.props.onClick()
  assert.equal(toggles, 1)
})

test('隐藏 + 拖动中 → 成为自动展开感应区，鼠标进来就回调 onPeek', () => {
  const h = load()
  let peeks = 0
  const node = h.LeftHandle({ t: T, hidden: true, dragging: true, onToggle() {}, onPeek: () => { peeks += 1 } })
  assert.equal(node.props['data-drop-zone'], 'true', '这时是加宽的感应区')
  const e = fakeEvent()
  node.props.onDragOver(e)
  assert.equal(peeks, 1)
  assert.equal(e.prevented, 1, '必须 preventDefault，否则浏览器不认这里是可放置区')
})

test('没隐藏时不抢拖拽：dragOver 不触发自动展开', () => {
  const h = load()
  let peeks = 0
  const node = h.LeftHandle({ t: T, hidden: false, dragging: true, onToggle() {}, onPeek: () => { peeks += 1 } })
  assert.equal(node.props['data-drop-zone'], 'false')
  node.props.onDragOver(fakeEvent())
  assert.equal(peeks, 0)
})

test('隐藏但没在拖动时不抢事件（避免误展开）', () => {
  const h = load()
  let peeks = 0
  const node = h.LeftHandle({ t: T, hidden: true, dragging: false, onToggle() {}, onPeek: () => { peeks += 1 } })
  assert.equal(node.props['data-drop-zone'], 'false')
  node.props.onDragOver(fakeEvent())
  assert.equal(peeks, 0)
})

test('键盘可达：Enter / 空格也能切换', () => {
  const h = load()
  let toggles = 0
  const node = h.LeftHandle({ t: T, hidden: false, dragging: false, onToggle: () => { toggles += 1 }, onPeek() {} })
  assert.equal(node.props.tabIndex, 0)
  node.props.onKeyDown({ key: 'Enter', preventDefault() {} })
  node.props.onKeyDown({ key: ' ', preventDefault() {} })
  assert.equal(toggles, 2)
  node.props.onKeyDown({ key: 'a', preventDefault() {} })
  assert.equal(toggles, 2, '其它键不该触发')
})

test('中英文字典都有把手文案', () => {
  const h = load()
  for (const lang of ['zh', 'en']) {
    for (const key of ['hideLeftPanel', 'showLeftPanel']) {
      assert.equal(typeof h.dict[lang][key], 'string', lang + '.' + key)
      assert.ok(h.dict[lang][key].trim() !== '')
    }
  }
})
