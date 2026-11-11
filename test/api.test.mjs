/** API dispatch + agent-tool contract tests (v2 surface). */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createStore } from '../lib/store.js'
import { createApi } from '../lib/api.js'
import { createTool } from '../lib/tool.js'
import { createNotifier } from '../lib/notify.js'

async function harness() {
  const dir = await mkdtemp(join(tmpdir(), 'todo-api-'))
  const store = createStore({ file: join(dir, 'todos.json') })
  const ready = store.load()
  await ready
  const notifier = createNotifier({ store, logger: { warn() {} } })
  await notifier._loadLedger()
  const api = createApi(store, notifier)
  return { store, api, notifier, ready, dir }
}

test('api exposes the full v2 surface', async () => {
  const { api } = await harness()
  const expected = [
    'list', 'create', 'update', 'complete', 'confirm', 'remove',
    'categories', 'renameCategory', 'clearCategory', 'occurrences',
    'retry', 'parse', 'setQuadrant', 'subtaskAdd', 'subtaskUpdate',
    'subtaskRemove', 'setCategoryIcon', 'settings', 'saveSettings',
    'notifyPoll', 'notifyTest',
  ]
  for (const m of expected) assert.equal(typeof api[m], 'function', `api.${m} exists`)
})

test('notification methods are omitted when no notifier is wired', async () => {
  const { store } = await harness()
  const bare = createApi(store)
  assert.equal(typeof bare.list, 'function')
  assert.equal(bare.notifyPoll, undefined)
  assert.equal(bare.notifyTest, undefined)
})

test('setQuadrant + subtask methods drive the store correctly', async () => {
  const { api } = await harness()
  const created = await api.create({ title: '带子计划', quadrant: 'neither' })
  const withSub = await api.subtaskAdd({ id: created.id, title: '第一步' })
  const sid = withSub.subtasks[0].id
  // 故意再加一条**未完成**的子任务：否则「子任务全完成 → 主任务自动完成」
  // 会让主任务变成 done、bucket 变 done，收集箱计数就不再是 1 了。
  await api.subtaskAdd({ id: created.id, title: '第二步' })
  await api.subtaskUpdate({ id: created.id, subtaskId: sid, patch: { done: true } })
  const moved = await api.setQuadrant({ id: created.id, quadrant: null })
  assert.equal(moved.quadrant, null)
  assert.equal(moved.subtasks[0].done, true)
  assert.equal(moved.done, false, '还有子任务没完成，主任务不应被自动完成')
  assert.equal((await api.list({})).inboxCount, 1)
})

test('settings round-trip through the api', async () => {
  const { api } = await harness()
  const before = await api.settings()
  assert.equal(before.notify.system, true)
  const after = await api.saveSettings({ notify: { overlayTypo: true, feishu: false } })
  assert.equal(after.notify.feishu, false)
  assert.equal(after.notify.overlayTypo, undefined, 'unknown keys are dropped')
})

test('notifyTest("system") enqueues, notifyPoll drains', async () => {
  const { api } = await harness()
  const res = await api.notifyTest({ channel: 'system' })
  assert.equal(res.ok, true)
  const polled = await api.notifyPoll()
  assert.equal(polled.toasts.length, 1)
  assert.equal((await api.notifyPoll()).toasts.length, 0)
})

test('agent tool: add with quadrant, then list renders inbox count without throwing', async () => {
  const { api, ready } = await harness()
  const tool = createTool(api, ready)

  const added = await tool.execute({ action: 'add', title: '重要的事', quadrant: 'urgent_important' })
  assert.equal(added.item.quadrant, 'urgent_important')
  assert.equal(added.inboxCount, 0)

  await tool.execute({ action: 'add', title: '随手记的' })
  const listed = await tool.execute({ action: 'list' })
  assert.equal(listed.inboxCount, 1)

  // render must not throw and must surface the new fields
  const rendered = tool.output.render({ action: 'list' }, listed)
  const text = rendered[0].text
  assert.match(text, /收集箱 1/)
  assert.match(text, /重要且紧急/)
  assert.match(text, /收集箱/)
})

test('agent tool: subtask lifecycle through tool actions', async () => {
  const { api, ready } = await harness()
  const tool = createTool(api, ready)
  const t = await tool.execute({ action: 'add', title: '有子计划' })
  const s1 = await tool.execute({ action: 'subtaskAdd', id: t.item.id, title: '甲' })
  const sid = s1.item.subtasks[0].id
  const s2 = await tool.execute({ action: 'subtaskUpdate', id: t.item.id, subtaskId: sid, done: true })
  assert.equal(s2.item.subtasks[0].done, true)
  const s3 = await tool.execute({ action: 'subtaskRemove', id: t.item.id, subtaskId: sid })
  assert.deepEqual(s3.item.subtasks, [])
})

test('agent tool: rejects bad input with actionable messages', async () => {
  const { api, ready } = await harness()
  const tool = createTool(api, ready)
  await assert.rejects(() => tool.execute({ action: 'nope' }), /不支持的 action/)
  await assert.rejects(() => tool.execute({ action: 'complete' }), /id 必填/)
  await assert.rejects(() => tool.execute({ action: 'subtaskAdd', id: 'x' }), /id 必填|已经不在了/)
  await assert.rejects(
    () => tool.execute({ action: 'add', title: 'x', quadrant: 'urgent' }),
    /象限/,
  )
})

test('agent tool: list filters by quadrant and renders the filter note', async () => {
  const { api, ready } = await harness()
  const tool = createTool(api, ready)
  await tool.execute({ action: 'add', title: 'A', quadrant: 'neither' })
  await tool.execute({ action: 'add', title: 'B' })
  const inbox = await tool.execute({ action: 'list', view: 'open', quadrant: '__inbox__' })
  assert.equal(inbox.items.length, 1)
  assert.equal(inbox.items[0].title, 'B')
  const text = tool.output.render({ action: 'list', view: 'open', quadrant: '__inbox__' }, inbox)[0].text
  assert.match(text, /收集箱/)
})

test('agent tool: parameter schema stays strict', async () => {
  const { api, ready } = await harness()
  const tool = createTool(api, ready)
  assert.equal(tool.name, 'personal_todo')
  assert.equal(tool.parameters.additionalProperties, false)
  assert.ok(tool.parameters.properties.quadrant.enum.includes('urgent_important'))
  assert.deepEqual(tool.parameters.required, ['action'])
})
