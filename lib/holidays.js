/**
 * 中国法定节假日 / 调休上班日的获取、缓存与年度刷新。
 *
 * 数据源是国务院公告的机器可读版本（holiday-cn，按年发布，附 gov.cn 原文链接）。
 * 设计要点：
 *  - 只缓存「放假」与「调休上班」两个日期集合，其余一律按周末规则推断。
 *  - 抓取失败**绝不影响待办功能**：退回上一份缓存，没有缓存就退回纯周末规则。
 *  - 每年 12 月的第一个工作日抓次年的安排（国务院通常 11 月公布）。
 */

import { readFile, writeFile, rename, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

const CACHE_VERSION = 1
const RETRY_MS = 6 * 60 * 60 * 1000   // 抓取失败后的重试间隔，避免每小时猛敲
const TIMEOUT_MS = 20000
const FIRST_WORKDAY_SCAN_DAYS = 10    // 12 月里最多往前找这么多天

/**
 * 主源是 GitHub raw，国内经常不稳；jsDelivr 是它的镜像，作为兜底。
 * 两个都失败就保留旧缓存。
 */
const SOURCES = [
  (year) => `https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/${year}.json`,
  (year) => `https://cdn.jsdelivr.net/gh/NateScarlet/holiday-cn@master/${year}.json`,
]

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function dateKeyOf(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function shiftKey(key, days) {
  const at = parseKey(key)
  at.setDate(at.getDate() + days)
  return dateKeyOf(at)
}

/** 纯周末规则：周一至周五。 */
export function isWeekdayByCalendar(key) {
  const day = parseKey(key).getDay()
  return day !== 0 && day !== 6
}

/**
 * 解析一年的数据文件。返回 null 表示这份文档不可用（形状不对/年份对不上），
 * 调用方应当当作抓取失败处理，而不是把半份数据写进缓存。
 */
export function parseYearDoc(raw, expectYear) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.days)) return null
  const year = Number(raw.year)
  if (!Number.isInteger(year)) return null
  if (expectYear !== undefined && year !== expectYear) return null
  const holiday = []
  const makeup = []
  for (const day of raw.days) {
    if (!day || typeof day.date !== 'string' || !DATE_RE.test(day.date)) continue
    if (Number(day.date.slice(0, 4)) !== year) continue
    if (day.isOffDay === true) holiday.push(day.date)
    else if (day.isOffDay === false) makeup.push(day.date)
  }
  return { year, holiday: [...new Set(holiday)].sort(), makeup: [...new Set(makeup)].sort(), papers: Array.isArray(raw.papers) ? raw.papers : [] }
}

/** 空缓存。 */
function emptyCache() {
  return { version: CACHE_VERSION, years: {}, lastError: null }
}

function normalizeCache(raw) {
  const out = emptyCache()
  if (!raw || typeof raw !== 'object' || !raw.years || typeof raw.years !== 'object') return out
  for (const [key, value] of Object.entries(raw.years)) {
    const year = Number(key)
    if (!Number.isInteger(year) || !value || typeof value !== 'object') continue
    out.years[String(year)] = {
      holiday: Array.isArray(value.holiday) ? value.holiday.filter((d) => DATE_RE.test(d)) : [],
      makeup: Array.isArray(value.makeup) ? value.makeup.filter((d) => DATE_RE.test(d)) : [],
      papers: Array.isArray(value.papers) ? value.papers : [],
      updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
      source: typeof value.source === 'string' ? value.source : null,
    }
  }
  out.lastError = typeof raw.lastError === 'string' ? raw.lastError : null
  return out
}

/**
 * 12 月的第一个工作日。用来决定「什么时候去抓次年的安排」。
 * 这是纯日期推算，不依赖已经抓到的表；表里带了 12 月的调休也会被算进去。
 */
export function firstWorkdayOfDecember(year, isWorkday) {
  let key = `${year}-12-01`
  for (let i = 0; i < FIRST_WORKDAY_SCAN_DAYS; i += 1) {
    if (isWorkday(key)) return key
    key = shiftKey(key, 1)
  }
  return `${year}-12-03`   // 极端兜底：12 月前 10 天全是假，实际不会发生
}

