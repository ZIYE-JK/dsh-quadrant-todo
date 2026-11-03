/** The `personal_todo` agent tool: same dispatch table the UI calls. */

import { TodoError, QUADRANTS } from './model.js'
import { summarize } from './bucket.js'

const ACTIONS = [
  'list', 'add', 'update', 'complete', 'confirm', 'delete',
  'subtaskAdd', 'subtaskUpdate', 'subtaskRemove',
]
const NEEDS_ID = ['update', 'complete', 'confirm', 'delete', 'subtaskAdd', 'subtaskUpdate', 'subtaskRemove']
const NEEDS_SUBTASK = ['subtaskUpdate', 'subtaskRemove']

const QUADRANT_KEYS = [...QUADRANTS]
const QUADRANT_LABEL = {
  urgent_important: '重要且紧急',
  urgent_not_important: '紧急不重要',
  important_not_urgent: '重要不紧急',
  neither: '不重要不紧急',
}

function describe(item) {
  // 循环任务显示本周期待完成的这一次（dueDate），不是下一个未完成实例（nextDue）：
  // 漏做时两者不同，用 nextDue 会让用户以为要交的是下周那次。
  const due = item.isRepeating
    ? item.dueDate
      ? `（循环·本次 ${String(item.dueDate).slice(5)}）`
      : '（循环·已结束）'
    : item.dueDate
      ? `（截止 ${item.dueDate}${item.dueTime ? ' ' + item.dueTime : ''}）`
      : ''
  const flags = []
  if (item.bucket === 'overdue') flags.push('【逾期】')
  if (item.bucket === 'stale') flags.push('【积压】')
  const tags = []
  if (item.quadrant) tags.push(QUADRANT_LABEL[item.quadrant] ?? item.quadrant)
  else tags.push('收集箱')
  if (item.category) tags.push(`#${item.category}`)
  if (Array.isArray(item.subtasks) && item.subtasks.length > 0) {
    const done = item.subtasks.filter((s) => s.done).length
    tags.push(`子计划 ${done}/${item.subtasks.length}`)
  }
  const subtasks = Array.isArray(item.subtasks) && item.subtasks.length > 0
    ? '\n' + item.subtasks.map((s) => `    ${s.done ? '[x]' : '[ ]'} ${s.title}`).join('\n')
    : ''
  return `- ${item.done ? '[x]' : '[ ]'} (${item.id}) ${item.title}${due}${flags.join('')} [${tags.join(' · ')}]${subtasks}`
}

function filterNote(args) {
  const parts = []
  if (typeof args?.view === 'string' && args.view !== '') parts.push(`view=${args.view}`)
  if (typeof args?.quadrant === 'string' && args.quadrant !== '') {
    parts.push(args.quadrant === '__inbox__' ? '收集箱' : `象限=${QUADRANT_LABEL[args.quadrant] ?? args.quadrant}`)
  }
  if (typeof args?.category === 'string' && args.category !== '') parts.push(`分类=${args.category}`)
  const q = typeof args?.q === 'string' ? args.q.trim() : ''
  if (q !== '') parts.push(`关键词「${q}」`)
  if (parts.length === 0) return ''
  return `（以下为 ${parts.join(' / ')} 的筛选结果，计数为全量）`
}

