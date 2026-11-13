/** One dispatch table shared by the HTTP route and the agent tool. */

import { parseQuickAdd } from './quickadd.js'

export function createApi(store, notifier, holidays) {
  const api = {
    list: (input = {}) => store.list(input),
    create: (input = {}) => store.create(input),
    update: (input = {}) => {
      const patch = input.patch ?? stripKeys(input, ['id', 'patch'])
      return store.update(input.id, patch)
    },
    complete: (input = {}) => store.complete(input.id, input.done !== false, input.by, input.date),
    confirm: (input = {}) => store.confirm(input.id),
    remove: (input = {}) => store.remove(input.id),
    categories: () => store.categories(),
    addCategory: (input = {}) => store.addCategory(input.name),
    renameCategory: (input = {}) => store.renameCategory(input.from, input.to),
    clearCategory: (input = {}) => store.clearCategory(input.name),
    occurrences: (input = {}) => store.occurrences(input),
    // 循环待办的三种保存范围：仅本次 / 本次及未来 /（整个系列走 update）。
    overrideOccurrence: (input = {}) => store.overrideOccurrence(input.id, input.date, input.patch),
    splitSeries: (input = {}) => store.splitSeries(input.id, input.from, input.patch),
    retry: () => store.retryPersist(),
    parse: (input = {}) => parseQuickAdd(input.text, input.today ? { today: input.today } : undefined),

    // --- v2：四象限 / 子计划 / 分类图标 / 通知设置 ---
    setQuadrant: (input = {}) => store.setQuadrant(input.id, input.quadrant),
    setAbandoned: (input = {}) => store.setAbandoned(input.id, input.abandoned !== false),
    subtaskAdd: (input = {}) => store.subtaskAdd(input.id, input.title),
    subtaskUpdate: (input = {}) => store.subtaskUpdate(input.id, input.subtaskId, input.patch),
    subtaskRemove: (input = {}) => store.subtaskRemove(input.id, input.subtaskId),
    setCategoryIcon: (input = {}) => store.setCategoryIcon(input.name, input.icon),
    settings: () => store.settings(),
    saveSettings: (input = {}) => store.saveSettings(input),
  }

  // 通知相关的方法只在真的有调度器时挂上——缺了它们，这个包仍然是个完整的待办插件。
  if (notifier) {
    api.notifyPoll = () => notifier.poll()
    api.notifyTest = (input = {}) => notifier.sendTest(input.channel)
  }

  // 法定工作日同理：没有联网能力时这两个方法直接不存在。
  if (holidays) {
    api.holidayStatus = () => holidays.status()
    api.holidayRefresh = (input = {}) => holidays.refresh(input.year)
  }

  return api
}

function stripKeys(input, keys) {
  const out = {}
  for (const [key, value] of Object.entries(input)) {
    if (!keys.includes(key)) out[key] = value
  }
  return out
}
