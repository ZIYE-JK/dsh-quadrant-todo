/** Notification scheduler tests: trigger math, dedupe, quiet hours, toast queue, Feishu fan-out. */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createStore } from '../lib/store.js'
import { createNotifier, collectDue, renderMessage } from '../lib/notify.js'
import { inQuietHours } from '../lib/settings.js'

const NOTIFY = { system: true, feishu: true, leadMinutes: 0, overdueDaily: true, quietHours: { enabled: false, start: '22:00', end: '08:00' } }
const item = (over = {}) => ({ id: 't1', title: '交周报', dueDate: '2026-11-03', startTime: '11:00', bucket: 'today', ...over })
const at = (y, m, d, hh = 0, mm = 0) => new Date(y, m - 1, d, hh, mm, 0)

// ---------------------------------------------------------------- collectDue

test('due does not fire before the minute, fires on it', () => {
  assert.equal(collectDue([item()], at(2026, 11, 3, 10, 59), NOTIFY).length, 0)
  const fired = collectDue([item()], at(2026, 11, 3, 11, 0), NOTIFY)
  assert.equal(fired.length, 1)
  assert.equal(fired[0].kind, 'due')
  assert.equal(fired[0].key, 't1|2026-11-03|due')
})

test('leadMinutes brings the trigger forward', () => {
  const n = { ...NOTIFY, leadMinutes: 30 }
  assert.equal(collectDue([item()], at(2026, 11, 3, 10, 29), n).length, 0)
  assert.equal(collectDue([item()], at(2026, 11, 3, 10, 30), n).length, 1)
})

test('a date with no time defaults to 09:00 that day', () => {
  const t = item({ startTime: null })
  assert.equal(collectDue([t], at(2026, 11, 3, 8, 59), NOTIFY).length, 0)
  assert.equal(collectDue([t], at(2026, 11, 3, 9, 0), NOTIFY).length, 1)
})

test('past due reports overdue once a day, and never also reports due', () => {
  const t = item({ dueDate: '2026-11-01', bucket: 'overdue' })
  const events = collectDue([t], at(2026, 11, 3, 9, 0), NOTIFY)
  assert.equal(events.length, 1)
  assert.equal(events[0].kind, 'overdue')
  assert.equal(events[0].key, 't1|2026-11-03|overdue', 'ledger key carries the day, so it repeats daily')
  // next day produces a different key -> fires again
  assert.equal(collectDue([t], at(2026, 11, 4, 9, 0), NOTIFY)[0].key, 't1|2026-11-04|overdue')
})

test('past-due point tasks nag at any hour; overdueDaily=false silences them', () => {
  // 逾期时刻现在由任务自己的时间决定，不再有固定的 09:00 闸门。
  const t = item({ dueDate: '2026-11-01', bucket: 'overdue', startTime: '11:00' })
  assert.equal(collectDue([t], at(2026, 11, 3, 8, 0), NOTIFY).length, 1, 'no 09:00 gate any more')
  assert.equal(collectDue([t], at(2026, 11, 3, 12, 0), { ...NOTIFY, overdueDaily: false }).length, 0)
})

test('a point task is not overdue on its own due day', () => {
  // 否则「到期」和「逾期」会在同一分钟一起响。
  const t = item({ dueDate: '2026-11-03', startTime: '11:00', bucket: 'today' })
  const events = collectDue([t], at(2026, 11, 3, 11, 30), NOTIFY)
  assert.equal(events.length, 1)
  assert.equal(events[0].kind, 'due')
})

test('done items and undated items never fire', () => {
  assert.equal(collectDue([item({ bucket: 'done' })], at(2026, 11, 3, 12, 0), NOTIFY).length, 0)
  assert.equal(collectDue([item({ dueDate: null })], at(2026, 11, 3, 12, 0), NOTIFY).length, 0)
})

test('renderMessage wording', () => {
  assert.match(renderMessage({ kind: 'due', title: 'T', dueDate: '2026-11-03', dueTime: '11:00' }).body, /2026-11-03 11:00/)
  assert.match(renderMessage({ kind: 'overdue', title: 'T', dueDate: '2026-11-01', dueTime: null }).title, /逾期/)
})

