/** File-backed todo store: one JSON document, serialized atomic writes. */

import { readFile, writeFile, rename, mkdir, copyFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { bucketOf, compareTodos, summarize, dateKey, shiftKey } from './bucket.js'
import { nextOccurrence, occurrencesBetween, periodOccurrence, periodRange, isDueOn } from './repeat.js'
import { TodoError, normalizeCreate, applyPatch, normalizeOverrides, syncRepeatAnchor, newId, LEGACY_QUADRANT_NAMES, QUADRANTS, DUE_PRESETS, OVERDUE_MODES } from './model.js'
import { defaultSettings, normalizeSettings, mergeNotify } from './settings.js'

const DOC_VERSION = 5
const CORRUPT_UNBACKUPED = '数据文件损坏且无法备份，已停止写入以保护原文件'
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
/** 结束时间额外允许 24:00（= 一天结束）。开始时间不允许。 */
const END_TIME_RE = /^(?:([01]\d|2[0-3]):[0-5]\d|24:00)$/
const INBOX = '__inbox__'
const NO_CATEGORY = '__none__'

/** 'HH:mm' → 分钟；'24:00' 视作 1440，用于时间先后比较。 */
function minutesOfKey(value) {
  if (value === '24:00') return 1440
  const [h, m] = value.split(':').map(Number)
  return h * 60 + m
}

function emptyDoc() {
  return { version: DOC_VERSION, todos: [], categories: {}, settings: defaultSettings() }
}

/** 合法的 YYYY-MM-DD 日历日；用 shiftKey 回写可顺手拒绝 2026-13-01、2026-02-30 这类格式对但不存在的日期。 */
function isDayKey(value) {
  return typeof value === 'string' && DATE_KEY_RE.test(value) && shiftKey(value, 0) === value
}

/** 取一条待办的创建日（本地日期键），缺失或非法返回 null。 */
function createdDay(todo) {
  if (!todo || !todo.createdAt) return null
  const at = new Date(todo.createdAt)
  return Number.isNaN(at.getTime()) ? null : dateKey(at)
}

/**
 * 循环起点：优先 dueDate；没有时退回创建日。
 * 早期通过 agent 建的循环待办可能不带起始日（dueDate 为空），
 * 若不兜底，periodOccurrence 会直接返回 null，整条待办在列表/日历里都不可见，也无法勾选。
 */
function seriesStartOf(todo) {
  return todo.dueDate || createdDay(todo)
}

/** 本周期内是否已有完成记录——循环任务据此判断「本次已办，整行先收起」。 */
function completedInPeriod(todo, today) {
  const completions = todo.completions ?? {}
  const { from, to } = periodRange(todo, today)
  return Object.keys(completions).some((day) => day >= from && day <= to)
}

/**
 * 「当月那一次必然被吞」的判断：锚点日落在起始日之前，且同月。
 *
 * 每月：锚点日 < 起始日的日 → 当月这一次在起点之前，会被跳过。
 * 每年：只有**同月**才算被吞；「11 月起、每年 3 月重复」是正常意图，不动它。
 */
function startMonthSwallowed(repeat, dueDate) {
  const [, month, day] = String(dueDate).split('-').map(Number)
  if (!Number.isInteger(month) || !Number.isInteger(day)) return false
  if (repeat.freq === 'monthly') return repeat.monthDay < day
  if (repeat.freq === 'yearly') return repeat.month === month && repeat.monthDay < day
  return false
}

/**
 * 子任务 → 主任务：全部完成即完成，任一未完成即取消完成。
 *
 * 为什么放在 store 而不是界面：agent 工具也能改子任务，联动只写一份才不会
 * 出现「界面里自动完成、agent 改完却没同步」这种不一致。
 *
 * 为什么**跳过循环任务**：循环任务的子任务是整个系列共享的（不是每个发生日
 * 各一份），跟「某一次是否完成」没有对应关系；硬联动会把上个月的进度带进来。
 *
 * 没有子任务时不动主任务 —— 保持用户手动勾选的结果。
 */
function syncDoneFromSubtasks(todo, now) {
  if (todo.repeat) return todo
  const list = Array.isArray(todo.subtasks) ? todo.subtasks : []
  if (list.length === 0) return todo
  const allDone = list.every((item) => item.done === true)
  if (allDone === (todo.done === true)) return todo
  return {
    ...todo,
    done: allDone,
    doneAt: allDone ? now : null,
    doneBy: allDone ? 'user' : null,
    verifiedAt: allDone ? now : null,
    updatedAt: now,
  }
}

/**
 * 分类表归一：名称 -> {icon}。
 * icon 可以是 null —— 表示「分类存在，但还没配图标」。显式新建的分类就长这样，
 * 所以这里**不能**因为 icon 为空就把整条丢掉（那会让新建的分类一重启就消失）。
 */
function normalizeCategories(raw) {
  const out = {}
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out
  for (const [name, value] of Object.entries(raw)) {
    if (typeof name !== 'string' || name === '' || name.length > 24) continue
    const icon = value && typeof value === 'object' && typeof value.icon === 'string' ? value.icon.trim() : ''
    out[name] = { icon: icon === '' ? null : icon.slice(0, 8) }
  }
  return out
}

/**
 * v1 -> v2 迁移。
 * 旧数据里有人把象限名写进了 category（agent 建待办时的历史行为），这里按对照表搬回 quadrant，
 * 否则那些待办会顶着「重要且紧急」这种分类名出现在分类列表里。
 */
function migrate(raw) {
  const todos = Array.isArray(raw?.todos) ? raw.todos : []
  const fromVersion = raw?.version ?? 1
  let movedQuadrants = 0
  let movedTimes = 0
  let anchoredCount = 0
  const next = todos.map((todo) => {
    if (!todo || typeof todo !== 'object') return todo
    const out = {
      quadrant: null, subtasks: [], startTime: null, endTime: null,
      duePreset: null, onOverdue: 'none', abandoned: false, abandonedAt: null,
      ...todo,
    }
    if (!Array.isArray(out.subtasks)) out.subtasks = []
    const legacy = typeof out.category === 'string' ? LEGACY_QUADRANT_NAMES[out.category] : undefined
    if (legacy !== undefined && (out.quadrant === null || out.quadrant === undefined)) {
      out.quadrant = legacy
      out.category = null
      movedQuadrants += 1
    }
    if (out.quadrant !== null && !QUADRANTS.has(out.quadrant)) out.quadrant = null
    // v4：「时间」曾经有 dueTime 与 startTime 两个字段，界面因此会在两处各显示一个时间。
    // 统一以 startTime 为准，dueTime 仅作为旧数据的来源被吸收，不再落库。
    if (out.startTime === null && typeof out.dueTime === 'string' && TIME_RE.test(out.dueTime)) {
      out.startTime = out.dueTime
      movedTimes += 1
    }
    out.dueTime = null
    if (typeof out.startTime !== 'string' || !TIME_RE.test(out.startTime)) out.startTime = null
    // 结束时间用 END_TIME_RE：24:00 是合法的「一天结束」，不能用 TIME_RE 清掉——
    // migrate() 每次 load 都会跑，清掉的话「23:00–00:00」重载后就只剩开始时间了。
    if (typeof out.endTime !== 'string' || !END_TIME_RE.test(out.endTime)) out.endTime = null
    // 顺序比较换成分钟比较，否则 '24:00' <= '23:00' 这种字符串比较会判错。
    if (out.startTime !== null && out.endTime !== null && minutesOfKey(out.endTime) <= minutesOfKey(out.startTime)) {
      out.endTime = null
    }
    // v4：完成期限预设 / 超期处理 / 放弃标记
    if (!DUE_PRESETS.has(out.duePreset)) out.duePreset = null
    if (!OVERDUE_MODES.has(out.onOverdue)) out.onOverdue = 'none'
    out.abandoned = out.abandoned === true
    if (!out.abandoned) out.abandonedAt = null
    // v5：单次覆盖。只对循环待办有意义；老数据没有这个字段，补成空对象。
    // 逐条 try：一条脏覆盖不该让整份数据打不开（migrate 每次 load 都跑）。
    if (out.repeat) {
      try {
        out.overrides = normalizeOverrides(out.overrides)
      } catch {
        out.overrides = {}
      }
    } else {
      delete out.overrides
    }
    // v5 一次性修复：起点晚于当月锚点的「每月 N 号」会让当月那一次整个消失
    // （真实踩到：起点 11-16、规则 13 号 → 11 月什么都看不到）。
    // 只在**老文档**上修，且只修「当月必然被吞」这一种；用户新建时显式选的
    // 「从 20 号起、按 13 号重复」不受影响。
    if (fromVersion < 5 && out.repeat && typeof out.dueDate === 'string') {
      const fixed = syncRepeatAnchor(out.repeat, out.dueDate)
      if (fixed !== out.repeat && startMonthSwallowed(out.repeat, out.dueDate)) {
        out.repeat = fixed
        anchoredCount += 1
      }
    }
    return out
  })
  return {
    doc: {
      version: DOC_VERSION,
      todos: next,
      categories: normalizeCategories(raw?.categories),
      settings: normalizeSettings(raw?.settings),
    },
    movedQuadrants,
    movedTimes,
    anchoredCount,
    wasLegacy: fromVersion < DOC_VERSION,
  }
}

async function readDoc(file) {
  let raw
  try {
    raw = await readFile(file, 'utf8')
  } catch (err) {
    if (err.code === 'ENOENT') return { doc: emptyDoc(), corrupt: false, migrated: null }
    throw new TodoError('io-error', `无法读取待办数据：${err.message}`)
  }
  let parsed
  try {
    parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.todos)) throw new Error('shape')
  } catch {
    return { doc: emptyDoc(), corrupt: true, migrated: null }
  }
  const { doc, movedQuadrants, movedTimes, anchoredCount, wasLegacy } = migrate(parsed)
  return {
    doc,
    corrupt: false,
    migrated: wasLegacy
      ? { from: parsed.version ?? 1, to: DOC_VERSION, movedQuadrants, movedTimes, anchoredCount }
      : null,
  }
}

