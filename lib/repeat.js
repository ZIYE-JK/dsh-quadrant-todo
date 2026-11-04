/** Pure recurrence expansion: no IO, no host services. */

// 逐日扫描的上限。必须覆盖「每年」这种稀疏频率：400 天会在一次查询里
// 悄悄截断多年序列，让年重复看起来只发生一两次。
const MAX_SPAN_DAYS = 4000

/** 无重复 / 每日 / 每周 / 每月 / 每年 / 艾宾浩斯记忆曲线 / 法定工作日 */
const FREQS = new Set(['daily', 'weekly', 'monthly', 'yearly', 'ebbinghaus', 'workday'])

/** 艾宾浩斯复习间隔（自系列起始日算起的天数）。 */
export const EBBINGHAUS_OFFSETS = [0, 1, 2, 4, 7, 15, 30, 60]

/**
 * 「法定工作日」的节假日数据。由 lib/holidays.js 抓取与缓存，index.js 负责注入。
 * 没有注入（或抓取失败）时退回纯周末规则，功能不受影响。
 * 注意：这里刻意不 import holidays.js —— repeat.js 保持纯净、无 IO，便于单测。
 */
let HOLIDAYS = new Set()        // 'YYYY-MM-DD'：放假（即使是工作日）
let MAKEUP_WORKDAYS = new Set() // 'YYYY-MM-DD'：调休上班（即使是周末）

/** 注入（或用 null 清空）法定节假日表。 */
export function setWorkdayTables(tables) {
  HOLIDAYS = new Set(Array.isArray(tables?.holidays) ? tables.holidays : [])
  MAKEUP_WORKDAYS = new Set(Array.isArray(tables?.makeups) ? tables.makeups : [])
}

/** 当前是否已注入真实的节假日数据。 */
export function hasWorkdayTables() {
  return HOLIDAYS.size > 0 || MAKEUP_WORKDAYS.size > 0
}

/** Local date key helpers kept in-module so the client never imports this. */
function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function keyOf(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function shift(key, days) {
  const at = parseKey(key)
  at.setDate(at.getDate() + days)
  return keyOf(at)
}

function diffDays(fromKey, toKey) {
  return Math.round((parseKey(toKey) - parseKey(fromKey)) / 86400000)
}

/** ISO weekday: Monday=1 … Sunday=7. */
function isoWeekday(date) {
  return date.getDay() === 0 ? 7 : date.getDay()
}

/** 是否工作日：调休上班日优先，其次排除法定假日与周末。 */
export function isWorkday(key) {
  if (MAKEUP_WORKDAYS.has(key)) return true
  if (HOLIDAYS.has(key)) return false
  const day = parseKey(key).getDay()
  return day !== 0 && day !== 6
}

/** Validate a repeat rule; throws with a short reason. */
export function normalizeRepeat(input) {
  if (input === undefined || input === null) return null
  if (typeof input !== 'object') throw new Error('repeat 必须是对象')
  const freq = input.freq
  if (!FREQS.has(freq)) {
    throw new Error('repeat.freq 只能是 daily / weekly / monthly / yearly / ebbinghaus / workday')
  }

  const out = { freq, interval: 1, until: null }
  if (input.until) {
    if (typeof input.until !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.until)) {
      throw new Error('repeat.until 必须是 YYYY-MM-DD')
    }
    out.until = input.until
  }

  if (freq === 'weekly') {
    const days = input.weekdays
    if (!Array.isArray(days) || days.length === 0) throw new Error('weekdays 不能为空')
    for (const day of days) {
      if (!Number.isInteger(day) || day < 1 || day > 7) throw new Error('weekdays 只能是 1-7')
    }
    out.weekdays = [...new Set(days)].sort((a, b) => a - b)
  }

  if (freq === 'monthly') {
    const day = input.monthDay
    if (!Number.isInteger(day) || day < 1 || day > 31) throw new Error('monthDay 只能是 1-31')
    out.monthDay = day
  }

  // 每年固定到「起始日的月+日」；允许显式覆盖，方便从 UI 直接指定。
  if (freq === 'yearly') {
    const month = input.month
    const day = input.monthDay
    if (month !== undefined) {
      if (!Number.isInteger(month) || month < 1 || month > 12) throw new Error('month 只能是 1-12')
      out.month = month
    }
    if (day !== undefined) {
      if (!Number.isInteger(day) || day < 1 || day > 31) throw new Error('monthDay 只能是 1-31')
      out.monthDay = day
    }
  }

  return out
}

/** 「每年」实际使用的月/日：显式字段优先，否则取系列起始日。 */
function yearlyMonthDay(todo, repeat) {
  const start = parseKey(todo.dueDate)
  return {
    month: repeat.month ?? start.getMonth() + 1,
    day: repeat.monthDay ?? start.getDate(),
  }
}