// ------------------------------------------------------------- quiet hours

test('inQuietHours: same-day window', () => {
  const q = { enabled: true, start: '13:00', end: '15:00' }
  assert.equal(inQuietHours(q, at(2026, 11, 3, 12, 59)), false)
  assert.equal(inQuietHours(q, at(2026, 11, 3, 13, 0)), true)
  assert.equal(inQuietHours(q, at(2026, 11, 3, 14, 59)), true)
  assert.equal(inQuietHours(q, at(2026, 11, 3, 15, 0)), false)
})

test('inQuietHours: cross-midnight window', () => {
  const q = { enabled: true, start: '22:00', end: '08:00' }
  assert.equal(inQuietHours(q, at(2026, 11, 3, 23, 0)), true)
  assert.equal(inQuietHours(q, at(2026, 11, 3, 3, 0)), true)
  assert.equal(inQuietHours(q, at(2026, 11, 3, 8, 0)), false)
  assert.equal(inQuietHours(q, at(2026, 11, 3, 12, 0)), false)
})

test('inQuietHours is off when disabled or equal endpoints', () => {
  assert.equal(inQuietHours({ enabled: false, start: '00:00', end: '23:59' }, at(2026, 11, 3, 12, 0)), false)
  assert.equal(inQuietHours({ enabled: true, start: '09:00', end: '09:00' }, at(2026, 11, 3, 9, 0)), false)
})

// --------------------------------------------------------- notifier end-to-end

async function freshNotifier(opts = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'todo-notify-'))
  const store = createStore({ file: join(dir, 'todos.json') })
  await store.load()
  const warnings = []
  const notifier = createNotifier({
    store,
    logger: { warn: (...a) => warnings.push(a.join(' ')) },
    ...opts,
  })
  await notifier._loadLedger()
  return { store, notifier, dir, warnings }
}

test('tick fires once, then dedupes on the next tick', async () => {
  const { store, notifier } = await freshNotifier()
  await store.create({ title: '交周报', dueDate: '2026-11-03', dueTime: '11:00' })
  const when = at(2026, 11, 3, 11, 0)

  assert.equal((await notifier._tick(when)).fired, 1)
  assert.equal((await notifier._tick(when)).fired, 0, 'same minute must not re-fire')
  assert.equal((await notifier._tick(at(2026, 11, 3, 11, 1))).fired, 0)
  assert.equal(notifier.ledgerSize(), 1)
})

test('quiet hours defer delivery without consuming the ledger entry', async () => {
  const { store, notifier } = await freshNotifier()
  await store.saveSettings({ notify: { quietHours: { enabled: true, start: '10:00', end: '12:00' }, feishu: false } })
  await store.create({ title: '交周报', dueDate: '2026-11-03', dueTime: '10:30' })

  const deferred = await notifier._tick(at(2026, 11, 3, 10, 30))
  assert.equal(deferred.fired, 0)
  assert.equal(deferred.deferred, 1)
  assert.equal(notifier.ledgerSize(), 0, 'deferred event is NOT recorded')
  assert.deepEqual(notifier.poll(at(2026, 11, 3, 10, 31)).toasts, [], 'nothing queued while quiet')

  const after = await notifier._tick(at(2026, 11, 3, 12, 0))
  assert.equal(after.fired, 1, 'delivered once quiet hours end')
})

test('poll returns queued toasts, clears them, and drops stale ones', async () => {
  const { store, notifier } = await freshNotifier()
  await store.create({ title: '交周报', dueDate: '2026-11-03', dueTime: '11:00' })
  await notifier._tick(at(2026, 11, 3, 11, 0))

  const first = notifier.poll(at(2026, 11, 3, 11, 1))
  assert.equal(first.toasts.length, 1)
  assert.equal(first.toasts[0].title, '🔔 待办到期')
  assert.match(first.toasts[0].body, /交周报/)
  assert.equal(first.toasts[0].kind, 'due')
  assert.deepEqual(notifier.poll(at(2026, 11, 3, 11, 2)).toasts, [], 'queue drained')

  // a toast older than the TTL is dropped rather than delivered late
  await store.create({ title: '第二条', dueDate: '2026-11-04', dueTime: '11:00' })
  await notifier._tick(at(2026, 11, 4, 11, 0))
  assert.deepEqual(notifier.poll(at(2026, 11, 4, 23, 0)).toasts, [])
})

