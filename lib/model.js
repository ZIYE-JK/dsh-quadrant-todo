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
  const startTime = pickTime(source.startTime)
  const endTime = pickTime(source.endTime)
  assertTimeRange(startTime, endTime)
  return {
    id: newId(),
    title,
    note: text(source.note, 2000, '备注'),
    quadrant: pickQuadrant(source.quadrant),
    priority: pickPriority(source.priority),
    category: nullableText(source.category, 24, '分类'),
    dueDate,
    dueTime: pickTime(source.dueTime),
    startTime,
    endTime,
    done: false,
    repeat,
    completions: {},
    subtasks: normalizeSubtasks(source.subtasks),
    doneAt: null,
    doneBy: null,
    verifiedAt: null,
    createdAt: now,
    updatedAt: now,
  }
}

const PATCHABLE = new Set([
  'title', 'note', 'quadrant', 'priority', 'category', 'dueDate', 'dueTime',
  'startTime', 'endTime', 'repeat', 'subtasks',
])

/** 时间段必须首尾有序；只给了一头就按「点到点」容忍，不给结束时间视为未定时长。 */
function assertTimeRange(startTime, endTime) {
  if (startTime !== null && startTime !== undefined && endTime !== null && endTime !== undefined) {
    if (endTime <= startTime) {
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
    else if (key === 'dueTime') next.dueTime = pickTime(source.dueTime)
    else if (key === 'startTime') next.startTime = pickTime(source.startTime)
    else if (key === 'endTime') next.endTime = pickTime(source.endTime)
    else if (key === 'repeat') next.repeat = pickRepeat(source.repeat)
    else if (key === 'subtasks') next.subtasks = normalizeSubtasks(source.subtasks)
  }
  assertTimeRange(next.startTime, next.endTime)
  // 老数据补设循环时同样补起始日，避免它此后在列表里消失、勾不动。
  if (next.repeat && !next.dueDate) {
    const base = next.createdAt ? new Date(next.createdAt) : new Date()
    next.dueDate = dateKey(Number.isNaN(base.getTime()) ? new Date() : base)
  }
  next.updatedAt = new Date().toISOString()
  return next
}
