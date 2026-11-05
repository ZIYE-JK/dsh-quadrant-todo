/**
 * v5 提醒模型测试：
 *  - 提醒点 = 开始时间（时间段在开始那一刻提醒，全天回落到 09:00）
 *  - 每天 11:00 / 16:00 的检查点：汇总「这个节点前还没完成的」，一天一次、列表为空不产出
 *  - 设置里的 checkpoints 默认值 / 宽容归一化 / 老数据兜底
 *  - 中英文字典与客户端文案渲染（从 client.js 源码里抠真函数来跑，和 sort.test.mjs 同一套办法）
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createStore } from '../lib/store.js'
import { createNotifier, collectCheckpoints, collectDue, renderMessage } from '../lib/notify.js'
import { normalizeCheckpoints } from '../lib/model.js'

const NOTIFY = {
  system: true, feishu: false, leadMinutes: 0, overdueDaily: true,
  checkpoints: ['11:00', '16:00'],
  quietHours: { enabled: false, start: '22:00', end: '08:00' },
}
const at = (y, m, d, hh = 0, mm = 0) => new Date(y, m - 1, d, hh, mm, 0)
/** 一条已成形的待办行：默认今天、全天、未完成。 */
const row = (over = {}) => ({ id: 'x', title: 'x', dueDate: '2026-11-03', startTime: null, bucket: 'today', ...over })

// ------------------------------------------------------------------ 检查点内容

test('checkpoint: one summary event per checkpoint, listing what was scheduled before it', () => {
  const items = [
    row({ id: 'a', title: '早会', startTime: '09:00' }),
    row({ id: 'b', title: '全天任务' }),
    row({ id: 'c', title: '下午的', startTime: '14:00' }),
    row({ id: 'd', title: '明天的', dueDate: '2026-11-04', startTime: '08:00' }),
    row({ id: 'e', title: '做完了', startTime: '08:00', bucket: 'done' }),
    row({ id: 'f', title: '放弃了', startTime: '08:00', abandoned: true }),
    row({ id: 'g', title: '昨天留下的', dueDate: '2026-11-02', startTime: '10:00' }),
  ]

  const eleven = collectCheckpoints(items, at(2026, 11, 3, 11, 0), NOTIFY)
  assert.equal(eleven.length, 1, 'one event per checkpoint, not one per todo')
  assert.equal(eleven[0].kind, 'checkpoint')
  assert.equal(eleven[0].dueDate, '2026-11-03')
  assert.equal(eleven[0].dueTime, '11:00')
  assert.equal(eleven[0].key, 'checkpoint|2026-11-03|11:00')
  assert.equal(eleven[0].count, 3)
  // 全天在最前，然后按开始时间升序 —— 和客户端 compareTodoOrder 同一口径。
  assert.deepEqual(eleven[0].titles, ['全天任务', '早会', '昨天留下的'])

  const four = collectCheckpoints(items, at(2026, 11, 3, 16, 0), NOTIFY)
  assert.equal(four.length, 1, 'the 11:00 checkpoint is not replayed at 16:00')
  assert.equal(four[0].dueTime, '16:00')
  assert.equal(four[0].count, 4)
  assert.deepEqual(four[0].titles, ['全天任务', '早会', '昨天留下的', '下午的'])
})

test('checkpoint: 全天 and carried-over items are included', () => {
  const items = [
    row({ id: 'all-day', title: '全天' }),
    row({ id: 'yesterday', title: '昨天的', dueDate: '2026-11-01', startTime: '23:00' }),
    row({ id: 'later-today', title: '今天下午', startTime: '15:00' }),
  ]
  const [eleven] = collectCheckpoints(items, at(2026, 11, 3, 11, 0), NOTIFY)
  assert.deepEqual(eleven.titles, ['全天', '昨天的'], '全天要出现，今天下午的还不提醒')
})

test('checkpoint: nothing is emitted when everything is done', () => {
  const finished = [
    row({ id: 'a', bucket: 'done', startTime: '09:00' }),
    row({ id: 'b', abandoned: true, startTime: '09:00' }),
    row({ id: 'c', dueDate: '2026-11-10', startTime: '08:00' }), // 未来的排期不算「这个节点前」
  ]
  assert.deepEqual(collectCheckpoints(finished, at(2026, 11, 3, 11, 0), NOTIFY), [], 'no "0 items" nag')
  assert.deepEqual(collectCheckpoints([], at(2026, 11, 3, 11, 0), NOTIFY), [])
})