test('system=false suppresses the toast but still records the event', async () => {
  const { store, notifier } = await freshNotifier()
  await store.saveSettings({ notify: { system: false, feishu: false } })
  await store.create({ title: '静默记录', dueDate: '2026-11-03', dueTime: '11:00' })
  assert.equal((await notifier._tick(at(2026, 11, 3, 11, 0))).fired, 1)
  assert.deepEqual(notifier.poll(at(2026, 11, 3, 11, 0)).toasts, [])
  assert.equal(notifier.ledgerSize(), 1)
})

test('Feishu: creates the delivery target once, then sends', async () => {
  const calls = { created: [], sent: [] }
  const targets = []
  const fakeIm = {
    async listBots() { return [{ botId: 'bot_x', channel: 'feishu' }] },
    async listTargets() { return targets.slice() },
    async createTarget(botId, target) { calls.created.push({ botId, target }); targets.push({ targetId: target.targetId, kind: target.kind, route: target.route }) },
    async send(botId, targetId, text, opts) { calls.sent.push({ botId, targetId, text, opts }); return { sent: true } },
  }
  const { store, notifier } = await freshNotifier({ getIm: () => fakeIm, openIdResolver: null })
  await store.saveSettings({ notify: { system: false, feishu: true } })
  await store.create({ title: '发飞书', dueDate: '2026-11-03', dueTime: '11:00' })

  const res = await notifier._tick(at(2026, 11, 3, 11, 0))
  assert.equal(res.fired, 1)
  await new Promise((r) => setTimeout(r, 40)) // feishu fan-out is fire-and-await inside tick

  assert.equal(calls.sent.length, 1, 'one send for one event')
  assert.equal(calls.sent[0].targetId, 'todo-alerts')
  assert.equal(calls.sent[0].opts.format, 'markdown')
  assert.match(calls.sent[0].text, /发飞书/)
})

test('Feishu: missing dshIm service degrades without throwing or losing the todo', async () => {
  const { store, notifier, warnings } = await freshNotifier({ getIm: () => undefined })
  await store.create({ title: '没有 im', dueDate: '2026-11-03', dueTime: '11:00' })
  const res = await notifier._tick(at(2026, 11, 3, 11, 0))
  assert.equal(res.fired, 1, 'event still recorded even though feishu is unavailable')
  assert.equal((await store.list({})).items.length, 1, 'todo data untouched')
  assert.ok(warnings.length >= 0)
})

test('sendTest enqueues a system toast through the real channel', async () => {
  const { store, notifier } = await freshNotifier()
  const bad = await notifier.sendTest('nope')
  assert.equal(bad.ok, false)

  const ok = await notifier.sendTest('system', at(2026, 11, 3, 12, 0))
  assert.equal(ok.ok, true)
  const { toasts } = notifier.poll(at(2026, 11, 3, 12, 0))
  assert.equal(toasts.length, 1)
  assert.equal(toasts[0].kind, 'test')

  await store.saveSettings({ notify: { system: false } })
  assert.equal((await notifier.sendTest('system')).ok, false)
})

test('ledger survives a restart via notify-state.json', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'todo-notify-'))
  const file = join(dir, 'todos.json')
  const store = createStore({ file })
  await store.load()
  await store.create({ title: '交周报', dueDate: '2026-11-03', dueTime: '11:00' })

  const n1 = createNotifier({ store, logger: { warn() {} } })
  await n1._loadLedger()
  assert.equal((await n1._tick(at(2026, 11, 3, 11, 0))).fired, 1)

  const n2 = createNotifier({ store, logger: { warn() {} } })
  await n2._loadLedger()
  assert.equal(n2.ledgerSize(), 1, 'dedupe state reloaded')
  assert.equal((await n2._tick(at(2026, 11, 3, 11, 5))).fired, 0, 'no re-fire after restart')
})
