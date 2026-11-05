/** Notification settings: defaults + tolerant normalization. */

import { DEFAULT_CHECKPOINTS, normalizeCheckpoints } from './model.js'

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export const DEFAULT_NOTIFY = Object.freeze({
  system: true,        // 系统通知（Windows toast，由客户端弹）
  feishu: true,        // 飞书通知（宿主端经 dsh-im 的 dshIm 服务发送）
  leadMinutes: 0,      // 提前多少分钟提醒；0 = 准点
  overdueDaily: true,  // 逾期后每天 09:00 再提醒一次
  checkpoints: DEFAULT_CHECKPOINTS, // 每天这几个时刻汇总「还没完成的」；空数组 = 关闭
  quietHours: Object.freeze({ enabled: false, start: '22:00', end: '08:00' }),
})

function clampLead(value) {
  if (!Number.isFinite(value)) return DEFAULT_NOTIFY.leadMinutes
  return Math.max(0, Math.min(1440, Math.trunc(value)))
}

/** 宽松归一：坏值一律退回默认，绝不因为一份坏设置让插件起不来。 */
export function normalizeNotify(raw) {
  const n = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const q = n.quietHours && typeof n.quietHours === 'object' && !Array.isArray(n.quietHours) ? n.quietHours : {}
  return {
    system: n.system !== false,
    feishu: n.feishu !== false,
    leadMinutes: clampLead(n.leadMinutes),
    overdueDaily: n.overdueDaily !== false,
    checkpoints: normalizeCheckpoints(n.checkpoints),
    quietHours: {
      enabled: q.enabled === true,
      start: TIME_RE.test(q.start) ? q.start : DEFAULT_NOTIFY.quietHours.start,
      end: TIME_RE.test(q.end) ? q.end : DEFAULT_NOTIFY.quietHours.end,
    },
  }
}

export function normalizeSettings(raw) {
  const s = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  return { notify: normalizeNotify(s.notify) }
}

export function defaultSettings() {
  return normalizeSettings({})
}

/** 局部合并：只覆盖传进来的字段，其余保持原值。 */
export function mergeNotify(current, patch) {
  const base = normalizeNotify(current)
  const p = patch && typeof patch === 'object' && !Array.isArray(patch) ? patch : {}
  const next = { ...base }
  if (p.system !== undefined) next.system = p.system !== false
  if (p.feishu !== undefined) next.feishu = p.feishu !== false
  if (p.leadMinutes !== undefined) next.leadMinutes = clampLead(Number(p.leadMinutes))
  if (p.overdueDaily !== undefined) next.overdueDaily = p.overdueDaily !== false
  if (p.checkpoints !== undefined) next.checkpoints = normalizeCheckpoints(p.checkpoints)
  if (p.quietHours !== undefined) {
    const q = p.quietHours && typeof p.quietHours === 'object' ? p.quietHours : {}
    next.quietHours = {
      enabled: q.enabled !== undefined ? q.enabled === true : base.quietHours.enabled,
      start: TIME_RE.test(q.start) ? q.start : base.quietHours.start,
      end: TIME_RE.test(q.end) ? q.end : base.quietHours.end,
    }
  }
  return next
}

/** "HH:mm" -> 当天分钟数；坏值返回 null。 */
export function minutesOf(timeKey) {
  if (typeof timeKey !== 'string' || !TIME_RE.test(timeKey)) return null
  const [h, m] = timeKey.split(':').map(Number)
  return h * 60 + m
}

/**
 * 静默时段是否覆盖 `now`。
 * 跨零点（start > end）时区间是 [start, 24:00) ∪ [00:00, end)。
 */
export function inQuietHours(quiet, now = new Date()) {
  if (!quiet || quiet.enabled !== true) return false
  const start = minutesOf(quiet.start)
  const end = minutesOf(quiet.end)
  if (start === null || end === null || start === end) return false
  const cur = now.getHours() * 60 + now.getMinutes()
  return start < end ? cur >= start && cur < end : cur >= start || cur < end
}