export function createStore({ file, staleDays = 7 }) {
  const state = { todos: [], categories: {}, settings: defaultSettings(), corrupt: false, sealed: false }
  let queue = Promise.resolve()
  let closed = false
  // 最近一次落盘失败的消息；成功写入后清空。UI 靠 list().notices 里的
  // 'write-error' 常驻提示，直到这里真的写成功（而不是读一次成功就消失）。
  let writeError = null
  // v1->v2 迁移结果，供 index.js 记日志；只在本次进程首次 load 时有值。
  let lastMigration = null

  function iconOf(category) {
    if (typeof category !== 'string' || category === '') return null
    return state.categories[category]?.icon ?? null
  }

  const withBucket = (todo) => ({
    ...todo,
    categoryIcon: iconOf(todo.category),
    bucket: bucketOf(todo, new Date(), staleDays),
  })

  /** 下一次未完成的循环实例；全部完成后返回 null。 */
  function nextOpenOccurrence(todo, fromKey) {
    let due = nextOccurrence(todo, fromKey)
    while (due !== null && todo.completions?.[due]) {
      due = nextOccurrence(todo, shiftKey(due, 1))
    }
    return due
  }

  function docOf() {
    return { version: DOC_VERSION, todos: state.todos, categories: state.categories, settings: state.settings }
  }

  async function persist() {
    if (state.sealed) {
      writeError = CORRUPT_UNBACKUPED
      throw new TodoError('io-error', CORRUPT_UNBACKUPED)
    }
    const snapshot = JSON.stringify(docOf(), null, 2)
    const write = queue.then(async () => {
      await mkdir(dirname(file), { recursive: true })
      const tmp = `${file}.tmp`
      await writeFile(tmp, snapshot, 'utf8')
      await rename(tmp, file)
    })
    queue = write.catch(() => {})
    try {
      await write
      writeError = null
    } catch (err) {
      writeError = err.message
      throw err
    }
  }

  async function guard(fn) {
    try {
      return await fn()
    } catch (err) {
      if (err instanceof TodoError) throw err
      throw new TodoError('io-error', `待办数据写入失败：${err.message}`)
    }
  }

  function findIndex(id) {
    return state.todos.findIndex((t) => t.id === id)
  }

  function requireIndex(id) {
    const index = findIndex(id)
    if (index === -1) throw new TodoError('not-found', '这条待办已经不在了')
    return index
  }

  return {
    async load() {
      const { doc, corrupt, migrated } = await readDoc(file)
      state.todos = doc.todos
      state.categories = doc.categories
      state.settings = doc.settings
      state.corrupt = corrupt
      state.sealed = false
      writeError = null
      lastMigration = migrated
      if (!corrupt) {
        // 迁移过就立刻按当前版本落盘，并留一份原件备份。
        // 备份名带上**来源版本**——写死 v1 会让 v2→v3 的备份看起来像 v1 的，事后无从分辨。
        if (migrated !== null) {
          try {
            await copyFile(file, `${file.replace(/\.json$/, '')}.v${migrated.from}-backup-${Date.now()}.json`)
          } catch { /* 备份失败不阻塞迁移落盘；原件本来就在 */ }
          await guard(persist)
        }
        return { corrupt, migrated }
      }
      const backup = `${file.replace(/\.json$/, '')}.corrupt-${Date.now()}.json`
      try {
        await copyFile(file, backup)
      } catch {
        state.sealed = true
        throw new TodoError('io-error', CORRUPT_UNBACKUPED)
      }
      await guard(persist)
      return { corrupt, migrated: null }
    },

    lastMigration: () => lastMigration,
    dataFile: () => file,

    async list(filter = {}) {
      if (filter === null || typeof filter !== 'object' || Array.isArray(filter)) {
        throw new TodoError('invalid-input', '过滤条件必须是对象')
      }
      const now = new Date()
      const today = dateKey(now)
      // 循环任务只在当前周期（天/周/月）内还有发生实例时进入列表；完成本次后
      // 整行消失，直到下一个周期再出现。日历 occurrences() 不经过这里，仍然展开全部实例。
      let items = state.todos.map((todo) => {
        const isRepeating = Boolean(todo.repeat)
        if (!isRepeating) {
          return {
            ...todo,
            categoryIcon: iconOf(todo.category),
            isRepeating,
            nextDue: todo.dueDate,
            bucket: bucketOf(todo, now, staleDays),
          }
        }
        const anchored = todo.dueDate ? todo : { ...todo, dueDate: seriesStartOf(todo) }
        if (!anchored.dueDate) return null
        let outstanding = periodOccurrence(anchored, today, todo.completions ?? {})
        if (outstanding === null) {
          // 本次已办：**保留这一行**（勾上 + 删除线），不再整行收起。
          // 「完成即消失」会让用户无法确认自己到底做没做，也让误勾无法发现和撤销。
          // 只在当前周期内保留，下一个周期它会自然变回未完成的那一次。
          if (completedInPeriod(anchored, today)) {
            const { from, to } = periodRange(anchored, today)
            const doneDay = Object.keys(todo.completions ?? {})
              .filter((day) => day >= from && day <= to)
              .sort()
              .pop() ?? anchored.dueDate
            const doneShaped = { ...todo, dueDate: doneDay, done: true }
            return {
              ...doneShaped,
              categoryIcon: iconOf(doneShaped.category),
              isRepeating,
              nextDue: nextOpenOccurrence(anchored, today),
              completions: todo.completions ?? {},
              bucket: bucketOf(doneShaped, now, staleDays),
            }
          }
          // 还没到第一个发生日（如周三才建的「每周一」）则显示下一次，避免“建完就看不见”。
          outstanding = nextOpenOccurrence(anchored, today)
        }
        if (outstanding === null) return null
        const shaped = { ...todo, dueDate: outstanding, done: false }
        return {
          ...shaped,
          categoryIcon: iconOf(shaped.category),
          isRepeating,
          nextDue: nextOpenOccurrence(anchored, today),
          completions: todo.completions ?? {},
          bucket: bucketOf(shaped, now, staleDays),
        }
      }).filter(Boolean)

      // 收集箱计数始终是「全量未归类且未完成」，不受当前筛选影响。
      const inboxCount = items.filter((t) => t.bucket !== 'done' && (t.quadrant ?? null) === null).length

      const view = filter.view
      if (view === 'today') items = items.filter((t) => t.bucket === 'today')
      else if (view === 'week') items = items.filter((t) => t.bucket === 'today' || t.bucket === 'tomorrow' || t.bucket === 'week')
      else if (view === 'stale') items = items.filter((t) => t.bucket === 'stale')
      else if (view === 'done') items = items.filter((t) => t.bucket === 'done')
      else if (view === 'open') items = items.filter((t) => t.bucket !== 'done')

      if (typeof filter.category === 'string' && filter.category !== '') {
        items = filter.category === NO_CATEGORY
          ? items.filter((t) => t.category === null || t.category === '')
          : items.filter((t) => t.category === filter.category)
      }

      if (typeof filter.quadrant === 'string' && filter.quadrant !== '') {
        items = filter.quadrant === INBOX
          ? items.filter((t) => (t.quadrant ?? null) === null)
          : items.filter((t) => t.quadrant === filter.quadrant)
      }

      const q = typeof filter.q === 'string' ? filter.q.trim().toLowerCase() : ''
      if (q !== '') {
        items = items.filter((t) =>
          t.title.toLowerCase().includes(q) ||
          (t.note ?? '').toLowerCase().includes(q) ||
          (t.category ?? '').toLowerCase().includes(q))
      }
      items.sort(compareTodos)
      const notices = []
      if (state.corrupt) notices.push('corrupt')
      if (writeError !== null) notices.push('write-error')
      return {
        items,
        summary: summarize(items, now),
        notices,
        staleDays,
        inboxCount,
      }
    },

    /** 展开 [from, to] 内的所有实例；单次任务只有 dueDate 当天。 */
    async occurrences({ from, to } = {}) {
      if (typeof from !== 'string' || typeof to !== 'string') {
        throw new TodoError('invalid-input', 'from 与 to 必填')
      }
      const items = []
      for (const raw of state.todos) {
        // 与 list() 一致：没有起始日的循环待办用创建日兜底，否则日历里永远展开不出实例。
        const todo = raw.dueDate ? raw : { ...raw, dueDate: seriesStartOf(raw) }
        if (!todo.dueDate) continue
        for (const date of occurrencesBetween(todo, from, to)) {
          // 「仅本次」的覆盖：只影响这一次的显示字段与排期。
          const ov = (todo.overrides ?? {})[date] ?? null
          const shown = ov === null ? todo : { ...todo, ...ov }
          const shownDate = ov?.dueDate ?? date
          items.push({
            todoId: todo.id,
            // date 是**显示/落位**的日期（被移动过的实例就是新日期）
            date: shownDate,
            // occurrenceDate 是这次发生的**身份**：勾选/覆盖都以它为准，
            // 否则把实例挪到 11-16 之后，complete() 会拿 11-16 去校验 isDueOn 并失败。
            occurrenceDate: date,
            title: shown.title,
            quadrant: shown.quadrant ?? null,
            priority: shown.priority,
            category: shown.category,
            categoryIcon: iconOf(shown.category),
            dueTime: shown.dueTime ?? null,
            startTime: shown.startTime ?? null,
            endTime: shown.endTime ?? null,
            abandoned: shown.abandoned === true,
            // 统一排序（未完成 → 全天 → 开始时间 → 创建日期）需要它；
            // 少了这个字段，客户端的 compareTodoOrder 就只能一路退到标题兜底。
            createdAt: todo.createdAt ?? null,
            done: todo.repeat
              ? Boolean(todo.completions?.[date])
              : Boolean(todo.done && todo.dueDate === date),
            repeat: todo.repeat,
            overridden: ov !== null,
          })
        }
      }
      items.sort((a, b) => (a.date === b.date ? a.title.localeCompare(b.title) : a.date.localeCompare(b.date)))
      return { items }
    },

    /**
     * 所有分类 = 「被待办用到的」∪「显式新建过的」。
     * 后半句是新加的：以前分类只能由待办派生，导致新建一个还没用的分类无处安放。
     * 按使用量降序、同量按名称排序；带上图标。
     */
    categories() {
      const counts = new Map()
      for (const todo of state.todos) {
        if (typeof todo.category !== 'string' || todo.category === '') continue
        counts.set(todo.category, (counts.get(todo.category) ?? 0) + 1)
      }
      for (const name of Object.keys(state.categories)) {
        if (!counts.has(name)) counts.set(name, 0)
      }
      const items = [...counts.entries()]
        .map(([name, count]) => ({ name, count, icon: iconOf(name) }))
        .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name))
      return { items }
    },

    /** 新建一个分类。还没有任何待办引用它也能存在。重名是幂等的，不报错。 */
    async addCategory(name) {
      const target = typeof name === 'string' ? name.trim() : ''
      if (target === '') throw new TodoError('invalid-input', '分类名必填')
      if (target.length > 24) throw new TodoError('invalid-input', '分类名过长（上限 24 字）')
      if (state.categories[target] === undefined) {
        state.categories[target] = { icon: null }
        await guard(persist)
      }
      return { name: target, icon: iconOf(target) }
    },

    /**
     * 设置（或清除）一个分类的图标。图标是 emoji，长度上限 8。
     * 清图标只把 icon 置空，**不删分类本身** —— 分类的存亡由 addCategory / clearCategory 决定，
     * 否则「显式新建但还没用」的分类会因为清一下图标就整条消失。
     */
    async setCategoryIcon(name, icon) {
      const target = typeof name === 'string' ? name.trim() : ''
      if (target === '') throw new TodoError('invalid-input', '分类名必填')
      if (target.length > 24) throw new TodoError('invalid-input', '分类名过长（上限 24 字）')
      const value = icon === null || icon === undefined ? '' : String(icon).trim()
      state.categories[target] = { icon: value === '' ? null : value.slice(0, 8) }
      await guard(persist)
      return { name: target, icon: state.categories[target].icon }
    },

    async settings() {
      return { notify: { ...state.settings.notify } }
    },

    /** 局部保存通知设置：只覆盖传进来的字段。 */
    async saveSettings(patch) {
      const incoming = patch && typeof patch === 'object' && 'notify' in patch ? patch.notify : patch
      const notify = mergeNotify(state.settings.notify, incoming)
      state.settings = { ...state.settings, notify }
      await guard(persist)
      return { notify: { ...notify } }
    },

    /** 把一个分类改名；目标分类已存在时合并。返回受影响条数。 */
    async renameCategory(from, to) {
      const target = typeof to === 'string' ? to.trim() : ''
      if (target === '') throw new TodoError('invalid-input', '分类名不能为空')
      if (target.length > 24) throw new TodoError('invalid-input', '分类名过长（上限 24 字）')
      if (typeof from !== 'string' || from === '') throw new TodoError('invalid-input', '原分类名必填')
      let moved = 0
      const now = new Date().toISOString()
      state.todos = state.todos.map((todo) => {
        if (todo.category !== from) return todo
        moved += 1
        return { ...todo, category: target, updatedAt: now }
      })
      // 图标跟着分类名走；目标已有图标时不覆盖。
      const icon = state.categories[from]?.icon
      if (icon !== undefined) {
        if (state.categories[target] === undefined) state.categories[target] = { icon }
        delete state.categories[from]
      }
      if (moved > 0) await guard(persist)
      return { moved, name: target }
    },

    /** 删掉一个分类：已有待办回到无分类。返回受影响条数。 */
    async clearCategory(name) {
      if (typeof name !== 'string' || name === '') throw new TodoError('invalid-input', '分类名必填')
      let cleared = 0
      const now = new Date().toISOString()
      state.todos = state.todos.map((todo) => {
        if (todo.category !== name) return todo
        cleared += 1
        return { ...todo, category: null, updatedAt: now }
      })
      delete state.categories[name]
      if (cleared > 0) await guard(persist)
      return { cleared }
    },

    async create(input) {
      const todo = normalizeCreate(input)
      state.todos.push(todo)
      await guard(persist)
      return withBucket(todo)
    },

    async update(id, patch) {
      const index = requireIndex(id)
      const current = state.todos[index]
      const patched = applyPatch(current, patch)
      // 起始日**确实变了**才让递归锚点跟随（见 syncRepeatAnchor）：
      // 无条件同步会覆盖用户在重复编辑器里主动选的「每月几号 / 31 = 最后一天」。
      const dateChanged = Object.prototype.hasOwnProperty.call(patch ?? {}, 'dueDate')
        && (current.dueDate ?? null) !== (patched.dueDate ?? null)
      const anchored = dateChanged
        ? { ...patched, repeat: syncRepeatAnchor(patched.repeat, patched.dueDate) }
        : patched
      // 子任务随 update 一起改（拖动排序就靠这条）时，也要重算主任务完成状态。
      const next = syncDoneFromSubtasks(anchored, new Date().toISOString())
      state.todos[index] = next
      await guard(persist)
      return withBucket(next)
    },

    /**
     * 「仅本次」：只改这一次发生的显示字段 / 排期，不动系列本身。
     *
     * date 是这次发生的**身份**（原始日期），patch 里的 dueDate 才是「挪到哪天」。
     */
    async overrideOccurrence(id, date, patch) {
      const index = requireIndex(id)
      const current = state.todos[index]
      if (!current.repeat) throw new TodoError('invalid-input', '这条待办不是循环任务，整条修改即可')
      const anchored = current.dueDate ? current : { ...current, dueDate: seriesStartOf(current) }
      const day = typeof date === 'string' ? date : ''
      if (!isDayKey(day)) throw new TodoError('invalid-input', '日期格式应为 YYYY-MM-DD')
      const known = (current.overrides ?? {})[day] !== undefined
      if (!known && !isDueOn(anchored, day)) {
        throw new TodoError('invalid-input', `${day} 不是这条循环任务的发生日`)
      }
      // 复用 applyPatch 的字段校验：把覆盖当成一条只含允许字段的补丁来验。
      const clean = normalizeOverrides({ [day]: patch })[day]
      if (!clean) throw new TodoError('invalid-input', '没有可保存的修改')
      const overrides = { ...(current.overrides ?? {}), [day]: { ...(current.overrides?.[day] ?? {}), ...clean } }
      const next = { ...current, overrides, updatedAt: new Date().toISOString() }
      state.todos[index] = next
      await guard(persist)
      return withBucket(next)
    },

    /**
     * 「本次及未来」：以 from 为界拆系列。
     *
     * 旧系列截到 from 前一天（until），from 当天起新建一条系列用新值。
     * from 就是第一次发生时不用拆——整条替换即可。
     * 已完成的记录按日期搬到对应的一侧，否则历史勾选会跟着新系列走。
     */
    async splitSeries(id, from, patch) {
      const index = requireIndex(id)
      const current = state.todos[index]
      if (!current.repeat) throw new TodoError('invalid-input', '这条待办不是循环任务，整条修改即可')
      const anchored = current.dueDate ? current : { ...current, dueDate: seriesStartOf(current) }
      if (!isDayKey(from)) throw new TodoError('invalid-input', '日期格式应为 YYYY-MM-DD')
      if (!isDueOn(anchored, from)) throw new TodoError('invalid-input', `${from} 不是这条循环任务的发生日`)

      // 分界就是第一次：整条系列都用新值，不必拆。
      if (from <= String(anchored.dueDate ?? '')) return this.update(id, patch)

      const now = new Date().toISOString()
      const before = shiftKey(from, -1)
      const completions = current.completions ?? {}
      const overrides = current.overrides ?? {}

      const keepCompletions = {}
      const moveCompletions = {}
      for (const [day, at] of Object.entries(completions)) {
        if (day < from) keepCompletions[day] = at
        else moveCompletions[day] = at
      }
      const keepOverrides = {}
      for (const [day, value] of Object.entries(overrides)) {
        if (day < from) keepOverrides[day] = value
      }

      // 旧段：截到分界前一天，之后的完成记录与覆盖搬去新段。
      const oldNext = applyPatch(current, { repeat: { ...current.repeat, until: before } })
      const oldTodo = {
        ...oldNext,
        completions: keepCompletions,
        overrides: keepOverrides,
        updatedAt: now,
      }

      // 新段：从分界日开始，套用用户的修改；锚点跟着 from（这段的第一次就是这个日子）。
      const base = applyPatch(current, patch ?? {})
      // 但用户**显式改了重复规则**时不许同步锚点，否则「改成每月 20 号」会被
      // 分界日的 13 号覆盖回去 —— 那是用户的明确选择，比默认行为优先。
      const patchHasRepeat = patch !== null && typeof patch === 'object'
        && Object.prototype.hasOwnProperty.call(patch, 'repeat')
        && patch.repeat !== undefined && patch.repeat !== null
      const carriedRepeat = { ...(base.repeat ?? current.repeat), until: base.repeat?.until ?? current.repeat?.until ?? null }
      const newTodo = {
        ...base,
        id: newId(),
        dueDate: from,
        repeat: patchHasRepeat ? carriedRepeat : syncRepeatAnchor(carriedRepeat, from),
        completions: moveCompletions,
        overrides: {},
        // 子任务/备注等沿用；完成状态重算为空。
        done: false,
        doneAt: null,
        doneBy: null,
        verifiedAt: null,
        abandoned: false,
        abandonedAt: null,
        createdAt: now,
        updatedAt: now,
      }

      state.todos[index] = oldTodo
      state.todos.push(newTodo)
      await guard(persist)
      return withBucket(newTodo)
    },

    /** 只改象限——UI 里拖拽/选择象限走这条，语义单一。 */
    async setQuadrant(id, quadrant) {
      const index = requireIndex(id)
      const next = applyPatch(state.todos[index], { quadrant })
      state.todos[index] = next
      await guard(persist)
      return withBucket(next)
    },

    async subtaskAdd(id, title) {
      const index = requireIndex(id)
      const current = state.todos[index]
      const list = Array.isArray(current.subtasks) ? current.subtasks : []
      // 新加的子任务必然是未完成的 → 主任务会被拉回未完成（双向联动的必然结果）。
      const next = syncDoneFromSubtasks(
        applyPatch(current, { subtasks: [...list, { title }] }),
        new Date().toISOString(),
      )
      state.todos[index] = next
      await guard(persist)
      return withBucket(next)
    },

    async subtaskUpdate(id, subtaskId, patch) {
      const index = requireIndex(id)
      const current = state.todos[index]
      const list = Array.isArray(current.subtasks) ? current.subtasks : []
      if (!list.some((s) => s.id === subtaskId)) throw new TodoError('not-found', '这条子计划已经不在了')
      const p = patch && typeof patch === 'object' && !Array.isArray(patch) ? patch : {}
      const merged = list.map((s) => {
        if (s.id !== subtaskId) return s
        const out = { ...s }
        if (p.title !== undefined) out.title = p.title
        if (p.done !== undefined) {
          out.done = p.done === true
          out.doneAt = out.done ? new Date().toISOString() : null
        }
        return out
      })
      const next = syncDoneFromSubtasks(applyPatch(current, { subtasks: merged }), new Date().toISOString())
      state.todos[index] = next
      await guard(persist)
      return withBucket(next)
    },

    async subtaskRemove(id, subtaskId) {
      const index = requireIndex(id)
      const current = state.todos[index]
      const list = Array.isArray(current.subtasks) ? current.subtasks : []
      if (!list.some((s) => s.id === subtaskId)) throw new TodoError('not-found', '这条子计划已经不在了')
      // 删掉最后一个未完成的子任务，可能让「剩下的全完成」成立 → 主任务跟着完成。
      const next = syncDoneFromSubtasks(
        applyPatch(current, { subtasks: list.filter((s) => s.id !== subtaskId) }),
        new Date().toISOString(),
      )
      state.todos[index] = next
      await guard(persist)
      return withBucket(next)
    },

    async complete(id, done = true, by = 'user', date) {
      if (typeof done !== 'boolean') throw new TodoError('invalid-input', 'done 必须是布尔值')
      const index = requireIndex(id)
      const current = state.todos[index]
      const finished = done !== false
      const now = new Date().toISOString()

      if (current.repeat) {
        if (typeof by !== 'string' || by === '') throw new TodoError('invalid-input', 'by 必须是 user 或 agent')
        const explicit = date !== undefined && date !== null && date !== ''
        const day = explicit ? date : dateKey(new Date())
        if (!isDayKey(day)) throw new TodoError('invalid-input', '日期格式应为 YYYY-MM-DD')
        // 没有起始日的循环待办（agent 历史数据）用创建日兜底，否则永远无法勾选。
        const anchored = current.dueDate ? current : { ...current, dueDate: seriesStartOf(current) }
        if (!anchored.dueDate) throw new TodoError('invalid-input', '这条循环任务缺少起始日，无法判断发生日')
        if (!isDueOn(anchored, day)) throw new TodoError('invalid-input', `${day} 不是这条循环任务的发生日`)
        const completions = { ...(current.completions ?? {}) }
        if (finished) completions[day] = now
        else delete completions[day]
        const next = { ...current, completions, updatedAt: now }
        state.todos[index] = next
        await guard(persist)
        return withBucket(next)
      }

      // 主任务 → 子任务：勾主任务就把子任务全部勾上，取消完成就全部取消。
      // 「取消主任务 → 子任务全部取消」不是多余的一步：双向规则下若不这么做，
      // 「子任务全完成 → 主任务完成」会立刻把主任务又勾回去，来回弹。
      // 循环任务不参与（子任务跨实例共享，见 syncDoneFromSubtasks 的说明）。
      const subtasks = Array.isArray(current.subtasks) ? current.subtasks : []
      const syncedSubtasks = subtasks.length === 0
        ? subtasks
        : subtasks.map((s) => ({ ...s, done: finished, doneAt: finished ? now : null }))
      const subtasksAlreadySynced = subtasks.length === 0
        || subtasks.every((s) => (s.done === true) === finished)
      if (current.done === done && subtasksAlreadySynced) return withBucket(current)
      const byAgent = by === 'agent'
      const next = {
        ...current,
        done: finished,
        doneAt: finished ? now : null,
        doneBy: finished ? (byAgent ? 'agent' : 'user') : null,
        verifiedAt: finished && !byAgent ? now : null,
        updatedAt: now,
        subtasks: syncedSubtasks,
      }
      state.todos[index] = next
      await guard(persist)
      return withBucket(next)
    },

    async confirm(id) {
      const index = requireIndex(id)
      const current = state.todos[index]
      if (current.done !== true || current.doneBy !== 'agent') {
        throw new TodoError('invalid-input', '这条待办不需要确认')
      }
      const now = new Date().toISOString()
      const next = { ...current, verifiedAt: now, updatedAt: now }
      state.todos[index] = next
      await guard(persist)
      return withBucket(next)
    },

    /** 标记 / 取消「放弃」。放弃后不再催办，但**仍留在列表里**可见、可撤销。 */
    async setAbandoned(id, abandoned = true) {
      const index = requireIndex(id)
      const next = applyPatch(state.todos[index], { abandoned: abandoned !== false })
      state.todos[index] = next
      await guard(persist)
      return withBucket(next)
    },

    async remove(id) {
      const index = requireIndex(id)
      state.todos.splice(index, 1)
      await guard(persist)
      return { id }
    },

    /** 写失败后把内存里的当前全量再落一次盘；成功即清掉 write-error。 */
    async retryPersist() {
      try {
        await persist()
        return { ok: true }
      } catch (err) {
        if (err instanceof TodoError) throw err
        throw new TodoError('io-error', `待办数据写入失败：${err.message}`)
      }
    },

    /** 只读快照——通知调度器用它算到期，不经过 HTTP。 */
    snapshot() {
      return { todos: state.todos, settings: state.settings, categories: state.categories }
    },

    async close() {
      if (closed) return
      closed = true
      await queue
    },
  }
}

/** Default data file, resolved from the running profile. */
export function resolveDataFile(override) {
  if (typeof override === 'string' && override.trim() !== '') return override
  const base = process.env.DSH_PROFILE_DIR || process.cwd()
  // 目录名 `dsh-todolist` 是**故意保留**的：插件从 dsh-sidebar-todo 改名成
  // dsh-quadrant-todo 时没有跟着改，否则已装用户的待办会变成孤儿文件。
  // 新装用户会看到这个「历史路径」，这是为了兼容付出的代价。
  return join(base, 'data', 'dsh-todolist', 'todos.json')
}
