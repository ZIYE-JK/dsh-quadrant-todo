/** Record validation and normalization for todo entries. */

import { normalizeRepeat } from './repeat.js'
import { dateKey } from './bucket.js'

export class TodoError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'TodoError'
    this.code = code
  }
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
// 原来只校验「两位:两位」，25:99 这种也会通过；收紧到真实存在的时刻。
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
// 结束时间多认一个 24:00 = 「当天最后一刻」：23:00 开始的时段要能写到 24:00（界面显示 00:00）。
// 开始时间仍然只认 00:00–23:59 —— 一天不能从 24:00 开始。
const END_TIME_RE = /^(?:([01]\d|2[0-3]):[0-5]\d|24:00)$/
const PRIORITIES = new Set(['high', 'medium', 'low'])

/** 四象限。null 表示还没归类 —— 也就是「收集箱」。 */
export const QUADRANTS = new Set([
  'urgent_important',
  'urgent_not_important',
  'important_not_urgent',
  'neither',
])

/** 旧数据里有人把象限名写进了 category，v1→v2 迁移时按这张表搬回 quadrant。 */
export const LEGACY_QUADRANT_NAMES = {
  '重要且紧急': 'urgent_important',
  '紧急不重要': 'urgent_not_important',
  '重要不紧急': 'important_not_urgent',
  '不重要不紧急': 'neither',
}

/**
 * 「完成期限」的预设。真正的到期日仍落在 dueDate 上，duePreset 只记住用户选的是哪一种，
 * 这样重新打开选择器时能高亮回原来那一项（只存日期会把「当天」和「自定义=今天」混淆）。
 */
export const DUE_PRESETS = new Set(['today', 'this_week', 'this_work_week', 'custom'])

/** 超过期限未完成怎么办：什么都不做，或标记为放弃。 */
export const OVERDUE_MODES = new Set(['none', 'abandon'])

/**
 * 每日检查点：一天里的这几个时刻汇总「到现在还没完成的」。
 * 默认上午 11 点 + 下午 4 点；在通知设置里可以改成任意 HH:mm 列表，留空 = 关闭。
 */
export const DEFAULT_CHECKPOINTS = Object.freeze(['11:00', '16:00'])

export function newId() {
  const rand = Math.random().toString(36).slice(2, 6)
  return `t_${Date.now().toString(36)}_${rand}`
}

export function newSubtaskId() {
  const rand = Math.random().toString(36).slice(2, 6)
  return `s_${Date.now().toString(36)}_${rand}`
}

function asRecord(value) {
  if (value === undefined) return {}
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TodoError('invalid-input', '待办数据必须是对象')
  }
  return value
}

function text(value, max, field) {
  if (value === undefined || value === null) return ''
  if (typeof value !== 'string') throw new TodoError('invalid-input', `${field} 必须是文本`)
  const out = value.trim()
  if (out.length > max) throw new TodoError('invalid-input', `${field} 过长（上限 ${max} 字）`)
  return out
}

function nullableText(value, max, field) {
  if (value === undefined || value === null || value === '') return null
  return text(value, max, field)
}

function pickPriority(value) {
  if (value === undefined || value === null || value === '') return null
  if (!PRIORITIES.has(value)) throw new TodoError('invalid-input', '优先级只能是 high / medium / low')
  return value
}

function pickQuadrant(value) {
  if (value === undefined || value === null || value === '') return null
  if (!QUADRANTS.has(value)) {
    throw new TodoError(
      'invalid-input',
      '象限只能是 urgent_important / urgent_not_important / important_not_urgent / neither',
    )
  }
  return value
}

function pickDuePreset(value) {
  if (value === undefined || value === null || value === '') return null
  if (!DUE_PRESETS.has(value)) {
    throw new TodoError('invalid-input', '完成期限预设只能是 today / this_week / this_work_week / custom')
  }
  return value
}

function pickOnOverdue(value) {
  if (value === undefined || value === null || value === '') return 'none'
  if (!OVERDUE_MODES.has(value)) {
    throw new TodoError('invalid-input', '超期处理只能是 none / abandon')
  }
  return value
}

/** 子计划整体替换语义：传进来的数组就是最终状态。 */
function normalizeSubtasks(value) {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) throw new TodoError('invalid-input', '子计划必须是数组')
  if (value.length > 100) throw new TodoError('invalid-input', '子计划过多（上限 100 条）')
  return value.map((raw) => {
    const item = asRecord(raw)
    const title = text(item.title, 200, '子计划标题')
    if (title === '') throw new TodoError('invalid-input', '子计划标题不能为空')
    const done = item.done === true
    return {
      id: typeof item.id === 'string' && item.id !== '' ? item.id : newSubtaskId(),
      title,
      done,
      doneAt: done
        ? (typeof item.doneAt === 'string' && item.doneAt !== '' ? item.doneAt : new Date().toISOString())
        : null,
    }
  })
}

/**
 * 单次覆盖：`overrides['YYYY-MM-DD']` 只影响那一次发生，不动系列本身。
 *
 * 只允许改「显示与排期」字段；**重复规则不在其中** —— 规则只对一次生效没有意义，
 * 下个月它还得按规则来。日期可以改（把这一次挪到别的日子）。
 */
