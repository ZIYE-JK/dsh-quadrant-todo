/** Due/overdue notification scheduler: dedupe ledger, quiet hours, toast queue, Feishu fan-out. */

import { readFile, writeFile, rename, mkdir, copyFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'

import { dateKey } from './bucket.js'
import { inQuietHours, minutesOf } from './settings.js'

const LEDGER_VERSION = 1
const LEDGER_KEEP_DAYS = 30
const DEFAULT_DAY_TIME = '09:00'   // 只给了日期没给时间时，按当天 09:00 算提醒点
const OVERDUE_AT = '09:00'         // 逾期每日提醒的固定时刻
const CHECKPOINT_TITLE_LIMIT = 5   // 通知正文里最多列几条标题，多的用「…」收尾
// 检查点是**准点**提醒：只在时刻之后的这半小时窗口内触发。不这么限的话，
// 开机/重启晚了会把上午 11 点的检查点在深夜补发出来，甚至 11:00 和 16:00 两条一起弹。
const CHECKPOINT_WINDOW_MINUTES = 30

/**
 * 纯计算：给定已成形的待办行，算出这一 tick 该触发哪些提醒。
 * 一条待办最多产出一个事件——已经逾期的就不再重复报「到期」。
 *
 * **提醒点 = 开始时间**（不再等时限）：
 *  - 时间点：`startTime` 就是那个点 → 到点报「到期」
 *  - 时间段：`startTime` 是开始 → **开始那一刻就提醒**，「09:30–10:00」在 09:30 响
 *  - 全天（没有时间）：回落到当天 `DEFAULT_DAY_TIME`（09:00）——不能默默不提醒
 * `notify.leadMinutes` 再把触发点整体提前。
 *
 * 「时限」仍然存在，只是用于逾期判定：`limitDay` 是提醒点自己所在的那天，
 * 从那天之后才升级成「逾期」，一天一次。
 *
 * 每天固定时刻的检查点不在这里逐条产出，而是由 `collectCheckpoints` 汇总成
 * **一条**事件（带上全部还没完成的标题），跟在后面一起返回。
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
    // 提醒时刻：有开始时间就用开始时间；全天任务回落到当天 09:00。
    const limitKey = start ?? DEFAULT_DAY_TIME
    const limitAt = new Date(`${due}T${limitKey}:00`)
    if (Number.isNaN(limitAt.getTime())) continue
    // 用**提醒点自己所在的那天**判断「是不是已经过了那天」，而不是 dueDate。
    // 这样提醒点跨过午夜时，不会在跨过午夜的第一 tick 就掉进逾期分支。
    const limitDay = dateKey(limitAt)

    // 1) 逾期：提醒点已过，而且已经不是提醒点那天了。一天最多一次。
    //    比「当天」晚一天，才不会和同一时刻的「到期」撞车。
    if (notify.overdueDaily && limitDay < today) {
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

    // 2) 到期：到提醒点那一刻。早于提醒点不响，所以刚建好的未来任务不会立刻弹。
    if (limitDay < today) continue                       // 过去的日期不再补发，归逾期路径管
    if (staleAtBirth(item, limitDay, limitAt)) continue  // 建单时提醒点就已过去（同一天内）
    const triggerAt = new Date(limitAt.getTime() - notify.leadMinutes * 60000)
    if (at >= triggerAt) {
      out.push({
        id: item.id,
        title: item.title,
        kind: 'due',
        dueDate: due,
        dueTime: limitKey,
        key: `${item.id}|${due}|due`,
        // 渲染文案要用：提前了几分钟、以及是不是全天（全天的 09:00 只是哨兵，
        // 说成「开始」会误导，所以分开措辞）。
        leadMinutes: notify.leadMinutes,
        allDay: start === null,
      })
    }
  }

  // 3) 每日检查点：到点汇总一次「这个节点前还没完成的」。只有设置里真的给了时刻
  //    才产出——老调用方传半个 notify 对象进来时，行为与从前完全一致。
  out.push(...collectCheckpoints(items, at, notify))
  return out
}

/**
 * 每日检查点：在 11:00 / 16:00 这类时刻，汇总**这个节点之前就排上、但还没完成**的待办。
 * 每个时刻最多产出一条事件（不是一条待办一条），正文里带上标题清单。
 *
 * 收录规则：
 *  - 未完成、未放弃
 *  - 有排期（dueDate 非空）且不晚于今天 —— 前几天留下来的（逾期）一定收录
 *  - 今天的：开始时间早于检查点；没有开始时间的（全天）一律收录，否则全天任务永远不出现
 * 清单为空时**不产出**（不做「0 项未完成」的骚扰）。去重交给通知账本，键按「日期 + 时刻」。
 * 只在准点后的 `CHECKPOINT_WINDOW_MINUTES` 分钟内触发：晚于窗口就当这一天已经过去了。
 *
 * @returns {Array<{id,kind,dueDate,dueTime,key,titles,count}>}
 */
export function collectCheckpoints(items, at, notify) {
  const checkpoints = Array.isArray(notify?.checkpoints) ? notify.checkpoints : []
  if (checkpoints.length === 0) return []
  const today = dateKey(at)
  const nowMinutes = at.getHours() * 60 + at.getMinutes()
  const out = []
  for (const raw of checkpoints) {
    const checkpointMinutes = minutesOf(raw)
    if (checkpointMinutes === null) continue      // 坏值忽略，绝不抛
    if (nowMinutes < checkpointMinutes) continue  // 还没到这个时刻
    if (nowMinutes >= checkpointMinutes + CHECKPOINT_WINDOW_MINUTES) continue  // 窗口已过，不补发
    const picked = []
    for (const item of items) {
      if (item.bucket === 'done' || item.done === true) continue
      if (item.abandoned === true) continue
      const due = item.dueDate
      if (typeof due !== 'string' || due === '') continue   // 没排期的不算「这个节点前」
      if (due > today) continue                             // 今天之后排的还不提醒
      // 前几天留下来的（逾期）按定义就在今天这个节点之前，不再看它的时刻；
      // 只有今天的项目才需要比时刻：全天收录，排在这个点之后的先不提醒。
      if (due === today) {
        const start = typeof item.startTime === 'string' && item.startTime !== '' ? item.startTime : null
        const startMinutes = start === null ? null : minutesOf(start)
        if (startMinutes !== null && startMinutes >= checkpointMinutes) continue
      }
      picked.push(item)
    }
    if (picked.length === 0) continue
    picked.sort(compareCheckpointOrder)
    out.push({
      id: 'checkpoint',
      kind: 'checkpoint',
      dueDate: today,
      dueTime: raw,
      key: `checkpoint|${today}|${raw}`,
      titles: picked.map((item) => String(item.title ?? '')),
      count: picked.length,
    })
  }
  return out
}

/**
 * 检查点清单的排序：和客户端统一的 compareTodoOrder 同一口径（只是这里全是未完成）。
 * 没有时间的（全天）在前，然后按开始时间、创建时间，最后按标题，保证顺序稳定。
 */
function compareCheckpointOrder(a, b) {
  const aStart = minutesOf(a.startTime)
  const bStart = minutesOf(b.startTime)
  if (aStart === null || bStart === null) {
    if (aStart !== bStart) return aStart === null ? -1 : 1
  } else if (aStart !== bStart) {
    return aStart - bStart
  }
  const byCreated = String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? ''))
  if (byCreated !== 0) return byCreated
  return String(a.title ?? '').localeCompare(String(b.title ?? ''))
}