/**
 * 某年某月（1-12）的最后一天是几号。
 * `new Date(y, m, 0)` 取的是「下个月的第 0 天」，也就是本月最后一天。
 */
function lastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

/**
 * 「第 N 天」在这个月里实际落在哪一天：当月没有第 N 天就**回退到最后一天**。
 *
 * 没有这条回退时，选「每月 31 号」的任务在 2/4/6/9/11 月**一次都不会触发**，
 * 而且是静默跳过 —— 不报错、日历上也不出现，用户只会觉得任务莫名消失。
 * 选 29/30 号在 2 月同理。所以这里统一成同一个约定。
 */
function resolveMonthDay(year, month, day) {
  return Math.min(day, lastDayOfMonth(year, month))
}

/** Whether this todo occurs on `dateKey` (start inclusive, until inclusive). */
export function isDueOn(todo, dateKey) {
  const start = todo.dueDate
  if (!start) return false
  if (dateKey < start) return false
  const repeat = todo.repeat
  if (!repeat) return dateKey === start
  if (repeat.until && dateKey > repeat.until) return false

  const date = parseKey(dateKey)
  if (repeat.freq === 'daily') return true
  if (repeat.freq === 'weekly') return (repeat.weekdays ?? []).includes(isoWeekday(date))
  if (repeat.freq === 'monthly') {
    return date.getDate() === resolveMonthDay(date.getFullYear(), date.getMonth() + 1, repeat.monthDay)
  }
  if (repeat.freq === 'workday') return isWorkday(dateKey)
  if (repeat.freq === 'ebbinghaus') {
    return EBBINGHAUS_OFFSETS.includes(diffDays(start, dateKey))
  }
  if (repeat.freq === 'yearly') {
    const { month, day } = yearlyMonthDay(todo, repeat)
    // 每年 2 月 29 日在平年回退到 2 月 28 日，同理。
    return date.getMonth() + 1 === month && date.getDate() === resolveMonthDay(date.getFullYear(), month, day)
  }
  return false
}

/** 当前周期的起止日，用来判断本周期内是否已有完成记录。 */
export function periodRange(todo, dateKey) {
  const date = parseKey(dateKey)
  const freq = todo.repeat?.freq
  if (freq === 'weekly') {
    const iso = date.getDay() === 0 ? 7 : date.getDay()
    const from = shift(dateKey, 1 - iso)          // 本周一
    return { from, to: shift(from, 6) }           // 本周日
  }
  if (freq === 'monthly') {
    return {
      from: keyOf(new Date(date.getFullYear(), date.getMonth(), 1)),
      to: keyOf(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
    }
  }
  if (freq === 'yearly') {
    return {
      from: keyOf(new Date(date.getFullYear(), 0, 1)),
      to: keyOf(new Date(date.getFullYear(), 11, 31)),
    }
  }
  // daily / workday / ebbinghaus：一次就是一天
  return { from: dateKey, to: dateKey }
}

/** 当前周期内的那个发生日；不在周期内或已过期返回 null。 */
export function periodOccurrence(todo, dateKey, completions = todo.completions ?? {}) {
  if (!todo.dueDate) return null
  const { from, to } = periodRange(todo, dateKey)
  // 周期起点早于任务起始日时，从起始日开始扫
  let cursor = from > todo.dueDate ? from : todo.dueDate
  while (cursor <= to) {
    if (isDueOn(todo, cursor) && completions[cursor] === undefined) return cursor
    cursor = shift(cursor, 1)
  }
  return null
}

/** First occurrence on or after `fromKey`, or null when the series ended. */
export function nextOccurrence(todo, fromKey) {
  const start = todo.dueDate
  if (!start) return null
  if (!todo.repeat) return start >= fromKey ? start : null
  const until = todo.repeat.until
  let cursor = fromKey > start ? fromKey : start
  for (let i = 0; i < MAX_SPAN_DAYS; i += 1) {
    if (until && cursor > until) return null
    if (isDueOn(todo, cursor)) return cursor
    cursor = shift(cursor, 1)
  }
  return null
}

/** All dates in [fromKey, toKey] where this todo occurs; capped at 400 days. */
export function occurrencesBetween(todo, fromKey, toKey) {
  const out = []
  const start = todo.dueDate
  if (!start || toKey < fromKey) return out
  const span = Math.min(diffDays(fromKey, toKey) + 1, MAX_SPAN_DAYS)
  let cursor = fromKey > start ? fromKey : start
  for (let i = 0; i < span; i += 1) {
    if (cursor > toKey) break
    if (isDueOn(todo, cursor)) out.push(cursor)
    cursor = shift(cursor, 1)
  }
  return out
}