test('checkpoint: punctual — not before its time, and no late catch-up', () => {
  const items = [row({ title: '早会', startTime: '09:00' })]
  assert.deepEqual(collectCheckpoints(items, at(2026, 11, 3, 10, 59), NOTIFY), [], 'not one minute early')
  assert.equal(collectCheckpoints(items, at(2026, 11, 3, 11, 0), NOTIFY).length, 1)
  assert.equal(collectCheckpoints(items, at(2026, 11, 3, 11, 29), NOTIFY).length, 1, 'still inside the window')
  assert.deepEqual(collectCheckpoints(items, at(2026, 11, 3, 11, 30), NOTIFY), [], 'window is over')
  assert.deepEqual(collectCheckpoints(items, at(2026, 11, 3, 23, 59), NOTIFY), [], 'no stale morning checkpoint at night')
})

test('checkpoint: bad times are ignored and an empty list disables it', () => {
  const items = [row({ title: '早会', startTime: '09:00' })]
  const messy = { ...NOTIFY, checkpoints: ['oops', '25:00', '9:00', null, '11:00'] }
  const events = collectCheckpoints(items, at(2026, 11, 3, 11, 10), messy)
  assert.deepEqual(events.map((event) => event.dueTime), ['11:00'], 'invalid entries are dropped, never thrown')
  assert.deepEqual(collectCheckpoints(items, at(2026, 11, 3, 11, 10), { ...NOTIFY, checkpoints: [] }), [], 'empty = off')
  assert.deepEqual(collectCheckpoints(items, at(2026, 11, 3, 11, 10), { ...NOTIFY, checkpoints: undefined }), [], 'absent = off for old callers')
})

test('checkpoint: collectDue carries it along, keyed per day and per time', () => {
  const items = [row({ id: 'a', title: '早会', startTime: '09:00' })]
  const today = collectDue(items, at(2026, 11, 3, 11, 0), NOTIFY).filter((event) => event.kind === 'checkpoint')
  assert.equal(today.length, 1)
  assert.equal(today[0].key, 'checkpoint|2026-11-03|11:00')

  const tomorrow = collectDue(items, at(2026, 11, 4, 11, 0), NOTIFY).filter((event) => event.kind === 'checkpoint')
  assert.equal(tomorrow[0].key, 'checkpoint|2026-11-04|11:00', 'a new key the next day')

  const legacy = collectDue(items, at(2026, 11, 3, 11, 0), { ...NOTIFY, checkpoints: undefined })
  assert.equal(legacy.filter((event) => event.kind === 'checkpoint').length, 0, 'callers without the field are unaffected')
})

// ------------------------------------------------------------------ 通知文本

test('renderMessage: the checkpoint summary caps the list at five', () => {
  const msg = renderMessage({ kind: 'checkpoint', count: 7, titles: ['a', 'b', 'c', 'd', 'e', 'f', 'g'], dueTime: '11:00' })
  assert.equal(msg.title, '📋 检查点 · 还有 7 项未完成')
  assert.match(msg.body, /11:00 的检查点/)
  assert.match(msg.body, /a、b、c、d、e …/)
  assert.ok(!msg.body.includes('f'), 'the sixth title is cut off')
  assert.match(renderMessage({ kind: 'checkpoint', count: 2, titles: ['x', 'y'], dueTime: '16:00' }).body, /x、y$/)
})

// ------------------------------------------------------------------ 端到端：账本去重

/** 一个已经落盘的 v4 数据文件；todos 自己给，settings 留空以验证默认值兜底。 */
async function storeWith(doc) {
  const dir = await mkdtemp(join(tmpdir(), 'todo-checkpoint-'))
  const file = join(dir, 'todos.json')
  await writeFile(file, JSON.stringify(doc, null, 2), 'utf8')
  const store = createStore({ file })
  await store.load()
  return { store, file }
}

/** 09:00 开始、09:30（本地）才建的待办：当天自己的「到期」被 staleAtBirth 压掉，只剩检查点。 */
function overdueishRow() {
  return {
    id: 'a', title: '早会', note: '', quadrant: null, priority: null, category: null,
    dueDate: '2026-11-03', duePreset: null, onOverdue: 'none',
    dueTime: null, startTime: '09:00', endTime: null,
    done: false, abandoned: false, abandonedAt: null, repeat: null, completions: {},
    subtasks: [], doneAt: null, doneBy: null, verifiedAt: null,
    createdAt: '2026-11-03T01:30:00.000Z', updatedAt: '2026-11-03T01:30:00.000Z',
  }
}

