/** Due/overdue notification scheduler: dedupe ledger, quiet hours, toast queue, Feishu fan-out. */

import { readFile, writeFile, rename, mkdir, copyFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'

import { dateKey } from './bucket.js'
import { inQuietHours } from './settings.js'

const LEDGER_VERSION = 1
const LEDGER_KEEP_DAYS = 30
const DEFAULT_DAY_TIME = '09:00'   // 只给了日期没给时间时，按当天 09:00 算到期
const OVERDUE_AT = '09:00'         // 逾期每日提醒的固定时刻

/**
 * 纯计算：给定已成形的待办行，算出这一 tick 该触发哪些提醒。
 * 一条待办最多产出一个事件——已经逾期的就不再重复报「到期」。
 *
 * **两种时间模式的区别就在这里**：
 *  - 时间点：`startTime` 既是开始也是时限 → 到那个点报「到期」
 *  - 时间段：`startTime` 只是开始，**时限是 `endTime`** → 到结束时刻才报「到期」
 * 拿开始时间当截止，会让「09:30–10:00」在 09:30 就报「到期 · 截止 09:30」：
 * 既早于真正的时限，若建单时已过了 09:30，还会在创建后几秒立刻弹一次。
 *
 * @returns {Array<{id,title,kind,dueDate,dueTime,key}>}
 */
export function collectDue(items, at, notify) {
  const today = dateKey(at)
  const out = []
  for (const item of items) {
    if (item.bucket === 'done') continue
    if (item.abandoned === true) continue          // 已放弃的不再催办
    const due = item.dueDate
    if (typeof due !== 'string' || due === '') continue

    const start = typeof item.startTime === 'string' && item.startTime !== '' ? item.startTime : null
    const end = typeof item.endTime === 'string' && item.endTime !== '' ? item.endTime : null
    // 时限：时间段取结束时间，时间点取那个点，都没有则当天 09:00。
    const limitKey = end ?? start ?? DEFAULT_DAY_TIME
    const limitAt = new Date(`${due}T${limitKey}:00`)
    if (Number.isNaN(limitAt.getTime())) continue

    // 1) 逾期：时限已过，而且已经不是当天了。一天最多一次。
    //    比「当天」晚一天，才不会和同一时刻的「到期」撞车。
    if (notify.overdueDaily && due < today) {
      out.push({
        id: item.id,
        title: item.title,
        kind: 'overdue',
        dueDate: due,
        dueTime: limitKey,
        key: `${item.id}|${today}|overdue`,
      })
      continue
    }

    // 2) 到期：到时限那一刻。早于时限不响，所以刚建好的未来任务不会立刻弹。
    if (due < today) continue                       // 过去的日期不再补发，归逾期路径管
    if (staleAtBirth(item, due, limitAt)) continue  // 建单时时限就已过去（同一天内）
    const triggerAt = new Date(limitAt.getTime() - notify.leadMinutes * 60000)
    if (at >= triggerAt) {
      out.push({
        id: item.id,
        title: item.title,
        kind: 'due',
        dueDate: due,
        dueTime: limitKey,
        key: `${item.id}|${due}|due`,
      })
    }
  }
  return out
}

/**
 * 这条待办「出生时」时限就已经到了吗？
 * 两种都会命中：
 *  - 09:30 建一条今天、没填时间的待办，默认时限 09:00 早已过去；
 *  - 新建时时间点默认就是此刻（13:30 建、时限也是 13:30）。
 * 这两种都不是「到期」，只是默认值落在现在或过去。别在创建后几秒就弹一次。
 *
 * **只在同一天内判断**：跨天的截止（昨天建的、今天到期）永远不该被压掉，
 * 那种情况下「已过期」是真的过期。
 */
function staleAtBirth(item, dueKey, limitAt) {
  if (typeof item.createdAt !== 'string' || item.createdAt === '') return false
  const born = new Date(item.createdAt)
  if (Number.isNaN(born.getTime())) return false
  if (dateKey(born) !== dueKey) return false
  return limitAt <= born
}

/** 到期未完成、且这条任务选了「标记为放弃」——返回应当被放弃的 id。 */
export function collectAbandonable(items, at) {
  const out = []
  for (const item of items) {
    if (item.bucket === 'done' || item.abandoned === true) continue
    if (item.onOverdue !== 'abandon') continue
    const due = item.dueDate
    if (typeof due !== 'string' || due === '') continue
    const start = typeof item.startTime === 'string' && item.startTime !== '' ? item.startTime : null
    const end = typeof item.endTime === 'string' && item.endTime !== '' ? item.endTime : null
    const limitAt = new Date(`${due}T${end ?? start ?? DEFAULT_DAY_TIME}:00`)
    // 和时间点/时间段同一套时限口径：时间段看结束时间。同样跳过「建单时就已过期」的。
    if (!Number.isNaN(limitAt.getTime()) && at >= limitAt && !staleAtBirth(item, due, limitAt)) out.push(item.id)
  }
  return out
}

/** 通知正文（系统通知与飞书共用措辞）。 */
export function renderMessage(event) {
  const when = event.dueTime ? `${event.dueDate} ${event.dueTime}` : event.dueDate
  if (event.kind === 'overdue') {
    return { title: '⏰ 待办已逾期', body: `${event.title}\n截止 ${when}，还没完成` }
  }
  return { title: '🔔 待办到期', body: `${event.title}\n截止 ${when}` }
}

/** 飞书 markdown 正文。 */
function renderFeishu(event) {
  const when = event.dueTime ? `${event.dueDate} ${event.dueTime}` : event.dueDate
  const head = event.kind === 'overdue' ? '⏰ **待办已逾期**' : '🔔 **待办到期**'
  return `${head}\n- ${event.title}\n- 截止：${when}`
}

/** 从飞书集成配置里取老板本人的 openId —— 用来建自投递目标。 */
async function resolveOwnerOpenId() {
  const bases = []
  if (typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME !== '') bases.push(process.env.DSH_HOME)
  bases.push(join(homedir(), '.dsh'))
  for (const base of bases) {
    try {
      const raw = await readFile(join(base, 'integrations', 'dsh-feishu', 'config.json'), 'utf8')
      const cfg = JSON.parse(raw)
      const bot = Array.isArray(cfg?.bots) ? cfg.bots[0] : null
      const openId = Array.isArray(bot?.ownerOpenIds) ? bot.ownerOpenIds[0] : null
      if (typeof openId === 'string' && openId !== '') return openId
    } catch { /* 换下一个候选目录 */ }
  }
  return null
}

async function readLedger(file) {
  try {
    const doc = JSON.parse(await readFile(file, 'utf8'))
    if (doc && typeof doc === 'object' && doc.notified && typeof doc.notified === 'object') {
      return { version: LEDGER_VERSION, notified: doc.notified }
    }
  } catch { /* 缺失或损坏都当空账本重来——通知去重丢一轮，不影响待办数据 */ }
  return { version: LEDGER_VERSION, notified: {} }
}

function pruneLedger(ledger, at) {
  const cutoff = new Date(at.getTime() - LEDGER_KEEP_DAYS * 86400000).toISOString()
  const next = {}
  for (const [key, iso] of Object.entries(ledger.notified)) {
    if (typeof iso === 'string' && iso >= cutoff) next[key] = iso
  }
  ledger.notified = next
}

export function createNotifier({
  store,
  getIm = () => undefined,
  logger = console,
  intervalMs = 30000,
  toastTtlMs = 10 * 60000,
  now = () => new Date(),
} = {}) {
  const stateFile = join(dirname(store.dataFile()), 'notify-state.json')
  const ledger = { version: LEDGER_VERSION, notified: {} }
  /** 待弹队列：宿主判定，客户端取走并用 new Notification() 显示。 */
  let queue = []
  let timer = null
  let writing = Promise.resolve()
  let imWarned = false

  async function loadLedger() {
    const doc = await readLedger(stateFile)
    ledger.notified = doc.notified
  }

  async function saveLedger() {
    const snapshot = JSON.stringify({ version: LEDGER_VERSION, notified: ledger.notified }, null, 2)
    const write = writing.then(async () => {
      await mkdir(dirname(stateFile), { recursive: true })
      const tmp = `${stateFile}.tmp`
      await writeFile(tmp, snapshot, 'utf8')
      await rename(tmp, stateFile)
    })
    writing = write.catch(() => {})
    await write
  }

  /** 飞书发送。任何失败都只回报，不抛——通知失败不该影响待办本身。 */
  async function sendFeishu(text) {
    const im = getIm()
    if (!im || typeof im.send !== 'function') {
      return { ok: false, detail: 'dsh-im 未启用（拿不到 ctx.dshIm 服务）' }
    }
    try {
      const bots = await im.listBots()
      const bot = (Array.isArray(bots) ? bots : []).find((b) => b && b.channel === 'feishu')
      if (!bot) return { ok: false, detail: '没有找到飞书机器人' }

      const targetId = 'todo-alerts'
      const targets = await im.listTargets(bot.botId)
      const exists = Array.isArray(targets) && targets.some((t) => t && t.targetId === targetId)
      if (!exists) {
        const openId = await resolveOwnerOpenId()
        if (openId === null) {
          return { ok: false, detail: '找不到投递目标，也读不到飞书 ownerOpenIds，无法建立目标' }
        }
        try {
          await im.createTarget(bot.botId, {
            targetId,
            kind: 'user',
            route: { openId },
            name: '待办提醒',
          })
        } catch (err) {
          // 并发或已存在都算成功延续。
          if (err?.code !== 'target-conflict') {
            return { ok: false, detail: `创建投递目标失败：${err?.message ?? err}` }
          }
        }
      }
      const res = await im.send(bot.botId, targetId, text, { format: 'markdown' })
      if (res?.sent === true) return { ok: true, detail: '飞书已接收' }
      return { ok: false, detail: `飞书未确认送达：${JSON.stringify(res)}` }
    } catch (err) {
      return { ok: false, detail: `${err?.code ? err.code + ': ' : ''}${err?.message ?? err}` }
    }
  }

  async function tick(at = now()) {
    const notify = (await store.settings()).notify
    let { items } = await store.list({})

    // 「超过期限未完成 → 标记为放弃」：先把状态落下去，再据此算该发哪些提醒。
    let abandoned = 0
    for (const id of collectAbandonable(items, at)) {
      try { await store.setAbandoned(id, true); abandoned += 1 }
      catch (err) { logger.warn?.('[dsh-sidebar-todo] 标记放弃失败：', err?.message ?? err) }
    }
    if (abandoned > 0) ({ items } = await store.list({}))

    const events = collectDue(items, at, notify)
    if (events.length === 0) return { fired: 0, deferred: 0, abandoned }

    // 静默时段：不投递也不记账，等静默结束后的 tick 再发。
    if (inQuietHours(notify.quietHours, at)) {
      return { fired: 0, deferred: events.length }
    }

    let fired = 0
    let deferred = 0
    const feishuJobs = []
    for (const event of events) {
      if (ledger.notified[event.key] !== undefined) { deferred += 1; continue }
      ledger.notified[event.key] = at.toISOString()
      fired += 1
      if (notify.system) {
        const msg = renderMessage(event)
        queue.push({ ...event, ...msg, at: at.getTime() })
      }
      if (notify.feishu) feishuJobs.push(sendFeishu(renderFeishu(event)))
    }

    if (fired > 0) {
      pruneLedger(ledger, at)
      try {
        await saveLedger()
      } catch (err) {
        logger.warn?.('[dsh-sidebar-todo] 通知账本落盘失败（下次仍会重试投递）：', err?.message ?? err)
      }
    }
    if (feishuJobs.length > 0) {
      const results = await Promise.all(feishuJobs)
      for (const r of results) {
        if (!r.ok) logger.warn?.('[dsh-sidebar-todo] 飞书通知未送达：', r.detail)
      }
    }
    return { fired, deferred, abandoned }
  }

  return {
    async start() {
      await loadLedger()
      if (timer !== null) return
      timer = setInterval(() => {
        tick().catch((err) => logger.warn?.('[dsh-sidebar-todo] 通知调度异常：', err?.message ?? err))
      }, intervalMs)
      // 后台定时器不该拖住进程退出。
      if (typeof timer.unref === 'function') timer.unref()
      void tick().catch(() => {})
    },

    stop() {
      if (timer === null) return
      clearInterval(timer)
      timer = null
    },

    /** 客户端取走待弹通知；过期项丢弃，避免离线一天后一次性炸出几十条。 */
    poll(at = now()) {
      if (queue.length === 0) return { toasts: [] }
      const cutoff = at.getTime() - toastTtlMs
      const fresh = queue.filter((t) => t.at >= cutoff)
      const dropped = queue.length - fresh.length
      queue = []
      if (dropped > 0) logger.warn?.(`[dsh-sidebar-todo] 丢弃 ${dropped} 条过期通知`)
      return { toasts: fresh.map(({ id, title, body, kind, dueDate, dueTime }) => ({ id, title, body, kind, dueDate, dueTime })) }
    },

    async sendTest(channel, at = now()) {
      if (channel === 'system') {
        const notify = (await store.settings()).notify
        if (!notify.system) return { ok: false, detail: '系统通知已在设置里关闭' }
        queue.push({
          id: 'test',
          title: '🔔 测试通知',
          body: '这是一条测试系统通知。能看到它就说明链路通了。',
          kind: 'test',
          dueDate: dateKey(at),
          dueTime: null,
          at: at.getTime(),
        })
        return { ok: true, detail: '已入队；前端下次轮询会弹出系统通知' }
      }
      if (channel === 'feishu') {
        return sendFeishu('🔔 **测试通知**\n这是一条来自 DSH 待办插件的测试消息。')
      }
      return { ok: false, detail: `未知通道：${String(channel)}` }
    },

    /** 供测试/自检：当前账本大小。 */
    ledgerSize: () => Object.keys(ledger.notified).length,
    _tick: tick,
    _loadLedger: loadLedger,
    stateFile: () => stateFile,
  }
}

export { resolveOwnerOpenId }