export function createHolidayService({ file, logger = console, fetchImpl = globalThis.fetch, now = () => new Date() } = {}) {
  const cache = emptyCache()
  const attempts = new Map()   // year -> 上次尝试抓取的时间戳，用于退避
  let lastError = null
  let writing = Promise.resolve()

  /** 已加载的表。setWorkdayTables 由 index.js 注入给 repeat.js。 */
  function buildSets() {
    const holidays = new Set()
    const makeups = new Set()
    for (const y of Object.values(cache.years)) {
      for (const d of y.holiday) holidays.add(d)
      for (const d of y.makeup) makeups.add(d)
    }
    return { holidays, makeups }
  }

  async function persist() {
    const snapshot = JSON.stringify({ ...cache, lastError }, null, 2)
    const write = writing.then(async () => {
      await mkdir(dirname(file), { recursive: true })
      const tmp = `${file}.tmp`
      await writeFile(tmp, snapshot, 'utf8')
      await rename(tmp, file)
    })
    writing = write.catch(() => {})
    await write
  }

  async function load() {
    try {
      const raw = JSON.parse(await readFile(file, 'utf8'))
      Object.assign(cache, normalizeCache(raw))
    } catch { /* 没有缓存或坏了：按空表起步，功能照常 */ }
    lastError = cache.lastError
    return { years: Object.keys(cache.years), lastError }
  }

  /** 单个年份已缓存的直接查询。只查已加载的表 + 周末规则。 */
  function isWorkday(key) {
    const { holidays, makeups } = buildSets()
    if (makeups.has(key)) return true
    if (holidays.has(key)) return false
    return isWeekdayByCalendar(key)
  }

  async function fetchYear(year) {
    attempts.set(year, now().getTime())
    let lastErr = null
    for (const build of SOURCES) {
      const url = build(year)
      try {
        const res = await fetchImpl(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { accept: 'application/json' } })
        if (!res || res.ok !== true) { lastErr = `HTTP ${res?.status ?? '?'}`; continue }
        const parsed = parseYearDoc(await res.json(), year)
        if (parsed === null) { lastErr = '返回内容不是该年份的可用数据'; continue }
        cache.years[String(year)] = { holiday: parsed.holiday, makeup: parsed.makeup, papers: parsed.papers, updatedAt: now().toISOString(), source: url }
        lastError = null
        cache.lastError = null
        await persist()
        logger.info?.(`[dsh-quadrant-todolist] 已更新 ${year} 年法定工作日：放假 ${parsed.holiday.length} 天、调休上班 ${parsed.makeup.length} 天`)
        return { ok: true, year, holiday: parsed.holiday.length, makeup: parsed.makeup.length, source: url }
      } catch (err) {
        lastErr = err?.message ?? String(err)
      }
    }
    lastError = lastErr
    cache.lastError = lastErr
    try { await persist() } catch { /* 落盘失败不影响内存里的旧表 */ }
    logger.warn?.(`[dsh-quadrant-todolist] 获取 ${year} 年法定工作日失败（继续用已有数据）：${lastErr}`)
    return { ok: false, year, detail: lastErr }
  }

  function shouldTry(year, at) {
    const seen = attempts.get(year)
    return seen === undefined || at.getTime() - seen >= RETRY_MS
  }

  /**
   * 按需补齐：缺当年就抓当年；到了 12 月第一个工作日就抓次年。
   * 只在需要且未退避时才发请求，返回本次实际做了什么的说明。
   */
  async function ensure(at = now()) {
    const year = at.getFullYear()
    const actions = []
    if (!cache.years[String(year)] && shouldTry(year, at)) {
      actions.push(await fetchYear(year))
    }
    const todayKey = dateKeyOf(at)
    const firstDec = firstWorkdayOfDecember(year, isWorkday)
    if (at.getMonth() === 11 && todayKey >= firstDec && !cache.years[String(year + 1)] && shouldTry(year + 1, at)) {
      actions.push(await fetchYear(year + 1))
    }
    return { actions, years: Object.keys(cache.years), lastError }
  }

  function status() {
    const years = {}
    for (const [k, v] of Object.entries(cache.years)) {
      years[k] = { holiday: v.holiday.length, makeup: v.makeup.length, updatedAt: v.updatedAt, source: v.source, papers: v.papers }
    }
    const y = now().getFullYear()
    return {
      years,
      currentYear: y,
      currentYearLoaded: Boolean(cache.years[String(y)]),
      lastError,
      nextRefreshAfter: firstWorkdayOfDecember(y, isWorkday),
    }
  }

  return { load, ensure, status, isWorkday, refresh: (year) => fetchYear(year ?? now().getFullYear()), tables: buildSets, _cache: cache }
}