/** 通知正文里的标题清单：最多 5 条，多的用「…」收尾。 */
function checkpointTitlesText(titles) {
  const shown = titles.slice(0, CHECKPOINT_TITLE_LIMIT)
  return shown.join('、') + (titles.length > shown.length ? ' …' : '')
}

/**
 * 这条待办「出生时」提醒点就已经到了吗？
 * 两种都会命中：
 *  - 09:30 建一条今天、没填时间的待办，默认提醒点 09:00 早已过去；
 *  - 新建时时间点默认就是此刻（13:30 建、提醒点也是 13:30）；
 *  - 时间段「09:30–10:00」在 09:33 才建：提醒点是 09:30，同样已经过去。
 * 这些都不是「到期」，只是默认值/开始时间落在现在或过去。别在创建后几秒就弹一次。
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
    // 注意：这里**仍然看结束时间**。到期提醒改成了「开始时提醒」，但
    // 「超过期限未完成 → 自动放弃」说的是真正的期限，时间段要到结束才算超期。
    // 同样跳过「建单时就已过期」的。
    if (!Number.isNaN(limitAt.getTime()) && at >= limitAt && !staleAtBirth(item, due, limitAt)) out.push(item.id)
  }
  return out
}

/** 通知正文（系统通知与飞书共用措辞）。 */
export function renderMessage(event) {
  if (event.kind === 'checkpoint') {
    const titles = Array.isArray(event.titles) ? event.titles.map((item) => String(item)) : []
    const count = Number.isFinite(event.count) ? event.count : titles.length
    const when = event.dueTime ? `${event.dueTime} 的检查点` : '检查点'
    return { title: `📋 检查点 · 还有 ${count} 项未完成`, body: `${when}\n${checkpointTitlesText(titles)}` }
  }
  const when = event.dueTime ? `${event.dueDate} ${event.dueTime}` : event.dueDate
  const lead = Number.isFinite(event.leadMinutes) ? event.leadMinutes : 0
  if (event.kind === 'overdue') {
    const label = event.allDay ? '原定' : '原定'
    return { title: '⏰ 待办已逾期', body: `${event.title}\n${label} ${when} 该开始，还没完成` }
  }
  // 提醒点是「开始」，不是「到期」。提前量必须写出来——否则用户在 09:55
  // 收到一条「10:00 到期」会以为发早了。
  if (event.allDay) {
    return { title: '🔔 待办提醒', body: `${event.title}\n今天 · 全天` }
  }
  const title = lead > 0 ? `🔔 待办即将开始` : '🔔 待办开始'
  const body = lead > 0
    ? `${event.title}\n${lead} 分钟后开始 · ${when}`
    : `${event.title}\n现在开始 · ${when}`
  return { title, body }
}