export function createTool(api, ready) {
  async function run(input = {}) {
    await ready
    if (input === null || typeof input !== 'object') {
      throw new TodoError('invalid-input', '参数必须是对象')
    }
    const action = input.action
    if (!ACTIONS.includes(action)) {
      throw new TodoError('invalid-input', `不支持的 action：${String(action)}，可用 ${ACTIONS.join(' / ')}`)
    }
    if (NEEDS_ID.includes(action) && (typeof input.id !== 'string' || input.id.trim() === '')) {
      throw new TodoError('invalid-input', 'id 必填')
    }
    if (NEEDS_SUBTASK.includes(action) && (typeof input.subtaskId !== 'string' || input.subtaskId.trim() === '')) {
      throw new TodoError('invalid-input', 'subtaskId 必填')
    }
    if (action === 'list') {
      const all = await api.list({})
      const filtered = await api.list({ ...input, view: input.view ?? 'open' })
      return { items: filtered.items, summary: summarize(all.items), inboxCount: all.inboxCount }
    }
    if (action === 'add') {
      const { action: _a, ...fields } = input
      const item = await api.create(fields)
      const all = await api.list({})
      return { item, summary: summarize(all.items), inboxCount: all.inboxCount }
    }
    if (action === 'update') {
      const { action: _a, ...rest } = input
      return { item: await api.update(rest) }
    }
    if (action === 'complete') {
      const item = await api.complete({ id: input.id, done: input.done !== false, by: 'agent', date: input.date })
      return { item }
    }
    if (action === 'confirm') {
      return { item: await api.confirm({ id: input.id }) }
    }
    if (action === 'subtaskAdd') {
      return { item: await api.subtaskAdd({ id: input.id, title: input.title }) }
    }
    if (action === 'subtaskUpdate') {
      return { item: await api.subtaskUpdate({ id: input.id, subtaskId: input.subtaskId, patch: { title: input.title, done: input.done } }) }
    }
    if (action === 'subtaskRemove') {
      return { item: await api.subtaskRemove({ id: input.id, subtaskId: input.subtaskId }) }
    }
    const removed = await api.remove({ id: input.id })
    return { removed }
  }

  return {
    name: 'personal_todo',
    description:
      '管理用户本人的日常待办（跨会话、与当前任务无关）。当前会话的任务清单请用官方 todo_write。' +
      'action=list 查询；add 新建；update 修改；complete 勾选/取消（agent 打勾会标为待确认）；' +
      'confirm 确认该条已完成；delete 删除；subtaskAdd/subtaskUpdate/subtaskRemove 管理子计划。' +
      '待办用「四象限」分类（quadrant）：urgent_important=重要且紧急、important_not_urgent=重要不紧急、' +
      'urgent_not_important=紧急不重要、neither=不重要不紧急；不传 quadrant 就落在「收集箱」。' +
      '只在用户明确要求记录、查询或更新待办时调用，不要用它记录当前会话的任务步骤。' +
      '用户用口语描述重复安排（如「每周一到周五」「每月 5 号」）时，自行推断 repeat 参数，不要反问用户要哪种重复。' +
      '用户说到「重要」「紧急」这类优先级时，按四象限语义填 quadrant。',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ACTIONS, description: '要执行的操作' },
        id: { type: 'string', description: '待办 id（除 list/add 外必填）' },
        subtaskId: { type: 'string', description: '子计划 id（subtaskUpdate / subtaskRemove 必填）' },
        title: { type: 'string', description: '标题；subtaskAdd/subtaskUpdate 时为子计划标题' },
        note: { type: 'string', description: '备注' },
        quadrant: {
          type: 'string',
          enum: QUADRANT_KEYS,
          description: '四象限：urgent_important 重要且紧急 / important_not_urgent 重要不紧急 / urgent_not_important 紧急不重要 / neither 不重要不紧急；省略=收集箱',
        },
        priority: { type: 'string', enum: ['high', 'medium', 'low'], description: '旧的三档优先级（兼容保留）' },
        category: { type: 'string', description: '分类，如 工作 / 生活' },
        dueDate: { type: 'string', description: '截止日期 YYYY-MM-DD' },
        dueTime: { type: 'string', description: '截止时间 HH:mm' },
        date: { type: 'string', description: 'complete 时指定哪一天（YYYY-MM-DD），默认今天；循环任务用' },
        repeat: {
          type: 'object',
          description: '循环规则：{ freq: daily|weekly|monthly, weekdays?: 1-7, monthDay?: 1-31, until?: YYYY-MM-DD }',
          properties: {
            freq: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
            weekdays: { type: 'array', items: { type: 'integer' } },
            monthDay: { type: 'integer' },
            until: { type: 'string' },
          },
          required: ['freq'],
          additionalProperties: false,
        },
        subtasks: {
          type: 'array',
          description: '子计划整体替换（add/update 时用）。每项 { id?, title, done? }',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              done: { type: 'boolean' },
            },
            required: ['title'],
            additionalProperties: false,
          },
        },
        view: { type: 'string', enum: ['open', 'today', 'week', 'stale', 'done'], description: 'list 的过滤视图' },
        q: { type: 'string', description: 'list 的关键词' },
        done: { type: 'boolean', description: 'complete 传 false 表示取消完成；subtaskUpdate 时表示子计划完成与否' },
      },
      required: ['action'],
      additionalProperties: false,
    },
    output: {
      schema: { type: 'object' },
      render(args, value) {
        if (Array.isArray(value?.items)) {
          const lines = value.items.map(describe)
          const s = value.summary ?? {}
          const head =
            `待办：今天 ${s.today ?? 0} · 逾期 ${s.overdue ?? 0} · 积压 ${s.stale ?? 0} · ` +
            `未排期 ${s.unplanned ?? 0} · 收集箱 ${value.inboxCount ?? 0} · 最近完成 ${s.doneToday ?? 0}`
          const note = filterNote(args)
          return [{ type: 'text', text: [head, ...(note === '' ? [] : [note]), ...lines].join('\n') }]
        }
        if (value?.item) return [{ type: 'text', text: `已保存 (${value.item.id})：${value.item.title}` }]
        if (value?.removed) return [{ type: 'text', text: `已删除 (${value.removed.id})` }]
        return [{ type: 'text', text: JSON.stringify(value) }]
      },
    },
    execute: run,
  }
}