const OVERRIDE_FIELDS = new Set([
  'title', 'note', 'category', 'quadrant', 'priority', 'startTime', 'endTime', 'dueDate',
])

function normalizeOverridePatch(raw) {
  const item = asRecord(raw)
  const out = {}
  for (const key of Object.keys(item)) {
    if (!OVERRIDE_FIELDS.has(key)) continue
    const value = item[key]
    if (key === 'title') {
      const title = text(value, 200, '标题')
      if (title === '') throw new TodoError('invalid-input', '标题不能为空')
      out.title = title
    } else if (key === 'note') out.note = text(value, 2000, '备注')
    else if (key === 'quadrant') out.quadrant = pickQuadrant(value)
    else if (key === 'priority') out.priority = pickPriority(value)
    else if (key === 'category') out.category = nullableText(value, 24, '分类')
    else if (key === 'startTime') out.startTime = pickTime(value)
    else if (key === 'endTime') out.endTime = pickEndTime(value)
    else if (key === 'dueDate') out.dueDate = pickDate(value)
  }
  return out
}

/** 整体归一：键必须是日期，值是按字段校验过的对象。 */
export function normalizeOverrides(value) {
  if (value === undefined || value === null) return {}
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new TodoError('invalid-input', 'overrides 必须是对象')
  }
  const out = {}
  for (const [day, patch] of Object.entries(value)) {
    if (!DATE_RE.test(day)) throw new TodoError('invalid-input', 'overrides 的键必须是 YYYY-MM-DD')
    const clean = normalizeOverridePatch(patch)
    if (Object.keys(clean).length > 0) out[day] = clean
  }
  return out
}

/**
 * 让重复规则的锚点跟随新的起始日。
 *
 * 只在**起始日确实变了**时调用（store.update 里比较前后值），
 * 否则会覆盖掉用户在重复编辑器里主动选的「每月几号 / 31 = 最后一天」。
 *
 * 不同步的后果就是真实踩到的那个：日期改到 11-16、规则还是 13 号 →
 * 系列起点晚于当月锚点 → 11-13 被跳过，整月看不到这条待办。
 */
export function syncRepeatAnchor(repeat, dueDate) {
  if (!repeat || typeof repeat !== 'object') return repeat
  if (typeof dueDate !== 'string' || !DATE_RE.test(dueDate)) return repeat
  const [, month, day] = dueDate.split('-').map(Number)
  if (repeat.freq === 'monthly') {
    return repeat.monthDay === day ? repeat : { ...repeat, monthDay: day }
  }
  if (repeat.freq === 'yearly') {
    if (repeat.month === month && repeat.monthDay === day) return repeat
    return { ...repeat, month, monthDay: day }
  }
  return repeat
}

function pickDate(value) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string' || !DATE_RE.test(value)) throw new TodoError('invalid-input', '截止日期格式应为 YYYY-MM-DD')
  return value
}

function pickTime(value) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string' || !TIME_RE.test(value)) throw new TodoError('invalid-input', '截止时间格式应为 HH:mm')
  return value
}

/** 结束时间专用：和 pickTime 一样严格，额外接受 24:00（当天结束）。 */
function pickEndTime(value) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string' || !END_TIME_RE.test(value)) throw new TodoError('invalid-input', '截止时间格式应为 HH:mm')
  return value
}

/** "HH:mm" → 分钟；24:00 读成 1440（当天结束），这样 23:00 → 24:00 是合法的 60 分钟。 */
function minutesOfTime(value) {
  const match = typeof value === 'string' ? /^(\d{2}):(\d{2})$/.exec(value) : null
  if (match === null) return null
  return Number(match[1]) * 60 + Number(match[2])
}

/**
 * 归一化「每日检查点」列表。宽松到绝不抛：坏值一律忽略，不因为一份坏设置让插件起不来。
 *  - `undefined` / `null`（老数据没有这个字段）→ 回到默认的 11:00 / 16:00
 *  - 字符串（界面上是一个逗号分隔的输入框）→ 按逗号 / 顿号 / 分号 / 空白切分
 *  - 空数组 → 明确关闭检查点提醒
 * 只认 00:00–23:59 的 HH:mm；去重后按时间升序，保证事件顺序稳定。
 */
export function normalizeCheckpoints(value) {
  let list
  if (value === undefined || value === null) return DEFAULT_CHECKPOINTS.slice()
  if (Array.isArray(value)) list = value
  else if (typeof value === 'string') list = value.split(/[,，;；、\s]+/)
  else return DEFAULT_CHECKPOINTS.slice()
  const seen = new Set()
  for (const raw of list) {
    if (typeof raw !== 'string') continue
    const key = raw.trim()
    if (!TIME_RE.test(key) || seen.has(key)) continue
    seen.add(key)
  }
  return [...seen].sort((a, b) => minutesOfTime(a) - minutesOfTime(b))
}

function pickRepeat(value) {
  try {
    return normalizeRepeat(value)
  } catch (err) {
    throw new TodoError('invalid-input', err.message)
  }
}