test('checkpoint: the notifier fires it once per checkpoint per day through the ledger', async () => {
  const { store } = await storeWith({ version: 4, todos: [overdueishRow()], categories: {}, settings: {} })
  assert.deepEqual((await store.settings()).notify.checkpoints, ['11:00', '16:00'], 'missing field falls back to the default')
  await store.saveSettings({ notify: { feishu: false } })
  assert.deepEqual((await store.settings()).notify.checkpoints, ['11:00', '16:00'], 'a partial patch keeps them')

  const notifier = createNotifier({ store, logger: { warn() {} } })
  await notifier._loadLedger()

  const eleven = await notifier._tick(at(2026, 11, 3, 11, 0))
  assert.equal(eleven.fired, 1, 'only the checkpoint: the row\'s own 到期 is stale at birth')

  const { toasts } = notifier.poll(at(2026, 11, 3, 11, 1))
  assert.equal(toasts.length, 1)
  assert.equal(toasts[0].kind, 'checkpoint')
  assert.equal(toasts[0].dueTime, '11:00')
  assert.equal(toasts[0].count, 1)
  assert.deepEqual(toasts[0].titles, ['早会'])
  assert.match(toasts[0].title, /检查点/)
  assert.match(toasts[0].body, /早会/)

  assert.equal((await notifier._tick(at(2026, 11, 3, 11, 5))).fired, 0, 'the same checkpoint is not repeated')
  assert.equal((await notifier._tick(at(2026, 11, 3, 16, 0))).fired, 1, '16:00 is a separate ledger key')
  assert.equal(notifier.ledgerSize(), 2)
  assert.equal((await notifier._tick(at(2026, 11, 4, 11, 0))).fired, 2, 'next day: the overdue nag plus a new checkpoint')
})

test('checkpoint: the Feishu summary names the checkpoint and lists the titles', async () => {
  const { store } = await storeWith({
    version: 4,
    todos: [overdueishRow()],
    categories: {},
    settings: { notify: { system: false, feishu: true } },
  })
  const sent = []
  const fakeIm = {
    async listBots() { return [{ botId: 'bot_x', channel: 'feishu' }] },
    async listTargets() { return [{ targetId: 'todo-alerts' }] },
    async createTarget() { throw new Error('the target already exists') },
    async send(botId, targetId, text, opts) { sent.push({ botId, targetId, text, opts }); return { sent: true } },
  }
  const notifier = createNotifier({ store, getIm: () => fakeIm, logger: { warn() {} } })
  await notifier._loadLedger()

  const res = await notifier._tick(at(2026, 11, 3, 11, 0))
  assert.equal(res.fired, 1)
  await new Promise((resolve) => setTimeout(resolve, 40)) // 飞书是在 tick 里 await 的
  assert.equal(sent.length, 1)
  assert.match(sent[0].text, /\*\*检查点\*\* 还有 1 项未完成/)
  assert.match(sent[0].text, /- 早会/)
  assert.deepEqual(notifier.poll(at(2026, 11, 3, 11, 1)).toasts, [], 'system notifications are off')
})

test('checkpoint: an all-done list keeps the notifier silent', async () => {
  const { store } = await storeWith({
    version: 4,
    todos: [{ ...overdueishRow(), done: true, doneAt: '2026-11-03T03:00:00.000Z' }],
    categories: {},
    settings: {},
  })
  const notifier = createNotifier({ store, logger: { warn() {} } })
  await notifier._loadLedger()
  assert.equal((await notifier._tick(at(2026, 11, 3, 11, 0))).fired, 0)
  assert.deepEqual(notifier.poll(at(2026, 11, 3, 11, 1)).toasts, [])
})

// ------------------------------------------------------------------ 设置默认值与归一化

test('settings: an old todos.json without checkpoints falls back to the default and can be patched', async () => {
  const legacy = {
    version: 4,
    todos: [],
    categories: {},
    settings: { notify: { quietHours: { enabled: false, start: '22:00', end: '08:00' } } },
  }
  const { store, file } = await storeWith(legacy)
  assert.deepEqual((await store.settings()).notify.checkpoints, ['11:00', '16:00'], 'absent field -> default')

  await store.saveSettings({ notify: { checkpoints: ['09:30', 'oops', '25:00', '9:00', '13:00', '09:30'] } })
  assert.deepEqual(
    (await store.settings()).notify.checkpoints,
    ['09:30', '13:00'],
    'invalid entries are ignored; what is left is deduped and sorted',
  )

  const reopened = createStore({ file })
  await reopened.load()
  assert.deepEqual((await reopened.settings()).notify.checkpoints, ['09:30', '13:00'], 'persisted')

  await store.saveSettings({ notify: { checkpoints: [] } })
  assert.deepEqual((await store.settings()).notify.checkpoints, [], 'an explicit empty list disables it')
})

test('settings: normalizeCheckpoints is tolerant of every shape', () => {
  assert.deepEqual(normalizeCheckpoints(undefined), ['11:00', '16:00'])
  assert.deepEqual(normalizeCheckpoints(null), ['11:00', '16:00'])
  assert.deepEqual(normalizeCheckpoints('not a time'), [])
  assert.deepEqual(normalizeCheckpoints('16:00, 11:00, oops'), ['11:00', '16:00'], 'a comma string is accepted')
  assert.deepEqual(normalizeCheckpoints(['24:00', '00:00']), ['00:00'], '24:00 is not a checkpoint')
  assert.deepEqual(normalizeCheckpoints([]), [])
  assert.deepEqual(normalizeCheckpoints(42), ['11:00', '16:00'], 'garbage falls back to the default')
})