/** 飞书 markdown 正文。 */
function renderFeishu(event) {
  if (event.kind === 'checkpoint') {
    const titles = Array.isArray(event.titles) ? event.titles.map((item) => String(item)) : []
    const count = Number.isFinite(event.count) ? event.count : titles.length
    const shown = titles.slice(0, CHECKPOINT_TITLE_LIMIT)
    const lines = shown.map((title) => `- ${title}`)
    if (titles.length > shown.length) lines.push(`- …还有 ${titles.length - shown.length} 项`)
    return `📋 **检查点** 还有 ${count} 项未完成\n${lines.join('\n')}`
  }
  const when = event.dueTime ? `${event.dueDate} ${event.dueTime}` : event.dueDate
  const lead = Number.isFinite(event.leadMinutes) ? event.leadMinutes : 0
  if (event.kind === 'overdue') {
    return `⏰ **待办已逾期**\n- ${event.title}\n- 原定 ${when} 该开始，还没完成`
  }
  if (event.allDay) {
    return `🔔 **待办提醒**\n- ${event.title}\n- 今天 · 全天`
  }
  const head = lead > 0 ? '🔔 **待办即将开始**' : '🔔 **待办开始**'
  const line = lead > 0 ? `${lead} 分钟后开始 · ${when}` : `现在开始 · ${when}`
  return `${head}\n- ${event.title}\n- ${line}`
}

/** 从飞书集成配置里取 owner 的 openId —— 用来建自投递目标。 */
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
      catch (err) { logger.warn?.('[dsh-quadrant-todolist] 标记放弃失败：', err?.message ?? err) }
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
        logger.warn?.('[dsh-quadrant-todolist] 通知账本落盘失败（下次仍会重试投递）：', err?.message ?? err)
      }
    }
    if (feishuJobs.length > 0) {
      const results = await Promise.all(feishuJobs)
      for (const r of results) {
        if (!r.ok) logger.warn?.('[dsh-quadrant-todolist] 飞书通知未送达：', r.detail)
      }
    }
    return { fired, deferred, abandoned }
  }

  return {
    async start() {
      await loadLedger()
      if (timer !== null) return
      timer = setInterval(() => {
        tick().catch((err) => logger.warn?.('[dsh-quadrant-todolist] 通知调度异常：', err?.message ?? err))
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
      if (dropped > 0) logger.warn?.(`[dsh-quadrant-todolist] 丢弃 ${dropped} 条过期通知`)
      // titles / count 让客户端用字典渲染检查点文案；其余事件上是 undefined，序列化时自然消失。
      return {
        toasts: fresh.map(({ id, title, body, kind, dueDate, dueTime, titles, count }) => (
          { id, title, body, kind, dueDate, dueTime, titles, count }
        )),
      }
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
