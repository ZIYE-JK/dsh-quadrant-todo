/**
 * 把待办拖到小日历的某一天 → 只改日期，其余不变。
 *
 * 需求原文：「我拖动某条待办，拖到小日历的某一日期后，该条待办除日期外的信息不变，
 * 日期按拖动到的日期更新并保存」；循环任务要弹三选一。
 *
 * 这里测的是**落点接线**（小日历每一格在拖动中才成为投放目标、放下时上报哪一天），
 * 以及 store 侧「拖期 + 本次及未来」的拆分口径。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { createStore } from '../lib/store.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(HERE, '..', 'client.js')

function load() {
  let src = fs.readFileSync(SRC, 'utf8')
  const marker = /return \{\r?\n\s*inject:/
  assert.ok(marker.test(src), 'factory return not found')
  src = src.replace(marker, 'globalThis.__EXPOSED__ = { LeftPanel };\r\n    return {\r\n      inject:')

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
    render(props) { hookIdx = 0; return sandbox.__EXPOSED__.LeftPanel(props) },
    reset() { hookStore.length = 0 },
  }
}

function walk(node, fn) {
  if (!node || typeof node !== 'object') return
  fn(node)
  for (const c of node.children || []) walk(c, fn)
}

/** 找到某个日期格子（aria-label 就是日期键）。 */
function cellOf(tree, key) {
  let hit = null
  walk(tree, (n) => { if (!hit && n.props && n.props['aria-label'] === key) hit = n })
  return hit
}

const T = (key) => key
const BASE = {
  t: T,
  activeFilter: 'all',
  onFilterChange() {}, categories: [], inboxCount: 0, uncategorizedCount: 0,
  onCreateCategory: async () => {}, onInboxFilter() {},
  monthCursor: { year: 2026, month: 10 },
  onMonthChange() {},
  calendarItems: [],
  onSelectDay() {}, selectedDay: null,
  statusFilter: 'all', onStatusChange() {},
  rangeMode: 'month', onRangeChange() {},
}

test('没在拖待办时，日历格子不是投放目标', () => {
  const h = load()
  h.reset()
  const tree = h.render({ ...BASE, dragging: false, onDayDrop() {} })
  const cell = cellOf(tree, '2026-11-16')
  assert.ok(cell, '找到 16 号格子')
  assert.equal(cell.props.onDrop, undefined, '不拖的时候不该接受放置')
})

test('拖动中：格子接受放置并上报那一天', () => {
  const h = load()
  h.reset()
  const dropped = []
  const tree = h.render({ ...BASE, dragging: true, onDayDrop: (key) => dropped.push(key) })
  const cell = cellOf(tree, '2026-11-16')
  assert.equal(typeof cell.props.onDrop, 'function')
  assert.equal(typeof cell.props.onDragOver, 'function')
  cell.props.onDragOver({ preventDefault() {} })
  // dragOver 之后要重新渲染才看得到高亮，但回调本身不依赖它
  cell.props.onDrop({ preventDefault() {} })
  assert.deepEqual(dropped, ['2026-11-16'])
})

test('格子点击仍然可用（拖动支持不该抢掉点选日期）', () => {
  const h = load()
  h.reset()
  const picked = []
  const tree = h.render({ ...BASE, dragging: true, onDayDrop() {}, onSelectDay: (key) => picked.push(key) })
  cellOf(tree, '2026-11-20').props.onClick()
  assert.deepEqual(picked, ['2026-11-20'])
})

// --- store：拖到某一天 + 「本次及未来」 ---

async function harness() {
  const dir = await mkdtemp(join(tmpdir(), 'todo-drag-date-'))
  const store = createStore({ file: join(dir, 'todos.json') })
  await store.load()
  return store
}

test('拖到某天 + 整个系列：只改日期，其余字段原样', async () => {
  const store = await harness()
  const t = await store.create({
    title: '月度经营分析', note: '备注留着', category: '经营分析报表',
    quadrant: 'urgent_important', dueDate: '2026-11-13', startTime: '10:00',
    repeat: { freq: 'monthly', monthDay: 13 },
  })
  const after = await store.update(t.id, { dueDate: '2026-11-16' })
  assert.equal(after.dueDate, '2026-11-16')
  assert.equal(after.title, '月度经营分析')
  assert.equal(after.note, '备注留着', '备注不变')
  assert.equal(after.category, '经营分析报表', '分类不变')
  assert.equal(after.quadrant, 'urgent_important', '象限不变')
  assert.equal(after.startTime, '10:00', '时间不变')
  assert.equal(after.repeat.monthDay, 16, '锚点跟随新日期')
})

test('拖到某天 + 仅本次：只有这一次换日子，系列规则不动', async () => {
  const store = await harness()
  const t = await store.create({ title: '月度经营分析', quadrant: 'urgent_important', dueDate: '2026-11-13', repeat: { freq: 'monthly', monthDay: 13 } })
  await store.overrideOccurrence(t.id, '2026-11-13', { dueDate: '2026-11-16' })
  const nov = (await store.occurrences({ from: '2026-11-01', to: '2026-11-30' })).items
  assert.deepEqual(nov.map((i) => i.date), ['2026-11-16'])
  const dec = (await store.occurrences({ from: '2026-12-01', to: '2026-12-31' })).items
  assert.deepEqual(dec.map((i) => i.date), ['2026-12-13'], '其余月份照旧 13 号')
})

test('拖到某天 + 本次及未来：新系列从拖到的日期开始，旧的截到前一天', async () => {
  const store = await harness()
  const t = await store.create({ title: '月度经营分析', quadrant: 'urgent_important', dueDate: '2026-11-13', repeat: { freq: 'monthly', monthDay: 13 } })
  // 把 12-13 这一次拖到 12-20，并选「本次及未来」
  const created = await store.splitSeries(t.id, '2026-12-13', { dueDate: '2026-12-20' })
  assert.notEqual(created.id, t.id)
  assert.equal(created.dueDate, '2026-12-20', '新系列起点 = 拖到的日期（不是分界日）')
  assert.equal(created.repeat.monthDay, 20, '锚点跟随新起点')
  const all = (await store.list({})).items
  const old = all.find((i) => i.id === t.id)
  assert.equal(old.repeat.until, '2026-12-12', '旧段截到分界前一天')
  assert.deepEqual((await store.occurrences({ from: '2026-11-01', to: '2026-11-30' })).items.map((i) => i.date), ['2026-11-13'])
  assert.deepEqual((await store.occurrences({ from: '2026-12-01', to: '2026-12-31' })).items.map((i) => i.date), ['2026-12-20'])
})