// ------------------------------------------------------- 客户端：字典 + 解析 + 渲染

const CLIENT_SOURCE = await readFile(new URL('../client.js', import.meta.url), 'utf8')

/** 抠出一个具名函数声明的完整源码（从 `function name(` 到配对的 `}`）。 */
function extractFunction(source, name) {
  const match = new RegExp(`^[ \\t]*function ${name}\\(`, 'm').exec(source)
  assert.ok(match, `client.js 必须定义 function ${name}`)
  const start = match.index + match[0].indexOf('function')
  const open = source.indexOf('{', start)
  assert.notEqual(open, -1, `${name} 必须有函数体`)
  let depth = 0
  for (let index = open; index < source.length; index += 1) {
    const ch = source[index]
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return source.slice(start, index + 1)
    }
  }
  return assert.fail(`提取 ${name} 时花括号不配对`)
}

const DICT_START = CLIENT_SOURCE.indexOf('const dict = {')
const ORDER_START = CLIENT_SOURCE.indexOf('const ORDER = [', DICT_START)
assert.ok(DICT_START > 0 && ORDER_START > DICT_START, 'client.js 结构变了：提取字典的位置需要更新')
const DICT_SOURCE = CLIENT_SOURCE.slice(CLIENT_SOURCE.indexOf('{', DICT_START), CLIENT_SOURCE.lastIndexOf('}', ORDER_START) + 1)
const dict = new Function(`return (${DICT_SOURCE})`)()

const LIMIT_SOURCE = /const CHECKPOINT_TITLE_LIMIT = \d+/.exec(CLIENT_SOURCE)
assert.ok(LIMIT_SOURCE, 'client.js 必须定义 CHECKPOINT_TITLE_LIMIT')
const CLIENT_HELPERS = [
  LIMIT_SOURCE[0],
  ...['asText', 'splitTimeKey', 'minutesOfTime', 'parseCheckpoints', 'checkpointNotificationText'].map((name) => extractFunction(CLIENT_SOURCE, name)),
].join('\n')
const { parseCheckpoints, checkpointNotificationText } = new Function(
  `${CLIENT_HELPERS}\nreturn { parseCheckpoints, checkpointNotificationText }`,
)()

test('client dict: the checkpoint keys exist in BOTH languages', () => {
  const zh = Object.keys(dict.zh)
  const en = Object.keys(dict.en)
  assert.deepEqual([...zh].sort(), [...en].sort(), '两种语言的键必须一一对应（不许单边）')
  for (const key of ['checkpoints', 'checkpointsHint', 'checkpointTitle', 'checkpointSeparator']) {
    assert.ok(zh.includes(key), `zh 缺 ${key}`)
    assert.ok(en.includes(key), `en 缺 ${key}`)
  }
  assert.match(dict.zh.checkpointTitle, /\{count\}/)
  assert.match(dict.en.checkpointTitle, /\{count\}/)
})

test('client parseCheckpoints: invalid entries are dropped, never thrown', () => {
  assert.deepEqual(parseCheckpoints('11:00, 16:00'), ['11:00', '16:00'])
  assert.deepEqual(parseCheckpoints('16:00, 11:00'), ['11:00', '16:00'], 'sorted')
  assert.deepEqual(parseCheckpoints('11:00, oops, 25:00, 9:00'), ['11:00'])
  assert.deepEqual(parseCheckpoints('12:00; 13:00、14:00'), ['12:00', '13:00', '14:00'])
  assert.deepEqual(parseCheckpoints(''), [], 'empty input = checkpoints off')
  assert.deepEqual(parseCheckpoints(null), [])
})

test('client checkpointNotificationText: dict-rendered title, five-title cap, locale separator', () => {
  const t = (key) => dict.zh[key] ?? key
  const many = checkpointNotificationText({ kind: 'checkpoint', count: 7, titles: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }, t)
  assert.equal(many.title, '检查点 · 还有 7 项未完成')
  assert.equal(many.body, 'a、b、c、d、e …')

  const en = (key) => dict.en[key] ?? key
  assert.equal(checkpointNotificationText({ kind: 'checkpoint', count: 2, titles: ['a', 'b'] }, en).body, 'a, b')
  assert.equal(checkpointNotificationText({ kind: 'due', count: 1, titles: ['a'] }, t), null, 'other kinds fall through')
  assert.equal(checkpointNotificationText({ kind: 'checkpoint', titles: [] }, t), null, 'no titles -> host text')
})