export function normalizeCreate(input) {
  const source = asRecord(input)
  const title = text(source.title, 200, '标题')
  if (title === '') throw new TodoError('invalid-input', '标题不能为空')
  const now = new Date().toISOString()
  const repeat = pickRepeat(source.repeat)
  // 循环任务必须有起始日：没给就按创建当天兜底。缺了它 periodOccurrence 会返回 null，
  // 整条待办在列表和日历里都看不见，也勾不动（agent 建待办时经常只给 repeat）。
  const dueDate = pickDate(source.dueDate) ?? (repeat ? dateKey(new Date()) : null)
  // startTime 是「时间」的唯一事实源：时间点模式只填它，时间段模式再填 endTime。
  // dueTime 是历史字段，给进来就并入 startTime，不再单独保存——否则界面两处会各显示一个时间。
  const startTime = pickTime(source.startTime) ?? pickTime(source.dueTime)
  const endTime = pickEndTime(source.endTime)
  assertTimeRange(startTime, endTime)
  return {
    id: newId(),
    title,
    note: text(source.note, 2000, '备注'),
    quadrant: pickQuadrant(source.quadrant),
    priority: pickPriority(source.priority),
    category: nullableText(source.category, 24, '分类'),
    dueDate,
    duePreset: pickDuePreset(source.duePreset),
    onOverdue: pickOnOverdue(source.onOverdue),
    dueTime: null,
    startTime,
    endTime,
    done: false,
    abandoned: false,
    abandonedAt: null,
    repeat,
    completions: {},
    // 单次覆盖：默认空。只有「仅本次」保存时才会写入某个日期。
    overrides: normalizeOverrides(source.overrides),
    subtasks: normalizeSubtasks(source.subtasks),
    doneAt: null,
    doneBy: null,
    verifiedAt: null,
    createdAt: now,
    updatedAt: now,
  }
}

const PATCHABLE = new Set([
  'title', 'note', 'quadrant', 'priority', 'category', 'dueDate', 'duePreset', 'onOverdue',
  'dueTime', 'startTime', 'endTime', 'repeat', 'subtasks', 'abandoned', 'overrides',
])

/**
 * 时间段必须首尾有序；只给了一头就按「点到点」容忍，不给结束时间视为未定时长。
 * 比较在**分钟**上做（24:00 = 1440），不能比字符串——否则 23:00 → 24:00 这类
 * 「到当天结束」的区间会算错。错误文案保持不变，客户端仍在直接展示它。
 */
function assertTimeRange(startTime, endTime) {
  if (startTime !== null && startTime !== undefined && endTime !== null && endTime !== undefined) {
    const start = minutesOfTime(startTime)
    const end = minutesOfTime(endTime)
    if (start !== null && end !== null && end <= start) {
      throw new TodoError('invalid-input', '结束时间必须晚于开始时间')
    }
  }
}

export function applyPatch(todo, patch) {
  const source = asRecord(patch)
  const next = { ...todo }
  for (const key of Object.keys(source)) {
    if (!PATCHABLE.has(key)) continue
    if (key === 'title') {
      const value = text(source.title, 200, '标题')
      if (value === '') throw new TodoError('invalid-input', '标题不能为空')
      next.title = value
    } else if (key === 'note') next.note = text(source.note, 2000, '备注')
    else if (key === 'quadrant') next.quadrant = pickQuadrant(source.quadrant)
    else if (key === 'priority') next.priority = pickPriority(source.priority)
    else if (key === 'category') next.category = nullableText(source.category, 24, '分类')
    else if (key === 'dueDate') next.dueDate = pickDate(source.dueDate)
    else if (key === 'duePreset') next.duePreset = pickDuePreset(source.duePreset)
    else if (key === 'onOverdue') next.onOverdue = pickOnOverdue(source.onOverdue)
    // dueTime 只作为 startTime 的别名接受，不落库。
    else if (key === 'dueTime') next.startTime = pickTime(source.dueTime) ?? (key in source ? null : next.startTime)
    else if (key === 'startTime') next.startTime = pickTime(source.startTime)
    else if (key === 'endTime') next.endTime = pickEndTime(source.endTime)
    else if (key === 'abandoned') {
      const on = source.abandoned === true
      next.abandoned = on
      next.abandonedAt = on ? new Date().toISOString() : null
    }
    else if (key === 'repeat') next.repeat = pickRepeat(source.repeat)
    else if (key === 'subtasks') next.subtasks = normalizeSubtasks(source.subtasks)
    else if (key === 'overrides') next.overrides = normalizeOverrides(source.overrides)
  }
  assertTimeRange(next.startTime, next.endTime)
  next.dueTime = null
  // 老数据补设循环时同样补起始日，避免它此后在列表里消失、勾不动。
  if (next.repeat && !next.dueDate) {
    const base = next.createdAt ? new Date(next.createdAt) : new Date()
    next.dueDate = dateKey(Number.isNaN(base.getTime()) ? new Date() : base)
  }
  next.updatedAt = new Date().toISOString()
  return next
}
