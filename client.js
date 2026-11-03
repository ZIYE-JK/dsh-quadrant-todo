window.__ModuleLoader__.load({
  id: 'dsh-sidebar-todo',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useCallback, useRef, useMemo } = React

    const NS = 'dsh-sidebar-todo'
    const dict = {
      zh: {
        nav: '待办', title: '待办', new: '新建', search: '搜索待办',
        today: '今天', overdue: '逾期', tomorrow: '明天', week: '本周', month: '本月', later: '以后', stale: '积压',
        unplanned: '未排期', done: '已完成', doneEmpty: '该范围内没有完成记录', empty: '还没有待办',
        staleHint: '超过 {n} 天未完成', loading: '加载中…', failed: '读取失败',
        actionFailed: '操作失败，请重试',
        retry: '重试', pickOne: '选一条看详情',
        listView: '列表', calendarView: '日历', prevMonth: '上个月', nextMonth: '下个月',
        nothingThatDay: '这一天没有安排', plansOnDay: '{{date}} 的安排', newOnThatDay: '在这一天新建',
        corruptNotice: '数据文件损坏，已备份并以空清单启动',
        writeNotice: '有改动尚未写入磁盘', retryWrite: '重试写入',
        save: '保存', cancel: '取消',
        complete: '完成', reopen: '撤销完成', remove: '删除', confirmRemove: '确认删除', edit: '编辑',
        needsReview: '待确认', confirmDone: '确认已完成',
        note: '备注', priority: '优先级', dueDate: '截止日期', dueTime: '时间',
        pickDate: '选择日期', pickTime: '选择时间', clearValue: '清除',
        hourShort: '时', minuteShort: '分',
        tomorrowQuick: '明天', nextMonday: '下周一',
        category: '分类', noCategory: '无分类', categoryManage: '管理分类', categoryEmpty: '暂无分类',
        categoryCount: '{count} 条',
        categoryHint: '分类不是预先设定的：它来自待办里填写的分类名，某条待办写了新名字，这里就会多一个。删掉一个分类，会让它的待办回到「无分类」。',
        rename: '重命名', deleteOne: '删除', confirmDelete: '确认删除',
        saveRename: '保存', cancelRename: '取消',
        dialogNew: '新建待办', dialogEdit: '编辑待办',
        fieldTitle: '标题', fieldNote: '备注', fieldDate: '日期', fieldTime: '时间',
        fieldPriority: '优先级', fieldCategory: '分类',
        fieldRepeat: '重复', repeatNone: '不循环', repeatDaily: '每天', repeatWeekly: '每周', repeatMonthly: '每月',
        fieldWeekdays: '星期', fieldMonthDay: '每月几号', fieldUntil: '结束日期',
        weekdaysRequired: '每周至少选一天',
        mon: '一', tue: '二', wed: '三', thu: '四', fri: '五', sat: '六', sun: '日',
        repeatBadge: '循环',
        completeOccurrence: '完成本次', lastCompleted: '上次完成', neverCompleted: '尚未完成过',
        completedTimes: '已完成 {n} 次', seriesEnded: '循环已结束',
        completedOn: '完成于', recurringDoneSection: '循环任务完成',
        quickFill: '一句话填写，例如：明天下午3点 交周报 #工作',
        quickHint: '也可以只填标题，之后在对话里让我改日期。', titleRequired: '标题不能为空',
        emptyHint: '新建第一条',
        yesterday: '昨天', earlier: '更早', created: '创建于',
        noMatch: '没有匹配的待办', staleFor: '挂了 {n} 天',
        priorityHigh: '高', priorityMedium: '中', priorityLow: '低',
        badResponse: '响应格式不正确', requestFailed: '请求失败', dismiss: '关闭',
        // --- New UI strings ---
        plan: '做计划', view: '视图', focus: '专注',
        inbox: '收集箱', inboxPlaceholder: '添加计划到「收集箱」，回车即可保存',
        all: '全部', uncategorized: '无分类', newCategory: '新建分类',
        monthTitle: '{year}年{month}月', backToToday: '回到今天',
        quadrantUrgentImportant: '重要且紧急',
        quadrantUrgentNotImportant: '紧急不重要',
        quadrantImportantNotUrgent: '重要不紧急',
        quadrantNeither: '不重要不紧急',
        quadrantEmptyUrgentImportant: '立即去做',
        quadrantEmptyUrgentNotImportant: '交给别人或自己做',
        quadrantEmptyImportantNotUrgent: '规划后再做',
        quadrantEmptyNeither: '有空再做',
        subtaskAdd: '+添加子计划', subtaskPlaceholder: '输入子计划…',
        titlePlaceholder: '计划标题',
        notePlaceholder: '选填：这是我要写的书写内容',
        propertyCategory: '计划分类', propertyPriority: '重要优先级',
        propertyDueDate: '完成期限', propertyRepeat: '重复',
        dueToday: '当天', dueNone: '未设置', repeatNoneShort: '不重复',
        notificationToggle: '通知', notificationOn: '通知已开启', notificationOff: '通知已关闭',
        notifySettings: '通知设置', systemNotify: '系统通知', feishuNotify: '飞书通知',
        leadMinutes: '提前提醒分钟数', leadMinutesShort: '分钟', quietHours: '静默时段',
        testNotify: '测试', testNotifySuccess: '测试通知已发送', testNotifyFail: '测试通知发送失败',
        notifyDenied: '通知权限被拒绝，请在系统设置中允许通知',
        notifyUnsupported: '当前环境不支持系统通知',
        selectCategory: '选择分类', selectQuadrant: '选择象限', selectRepeat: '选择重复规则',
        addTodo: '新建待办', calendarIcon: '日历', active: '当前',
        subtaskDelete: '删除子计划', subtaskDone: '子计划完成', subtaskUndone: '子计划未完成',
        collapseInbox: '折叠收集箱', expandInbox: '展开收集箱',
        inboxCount: '收集箱 {count}',
        quadrantCount: '{count} 条',
        noTodos: '暂无待办', noSubtasks: '暂无子计划',
        saveSuccess: '已保存', saveFail: '保存失败',
        settingsSaved: '设置已保存',
        quietStart: '开始', quietEnd: '结束',
        weekdays: '星期', monthDay: '每月几号', until: '结束日期',
        confirm: '确认', add: '添加', delete: '删除',
      },
      en: {
        nav: 'To-do', title: 'To-do', new: 'New', search: 'Search',
        today: 'Today', overdue: 'Overdue', tomorrow: 'Tomorrow', week: 'This week', month: 'This month', later: 'Later', stale: 'Backlog',
        unplanned: 'Unscheduled', done: 'Completed', doneEmpty: 'No completions in this range', empty: 'No todos yet',
        staleHint: 'Open for more than {n} days', loading: 'Loading…', failed: 'Failed to load',
        actionFailed: 'Action failed, please retry',
        retry: 'Retry', pickOne: 'Select an item',
        listView: 'List', calendarView: 'Calendar', prevMonth: 'Previous month', nextMonth: 'Next month',
        nothingThatDay: 'Nothing planned for this day', plansOnDay: 'Plans on {{date}}', newOnThatDay: 'New on this day',
        corruptNotice: 'Data file was corrupt; it is backed up and the list started empty.',
        writeNotice: 'Some changes are not on disk yet', retryWrite: 'Retry write',
        save: 'Save', cancel: 'Cancel',
        complete: 'Complete', reopen: 'Reopen', remove: 'Delete', confirmRemove: 'Confirm delete', edit: 'Edit',
        needsReview: 'Needs review', confirmDone: 'Confirm done',
        note: 'Note', priority: 'Priority', dueDate: 'Due date', dueTime: 'Time',
        pickDate: 'Pick a date', pickTime: 'Pick a time', clearValue: 'Clear',
        hourShort: 'Hr', minuteShort: 'Min',
        tomorrowQuick: 'Tomorrow', nextMonday: 'Next Monday',
        category: 'Category', noCategory: 'No category', categoryManage: 'Manage categories', categoryEmpty: 'No categories',
        categoryCount: '{count} items',
        categoryHint: 'Categories are not predefined: they come from the category names entered on todos, so a new name adds one here. Deleting a category moves its todos back to "No category".',
        rename: 'Rename', deleteOne: 'Delete', confirmDelete: 'Confirm delete',
        saveRename: 'Save', cancelRename: 'Cancel',
        dialogNew: 'New todo', dialogEdit: 'Edit todo',
        fieldTitle: 'Title', fieldNote: 'Note', fieldDate: 'Date', fieldTime: 'Time',
        fieldPriority: 'Priority', fieldCategory: 'Category',
        fieldRepeat: 'Repeat', repeatNone: 'Never', repeatDaily: 'Daily', repeatWeekly: 'Weekly', repeatMonthly: 'Monthly',
        fieldWeekdays: 'Weekdays', fieldMonthDay: 'Day of month', fieldUntil: 'Until',
        weekdaysRequired: 'Pick at least one weekday',
        mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
        repeatBadge: 'Repeats',
        completeOccurrence: 'Complete this one', lastCompleted: 'Last completed', neverCompleted: 'Never completed',
        completedTimes: 'Completed {n} times', seriesEnded: 'Series ended',
        completedOn: 'Completed on', recurringDoneSection: 'Recurring completions',
        quickFill: 'Quick fill, e.g. "tomorrow 3pm report #work"',
        quickHint: 'You can fill in just the title and ask me in chat to set the date later.', titleRequired: 'Title is required',
        emptyHint: 'Create the first one',
        yesterday: 'Yesterday', earlier: 'Earlier', created: 'Created',
        noMatch: 'No matching todos', staleFor: 'Open {n} days',
        priorityHigh: 'High', priorityMedium: 'Medium', priorityLow: 'Low',
        badResponse: 'Unexpected response', requestFailed: 'Request failed', dismiss: 'Dismiss',
        // --- New UI strings ---
        plan: 'Plan', view: 'View', focus: 'Focus',
        inbox: 'Inbox', inboxPlaceholder: 'Add to Inbox, press Enter to save',
        all: 'All', uncategorized: 'No category', newCategory: 'New category',
        monthTitle: '{year} {{month}}', backToToday: 'Back to today',
        quadrantUrgentImportant: 'Urgent & Important',
        quadrantUrgentNotImportant: 'Urgent & Not Important',
        quadrantImportantNotUrgent: 'Important & Not Urgent',
        quadrantNeither: 'Neither',
        quadrantEmptyUrgentImportant: 'Do it now',
        quadrantEmptyUrgentNotImportant: 'Delegate or do it yourself',
        quadrantEmptyImportantNotUrgent: 'Plan then do',
        quadrantEmptyNeither: 'Do when free',
        subtaskAdd: '+ Add subtask', subtaskPlaceholder: 'Enter subtask…',
        titlePlaceholder: 'Plan title',
        notePlaceholder: 'Optional: write your content here',
        propertyCategory: 'Category', propertyPriority: 'Priority',
        propertyDueDate: 'Due date', propertyRepeat: 'Repeat',
        dueToday: 'Today', dueNone: 'Not set', repeatNoneShort: 'None',
        notificationToggle: 'Notifications', notificationOn: 'Notifications on', notificationOff: 'Notifications off',
        notifySettings: 'Notification settings', systemNotify: 'System notifications', feishuNotify: 'Feishu notifications',
        leadMinutes: 'Lead time (minutes)', leadMinutesShort: 'min', quietHours: 'Quiet hours',
        testNotify: 'Test', testNotifySuccess: 'Test notification sent', testNotifyFail: 'Test notification failed',
        notifyDenied: 'Notification permission denied. Please enable notifications for this app.',
        notifyUnsupported: 'System notifications not supported in this environment',
        selectCategory: 'Select category', selectQuadrant: 'Select quadrant', selectRepeat: 'Select repeat',
        addTodo: 'New todo', calendarIcon: 'Calendar', active: 'Active',
        subtaskDelete: 'Delete subtask', subtaskDone: 'Subtask done', subtaskUndone: 'Subtask undone',
        collapseInbox: 'Collapse inbox', expandInbox: 'Expand inbox',
        inboxCount: 'Inbox {count}',
        quadrantCount: '{count} items',
        noTodos: 'No todos', noSubtasks: 'No subtasks',
        saveSuccess: 'Saved', saveFail: 'Save failed',
        settingsSaved: 'Settings saved',
        quietStart: 'Start', quietEnd: 'End',
        weekdays: 'Weekdays', monthDay: 'Day of month', until: 'Until',
        confirm: 'Confirm', add: 'Add', delete: 'Delete',
      },
    }
    const ORDER = ['overdue', 'today', 'tomorrow', 'week', 'later', 'stale', 'unplanned', 'done']

    // --- Quadrant constants ---
    const QUADRANTS = [
      { key: 'urgent_not_important', labelKey: 'quadrantUrgentNotImportant', color: '#f0d080', order: 1, row: 1, col: 1 },
      { key: 'urgent_important', labelKey: 'quadrantUrgentImportant', color: '#f07080', order: 2, row: 1, col: 2 },
      { key: 'neither', labelKey: 'quadrantNeither', color: '#7fc9a0', order: 3, row: 2, col: 1 },
      { key: 'important_not_urgent', labelKey: 'quadrantImportantNotUrgent', color: '#b0b0f0', order: 4, row: 2, col: 2 },
    ]
    const QUADRANT_MAP = QUADRANTS.reduce((acc, q) => { acc[q.key] = q; return acc }, {})
    const QUADRANT_COLORS = QUADRANTS.reduce((acc, q) => { acc[q.key] = q.color; return acc }, {})

    // --- API utilities ---
    function apiUrl(method) {
      return new URL(`todo/api/${method}`, document.baseURI).href
    }

    const defaultT = (key) => dict.zh[key] ?? key

    async function fetchApi(method, payload, t = defaultT) {
      const res = await fetch(apiUrl(method), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload ?? {}),
      })
      const body = await res.json().catch(() => null)
      if (!body) throw new Error(t('badResponse'))
      if (!body.ok) throw new Error(body.error?.message ?? t('requestFailed'))
      return body.result
    }

    // --- Styling ---
    const S = {
      // Main layout
      page: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', fontFamily: 'var(--dsw-font-family, sans-serif)' },
      topBar: { display: 'flex', alignItems: 'center', height: 72, padding: '0 20px', flex: 'none', borderBottom: '0.5px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-specific-input-major)' },
      mainBody: { display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' },
      // Left rail
      leftRail: { width: 120, flex: 'none', background: 'var(--dsw-alias-bg-layer-1)', borderRight: '0.5px solid var(--dsw-alias-border-l2)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 4 },
      railItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 0', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 8, transition: 'background 0.12s', fontSize: 11, color: 'var(--dsw-alias-label-secondary)' },
      railItemActive: { background: 'var(--dsw-specific-input-major)', color: 'var(--dsw-alias-label-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
      railIcon: { fontSize: 20, lineHeight: 1 },
      railLabel: { fontSize: 11, lineHeight: 1 },
      railAvatar: { width: 32, height: 32, borderRadius: '50%', background: 'var(--dsw-alias-bg-module-platform)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginTop: 'auto', marginBottom: 12, color: 'var(--dsw-alias-label-tertiary)' },
      // Left panel
      leftPanel: { width: 369, flex: 'none', background: 'var(--dsw-alias-bg-layer-1)', borderRight: '0.5px solid var(--dsw-alias-border-l2)', display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' },
      panelSection: { padding: '12px 16px', borderBottom: '0.5px solid var(--dsw-alias-border-l2)' },
      panelHeader: { display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 8px', borderRadius: 6, cursor: 'pointer' },
      panelHeaderIcon: { fontSize: 16, flex: 'none' },
      panelHeaderTitle: { fontSize: 13, fontWeight: 600, flex: 1, minWidth: 0 },
      panelHeaderCount: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', flex: 'none' },
      panelHeaderArrow: { fontSize: 10, color: 'var(--dsw-alias-label-tertiary)', flex: 'none' },
      panelHeaderArrowBtn: { flex: 'none', width: 20, height: 20, padding: 0, border: 'none', borderRadius: 4, background: 'transparent', color: 'var(--dsw-alias-label-tertiary)', fontSize: 11, lineHeight: '20px', textAlign: 'center', cursor: 'pointer' },
      // Calendar mini
      miniCalendar: { padding: '8px 12px 12px' },
      calendarHead: { display: 'flex', alignItems: 'center', gap: 4, height: 28, marginBottom: 4 },
      calendarTitle: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600 },
      calendarBtn: { width: 24, height: 24, padding: 0, border: 'none', borderRadius: 4, color: 'var(--dsw-alias-label-secondary)', fontSize: 14, lineHeight: '24px', textAlign: 'center', cursor: 'pointer', background: 'transparent' },
      calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 },
      calendarWeekday: { textAlign: 'center', fontSize: 10, lineHeight: '20px', color: 'var(--dsw-alias-label-tertiary)' },
      calendarCell: { height: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, fontSize: 11, color: 'var(--dsw-alias-label-primary)', position: 'relative', padding: 0 },
      calendarCellToday: { fontWeight: 600, color: 'var(--dsw-alias-state-business-primary)' },
      calendarCellSelected: { background: 'var(--dsw-alias-interactive-bg-hover)' },
      calendarDot: { width: 4, height: 4, borderRadius: '50%', position: 'absolute', bottom: 2 },
      // Category list
      categoryList: { padding: '4px 12px' },
      categoryRow: { display: 'flex', alignItems: 'center', gap: 8, height: 34, padding: '0 8px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
      categoryRowSelected: { background: 'var(--dsw-alias-interactive-bg-hover)' },
      categoryIcon: { fontSize: 16, flex: 'none', width: 20, textAlign: 'center' },
      categoryName: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      categoryCount: { flex: 'none', fontSize: 11, color: 'var(--dsw-alias-label-tertiary)' },
      newCategoryBtn: { display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 12px', margin: '8px 12px', borderRadius: 6, border: '0.5px dashed var(--dsw-alias-border-l3)', background: 'transparent', color: 'var(--dsw-alias-label-tertiary)', fontSize: 12, cursor: 'pointer', justifyContent: 'center' },
      // Top bar
      quickAdd: { flex: 1, height: 40, padding: '0 14px', borderRadius: 8, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit', marginRight: 12 },
      topBarRight: { display: 'flex', alignItems: 'center', gap: 8, flex: 'none' },
      iconBtn: { width: 34, height: 34, padding: 0, border: 'none', borderRadius: 6, background: 'transparent', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dsw-alias-label-secondary)', position: 'relative' },
      iconBtnActive: { color: 'var(--dsw-alias-state-business-primary)' },
      // Notification popover
      notifyPopover: { position: 'absolute', top: 40, right: 0, width: 280, background: 'var(--dsw-specific-input-major)', borderRadius: 'var(--dsw-radius-md)', boxShadow: 'var(--dsw-elevation-panel)', padding: 12, zIndex: 30, display: 'flex', flexDirection: 'column', gap: 8 },
      notifyRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 30, padding: '0 4px' },
      notifyLabel: { fontSize: 12, color: 'var(--dsw-alias-label-primary)' },
      notifyToggle: { width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.12s' },
      notifyToggleDot: { width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, transition: 'left 0.12s' },
      notifyInput: { width: 60, height: 28, padding: '0 8px', borderRadius: 6, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', fontSize: 12, textAlign: 'center', fontFamily: 'inherit' },
      notifyBtn: { height: 28, padding: '0 10px', borderRadius: 6, border: '0.5px solid var(--dsw-alias-border-l3)', background: 'transparent', color: 'var(--dsw-alias-label-secondary)', fontSize: 11, cursor: 'pointer' },
      notifyHint: { fontSize: 11, color: 'var(--dsw-alias-state-error-primary)', lineHeight: '16px', padding: '4px 0' },
      // Matrix
      matrixArea: { flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 16, padding: 16, overflow: 'hidden' },
      quadrantCard: { background: 'var(--dsw-specific-input-major)', borderRadius: 'var(--dsw-radius-lg)', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', border: '0.5px solid var(--dsw-alias-border-l2)' },
      quadrantHead: { display: 'flex', alignItems: 'center', gap: 8, height: 48, padding: '0 16px', flex: 'none', borderBottom: '0.5px solid var(--dsw-alias-border-l2)' },
      quadrantTitle: { fontSize: 14, fontWeight: 600, flex: 1, minWidth: 0 },
      quadrantAddBtn: { width: 28, height: 28, padding: 0, border: 'none', borderRadius: 6, background: 'transparent', cursor: 'pointer', fontSize: 18, color: 'var(--dsw-alias-label-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
      quadrantBody: { flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 12px 12px' },
      emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '40px 20px', color: 'var(--dsw-alias-label-tertiary)', fontSize: 12 },
      todoRow: { display: 'flex', alignItems: 'center', gap: 9, height: 34, padding: '0 8px', borderRadius: 6, cursor: 'pointer', transition: 'background 0.12s' },
      todoRowSelected: { background: '#fbd5d4' },
      todoCheckbox: { width: 14, height: 14, borderRadius: 4, border: '0.5px solid var(--dsw-alias-border-l4)', flex: 'none', background: 'var(--dsw-alias-bg-layer-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
      todoCheckboxDone: { background: 'var(--dsw-alias-state-business-primary)' },
      // 矩阵行的圆形状态图标：未完成 = 红圈，已完成 = 绿底白勾
      todoCircle: { width: 16, height: 16, borderRadius: '50%', border: '1.5px solid #f07080', flex: 'none', background: 'transparent', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' },
      todoCircleDone: { width: 16, height: 16, borderRadius: '50%', border: '1.5px solid #7fc9a0', flex: 'none', background: '#7fc9a0', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' },
      // 顶栏/左栏的已生效筛选胶囊
      chip: { display: 'inline-flex', alignItems: 'center', gap: 4, height: 20, padding: '0 8px', borderRadius: 10, fontSize: 11, background: 'var(--dsw-alias-interactive-bg-hover)', color: 'var(--dsw-alias-label-secondary)' },
      chipBtn: { border: 'none', background: 'transparent', color: 'inherit', fontSize: 12, lineHeight: 1, cursor: 'pointer', padding: 0 },
      todoTitle: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 },
      todoTitleDone: { textDecoration: 'line-through', color: 'var(--dsw-alias-label-tertiary)' },
      // Detail panel
      detailPanel: { width: 497, flex: 'none', background: 'var(--dsw-specific-input-major)', borderLeft: '0.5px solid var(--dsw-alias-border-l2)', display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' },
      detailHeader: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '20px 20px 12px' },
      detailIcon: { width: 24, height: 24, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
      detailTitleInput: { flex: 1, fontSize: 18, fontWeight: 600, border: 'none', background: 'transparent', color: 'var(--dsw-alias-label-primary)', fontFamily: 'inherit', outline: 'none', padding: 0, lineHeight: '28px' },
      detailSection: { padding: '0 20px 12px' },
      subtaskLink: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--dsw-alias-state-business-primary)', cursor: 'pointer', border: 'none', background: 'transparent', padding: '4px 0', fontFamily: 'inherit' },
      subtaskList: { display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 },
      subtaskRow: { display: 'flex', alignItems: 'center', gap: 8, minHeight: 30, padding: '0 4px', borderRadius: 4 },
      subtaskInput: { flex: 1, height: 28, background: 'transparent', color: 'var(--dsw-alias-label-primary)', fontSize: 13, fontFamily: 'inherit', outline: 'none', padding: '0 8px', borderRadius: 4 },
      subtaskDeleteBtn: { width: 22, height: 22, padding: 0, border: 'none', borderRadius: 4, background: 'transparent', color: 'var(--dsw-alias-label-tertiary)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
      noteTextarea: { width: '100%', minHeight: 100, borderRadius: 6, background: 'var(--dsw-specific-input-major)', color: 'var(--dsw-alias-label-primary)', fontSize: 13, fontFamily: 'inherit', padding: 10, resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: '20px' },
      divider: { height: '0.5px', background: 'var(--dsw-alias-border-l2)', margin: '12px 20px' },
      propertyRow: { display: 'flex', alignItems: 'center', height: 38, padding: '0 4px', cursor: 'pointer', borderRadius: 4, transition: 'background 0.12s' },
      propertyLabel: { width: 80, flex: 'none', fontSize: 13, color: 'var(--dsw-alias-label-tertiary)' },
      propertyValue: { flex: 1, fontSize: 13, color: 'var(--dsw-alias-label-primary)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      propertyChevron: { flex: 'none', fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', marginLeft: 4 },
      saveBtn: { height: 36, padding: '0 20px', borderRadius: 8, border: 'none', background: 'var(--dsw-alias-state-business-primary)', color: 'var(--dsw-alias-label-primary-inverted)', fontSize: 13, cursor: 'pointer', fontWeight: 500 },
      saveBtnContainer: { display: 'flex', justifyContent: 'flex-end', padding: '12px 20px 20px', flex: 'none' },
      // Shared UI primitives
      overlay: { position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dsw-alias-bg-mask-1)' },
      dialog: { width: 560, maxWidth: 'calc(100vw - 32px)', maxHeight: '82vh', overflowY: 'auto', boxSizing: 'border-box', padding: '22px 24px 18px', background: 'var(--dsw-specific-input-major)', borderRadius: 'var(--dsw-radius-xl)', boxShadow: 'var(--dsw-elevation-panel)', color: 'var(--dsw-alias-label-primary)' },
      dialogHead: { fontSize: 15, fontWeight: 600, marginBottom: 12 },
      hint: { marginTop: 6, fontSize: 11, color: 'var(--dsw-alias-label-tertiary)' },
      field: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, marginBottom: 10 },
      fieldRow: { display: 'flex', gap: 12 },
      fieldLabel: { fontSize: 11.5, color: 'var(--dsw-alias-label-secondary)' },
      input: { width: '100%', height: 32, boxSizing: 'border-box', padding: '0 10px', borderRadius: 8, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', fontSize: 12.5, fontFamily: 'inherit' },
      textarea: { width: '100%', height: 64, boxSizing: 'border-box', padding: '7px 10px', borderRadius: 8, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', fontSize: 12.5, fontFamily: 'inherit', lineHeight: '18px', resize: 'vertical' },
      seg: { display: 'flex', gap: 6 },
      segItem: { flex: 1, height: 30, borderRadius: 6, border: '0.5px solid var(--dsw-alias-border-l3)', color: 'var(--dsw-alias-label-secondary)', fontSize: 12.5, cursor: 'pointer' },
      segItemOn: { border: '0.5px solid transparent', background: 'var(--dsw-alias-state-business-primary)', color: 'var(--dsw-alias-label-primary-inverted)' },
      dialogError: { marginTop: 4, padding: '6px 10px', borderRadius: 6, fontSize: 12, color: 'var(--dsw-alias-state-error-primary)', background: 'color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent)' },
      dialogFoot: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 },
      btnGhost: { height: 32, padding: '0 14px', borderRadius: 8, border: '0.5px solid var(--dsw-alias-border-l3)', color: 'var(--dsw-alias-label-secondary)', fontSize: 12.5, cursor: 'pointer' },
      btnPrimary: { height: 32, padding: '0 14px', borderRadius: 8, border: 'none', background: 'var(--dsw-alias-state-business-primary)', color: 'var(--dsw-alias-label-primary-inverted)', fontSize: 12.5, cursor: 'pointer' },
      noticeClose: { flex: 'none', width: 20, height: 20, padding: 0, lineHeight: '18px', textAlign: 'center', border: 'none', borderRadius: 4, color: 'inherit', fontSize: 14, cursor: 'pointer' },
      // Category combo
      popEmpty: { padding: '8px', fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' },
      popList: { maxHeight: 208, overflowY: 'auto' },
      popItem: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: 30, padding: '0 8px', border: 'none', borderRadius: 6, color: 'var(--dsw-alias-label-primary)', fontSize: 12.5, cursor: 'pointer', textAlign: 'left', background: 'transparent' },
      popCount: { marginLeft: 'auto', flex: 'none', fontSize: 11, color: 'var(--dsw-alias-label-tertiary)' },
      popSep: { height: '0.5px', margin: 4, background: 'var(--dsw-alias-border-l2)' },
      popManage: { display: 'flex', alignItems: 'center', width: '100%', height: 30, padding: '0 8px', border: 'none', borderRadius: 6, color: 'var(--dsw-alias-state-business-primary)', fontSize: 12.5, cursor: 'pointer', textAlign: 'left', background: 'transparent' },
      comboClear: { position: 'absolute', top: 0, right: 0, width: 30, height: 32, padding: 0, border: 'none', borderRadius: 8, color: 'var(--dsw-alias-label-tertiary)', fontSize: 14, lineHeight: '32px', textAlign: 'center', cursor: 'pointer', background: 'transparent' },
      // Picker
      pickerTrigger: { width: '100%', height: 32, boxSizing: 'border-box', padding: '0 10px', borderRadius: 8, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left', cursor: 'pointer' },
      pickerPlaceholder: { color: 'var(--dsw-alias-label-tertiary)' },
      pickerIcon: { flex: 'none', fontSize: 10, lineHeight: 1, color: 'var(--dsw-alias-label-tertiary)' },
      pickerHead: { display: 'flex', alignItems: 'center', gap: 2, height: 28 },
      pickerTitle: { flex: 1, minWidth: 0, textAlign: 'center', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--dsw-alias-label-primary)' },
      pickerIconBtn: { flex: 'none', width: 26, height: 26, padding: 0, border: 'none', borderRadius: 6, color: 'var(--dsw-alias-label-secondary)', fontSize: 15, lineHeight: '26px', textAlign: 'center', cursor: 'pointer', background: 'transparent' },
      pickerQuick: { display: 'flex', gap: 6 },
      pickerQuickBtn: { flex: 1, minWidth: 0, height: 26, padding: 0, border: '0.5px solid var(--dsw-alias-border-l2)', borderRadius: 6, color: 'var(--dsw-alias-label-secondary)', fontSize: 12, textAlign: 'center', cursor: 'pointer', background: 'transparent' },
      pickerWeekdays: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 },
      pickerWeekday: { textAlign: 'center', fontSize: 12, lineHeight: '16px', color: 'var(--dsw-alias-label-tertiary)' },
      pickerGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 },
      pickerDay: { height: 30, padding: 0, border: 'none', borderRadius: 6, color: 'var(--dsw-alias-label-primary)', fontSize: 13, textAlign: 'center', cursor: 'pointer', background: 'transparent' },
      pickerDayToday: { boxShadow: 'inset 0 0 0 1px var(--dsw-alias-state-business-primary)' },
      pickerDayOn: { background: 'var(--dsw-alias-state-business-primary)', color: 'var(--dsw-alias-label-primary-inverted)' },
      pickerDayOff: { opacity: 0.4 },
      pickerClear: { width: '100%', height: 28, padding: 0, border: 'none', borderRadius: 6, color: 'var(--dsw-alias-label-tertiary)', fontSize: 12, cursor: 'pointer', background: 'transparent' },
      timeCols: { display: 'flex', gap: 8 },
      timeCol: { width: 80, flex: '1 1 80px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 },
      timeHead: { textAlign: 'center', fontSize: 11, lineHeight: '14px', color: 'var(--dsw-alias-label-tertiary)' },
      timeList: { minWidth: 0, maxHeight: 150, overflowY: 'auto' },
      timeItem: { width: '100%', height: 28, padding: 0, border: 'none', borderRadius: 6, color: 'var(--dsw-alias-label-primary)', fontSize: 13, textAlign: 'center', cursor: 'pointer', background: 'transparent' },
      timeItemOn: { background: 'var(--dsw-alias-state-business-primary)', color: 'var(--dsw-alias-label-primary-inverted)' },
      // Checkbox hit area
      cbHit: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 6, margin: -6, flex: 'none', cursor: 'pointer' },
      // Empty
      empty: { padding: 40, textAlign: 'center', color: 'var(--dsw-alias-label-tertiary)', fontSize: 13 },
      error: { margin: 12, padding: '8px 12px', borderRadius: 8, fontSize: 12, color: 'var(--dsw-alias-state-error-primary)', background: 'color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent)' },
      warn: { margin: 12, padding: '8px 12px', borderRadius: 8, fontSize: 12, color: 'var(--dsw-alias-state-warn-primary)', background: 'color-mix(in srgb, var(--dsw-alias-state-warn-primary) 8%, transparent)', display: 'flex', alignItems: 'center', gap: 8 },
      addBtn: { height: 32, padding: '0 12px', borderRadius: 8, border: '0.5px solid var(--dsw-alias-border-l3)', color: 'var(--dsw-alias-label-primary)', fontSize: 13, cursor: 'pointer', background: 'transparent' },
      detailTitle: { fontSize: 15, fontWeight: 600, color: 'var(--dsw-alias-label-primary)', marginBottom: 12 },
      dot: { flex: 'none', width: 5, height: 5, borderRadius: 999, background: 'var(--dsw-alias-label-tertiary)' },
      // Quadrant picker
      quadrantPicker: { display: 'flex', flexDirection: 'column', gap: 4, padding: 6 },
      quadrantPickerItem: { display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 8px', border: 'none', borderRadius: 6, background: 'transparent', color: 'var(--dsw-alias-label-primary)', fontSize: 12.5, cursor: 'pointer', textAlign: 'left' },
      quadrantPickerDot: { width: 10, height: 10, borderRadius: '50%', flex: 'none' },
      // Repeat picker
      repeatPicker: { display: 'flex', flexDirection: 'column', gap: 4, padding: 6 },
      pickerBody: { padding: '2px 0 8px' },
      repeatPickerItem: { display: 'flex', alignItems: 'center', height: 32, padding: '0 8px', border: 'none', borderRadius: 6, background: 'transparent', color: 'var(--dsw-alias-label-primary)', fontSize: 12.5, cursor: 'pointer', textAlign: 'left' },
      repeatPickerItemOn: { background: 'var(--dsw-alias-state-business-primary)', color: 'var(--dsw-alias-label-primary-inverted)' },
      // Calendar view (standalone)
      calendarView: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: '16px 20px', overflowY: 'auto' },
      calendarViewHead: { display: 'flex', alignItems: 'center', gap: 6, height: 32, marginBottom: 12 },
      calendarViewTitle: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 600 },
      calendarViewWeekdays: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 },
      calendarViewGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, flex: 1 },
      calendarViewCell: { display: 'flex', flexDirection: 'column', gap: 2, padding: 6, borderRadius: 8, border: '0.5px solid var(--dsw-alias-border-l2)', minHeight: 80, cursor: 'pointer', overflow: 'hidden' },
      calendarViewDay: { fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-secondary)' },
      calendarViewItem: { fontSize: 10.5, lineHeight: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--dsw-alias-label-secondary)' },
      calendarViewMore: { fontSize: 10, color: 'var(--dsw-alias-label-tertiary)' },
    }

    const PLUGIN_CSS = `
.td-overlay { animation: td-fade .14s ease-out; }
.td-dialog { animation: td-rise .16s cubic-bezier(.2,.8,.2,1); }
@keyframes td-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes td-rise { from { opacity: 0; transform: translateY(6px) scale(.992) } to { opacity: 1; transform: none } }

.td-btn { background: transparent; transition: background-color .12s ease, border-color .12s ease, color .12s ease, transform .08s ease; }
.td-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.td-btn:active:not(:disabled) { transform: scale(.985); }
.td-btn:focus { outline: none; }
.td-btn:focus-visible { outline: none; box-shadow: inset 0 0 0 1.5px var(--dsw-alias-state-business-primary); }
.td-btn:disabled { opacity: .5; cursor: default; }

.td-primary { transition: filter .12s ease, transform .08s ease, opacity .12s ease; }
.td-primary:hover:not(:disabled) { filter: brightness(1.06); }
.td-primary:active:not(:disabled) { transform: scale(.985); filter: brightness(.96); }
.td-primary:focus { outline: none; }
.td-primary:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--dsw-alias-bg-layer-1), 0 0 0 3.5px var(--dsw-alias-state-business-primary); }

.td-input { border: 0.5px solid var(--dsw-alias-border-l3); transition: border-color .12s ease, background-color .12s ease; }
.td-input:hover { border-color: var(--dsw-alias-border-l4); }
.td-input:focus { outline: none; border-color: var(--dsw-alias-state-business-primary); }
.td-input:focus-visible { outline: none; }

.td-row { transition: background-color .12s ease; }
.td-row:hover { background: var(--dsw-alias-interactive-bg-hover); }

.td-cal-cell { transition: background-color .12s ease; }
.td-cal-cell:hover { background: var(--dsw-alias-interactive-bg-hover); }

.td-title {
  background: transparent; border: 0; padding: 0; margin: 0;
  font: inherit; color: inherit; text-align: left; cursor: pointer;
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.td-title:hover { background: transparent; }
.td-title:focus { outline: none; }
.td-title:focus-visible { outline: none; box-shadow: inset 0 -1.5px 0 var(--dsw-alias-state-business-primary); }

.td-check { cursor: pointer; }
.td-check:focus { outline: none; }
.td-check:focus-visible { outline: none; box-shadow: 0 0 0 1.5px var(--dsw-alias-state-business-primary); }

.td-pop {
  background: var(--dsw-specific-input-major);
  border-radius: var(--dsw-radius-md);
  box-shadow: var(--dsw-elevation-panel);
  padding: 6px;
  transform-origin: top center;
  animation: td-pop-in .13s cubic-bezier(.2,.8,.2,1);
}
.td-pop-up { transform-origin: bottom center; animation-name: td-pop-up-in; }
@keyframes td-pop-in { from { opacity: 0; transform: translateY(-4px) scale(.98) } to { opacity: 1; transform: none } }
@keyframes td-pop-up-in { from { opacity: 0; transform: translateY(4px) scale(.98) } to { opacity: 1; transform: none } }

.td-picker { padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.td-picker-date { width: 272px; }
.td-picker-time { width: 196px; }

.td-notify-pop { animation: td-pop-in .13s cubic-bezier(.2,.8,.2,1); }
.td-rail-btn { transition: background-color .12s ease; }
.td-rail-btn:hover { background: var(--dsw-alias-interactive-bg-hover); }
.td-quadrant-card { transition: box-shadow .12s ease; }
.td-quadrant-card:hover { box-shadow: var(--dsw-elevation-panel); }
.td-todo-row { transition: background-color .12s ease; }
.td-todo-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
.td-property-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
.td-subtask-delete { transition: color .12s ease; }
.td-subtask-delete:hover { color: var(--dsw-alias-state-error-primary); }

@media (prefers-reduced-motion: reduce) {
  .td-overlay, .td-dialog, .td-btn, .td-primary, .td-input, .td-row, .td-pop, .td-notify-pop, .td-rail-btn, .td-quadrant-card, .td-todo-row { animation: none; transition: none; }
  .td-btn:active:not(:disabled), .td-primary:active:not(:disabled) { transform: none; }
}
`

    function ensureStyles() {
      const existing = document.querySelector('style[data-plugin-css="dsh-sidebar-todo"]')
      if (existing !== null) return () => {}
      const el = document.createElement('style')
      el.dataset.pluginCss = 'dsh-sidebar-todo'
      el.textContent = PLUGIN_CSS
      document.head.appendChild(el)
      return () => { el.remove() }
    }

    // --- Pure utilities ---
    function asText(value) {
      return typeof value === 'string' ? value : ''
    }

    function dateKeyOf(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    function startOfDay(date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    }

    function parseDateKey(key) {
      const text = asText(key)
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
      if (match === null) return null
      const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
      return dateKeyOf(date) === text ? date : null
    }

    function isoWeekday(date) {
      return ((date.getDay() + 6) % 7) + 1
    }

    function shiftKeyLocal(key, days) {
      const date = parseDateKey(key)
      if (date === null) return key
      return dateKeyOf(new Date(date.getFullYear(), date.getMonth(), date.getDate() + days))
    }

    function monthGrid(year, month) {
      const first = new Date(year, month, 1)
      const offset = (first.getDay() + 6) % 7
      const start = new Date(year, month, 1 - offset)
      const cells = []
      for (let index = 0; index < 42; index += 1) {
        cells.push(dateKeyOf(new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)))
      }
      return cells
    }

    function monthTitle(year, month) {
      return `${year} 年 ${month + 1} 月`
    }

    function splitTimeKey(value) {
      const text = asText(value)
      const match = /^(\d{2}):(\d{2})$/.exec(text)
      if (match === null) return null
      if (Number(match[1]) > 23 || Number(match[2]) > 59) return null
      return { hour: match[1], minute: match[2] }
    }

    const WEEKDAY_LABELS = {
      zh: ['一', '二', '三', '四', '五', '六', '日'],
      en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    }
    const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'))
    const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'))
    const MONTH_DAYS = Array.from({ length: 31 }, (_, index) => index + 1)
    const WEEKDAY_OPTIONS = [['mon', 1], ['tue', 2], ['wed', 3], ['thu', 4], ['fri', 5], ['sat', 6], ['sun', 7]]

    function weekdayLabels(t) {
      return t('today') === dict.zh.today ? WEEKDAY_LABELS.zh : WEEKDAY_LABELS.en
    }

    function formatDateTime(iso) {
      const at = new Date(iso)
      if (Number.isNaN(at.getTime())) return ''
      return `${dateKeyOf(at)} ${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`
    }

    const PRIORITY_COLOR = {
      high: 'var(--dsw-alias-state-error-primary)',
      medium: 'var(--dsw-alias-state-warn-primary)',
      low: 'var(--dsw-alias-state-business-primary)',
    }
    const PRIORITY_LABEL_KEY = {
      high: 'priorityHigh',
      medium: 'priorityMedium',
      low: 'priorityLow',
    }

    function priorityColor(priority) {
      return PRIORITY_COLOR[priority] ?? 'var(--dsw-alias-label-tertiary)'
    }

    function priorityLabel(priority, t) {
      const key = PRIORITY_LABEL_KEY[priority]
      if (key !== undefined) return t(key)
      return typeof priority === 'string' ? priority : ''
    }

    function staleLabel(item, t, now = new Date()) {
      const created = Date.parse(item.createdAt)
      if (Number.isNaN(created)) return t('stale')
      const days = Math.max(0, Math.floor((now.getTime() - created) / 86400000))
      return days > 0 ? t('staleFor').replace('{n}', String(days)) : t('stale')
    }

    function doneGroupOf(item, now = new Date()) {
      if (!item.doneAt) return 'earlier'
      const at = new Date(item.doneAt)
      if (Number.isNaN(at.getTime())) return 'earlier'
      const day = startOfDay(at).getTime()
      const today = startOfDay(now)
      if (day === today.getTime()) return 'today'
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      if (day === yesterday.getTime()) return 'yesterday'
      const monday = new Date(today)
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
      if (day >= monday.getTime()) return 'week'
      return 'earlier'
    }

    function doneKeyOf(item) {
      if (!item.doneAt) return null
      const at = new Date(item.doneAt)
      if (Number.isNaN(at.getTime())) return null
      return dateKeyOf(at)
    }

    function normalizeCategories(result) {
      const items = result !== null && typeof result === 'object' && Array.isArray(result.items) ? result.items : []
      const rows = []
      for (const item of items) {
        if (item === null || typeof item !== 'object') continue
        const name = asText(item.name)
        if (name === '') continue
        rows.push({ name, count: Number.isInteger(item.count) ? item.count : 0, icon: asText(item.icon) })
      }
      return rows
    }

    function dueLabel(item) {
      const dueDate = asText(item.dueDate)
      if (dueDate === '') return ''
      const dueTime = asText(item.dueTime)
      return dueTime === '' ? dueDate.slice(5) : `${dueDate.slice(5)} ${dueTime}`
    }

    const DATE_POP = { width: 272, height: 360 }
    const TIME_POP = { width: 196, height: 260 }
    const CATEGORY_POP = { width: null, height: 240 }
    const POP_GAP = 6
    const POP_EDGE = 8
    const POP_FALLBACK_WIDTH = 240

    function useAnchoredPopover(open, width, height, onDismiss) {
      const anchorRef = useRef(null)
      const [placement, setPlacement] = useState(null)

      useEffect(() => {
        if (!open) {
          setPlacement(null)
          return undefined
        }
        const place = () => {
          const node = anchorRef.current
          const rect = node !== null && typeof node.getBoundingClientRect === 'function'
            ? node.getBoundingClientRect()
            : null
          if (rect === null) return
          const viewportWidth = Number.isFinite(window.innerWidth) ? window.innerWidth : 0
          const viewportHeight = Number.isFinite(window.innerHeight) ? window.innerHeight : 0
          if (viewportWidth <= 0 || viewportHeight <= 0) return

          const popWidth = typeof width === 'number'
            ? width
            : (rect.width > 0 ? rect.width : POP_FALLBACK_WIDTH)
          const below = viewportHeight - rect.bottom - POP_GAP - POP_EDGE
          const up = below < height
          let top = rect.bottom + POP_GAP
          let maxHeight = Math.min(height, Math.max(0, below))
          if (up) {
            top = Math.max(POP_EDGE, rect.top - height - POP_GAP)
            maxHeight = Math.min(
              height,
              Math.max(0, rect.top - top - POP_GAP),
              Math.max(0, viewportHeight - top - POP_EDGE),
            )
          }
          const left = Math.max(POP_EDGE, Math.min(rect.left, viewportWidth - popWidth - POP_EDGE))

          setPlacement((prev) => (prev !== null
            && prev.left === left && prev.top === top && prev.maxHeight === maxHeight
            && prev.up === up && prev.width === popWidth
            ? prev
            : { left, top, maxHeight, up, width: popWidth }))
        }
        place()
        window.addEventListener('resize', place)
        window.addEventListener('scroll', place, true)
        return () => {
          window.removeEventListener('resize', place)
          window.removeEventListener('scroll', place, true)
        }
      }, [open, width, height])

      useEffect(() => {
        if (!open || typeof onDismiss !== 'function') return undefined
        const onPointerDown = (event) => {
          const node = anchorRef.current
          if (node !== null && typeof node.contains === 'function' && node.contains(event.target)) return
          onDismiss()
        }
        document.addEventListener('pointerdown', onPointerDown)
        return () => document.removeEventListener('pointerdown', onPointerDown)
      }, [open, onDismiss])

      const up = placement !== null && placement.up
      const popStyle = placement === null
        ? {
            position: 'fixed', zIndex: 20, boxSizing: 'border-box', visibility: 'hidden',
            ...(typeof width === 'number' ? { width } : null),
          }
        : {
            position: 'fixed', zIndex: 20, boxSizing: 'border-box',
            left: placement.left, top: placement.top, width: placement.width,
            maxHeight: placement.maxHeight, overflowY: 'auto',
          }

      return { anchorRef, popStyle, up }
    }

    function checkHit(onClick, inner) {
      return h('span', {
        style: S.cbHit,
        onClick: (event) => {
          event.stopPropagation()
          return onClick(event)
        },
      }, inner)
    }

    // --- Components ---
    function CategoryCombo({ t, value, categories, onChange, onManage }) {
      const [open, setOpen] = useState(false)
      const [query, setQuery] = useState('')
      const close = useCallback(() => setOpen(false), [])
      const popover = useAnchoredPopover(open, CATEGORY_POP.width, CATEGORY_POP.height, close)

      const openAll = () => {
        setQuery('')
        setOpen(true)
      }

      const text = asText(value)
      const needle = query.trim().toLowerCase()
      const visible = needle === ''
        ? categories
        : categories.filter((row) => row.name.toLowerCase().includes(needle))
      const countLabel = t('categoryCount')

      return h('div', {
        ref: popover.anchorRef,
        style: { position: 'relative' },
        onKeyDown: (event) => {
          if (!open || event.key !== 'Escape') return
          event.stopPropagation?.()
          close()
        },
      },
      h('input', {
        className: 'td-input',
        style: text === '' ? S.input : { ...S.input, paddingRight: 32 },
        value: text,
        placeholder: t('noCategory'),
        role: 'combobox',
        'aria-expanded': open ? 'true' : 'false',
        'aria-autocomplete': 'list',
        'aria-label': t('fieldCategory'),
        onFocus: openAll,
        onClick: () => { if (!open) openAll() },
        onChange: (event) => {
          onChange(event.target.value)
          setQuery(event.target.value)
          setOpen(true)
        },
      }),
      text !== ''
        ? h('button', {
            type: 'button',
            className: 'td-btn',
            style: S.comboClear,
            'aria-label': t('noCategory'),
            title: t('noCategory'),
            onClick: () => { onChange(''); openAll() },
          }, '×')
        : null,
      open
        ? h('div', { className: popover.up ? 'td-pop td-pop-up' : 'td-pop', style: popover.popStyle },
            visible.length === 0
              ? h('div', { style: S.popEmpty }, t('categoryEmpty'))
              : h('div', { style: S.popList }, visible.map((row) => h('button', {
                  key: row.name,
                  type: 'button',
                  className: 'td-btn',
                  style: S.popItem,
                  onClick: () => { onChange(row.name); setQuery(''); close() },
                },
                h('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, row.name),
                h('span', { style: S.popCount }, typeof countLabel === 'function' ? countLabel(row.count) : String(countLabel).replace('{count}', String(row.count)))))),
            h('div', { style: S.popSep, 'aria-hidden': 'true' }),
            h('button', {
              type: 'button',
              className: 'td-btn',
              style: S.popManage,
              onClick: () => { close(); onManage?.() },
            }, t('categoryManage')))
        : null)
    }

    function usePickerPopover() {
      const [open, setOpen] = useState(false)
      const openPopover = useCallback(() => setOpen(true), [])
      const closePopover = useCallback(() => setOpen(false), [])
      return { open, openPopover, closePopover }
    }

    function DateField({ t, value, onChange }) {
      const picker = usePickerPopover()
      const popover = useAnchoredPopover(picker.open, DATE_POP.width, DATE_POP.height, picker.closePopover)
      const [cursor, setCursor] = useState(() => {
        const at = parseDateKey(value) ?? new Date()
        return { year: at.getFullYear(), month: at.getMonth() }
      })

      const text = asText(value)
      const todayKey = dateKeyOf(new Date())
      const monthKey = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`
      const cells = monthGrid(cursor.year, cursor.month)
      const weekdays = weekdayLabels(t)

      const closeWith = (next) => {
        onChange(next)
        picker.closePopover()
      }

      const open = () => {
        if (picker.open) { picker.closePopover(); return }
        const at = parseDateKey(text) ?? new Date()
        setCursor({ year: at.getFullYear(), month: at.getMonth() })
        picker.openPopover()
      }

      const moveMonth = (delta) => {
        const at = new Date(cursor.year, cursor.month + delta, 1)
        setCursor({ year: at.getFullYear(), month: at.getMonth() })
      }

      const monthAt = (delta) => {
        const at = new Date(cursor.year, cursor.month + delta, 1)
        return monthTitle(at.getFullYear(), at.getMonth())
      }

      const pickDay = (delta) => {
        const at = new Date()
        closeWith(dateKeyOf(new Date(at.getFullYear(), at.getMonth(), at.getDate() + delta)))
      }

      const pickNextMonday = () => {
        const at = new Date()
        const delta = ((1 - at.getDay() + 7) % 7) || 7
        closeWith(dateKeyOf(new Date(at.getFullYear(), at.getMonth(), at.getDate() + delta)))
      }

      return h('div', {
        ref: popover.anchorRef,
        style: { position: 'relative' },
        onKeyDown: (event) => {
          if (!picker.open || event.key !== 'Escape') return
          event.stopPropagation?.()
          picker.closePopover()
        },
      },
      h('button', {
        type: 'button',
        className: 'td-btn td-input',
        style: text === '' ? { ...S.pickerTrigger, ...S.pickerPlaceholder } : S.pickerTrigger,
        'aria-haspopup': 'dialog',
        'aria-expanded': picker.open ? 'true' : 'false',
        'aria-label': t('pickDate'),
        onClick: open,
      },
      h('span', { style: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, text === '' ? t('pickDate') : text),
      h('span', { style: S.pickerIcon, 'aria-hidden': 'true' }, '▾')),

      picker.open
        ? h('div', {
            className: popover.up ? 'td-pop td-picker td-picker-date td-pop-up' : 'td-pop td-picker td-picker-date',
            style: popover.popStyle,
            role: 'dialog',
            'aria-label': t('pickDate'),
          },
          h('div', { style: S.pickerHead },
            h('button', {
              type: 'button', className: 'td-btn', style: S.pickerIconBtn,
              'aria-label': monthAt(-1), onClick: () => moveMonth(-1),
            }, '‹'),
            h('span', { style: S.pickerTitle }, monthTitle(cursor.year, cursor.month)),
            h('button', {
              type: 'button', className: 'td-btn', style: S.pickerIconBtn,
              'aria-label': monthAt(1), onClick: () => moveMonth(1),
            }, '›')),
          h('div', { style: S.pickerQuick },
            h('button', {
              type: 'button', className: 'td-btn', style: S.pickerQuickBtn,
              onClick: () => pickDay(0),
            }, t('today')),
            h('button', {
              type: 'button', className: 'td-btn', style: S.pickerQuickBtn,
              onClick: () => pickDay(1),
            }, t('tomorrowQuick')),
            h('button', {
              type: 'button', className: 'td-btn', style: S.pickerQuickBtn,
              onClick: pickNextMonday,
            }, t('nextMonday'))),
          h('div', { style: S.pickerWeekdays, 'aria-hidden': 'true' },
            weekdays.map((label, index) => h('div', { key: `${index}`, style: S.pickerWeekday }, label))),
          h('div', { style: S.pickerGrid },
            cells.map((key) => {
              const inMonth = key.slice(0, 7) === monthKey
              const selected = key === text
              return h('button', {
                key,
                type: 'button',
                className: 'td-btn',
                style: {
                  ...S.pickerDay,
                  ...(key === todayKey ? S.pickerDayToday : null),
                  ...(selected ? S.pickerDayOn : null),
                  ...(inMonth ? null : S.pickerDayOff),
                },
                'aria-label': key,
                'aria-pressed': selected ? 'true' : 'false',
                onClick: () => closeWith(key),
              }, String(Number(key.slice(8, 10))))
            })),
          h('button', {
            type: 'button', className: 'td-btn', style: S.pickerClear,
            onClick: () => closeWith(''),
          }, t('clearValue')))
        : null)
    }

    function TimeField({ t, value, onChange }) {
      const picker = usePickerPopover()
      const popover = useAnchoredPopover(picker.open, TIME_POP.width, TIME_POP.height, picker.closePopover)
      const [draftHour, setDraftHour] = useState(null)
      const hourItemRef = useRef(null)
      const minuteItemRef = useRef(null)
      const alive = useRef(true)

      const text = asText(value)
      const parsed = splitTimeKey(text)

      useEffect(() => {
        alive.current = true
        return () => { alive.current = false }
      }, [])

      useEffect(() => {
        if (!picker.open || !alive.current) return
        const hourNode = hourItemRef.current
        if (hourNode !== null && typeof hourNode.scrollIntoView === 'function') hourNode.scrollIntoView({ block: 'center' })
        const minuteNode = minuteItemRef.current
        if (minuteNode !== null && typeof minuteNode.scrollIntoView === 'function') minuteNode.scrollIntoView({ block: 'center' })
      }, [picker.open])

      const open = () => {
        if (picker.open) { picker.closePopover(); return }
        const parts = splitTimeKey(text)
        setDraftHour(parts === null ? null : parts.hour)
        picker.openPopover()
      }

      const closeWith = (next) => {
        onChange(next)
        picker.closePopover()
      }

      const pickMinute = (minute) => {
        const hour = draftHour ?? String(new Date().getHours()).padStart(2, '0')
        closeWith(`${hour}:${minute}`)
      }

      return h('div', {
        ref: popover.anchorRef,
        style: { position: 'relative' },
        onKeyDown: (event) => {
          if (!picker.open || event.key !== 'Escape') return
          event.stopPropagation?.()
          picker.closePopover()
        },
      },
      h('button', {
        type: 'button',
        className: 'td-btn td-input',
        style: text === '' ? { ...S.pickerTrigger, ...S.pickerPlaceholder } : S.pickerTrigger,
        'aria-haspopup': 'dialog',
        'aria-expanded': picker.open ? 'true' : 'false',
        'aria-label': t('pickTime'),
        onClick: open,
      },
      h('span', { style: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, text === '' ? t('pickTime') : text),
      h('span', { style: S.pickerIcon, 'aria-hidden': 'true' }, '▾')),

      picker.open
        ? h('div', {
            className: popover.up ? 'td-pop td-picker td-picker-time td-pop-up' : 'td-pop td-picker td-picker-time',
            style: popover.popStyle,
            role: 'dialog',
            'aria-label': t('pickTime'),
          },
          h('div', { style: S.timeCols },
            h('div', { style: S.timeCol },
              h('div', { style: S.timeHead, 'aria-hidden': 'true' }, t('hourShort')),
              h('div', { style: S.timeList }, HOUR_OPTIONS.map((hour) => h('button', {
                key: `h-${hour}`,
                type: 'button',
                className: 'td-btn',
                ref: hour === draftHour ? hourItemRef : null,
                style: hour === draftHour ? { ...S.timeItem, ...S.timeItemOn } : S.timeItem,
                'aria-pressed': hour === draftHour ? 'true' : 'false',
                onClick: () => setDraftHour(hour),
              }, hour)))),
            h('div', { style: S.timeCol },
              h('div', { style: S.timeHead, 'aria-hidden': 'true' }, t('minuteShort')),
              h('div', { style: S.timeList }, MINUTE_OPTIONS.map((minute) => h('button', {
                key: `m-${minute}`,
                type: 'button',
                className: 'td-btn',
                ref: parsed !== null && minute === parsed.minute ? minuteItemRef : null,
                style: parsed !== null && minute === parsed.minute ? { ...S.timeItem, ...S.timeItemOn } : S.timeItem,
                'aria-pressed': parsed !== null && minute === parsed.minute ? 'true' : 'false',
                onClick: () => pickMinute(minute),
              }, minute))))),
          h('button', {
            type: 'button', className: 'td-btn', style: S.pickerClear,
            onClick: () => closeWith(''),
          }, t('clearValue')))
        : null)
    }

    function CategoryDialog({ t, onClose, onChanged }) {
      const [rows, setRows] = useState(null)
      const [loadFailed, setLoadFailed] = useState(false)
      const [editing, setEditing] = useState(null)
      const [confirming, setConfirming] = useState(null)
      const [saving, setSaving] = useState(false)
      const [error, setError] = useState(null)

      const alive = useRef(true)
      const closeRef = useRef(onClose)
      const tRef = useRef(t)
      const confirmTimer = useRef(null)

      useEffect(() => { tRef.current = t }, [t])

      const clearConfirmTimer = useCallback(() => {
        if (confirmTimer.current !== null) {
          window.clearTimeout(confirmTimer.current)
          confirmTimer.current = null
        }
      }, [])

      useEffect(() => {
        alive.current = true
        return () => {
          alive.current = false
          clearConfirmTimer()
        }
      }, [clearConfirmTimer])

      useEffect(() => { closeRef.current = onClose }, [onClose])

      const load = useCallback(async () => {
        try {
          const result = await fetchApi('categories', {}, tRef.current)
          if (!alive.current) return
          setRows(normalizeCategories(result))
          setLoadFailed(false)
        } catch (err) {
          if (!alive.current) return
          console.error('[dsh-sidebar-todo] categories failed', err)
          setRows([])
          setLoadFailed(true)
        }
      }, [])

      useEffect(() => { void load() }, [load])

      useEffect(() => {
        const onKeyDown = (event) => {
          if (event.key !== 'Escape') return
          event.stopPropagation?.()
          closeRef.current()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [])

      const refreshAfterWrite = useCallback(async () => {
        await onChanged?.()
        await load()
      }, [load, onChanged])

      const startRename = (name) => {
        clearConfirmTimer()
        setConfirming(null)
        setError(null)
        setEditing({ from: name, value: name })
      }

      const submitRename = async () => {
        if (editing === null || saving) return
        const to = editing.value.trim()
        if (to === '') return
        if (to === editing.from) { setEditing(null); return }
        setSaving(true)
        setError(null)
        try {
          await fetchApi('renameCategory', { from: editing.from, to }, tRef.current)
          if (!alive.current) return
          setEditing(null)
          await refreshAfterWrite()
        } catch (err) {
          if (!alive.current) return
          setError(err instanceof Error && err.message ? err.message : tRef.current('requestFailed'))
        } finally {
          if (alive.current) setSaving(false)
        }
      }

      const requestDelete = async (name) => {
        if (saving) return
        setError(null)
        if (confirming !== name) {
          clearConfirmTimer()
          setEditing(null)
          setConfirming(name)
          confirmTimer.current = window.setTimeout(() => {
            confirmTimer.current = null
            setConfirming(null)
          }, 3000)
          return
        }
        clearConfirmTimer()
        setConfirming(null)
        setSaving(true)
        try {
          await fetchApi('clearCategory', { name }, tRef.current)
          if (!alive.current) return
          setEditing(null)
          await refreshAfterWrite()
        } catch (err) {
          if (!alive.current) return
          setError(err instanceof Error && err.message ? err.message : tRef.current('requestFailed'))
        } finally {
          if (alive.current) setSaving(false)
        }
      }

      const countLabel = t('categoryCount')

      return h('div', {
        className: 'td-overlay',
        style: S.overlay,
        onClick: (event) => { if (event.target === event.currentTarget) onClose() },
      },
      h('div', { className: 'td-dialog', style: S.dialog, role: 'dialog', 'aria-modal': 'true', 'aria-label': t('category') },
        h('div', { style: S.dialogHead }, t('category')),
        h('div', { style: { marginBottom: 10, fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-label-tertiary)' } }, t('categoryHint')),
        loadFailed ? h('div', { style: S.dialogError }, t('failed')) : null,
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 320, overflowY: 'auto', marginTop: 4 } },
          rows === null
            ? h('div', { style: { padding: '18px 8px', textAlign: 'center', fontSize: 12.5, color: 'var(--dsw-alias-label-tertiary)' } }, t('loading'))
            : rows.length === 0
              ? h('div', { style: { padding: '18px 8px', textAlign: 'center', fontSize: 12.5, color: 'var(--dsw-alias-label-tertiary)' } }, t('categoryEmpty'))
              : rows.map((row) => {
                  const renaming = editing !== null && editing.from === row.name
                  const confirmingThis = confirming === row.name
                  return h('div', { key: row.name, className: 'td-row', style: { display: 'flex', alignItems: 'center', gap: 8, minHeight: 34, padding: '0 8px', borderRadius: 6 } },
                    renaming
                      ? h('input', {
                          className: 'td-input',
                          autoFocus: true,
                          style: { ...S.input, height: 28, flex: 1, minWidth: 0 },
                          value: editing.value,
                          'aria-label': t('rename'),
                          onChange: (event) => setEditing((prev) => (prev === null ? prev : { ...prev, value: event.target.value })),
                          onKeyDown: (event) => {
                            if (event.nativeEvent?.isComposing === true) return
                            if (event.key === 'Enter') { event.preventDefault?.(); void submitRename() }
                            if (event.key === 'Escape') { event.preventDefault?.(); event.stopPropagation?.(); setEditing(null) }
                          },
                        })
                      : h('span', { style: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 } }, row.name),
                    h('span', { style: { flex: 'none', minWidth: 46, textAlign: 'right', fontSize: 11, color: 'var(--dsw-alias-label-tertiary)' } }, typeof countLabel === 'function' ? countLabel(row.count) : String(countLabel).replace('{count}', String(row.count))),
                    renaming
                      ? [
                          h('button', {
                            key: 'save',
                            type: 'button',
                            className: 'td-btn td-primary',
                            style: { flex: 'none', height: 26, padding: '0 9px', borderRadius: 6, border: 'none', background: 'var(--dsw-alias-state-business-primary)', color: 'var(--dsw-alias-label-primary-inverted)', fontSize: 11.5, cursor: 'pointer' },
                            disabled: saving || editing.value.trim() === '',
                            onClick: () => void submitRename(),
                          }, t('saveRename')),
                          h('button', {
                            key: 'cancel',
                            type: 'button',
                            className: 'td-btn',
                            style: { flex: 'none', height: 26, padding: '0 9px', borderRadius: 6, border: '0.5px solid var(--dsw-alias-border-l3)', color: 'var(--dsw-alias-label-secondary)', fontSize: 11.5, cursor: 'pointer', background: 'transparent' },
                            disabled: saving,
                            onClick: () => setEditing(null),
                          }, t('cancelRename')),
                        ]
                      : [
                          h('button', {
                            key: 'rename',
                            type: 'button',
                            className: 'td-btn',
                            style: { flex: 'none', height: 26, padding: '0 9px', borderRadius: 6, border: '0.5px solid var(--dsw-alias-border-l3)', color: 'var(--dsw-alias-label-secondary)', fontSize: 11.5, cursor: 'pointer', background: 'transparent' },
                            disabled: saving,
                            onClick: () => startRename(row.name),
                          }, t('rename')),
                          h('button', {
                            key: 'delete',
                            type: 'button',
                            className: 'td-btn',
                            style: { flex: 'none', height: 26, padding: '0 9px', borderRadius: 6, border: '0.5px solid var(--dsw-alias-border-l3)', color: confirmingThis ? 'var(--dsw-alias-state-error-primary)' : 'var(--dsw-alias-label-secondary)', borderColor: confirmingThis ? 'var(--dsw-alias-state-error-primary)' : 'var(--dsw-alias-border-l3)', fontSize: 11.5, cursor: 'pointer', background: 'transparent' },
                            disabled: saving,
                            onClick: () => void requestDelete(row.name),
                          }, confirmingThis ? t('confirmDelete') : t('deleteOne')),
                        ],
                  )
                }),
        ),
        error !== null ? h('div', { style: S.dialogError }, error) : null,
        h('div', { style: S.dialogFoot },
          h('button', { type: 'button', className: 'td-btn', style: S.btnGhost, onClick: onClose }, t('dismiss'))),
      ))
    }

    function CalendarView({ t, selectedDay, onPickDay, version }) {
      const [cursor, setCursor] = useState(() => {
        const at = new Date()
        return { year: at.getFullYear(), month: at.getMonth() }
      })
      const [byDate, setByDate] = useState({})

      const cells = monthGrid(cursor.year, cursor.month)
      const from = cells[0]
      const to = cells[cells.length - 1]
      const monthKey = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`
      const todayKey = dateKeyOf(new Date())
      const weekdays = weekdayLabels(t)

      useEffect(() => {
        let alive = true
        fetchApi('occurrences', { from, to })
          .then((result) => {
            if (!alive) return
            const map = {}
            for (const item of Array.isArray(result.items) ? result.items : []) {
              ;(map[item.date] ??= []).push(item)
            }
            setByDate(map)
          })
          .catch((err) => {
            if (!alive) return
            console.error('[dsh-sidebar-todo] occurrences failed', err)
            setByDate({})
          })
        return () => { alive = false }
      }, [from, to, version])

      const move = (delta) => {
        const at = new Date(cursor.year, cursor.month + delta, 1)
        setCursor({ year: at.getFullYear(), month: at.getMonth() })
      }

      const goToday = () => {
        const at = new Date()
        setCursor({ year: at.getFullYear(), month: at.getMonth() })
      }

      return h('div', { style: S.calendarView },
        h('div', { style: S.calendarViewHead },
          h('button', {
            type: 'button', className: 'td-btn', style: S.calendarBtn,
            'aria-label': t('prevMonth'), onClick: () => move(-1),
          }, '‹'),
          h('div', { style: S.calendarViewTitle }, monthTitle(cursor.year, cursor.month)),
          h('button', {
            type: 'button', className: 'td-btn', style: S.calendarBtn,
            'aria-label': t('nextMonth'), onClick: () => move(1),
          }, '›'),
          h('button', {
            type: 'button', className: 'td-btn',
            style: { ...S.btnGhost, height: 28, padding: '0 10px' },
            onClick: goToday,
          }, t('today'))),
        h('div', { style: S.calendarViewWeekdays, 'aria-hidden': 'true' },
          weekdays.map((label, index) => h('div', { key: String(index), style: S.calendarWeekday }, label))),
        h('div', { style: S.calendarViewGrid },
          cells.map((key) => {
            const items = byDate[key] ?? []
            const inMonth = key.slice(0, 7) === monthKey
            const selected = key === selectedDay
            return h('div', {
              key,
              role: 'button',
              tabIndex: 0,
              className: 'td-btn td-cal-cell',
              'aria-label': key,
              'data-date': key,
              style: {
                ...S.calendarViewCell,
                ...(selected ? S.calendarCellSelected : null),
                ...(inMonth ? null : S.pickerDayOff),
              },
              onClick: () => onPickDay(key),
              onKeyDown: (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault?.()
                onPickDay(key)
              },
            },
            h('div', { style: key === todayKey ? { ...S.calendarViewDay, ...S.calendarCellToday } : S.calendarViewDay }, String(Number(key.slice(8, 10)))),
            items.slice(0, 2).map((item) => h('div', {
              key: `${item.todoId}-${item.date}`,
              style: S.calendarViewItem,
            },
            h('span', { style: { ...S.dot, background: priorityColor(item.priority) }, 'aria-hidden': 'true' }),
            h('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, asText(item.title)))),
            items.length > 2 ? h('div', { style: S.calendarViewMore }, `+${items.length - 2}`) : null)
          })),
      )
    }

    // --- New components ---
    function LeftRail({ t, active, onChange, onAvatarClick }) {
      const items = [
        { key: 'plan', labelKey: 'plan', icon: '📅' },
        { key: 'view', labelKey: 'view', icon: '▦' },
        { key: 'focus', labelKey: 'focus', icon: '⌛' },
      ]
      return h('div', { style: S.leftRail },
        items.map((item) => h('button', {
          key: item.key,
          type: 'button',
          className: 'td-rail-btn',
          'aria-label': t(item.labelKey),
          'aria-pressed': active === item.key ? 'true' : 'false',
          style: active === item.key ? { ...S.railItem, ...S.railItemActive } : S.railItem,
          onClick: () => onChange(item.key),
        },
        h('span', { style: S.railIcon }, item.icon),
        h('span', { style: S.railLabel }, t(item.labelKey)))),
        h('div', { style: S.railAvatar, onClick: onAvatarClick }, '😼'))
    }

    function TopBar({ t, onQuickAdd, onToggleCalendar, notificationOn, calendarActive, settings, onSettingsChange }) {
      const [notifyOpen, setNotifyOpen] = useState(false)
      const [permissionState, setPermissionState] = useState('default')
      const [savingSettings, setSavingSettings] = useState(false)
      const [testResult, setTestResult] = useState(null)
      const notifyRef = useRef(null)

      useEffect(() => {
        if (typeof Notification !== 'undefined') {
          setPermissionState(Notification.permission)
        }
      }, [])

      useEffect(() => {
        if (!notifyOpen) return undefined
        const handler = (e) => {
          if (notifyRef.current && !notifyRef.current.contains(e.target)) setNotifyOpen(false)
        }
        document.addEventListener('pointerdown', handler)
        return () => document.removeEventListener('pointerdown', handler)
      }, [notifyOpen])

      const handleNotifyClick = async () => {
        if (typeof Notification === 'undefined') {
          setNotifyOpen(true)
          return
        }
        if (Notification.permission === 'default') {
          try {
            const result = await Notification.requestPermission()
            setPermissionState(result)
            if (result === 'granted') {
              onSettingsChange({ ...settings, notify: { ...settings.notify, system: true } })
            }
          } catch (e) {
            console.error('Notification permission request failed', e)
          }
        }
        setNotifyOpen(!notifyOpen)
      }

      const toggleSetting = (key) => {
        onSettingsChange({
          ...settings,
          notify: { ...settings.notify, [key]: !settings.notify[key] },
        })
      }

      const setLeadMinutes = (value) => {
        const num = Math.max(0, parseInt(value, 10) || 0)
        onSettingsChange({ ...settings, notify: { ...settings.notify, leadMinutes: num } })
      }

      const handleTest = async (channel) => {
        setTestResult(null)
        try {
          await fetchApi('notifyTest', { channel })
          setTestResult({ ok: true, msg: t('testNotifySuccess') })
          setTimeout(() => setTestResult(null), 3000)
        } catch (e) {
          setTestResult({ ok: false, msg: t('testNotifyFail') })
          setTimeout(() => setTestResult(null), 3000)
        }
      }

      const handleSaveSettings = async () => {
        setSavingSettings(true)
        try {
          await fetchApi('saveSettings', { notify: settings.notify })
          setTestResult({ ok: true, msg: t('settingsSaved') })
          setTimeout(() => setTestResult(null), 3000)
        } catch (e) {
          setTestResult({ ok: false, msg: t('saveFail') })
          setTimeout(() => setTestResult(null), 3000)
        } finally {
          setSavingSettings(false)
        }
      }

      return h('div', { style: S.topBar },
        h('input', {
          className: 'td-input',
          style: S.quickAdd,
          placeholder: t('inboxPlaceholder'),
          'aria-label': t('inboxPlaceholder'),
          onKeyDown: (e) => {
            if (e.key !== 'Enter' || e.nativeEvent?.isComposing === true) return
            const value = e.target.value.trim()
            if (value === '') return
            onQuickAdd(value)
            e.target.value = ''
          },
        }),
        h('div', { style: S.topBarRight },
          h('div', { style: { position: 'relative' }, ref: notifyRef },
            h('button', {
              type: 'button',
              className: 'td-btn',
              style: { ...S.iconBtn, ...(notificationOn ? S.iconBtnActive : null) },
              'aria-label': t('notificationToggle'),
              onClick: handleNotifyClick,
            }, '🔔'),
            notifyOpen
              ? h('div', { className: 'td-notify-pop', style: S.notifyPopover },
                  h('div', { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, t('notifySettings')),
                  typeof Notification === 'undefined'
                    ? h('div', { style: S.notifyHint }, t('notifyUnsupported'))
                    : permissionState === 'denied'
                      ? h('div', { style: S.notifyHint }, t('notifyDenied'))
                      : null,
                  h('div', { style: S.notifyRow },
                    h('span', { style: S.notifyLabel }, t('systemNotify')),
                    h('button', {
                      type: 'button',
                      style: { ...S.notifyToggle, background: settings.notify.system ? 'var(--dsw-alias-state-business-primary)' : 'var(--dsw-alias-bg-module-platform)' },
                      'aria-pressed': settings.notify.system ? 'true' : 'false',
                      onClick: () => toggleSetting('system'),
                    },
                    h('span', { style: { ...S.notifyToggleDot, left: settings.notify.system ? 18 : 2 } }))),
                  h('div', { style: S.notifyRow },
                    h('span', { style: S.notifyLabel }, t('feishuNotify')),
                    h('button', {
                      type: 'button',
                      style: { ...S.notifyToggle, background: settings.notify.feishu ? 'var(--dsw-alias-state-business-primary)' : 'var(--dsw-alias-bg-module-platform)' },
                      'aria-pressed': settings.notify.feishu ? 'true' : 'false',
                      onClick: () => toggleSetting('feishu'),
                    },
                    h('span', { style: { ...S.notifyToggleDot, left: settings.notify.feishu ? 18 : 2 } }))),
                  h('div', { style: S.notifyRow },
                    h('span', { style: S.notifyLabel }, t('leadMinutes')),
                    h('input', {
                      className: 'td-input',
                      style: S.notifyInput,
                      type: 'number',
                      min: 0,
                      value: settings.notify.leadMinutes,
                      onChange: (e) => setLeadMinutes(e.target.value),
                    })),
                  h('div', { style: S.notifyRow },
                    h('span', { style: S.notifyLabel }, t('quietHours')),
                    h('div', { style: { display: 'flex', alignItems: 'center', gap: 4 } },
                      h('input', {
                        className: 'td-input',
                        style: { ...S.notifyInput, width: 74 },
                        type: 'time',
                        'aria-label': t('quietStart'),
                        value: settings.notify.quietHours?.start ?? '22:00',
                        onChange: (e) => onSettingsChange({ ...settings, notify: { ...settings.notify, quietHours: { ...settings.notify.quietHours, enabled: true, start: e.target.value } } }),
                      }),
                      h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary)' } }, '–'),
                      h('input', {
                        className: 'td-input',
                        style: { ...S.notifyInput, width: 74 },
                        type: 'time',
                        'aria-label': t('quietEnd'),
                        value: settings.notify.quietHours?.end ?? '08:00',
                        onChange: (e) => onSettingsChange({ ...settings, notify: { ...settings.notify, quietHours: { ...settings.notify.quietHours, enabled: true, end: e.target.value } } }),
                      }))),
                  h('div', { style: { display: 'flex', gap: 6, marginTop: 4 } },
                    h('button', {
                      type: 'button',
                      className: 'td-btn',
                      style: S.notifyBtn,
                      onClick: () => handleTest('system'),
                    }, t('testNotify') + ' ' + t('systemNotify')),
                    h('button', {
                      type: 'button',
                      className: 'td-btn',
                      style: S.notifyBtn,
                      onClick: () => handleTest('feishu'),
                    }, t('testNotify') + ' ' + t('feishuNotify'))),
                  testResult
                    ? h('div', { style: { fontSize: 11, color: testResult.ok ? 'var(--dsw-alias-state-business-primary)' : 'var(--dsw-alias-state-error-primary)', padding: '2px 0' } }, testResult.msg)
                    : null,
                  h('button', {
                    type: 'button',
                    className: 'td-primary',
                    style: { ...S.btnPrimary, width: '100%', marginTop: 4 },
                    disabled: savingSettings,
                    onClick: handleSaveSettings,
                  }, savingSettings ? t('loading') : t('save')))
              : null),
          h('button', {
            type: 'button',
            className: 'td-btn',
            style: { ...S.iconBtn, ...(calendarActive ? S.iconBtnActive : null) },
            'aria-label': t('calendarIcon'),
            onClick: onToggleCalendar,
          }, '📅')))
    }

    function LeftPanel({ t, activeFilter, onFilterChange, categories, inboxCount, onNewCategory, onInboxFilter, onToggleInboxCollapse, collapsedInbox, monthCursor, onMonthChange, calendarItems, onSelectDay, dayFilter, onClearDayFilter }) {
      const [selectedDay, setSelectedDay] = useState(null)
      const cells = monthGrid(monthCursor.year, monthCursor.month)
      const monthKey = `${monthCursor.year}-${String(monthCursor.month + 1).padStart(2, '0')}`
      const todayKey = dateKeyOf(new Date())
      const weekdays = weekdayLabels(t)

      const byDate = {}
      for (const item of calendarItems) {
        const key = asText(item.date)
        ;(byDate[key] ??= []).push(item)
      }

      const handleDayClick = (key) => {
        setSelectedDay(key)
        onSelectDay(key)
      }

      return h('div', { style: S.leftPanel },
        // Inbox header
        h('div', { style: S.panelSection },
          h('div', {
            style: S.panelHeader,
            onClick: onInboxFilter,
            role: 'button',
            tabIndex: 0,
            'aria-label': t('inbox'),
            onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onInboxFilter() } },
          },
          h('span', { style: S.panelHeaderIcon }, '📁'),
          h('span', { style: S.panelHeaderTitle }, t('inbox')),
          h('span', { style: S.panelHeaderCount }, String(inboxCount)),
          h('button', {
            type: 'button',
            className: 'td-btn',
            style: S.panelHeaderArrowBtn,
            'aria-label': collapsedInbox ? t('expandInbox') : t('collapseInbox'),
            'aria-expanded': collapsedInbox ? 'false' : 'true',
            onClick: (e) => { e.stopPropagation(); onToggleInboxCollapse() },
          }, collapsedInbox ? '▸' : '▾')),
          collapsedInbox
            ? null
            : h('div', {
                style: { ...S.categoryRow, ...(activeFilter === '__inbox__' ? S.categoryRowSelected : null) },
                onClick: onInboxFilter,
              },
              h('span', { style: S.categoryIcon }, '📥'),
              h('span', { style: S.categoryName }, t('inbox')),
              h('span', { style: S.categoryCount }, String(inboxCount)))),

        // Mini calendar
        h('div', { style: S.miniCalendar },
          h('div', { style: S.calendarHead },
            h('button', {
              type: 'button', className: 'td-btn', style: S.calendarBtn,
              'aria-label': t('prevMonth'), onClick: () => onMonthChange(-1),
            }, '‹'),
            h('div', { style: S.calendarTitle }, monthTitle(monthCursor.year, monthCursor.month)),
            h('button', {
              type: 'button', className: 'td-btn', style: S.calendarBtn,
              'aria-label': t('nextMonth'), onClick: () => onMonthChange(1),
            }, '›')),
          h('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 4 } },
            h('button', {
              type: 'button', className: 'td-btn',
              style: { ...S.btnGhost, height: 22, padding: '0 8px', fontSize: 11 },
              onClick: () => { onMonthChange(0); handleDayClick(todayKey) },
            }, t('backToToday'))),
          dayFilter !== null
            ? h('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 4 } },
                h('span', { style: S.chip },
                  dayFilter.slice(5) + ' ',
                  h('button', {
                    type: 'button',
                    className: 'td-btn',
                    style: S.chipBtn,
                    'aria-label': t('clearValue'),
                    onClick: onClearDayFilter,
                  }, '×')))
            : null,
          h('div', { style: S.calendarGrid, 'aria-hidden': 'true' },
            weekdays.map((label, index) => h('div', { key: String(index), style: S.calendarWeekday }, label))),
          h('div', { style: S.calendarGrid },
            cells.map((key) => {
              const items = byDate[key] ?? []
              const inMonth = key.slice(0, 7) === monthKey
              const isToday = key === todayKey
              const isSelected = key === selectedDay
              const dotColor = items.length > 0 ? QUADRANT_COLORS[items[0].quadrant] ?? priorityColor(items[0].priority) : null
              return h('button', {
                key,
                type: 'button',
                className: 'td-btn td-cal-cell',
                'aria-label': key,
                style: {
                  ...S.calendarCell,
                  ...(isToday ? S.calendarCellToday : null),
                  ...(isSelected ? S.calendarCellSelected : null),
                  ...(inMonth ? null : { opacity: 0.4 }),
                },
                onClick: () => handleDayClick(key),
              },
              String(Number(key.slice(8, 10))),
              dotColor ? h('span', { style: { ...S.calendarDot, background: dotColor }, 'aria-hidden': 'true' }) : null)
            }))),

        // Category list
        h('div', { style: S.categoryList },
          h('div', {
            style: { ...S.categoryRow, ...(activeFilter === 'all' ? S.categoryRowSelected : null) },
            onClick: () => onFilterChange('all'),
          },
          h('span', { style: S.categoryIcon }, '◎'),
          h('span', { style: S.categoryName }, t('all'))),
          h('div', {
            style: { ...S.categoryRow, ...(activeFilter === '__none__' ? S.categoryRowSelected : null) },
            onClick: () => onFilterChange('__none__'),
          },
          h('span', { style: S.categoryIcon }, '⊘'),
          h('span', { style: S.categoryName }, t('uncategorized'))),
          categories.map((cat) => h('div', {
            key: cat.name,
            style: { ...S.categoryRow, ...(activeFilter === cat.name ? S.categoryRowSelected : null) },
            onClick: () => onFilterChange(cat.name),
          },
          h('span', { style: S.categoryIcon }, cat.icon || '🏷️'),
          h('span', { style: S.categoryName }, cat.name),
          h('span', { style: S.categoryCount }, String(cat.count)))),

        // New category button
        h('button', {
          type: 'button',
          className: 'td-btn',
          style: S.newCategoryBtn,
          onClick: onNewCategory,
        }, '+ ' + t('newCategory'))))
    }

    function MatrixArea({ t, items, onSelect, selectedId, onToggle, onAdd }) {
      const byQuadrant = useMemo(() => {
        const map = {}
        for (const q of QUADRANTS) map[q.key] = []
        for (const item of items) {
          const q = item.quadrant
          if (q && map[q]) map[q].push(item)
        }
        return map
      }, [items])

      const emptyCaptions = {
        urgent_not_important: 'quadrantEmptyUrgentNotImportant',
        urgent_important: 'quadrantEmptyUrgentImportant',
        important_not_urgent: 'quadrantEmptyImportantNotUrgent',
        neither: 'quadrantEmptyNeither',
      }

      return h('div', { style: S.matrixArea },
        QUADRANTS.map((q) => {
          const qItems = byQuadrant[q.key] ?? []
          return h('div', { key: q.key, style: S.quadrantCard, className: 'td-quadrant-card' },
            h('div', { style: S.quadrantHead },
              h('span', { style: { width: 4, height: 20, borderRadius: 2, background: q.color, flex: 'none' } }),
              h('span', { style: S.quadrantTitle }, t(q.labelKey)),
              h('span', { style: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', marginRight: 8 } }, String(qItems.length)),
              h('button', {
                type: 'button',
                className: 'td-btn',
                style: S.quadrantAddBtn,
                'aria-label': t('addTodo'),
                onClick: () => onAdd(q.key),
              }, '+')),
            h('div', { style: S.quadrantBody },
              qItems.length === 0
                ? h('div', { style: S.emptyState },
                    h('svg', { width: 48, height: 48, viewBox: '0 0 48 48', fill: 'none', stroke: 'var(--dsw-alias-label-tertiary)', strokeWidth: 1.2, opacity: 0.4 },
                      h('rect', { x: 8, y: 8, width: 32, height: 32, rx: 4 }),
                      h('path', { d: 'M16 20h16M16 28h10', strokeLinecap: 'round' })),
                    h('span', null, t(emptyCaptions[q.key])))
                : qItems.map((item) => {
                    const done = Boolean(item.done)
                    const selected = item.id === selectedId
                    // 循环任务以本周期实例为准：dueDate 为空说明系列已结束，
                    // 复选框置灰且不响应（与 handleToggle 的提前 return 保持一致）。
                    const ended = Boolean(item.isRepeating) && asText(item.dueDate) === ''
                    return h('div', {
                      key: item.id,
                      className: 'td-todo-row',
                      style: selected ? { ...S.todoRow, ...S.todoRowSelected } : S.todoRow,
                      onClick: () => onSelect(item.id),
                    },
                    checkHit(
                      () => { if (!ended) onToggle(item) },
                      h('span', {
                        role: 'checkbox',
                        'aria-checked': done ? 'true' : 'false',
                        'aria-disabled': ended ? 'true' : undefined,
                        'aria-label': asText(item.title),
                        tabIndex: 0,
                        className: 'td-check',
                        style: ended
                          ? { ...(done ? S.todoCircleDone : S.todoCircle), opacity: 0.4 }
                          : (done ? S.todoCircleDone : S.todoCircle),
                        onKeyDown: (e) => {
                          if (e.nativeEvent?.isComposing === true) return
                          if (ended) return
                          if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); onToggle(item) }
                        },
                      }, done
                        ? h('svg', { width: 9, height: 9, viewBox: '0 0 16 16', fill: 'none', stroke: 'var(--dsw-alias-label-primary-inverted)', strokeWidth: 2.4 },
                            h('path', { d: 'M3.4 8.4 6.2 11l6.4-6.4', strokeLinecap: 'round', strokeLinejoin: 'round' }))
                        : null)),
                    h('button', {
                      type: 'button',
                      className: 'td-title',
                      'aria-current': selected ? 'true' : 'false',
                      style: done ? S.todoTitleDone : S.todoTitle,
                      onClick: (e) => { e.stopPropagation(); onSelect(item.id) },
                    }, asText(item.title)),
                    h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary)', flex: 'none' } }, dueLabel(item)))
                  })))
        }))
    }

    function DetailPanel({ t, item, categories, onManageCategories, onAddSubtask, onToggleSubtask, onRemoveSubtask, onSave, onRemove }) {
      const [title, setTitle] = useState(asText(item.title))
      const [note, setNote] = useState(asText(item.note))
      const [category, setCategory] = useState(asText(item.category))
      const [quadrant, setQuadrant] = useState(item.quadrant ?? null)
      const [dueDate, setDueDate] = useState(asText(item.dueDate))
      const [dueTime, setDueTime] = useState(asText(item.dueTime))
      const [repeat, setRepeat] = useState(item.repeat ?? null)
      const [subtaskInput, setSubtaskInput] = useState('')
      const [showCategoryPicker, setShowCategoryPicker] = useState(false)
      const [showQuadrantPicker, setShowQuadrantPicker] = useState(false)
      const [showDatePicker, setShowDatePicker] = useState(false)
      const [showRepeatPicker, setShowRepeatPicker] = useState(false)
      // 同一时刻只开一个属性选择器，避免四个弹层互相叠着。
      const openPicker = (which) => {
        setShowCategoryPicker(which === 'category' ? !showCategoryPicker : false)
        setShowQuadrantPicker(which === 'quadrant' ? !showQuadrantPicker : false)
        setShowDatePicker(which === 'date' ? !showDatePicker : false)
        setShowRepeatPicker(which === 'repeat' ? !showRepeatPicker : false)
      }
      // 属性行：左标签 / 右值 + 箭头；点整行开合对应选择器。键盘可达。
      const propRow = (label, value, which) => h('div', {
        className: 'td-property-row',
        style: S.propertyRow,
        role: 'button',
        tabIndex: 0,
        onClick: () => openPicker(which),
        onKeyDown: (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return
          e.preventDefault()
          openPicker(which)
        },
      },
      h('span', { style: S.propertyLabel }, label),
      h('span', { style: S.propertyValue }, value),
      h('span', { style: S.propertyChevron }, '›'))
      const [dirty, setDirty] = useState(false)
      const [saving, setSaving] = useState(false)
      const [savedMsg, setSavedMsg] = useState(null)
      const dirtyRef = useRef(false)

      // Sync from props when selection changes or when item updates without dirty state
      useEffect(() => {
        if (!dirtyRef.current) {
          setTitle(asText(item.title))
          setNote(asText(item.note))
          setCategory(asText(item.category))
          setQuadrant(item.quadrant ?? null)
          setDueDate(asText(item.dueDate))
          setDueTime(asText(item.dueTime))
          setRepeat(item.repeat ?? null)
        }
      }, [item])

      useEffect(() => {
        dirtyRef.current = dirty
      }, [dirty])

      const markDirty = () => setDirty(true)

      // 删除是两步确认（3 秒内再点一次），与旧版行为一致：避免误删。
      const [confirmingDelete, setConfirmingDelete] = useState(false)
      const deleteTimer = useRef(null)
      useEffect(() => () => {
        if (deleteTimer.current !== null) window.clearTimeout(deleteTimer.current)
      }, [])
      const handleDelete = () => {
        if (deleteTimer.current !== null) { window.clearTimeout(deleteTimer.current); deleteTimer.current = null }
        if (!confirmingDelete) {
          setConfirmingDelete(true)
          deleteTimer.current = window.setTimeout(() => { deleteTimer.current = null; setConfirmingDelete(false) }, 3000)
          return
        }
        setConfirmingDelete(false)
        void onRemove()
      }

      const handleSave = async () => {
        setSaving(true)
        setSavedMsg(null)
        try {
          const payload = {
            title: title.trim() || asText(item.title),
            note: note.trim(),
            category: category.trim() === '' ? null : category.trim(),
            quadrant: quadrant || null,
            dueDate: dueDate === '' ? null : dueDate,
            dueTime: dueTime === '' ? null : dueTime,
            repeat: repeat || null,
          }
          const ok = await onSave(payload)
          // onSave 返回布尔而不抛错；不检查就会把失败也显示成「已保存」。
          if (ok === false) throw new Error('save-failed')
          setDirty(false)
          setSavedMsg({ ok: true, msg: t('saveSuccess') })
          setTimeout(() => setSavedMsg(null), 2500)
        } catch (err) {
          setSavedMsg({ ok: false, msg: t('saveFail') })
          setTimeout(() => setSavedMsg(null), 3000)
        } finally {
          setSaving(false)
        }
      }

      const handleAddSubtask = async () => {
        const value = subtaskInput.trim()
        if (value === '') return
        try {
          await onAddSubtask(value)
          setSubtaskInput('')
        } catch (err) {
          console.error('add subtask failed', err)
        }
      }

      const q = quadrant ? QUADRANT_MAP[quadrant] : null

      const dueDisplay = () => {
        if (dueDate === '') return t('dueNone')
        const today = dateKeyOf(new Date())
        if (dueDate === today) return t('dueToday')
        return dueDate + (dueTime !== '' ? ' ' + dueTime : '')
      }

      const repeatDisplay = () => {
        if (!repeat) return t('repeatNoneShort')
        if (repeat.freq === 'daily') return t('repeatDaily')
        if (repeat.freq === 'weekly') return t('repeatWeekly')
        if (repeat.freq === 'monthly') return t('repeatMonthly')
        return t('repeatNoneShort')
      }

      return h('div', { style: S.detailPanel },
        // Header
        h('div', { style: S.detailHeader },
          h('div', { style: { ...S.detailIcon, background: q ? q.color : 'var(--dsw-alias-label-tertiary)' }, 'aria-hidden': 'true' }),
          h('input', {
            className: 'td-input',
            style: S.detailTitleInput,
            value: title,
            placeholder: t('titlePlaceholder'),
            'aria-label': t('titlePlaceholder'),
            onChange: (e) => { setTitle(e.target.value); markDirty() },
          })),

        // Subtasks
        h('div', { style: S.detailSection },
          h('button', {
            type: 'button',
            className: 'td-btn',
            style: S.subtaskLink,
            onClick: handleAddSubtask,
          }, t('subtaskAdd')),
          h('div', { style: { display: 'flex', gap: 6, marginTop: 4 } },
            h('input', {
              className: 'td-input',
              style: { ...S.subtaskInput, flex: 1 },
              placeholder: t('subtaskPlaceholder'),
              value: subtaskInput,
              onChange: (e) => setSubtaskInput(e.target.value),
              onKeyDown: (e) => { if (e.key === 'Enter' && e.nativeEvent?.isComposing !== true) handleAddSubtask() },
            }),
            h('button', {
              type: 'button',
              className: 'td-btn',
              style: { height: 28, padding: '0 10px', borderRadius: 4, border: '0.5px solid var(--dsw-alias-border-l3)', color: 'var(--dsw-alias-label-secondary)', fontSize: 12, cursor: 'pointer', background: 'transparent' },
              onClick: handleAddSubtask,
            }, t('add'))),
          h('div', { style: S.subtaskList },
            (item.subtasks ?? []).length === 0
              ? h('div', { style: { padding: '4px 0', fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' } }, t('noSubtasks'))
              : (item.subtasks ?? []).map((sub) => h('div', { key: sub.id, style: S.subtaskRow },
                  checkHit(
                    () => onToggleSubtask(sub),
                    h('span', {
                      role: 'checkbox',
                      'aria-checked': sub.done ? 'true' : 'false',
                      'aria-label': asText(sub.title),
                      tabIndex: 0,
                      className: 'td-check',
                      style: sub.done ? { ...S.todoCheckbox, ...S.todoCheckboxDone } : S.todoCheckbox,
                      onKeyDown: (e) => {
                        if (e.nativeEvent?.isComposing === true) return
                        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); onToggleSubtask(sub) }
                      },
                    }, sub.done
                      ? h('svg', { width: 9, height: 9, viewBox: '0 0 16 16', fill: 'none', stroke: 'var(--dsw-alias-label-primary-inverted)', strokeWidth: 2.4 },
                          h('path', { d: 'M3.4 8.4 6.2 11l6.4-6.4', strokeLinecap: 'round', strokeLinejoin: 'round' }))
                      : null)),
                  h('span', { style: { flex: 1, fontSize: 13, color: sub.done ? 'var(--dsw-alias-label-tertiary)' : 'var(--dsw-alias-label-primary)', textDecoration: sub.done ? 'line-through' : 'none' } }, asText(sub.title)),
                  h('button', {
                    type: 'button',
                    className: 'td-btn td-subtask-delete',
                    style: S.subtaskDeleteBtn,
                    'aria-label': t('subtaskDelete'),
                    onClick: () => onRemoveSubtask(sub),
                  }, '×'))))),

        // Note
        h('div', { style: S.detailSection },
          h('textarea', {
            className: 'td-input',
            style: S.noteTextarea,
            placeholder: t('notePlaceholder'),
            'aria-label': t('notePlaceholder'),
            value: note,
            onChange: (e) => { setNote(e.target.value); markDirty() },
          })),

        h('div', { style: S.divider, 'aria-hidden': 'true' }),

        // Properties
        h('div', { style: { padding: '0 20px' } },
          propRow(t('propertyCategory'), category === '' ? t('noCategory') : category, 'category'),
          showCategoryPicker
            ? h('div', { style: S.pickerBody },
                h(CategoryCombo, {
                  t,
                  value: category,
                  categories,
                  onChange: (next) => { setCategory(next); markDirty() },
                  onManage: onManageCategories,
                }))
            : null,

          propRow(t('propertyPriority'), q ? t(q.labelKey) : t('dueNone'), 'quadrant'),
          showQuadrantPicker
            ? h('div', { style: S.pickerBody },
                QUADRANTS.map((qItem) => h('button', {
                  key: qItem.key,
                  type: 'button',
                  className: 'td-btn',
                  style: { ...S.quadrantPickerItem, ...(quadrant === qItem.key ? S.repeatPickerItemOn : null) },
                  onClick: () => { setQuadrant(quadrant === qItem.key ? null : qItem.key); setShowQuadrantPicker(false); markDirty() },
                },
                h('span', { style: { ...S.quadrantPickerDot, background: qItem.color } }),
                t(qItem.labelKey))))
            : null,

          propRow(t('propertyDueDate'), dueDisplay(), 'date'),
          showDatePicker
            ? h('div', { style: S.pickerBody },
                h(DateField, {
                  t,
                  value: dueDate,
                  onChange: (next) => { setDueDate(next); markDirty() },
                }))
            : null,

          propRow(t('propertyRepeat'), repeatDisplay(), 'repeat'),
          showRepeatPicker
            ? h('div', { style: S.repeatPicker },
                [['', 'repeatNone'], ['daily', 'repeatDaily'], ['weekly', 'repeatWeekly'], ['monthly', 'repeatMonthly']].map(([value, key]) =>
                  h('button', {
                    key: value === '' ? 'none' : value,
                    type: 'button',
                    className: 'td-btn',
                    style: { ...S.repeatPickerItem, ...(repeat?.freq === value ? S.repeatPickerItemOn : null) },
                    onClick: () => {
                      setRepeat(value === '' ? null : { freq: value, interval: 1, until: null, weekdays: value === 'weekly' ? [1, 2, 3, 4, 5] : null, monthDay: value === 'monthly' ? new Date().getDate() : null })
                      setShowRepeatPicker(false)
                      markDirty()
                    },
                  }, t(key))))
            : null),

        // Save button
        h('div', { style: S.saveBtnContainer },
          savedMsg
            ? h('span', { style: { marginRight: 12, fontSize: 12, color: savedMsg.ok ? 'var(--dsw-alias-state-business-primary)' : 'var(--dsw-alias-state-error-primary)' } }, savedMsg.msg)
            : null,
          h('button', {
            type: 'button',
            className: 'td-btn',
            style: confirmingDelete
              ? { ...S.btnGhost, marginRight: 8, color: 'var(--dsw-alias-state-error-primary)', borderColor: 'var(--dsw-alias-state-error-primary)' }
              : { ...S.btnGhost, marginRight: 8 },
            onClick: handleDelete,
          }, confirmingDelete ? t('confirmRemove') : t('remove')),
          h('button', {
            type: 'button',
            className: 'td-primary',
            style: S.saveBtn,
            disabled: saving,
            onClick: handleSave,
          }, saving ? t('loading') : t('save'))))
    }

    let corruptDismissed = false

    // 活着的系统通知：Chromium 的通知对象若只被局部变量引用，可能在下一次 GC 后
    // 连同 onclick 一起被回收（点通知没反应）。模块级 Set 持有强引用，onclick /
    // onclose 时再删除，既不会被回收，也不会无限增长。
    const LIVE_NOTIFICATIONS = new Set()

    // 面板挂载时注册的「选中某条待办」回调；面板没开时为 null，点通知只把窗口拉到前台。
    let SELECT_TODO = null

    /**
     * 通知轮询必须活在插件层，不能放在 TodoPage 里：
     * 面板没打开时组件不挂载、轮询就不会跑 —— 而「没盯着待办面板」恰恰是最需要弹通知的时候。
     */
    function startNotificationWatch(getT) {
      if (typeof Notification === 'undefined') return () => {}

      // 浏览器只在用户手势里允许 requestPermission()。桌面壳的权限处理器本来就会放行，
      // 所以先无手势试一次；被拒（仍是 default）就挂一次性监听，用户第一次点面板时再要。
      try { void Notification.requestPermission?.() } catch (e) { /* 旧实现可能同步抛 */ }
      if (Notification.permission === 'default') {
        const ask = () => {
          document.removeEventListener('pointerdown', ask, true)
          try { void Notification.requestPermission?.() } catch (e) { /* 同上 */ }
        }
        document.addEventListener('pointerdown', ask, true)
      }

      const timer = window.setInterval(async () => {
        if (Notification.permission !== 'granted') return
        try {
          const result = await fetchApi('notifyPoll', {}, getT())
          const toasts = Array.isArray(result?.toasts) ? result.toasts : []
          for (const toast of toasts) {
            try {
              const n = new Notification(toast.title || getT()('nav'), {
                body: toast.body || '',
                tag: 'dsh-sidebar-todo:' + (toast.kind || 'due'),
                renotify: true,
                silent: ('dshDesktop' in globalThis),
              })
              LIVE_NOTIFICATIONS.add(n)
              n.onclick = () => {
                LIVE_NOTIFICATIONS.delete(n)
                try { window.focus() } catch (e) { /* focus 可能被浏览器策略拒绝 */ }
                if (toast.id && typeof SELECT_TODO === 'function') SELECT_TODO(toast.id)
              }
              n.onclose = () => { LIVE_NOTIFICATIONS.delete(n) }
              n.onerror = () => { LIVE_NOTIFICATIONS.delete(n) }
            } catch (e) {
              console.error('[dsh-sidebar-todo] notification failed', e)
            }
          }
        } catch (err) {
          console.error('[dsh-sidebar-todo] notifyPoll failed', err)
        }
      }, 3000)
      return () => window.clearInterval(timer)
    }

    function TodoPage(props) {
      const t = props.t ?? ((key) => dict.zh[key] ?? key)
      const [state, setState] = useState({ loading: true, error: null, items: [], summary: {}, notices: [], staleDays: 7, inboxCount: 0, categories: [] })
      const [activeRail, setActiveRail] = useState('plan')
      const [activeFilter, setActiveFilter] = useState('all')
      const [selected, setSelected] = useState(null)
      const [dialog, setDialog] = useState(null)
      const [categoryOpen, setCategoryOpen] = useState(false)
      const [calendarActive, setCalendarActive] = useState(false)
      const [monthCursor, setMonthCursor] = useState(() => { const at = new Date(); return { year: at.getFullYear(), month: at.getMonth() } })
      const [calendarItems, setCalendarItems] = useState([])
      const [settings, setSettings] = useState({ notify: { system: true, feishu: true, leadMinutes: 0, overdueDaily: true, quietHours: { enabled: false, start: '22:00', end: '08:00' } } })
      const [noticeHidden, setNoticeHidden] = useState(corruptDismissed)
      const [actionError, setActionError] = useState(false)
      const [dataVersion, setDataVersion] = useState(0)
      // 左栏选中的具体某一天（再点一次取消），只影响矩阵里显示哪些计划。
      const [dayFilter, setDayFilter] = useState(null)
      // 收集箱折叠：只隐藏左栏那一行筛选入口，不影响当前选中的筛选。
      const [collapsedInbox, setCollapsedInbox] = useState(false)
      const [retrying, setRetrying] = useState(false)

      const tRef = useRef(t)
      useEffect(() => { tRef.current = t }, [t])

      const seqRef = useRef(0)
      const aliveRef = useRef(true)
      useEffect(() => { aliveRef.current = true; return () => { aliveRef.current = false } }, [])

      const actionErrorTimer = useRef(null)
      const clearActionErrorTimer = useCallback(() => {
        if (actionErrorTimer.current !== null) {
          window.clearTimeout(actionErrorTimer.current)
          actionErrorTimer.current = null
        }
      }, [])
      const dismissActionError = useCallback(() => { clearActionErrorTimer(); setActionError(false) }, [clearActionErrorTimer])
      const showActionError = useCallback(() => {
        clearActionErrorTimer()
        setActionError(true)
        actionErrorTimer.current = window.setTimeout(() => { actionErrorTimer.current = null; setActionError(false) }, 5000)
      }, [clearActionErrorTimer])

      const reload = useCallback(async () => {
        const seq = ++seqRef.current
        try {
          const params = {}
          if (activeFilter === '__inbox__') params.quadrant = '__inbox__'
          else if (activeFilter === '__none__') params.category = '__none__'
          else if (activeFilter !== 'all') params.category = activeFilter
          const [result, catResult] = await Promise.all([
            fetchApi('list', params, tRef.current),
            fetchApi('categories', {}, tRef.current),
          ])
          if (seq !== seqRef.current || !aliveRef.current) return
          setState({
            loading: false,
            error: null,
            items: Array.isArray(result.items) ? result.items : [],
            summary: result.summary && typeof result.summary === 'object' ? result.summary : {},
            notices: Array.isArray(result.notices) ? result.notices : [],
            staleDays: Number.isInteger(result.staleDays) ? result.staleDays : 7,
            inboxCount: Number.isInteger(result.inboxCount) ? result.inboxCount : 0,
            categories: normalizeCategories(catResult),
          })
        } catch (err) {
          if (seq !== seqRef.current || !aliveRef.current) return
          console.error('[dsh-sidebar-todo] list failed', err)
          setState((prev) => ({ ...prev, loading: false, error: true }))
        }
      }, [activeFilter])

      const mutate = useCallback(async (method, payload) => {
        try {
          await fetchApi(method, payload, tRef.current)
          dismissActionError()
          setDataVersion((v) => v + 1)
          await reload()
          return true
        } catch (err) {
          console.error(`[dsh-sidebar-todo] ${method} failed`, err)
          showActionError()
          await reload()
          return false
        }
      }, [reload, dismissActionError, showActionError])

      // Fetch settings on mount
      useEffect(() => {
        fetchApi('settings', {}, tRef.current)
          .then((result) => {
            if (!aliveRef.current) return
            if (result?.notify) setSettings({ notify: result.notify })
          })
          .catch((err) => console.error('[dsh-sidebar-todo] settings failed', err))
      }, [])

      useEffect(() => { void reload() }, [reload])

      // Poll for notifications every 2.5s
      useEffect(() => {
        const timer = window.setInterval(() => { void reload() }, 2500)
        return () => window.clearInterval(timer)
      }, [reload])

      // 点系统通知时选中对应待办；面板卸载就摘掉回调，避免对已卸载组件 setState。
      useEffect(() => {
        SELECT_TODO = (id) => setSelected(id)
        return () => { SELECT_TODO = null }
      }, [])

      // Fetch calendar items when month changes or data changes
      useEffect(() => {
        let alive = true
        const cells = monthGrid(monthCursor.year, monthCursor.month)
        const from = cells[0]
        const to = cells[cells.length - 1]
        fetchApi('occurrences', { from, to }, tRef.current)
          .then((result) => {
            if (!alive) return
            setCalendarItems(Array.isArray(result?.items) ? result.items : [])
          })
          .catch((err) => {
            if (!alive) return
            console.error('[dsh-sidebar-todo] occurrences failed', err)
            setCalendarItems([])
          })
        return () => { alive = false }
      }, [monthCursor, dataVersion])

      const handleMonthChange = (delta) => {
        if (delta === 0) {
          const at = new Date()
          setMonthCursor({ year: at.getFullYear(), month: at.getMonth() })
        } else {
          setMonthCursor((prev) => {
            const at = new Date(prev.year, prev.month + delta, 1)
            return { year: at.getFullYear(), month: at.getMonth() }
          })
        }
      }

      const handleQuickAdd = useCallback(async (text) => {
        try {
          const parsed = await fetchApi('parse', { text }, tRef.current)
          const payload = {
            title: parsed.title || text,
            note: '',
            quadrant: null,
            category: parsed.category || null,
            dueDate: parsed.dueDate || null,
            dueTime: parsed.dueTime || null,
            repeat: parsed.repeat || null,
          }
          await mutate('create', payload)
        } catch (err) {
          console.error('[dsh-sidebar-todo] quick add failed', err)
          await mutate('create', { title: text, quadrant: null })
        }
      }, [mutate])

      const handleToggle = useCallback((item) => {
        const payload = { id: item.id, done: !item.done }
        if (item.isRepeating) {
          if (!item.dueDate) return
          payload.date = item.dueDate
        }
        void mutate('complete', payload)
      }, [mutate])

      const handleSaveDetail = useCallback(async (payload) => {
        if (!selected) return false
        const ok = await mutate('update', { id: selected, patch: payload })
        return ok
      }, [selected, mutate])

      // 删除后清空选中，右侧详情面板随之收起（否则会指向一条已不存在的记录）。
      const handleRemoveSelected = useCallback(async () => {
        if (!selected) return
        const ok = await mutate('remove', { id: selected })
        if (ok) setSelected(null)
      }, [selected, mutate])

      const handleAddSubtask = useCallback(async (title) => {
        if (!selected) return
        await mutate('subtaskAdd', { id: selected, title })
      }, [selected, mutate])

      const handleToggleSubtask = useCallback(async (sub) => {
        if (!selected) return
        await mutate('subtaskUpdate', { id: selected, subtaskId: sub.id, patch: { done: !sub.done } })
      }, [selected, mutate])

      const handleRemoveSubtask = useCallback(async (sub) => {
        if (!selected) return
        await mutate('subtaskRemove', { id: selected, subtaskId: sub.id })
      }, [selected, mutate])

      const handleSaveSettings = useCallback(async (nextSettings) => {
        setSettings(nextSettings)
      }, [])

      // 收集箱标题：点整行筛到收集箱。
      const handleInboxFilter = () => setActiveFilter('__inbox__')

      // 有改动没落盘时，宿主会在 notices 里回 write-error；这个按钮重试落盘。
      const retryWrite = useCallback(async () => {
        if (retrying) return
        setRetrying(true)
        try {
          await fetchApi('retry', {}, tRef.current)
          await reload()
        } catch (err) {
          console.error('[dsh-sidebar-todo] retry write failed', err)
        } finally {
          if (aliveRef.current) setRetrying(false)
        }
      }, [reload, retrying])

      // 点某天 = 只看那天的计划（再点一次取消）。左栏会显示一枚可清除的胶囊，
      // 免得用户以为待办凭空消失。
      const handleSelectDay = (dayKey) => {
        setDayFilter((prev) => (prev === dayKey ? null : dayKey))
      }

      const items = state.items
      const selectedItem = items.find((item) => item.id === selected) ?? null
      // 通知开关直接反映宿主持久化的设置，不再单独存一份本地状态（否则两者会漂移）。
      const notificationOn = Boolean(settings && settings.notify && settings.notify.system)

      const handleAddToQuadrant = (quadrant) => {
        setDialog({ initial: { quadrant } })
      }

      // 矩阵只显示「未完成 + 已归入象限」的计划；再叠加可选的按天筛选。
      const quadrantItems = useMemo(() => {
        let rows = items.filter((item) => !item.done && item.quadrant)
        if (dayFilter !== null) rows = rows.filter((item) => asText(item.dueDate) === dayFilter)
        return rows
      }, [items, dayFilter])

      const renderCalendarView = () => {
        if (!calendarActive) return null
        return h(CalendarView, {
          t,
          selectedDay: null,
          onPickDay: (key) => {
            setCalendarActive(false)
            handleSelectDay(key)
          },
          version: dataVersion,
        })
      }

      const handleSelect = (id) => {
        setSelected(id)
      }

      // Render
      if (state.loading && items.length === 0) {
        return h('div', { style: S.page }, h('div', { style: S.empty }, t('loading')))
      }

      const activeRailContent = () => {
        if (activeRail === 'view') {
          return calendarActive
            ? renderCalendarView()
            : h('div', { style: S.matrixArea },
                items.filter((i) => !i.done).map((item) => h('div', {
                  key: item.id,
                  className: 'td-todo-row',
                  style: { ...S.todoRow, background: 'var(--dsw-specific-input-major)', marginBottom: 4, padding: '0 12px' },
                  onClick: () => handleSelect(item.id),
                },
                checkHit(
                  () => handleToggle(item),
                  h('span', {
                    role: 'checkbox',
                    'aria-checked': item.done ? 'true' : 'false',
                    'aria-label': asText(item.title),
                    tabIndex: 0,
                    className: 'td-check',
                    style: item.done ? { ...S.todoCheckbox, ...S.todoCheckboxDone } : S.todoCheckbox,
                    onKeyDown: (e) => {
                      if (e.nativeEvent?.isComposing === true) return
                      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); handleToggle(item) }
                    },
                  }, item.done
                    ? h('svg', { width: 9, height: 9, viewBox: '0 0 16 16', fill: 'none', stroke: 'var(--dsw-alias-label-primary-inverted)', strokeWidth: 2.4 },
                        h('path', { d: 'M3.4 8.4 6.2 11l6.4-6.4', strokeLinecap: 'round', strokeLinejoin: 'round' }))
                    : null)),
                h('button', {
                  type: 'button',
                  className: 'td-title',
                  style: S.todoTitle,
                  onClick: (e) => { e.stopPropagation(); handleSelect(item.id) },
                }, asText(item.title)),
                h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary)', flex: 'none' } }, dueLabel(item)))))
        }
        if (activeRail === 'focus') {
          return h('div', { style: { ...S.matrixArea, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--dsw-alias-label-tertiary)', fontSize: 14 } },
            h('div', { style: { fontSize: 48, marginBottom: 12 } }, '⌛'),
            h('div', null, selectedItem ? asText(selectedItem.title) : t('pickOne')))
        }
        // Default: plan (matrix)
        return h(MatrixArea, {
          t,
          items: quadrantItems,
          onSelect: handleSelect,
          selectedId: selected,
          onToggle: handleToggle,
          onAdd: handleAddToQuadrant,
          quadrants: QUADRANTS,
        })
      }

      return h('div', { style: S.page },
        h(TopBar, {
          t,
          onQuickAdd: handleQuickAdd,
          onToggleCalendar: () => { setCalendarActive(!calendarActive); setActiveRail('view') },
          notificationOn,
          calendarActive,
          settings,
          onSettingsChange: handleSaveSettings,
        }),
        h('div', { style: S.mainBody },
          h(LeftRail, {
            t,
            active: activeRail,
            onChange: setActiveRail,
            onAvatarClick: () => {},
          }),
          h(LeftPanel, {
            t,
            activeFilter,
            onFilterChange: (next) => { setActiveFilter(next); setDayFilter(null) },
            categories: state.categories,
            inboxCount: state.inboxCount,
            onNewCategory: () => setCategoryOpen(true),
            onInboxFilter: handleInboxFilter,
            onToggleInboxCollapse: () => setCollapsedInbox((v) => !v),
            collapsedInbox,
            monthCursor,
            onMonthChange: handleMonthChange,
            calendarItems,
            onSelectDay: handleSelectDay,
            dayFilter,
            onClearDayFilter: () => setDayFilter(null),
          }),
          activeRailContent(),
          selectedItem
            ? h(DetailPanel, {
                // key 让切换待办时重建组件：否则上一条的 dirty 状态会跟着复用，
                // 新条目就再也同步不到服务端的值。
                key: selectedItem.id,
                t,
                item: selectedItem,
                categories: state.categories,
                onManageCategories: () => setCategoryOpen(true),
                onAddSubtask: handleAddSubtask,
                onToggleSubtask: handleToggleSubtask,
                onRemoveSubtask: handleRemoveSubtask,
                onSave: handleSaveDetail,
                onRemove: handleRemoveSelected,
              })
            : null),
        state.notices.includes('corrupt') && !noticeHidden
          ? h('div', { style: S.warn },
              h('span', { style: { flex: 1 } }, t('corruptNotice')),
              h('button', {
                type: 'button', className: 'td-btn', style: S.noticeClose,
                'aria-label': t('dismiss'),
                onClick: () => { corruptDismissed = true; setNoticeHidden(true) },
              }, '×'))
          : null,
        state.notices.includes('write-error')
          ? h('div', { style: S.warn },
              h('span', { style: { flex: 1 } }, t('writeNotice')),
              h('button', {
                type: 'button', className: 'td-btn td-elevated',
                disabled: retrying,
                style: { ...S.addBtn, height: 26, padding: '0 8px', flex: 'none', cursor: retrying ? 'default' : 'pointer' },
                onClick: () => void retryWrite(),
              }, retrying ? t('loading') : t('retryWrite')))
          : null,
        actionError ? h('div', { role: 'alert', style: S.error }, t('actionFailed')) : null,
        state.error ? h('div', { style: S.error }, `${t('failed')}　`,
          h('button', {
            type: 'button',
            className: 'td-btn',
            style: { padding: '1px 8px', border: 'none', borderRadius: 4, color: 'inherit', fontSize: 12, cursor: 'pointer', background: 'transparent' },
            onClick: () => void reload(),
          }, t('retry'))) : null,
        dialog !== null
          ? h(TodoDialog, {
              t,
              initial: dialog.initial,
              mutate,
              onClose: () => setDialog(null),
              onSaved: () => setDialog(null),
              onManageCategories: () => setCategoryOpen(true),
              escSuspended: categoryOpen,
            })
          : null,
        categoryOpen
          ? h(CategoryDialog, {
              t,
              onClose: () => setCategoryOpen(false),
              onChanged: reload,
            })
          : null,
      )
    }

    function TodoDialog({ t, initial, mutate, onClose, onSaved, onManageCategories, escSuspended }) {
      const editing = initial !== null && initial !== undefined && initial.id !== null && initial.id !== undefined
      const [form, setForm] = useState(() => ({
        id: editing ? initial.id : null,
        title: editing ? asText(initial.title) : '',
        note: editing ? asText(initial.note) : '',
        dueDate: editing ? asText(initial.dueDate) : (asText(initial?.dueDate) || dateKeyOf(new Date())),
        dueTime: editing ? asText(initial.dueTime) : '',
        priority: editing && ['high', 'medium', 'low'].includes(initial.priority) ? initial.priority : null,
        category: editing ? asText(initial.category) : '',
        quadrant: editing && QUADRANT_MAP[initial.quadrant] ? initial.quadrant : (initial?.quadrant ?? null),
        repeatFreq: initial?.repeat?.freq ?? '',
        weekdays: initial?.repeat?.weekdays ?? [],
        monthDay: initial?.repeat?.monthDay ?? new Date().getDate(),
        until: initial?.repeat?.until ?? '',
      }))
      const [quick, setQuick] = useState('')
      const [error, setError] = useState(null)
      const [saving, setSaving] = useState(false)
      const [categoryRows, setCategoryRows] = useState([])

      const alive = useRef(true)
      const seq = useRef(0)
      const closeRef = useRef(onClose)

      useEffect(() => {
        alive.current = true
        return () => { alive.current = false }
      }, [])

      useEffect(() => { closeRef.current = onClose }, [onClose])

      useEffect(() => {
        let cancelled = false
        fetchApi('categories', {}, t)
          .then((result) => {
            if (cancelled || !alive.current) return
            setCategoryRows(normalizeCategories(result))
          })
          .catch((err) => console.error('[dsh-sidebar-todo] categories failed', err))
        return () => { cancelled = true }
      }, [])

      useEffect(() => {
        if (escSuspended) return undefined
        const onKeyDown = (event) => {
          if (event.key !== 'Escape') return
          event.stopPropagation?.()
          closeRef.current()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [escSuspended])

      useEffect(() => {
        const current = ++seq.current
        if (quick.trim() === '') return undefined
        const timer = window.setTimeout(() => {
          fetchApi('parse', { text: quick })
            .then((parsed) => {
              if (!alive.current || current !== seq.current) return
              setForm((prev) => ({
                ...prev,
                title: parsed.title || prev.title,
                dueDate: parsed.dueDate || prev.dueDate,
                dueTime: parsed.dueTime || prev.dueTime,
                priority: parsed.priority ?? prev.priority,
                category: parsed.category || prev.category,
                quadrant: parsed.quadrant ?? prev.quadrant,
              }))
            })
            .catch(() => {})
        }, 200)
        return () => window.clearTimeout(timer)
      }, [quick])

      const submit = async () => {
        if (saving) return
        const title = form.title.trim()
        if (title === '') {
          setError(t('titleRequired'))
          return
        }
        if (form.repeatFreq === 'weekly' && form.weekdays.length === 0) {
          setError(t('weekdaysRequired'))
          return
        }
        const category = form.category.trim()
        const payload = {
          title,
          note: form.note,
          dueDate: form.dueDate || null,
          dueTime: form.dueTime || null,
          priority: form.priority || null,
          category: category === '' ? null : category,
          quadrant: form.quadrant || null,
          repeat: form.repeatFreq === ''
            ? null
            : form.repeatFreq === 'weekly'
              ? { freq: 'weekly', weekdays: form.weekdays }
              : form.repeatFreq === 'monthly'
                ? { freq: 'monthly', monthDay: form.monthDay }
                : { freq: 'daily' },
        }
        if (form.until !== '' && payload.repeat !== null) payload.repeat.until = form.until
        setError(null)
        setSaving(true)
        try {
          const ok = form.id === null
            ? await mutate('create', payload)
            : await mutate('update', { id: form.id, patch: payload })
          if (!ok) {
            setError(t('requestFailed'))
            return
          }
          onSaved()
        } catch (err) {
          setError(err instanceof Error && err.message ? err.message : t('requestFailed'))
        } finally {
          if (alive.current) setSaving(false)
        }
      }

      const modeLabel = t(editing ? 'dialogEdit' : 'dialogNew')

      return h('div', {
        className: 'td-overlay',
        style: S.overlay,
        onClick: (event) => { if (event.target === event.currentTarget) onClose() },
      },
      h('div', { className: 'td-dialog', style: S.dialog, role: 'dialog', 'aria-modal': 'true', 'aria-label': modeLabel },
        h('div', { style: S.dialogHead }, modeLabel),
        h('div', { style: { marginBottom: 12 } },
          h('input', {
            className: 'td-input',
            style: { ...S.input, width: '100%', boxSizing: 'border-box' },
            value: quick, placeholder: t('quickFill'), 'aria-label': t('quickFill'),
            onChange: (e) => setQuick(e.target.value),
          }),
          h('div', { style: S.hint }, t('quickHint'))),

        h('label', { style: S.field },
          h('span', { style: S.fieldLabel }, t('fieldTitle')),
          h('input', {
            className: 'td-input',
            autoFocus: true, style: S.input, value: form.title,
            onChange: (e) => setForm((prev) => ({ ...prev, title: e.target.value })),
            onKeyDown: (e) => {
              if (e.nativeEvent?.isComposing === true) return
              if (e.key === 'Enter') void submit()
            },
          })),

        h('label', { style: S.field },
          h('span', { style: S.fieldLabel }, t('fieldNote')),
          h('textarea', {
            className: 'td-input',
            rows: 3, style: S.textarea, value: form.note,
            onChange: (e) => setForm((prev) => ({ ...prev, note: e.target.value })),
          })),

        h('div', { style: S.fieldRow },
          h('div', { style: S.field },
            h('span', { style: S.fieldLabel }, t('fieldDate')),
            h(DateField, {
              t,
              value: form.dueDate,
              onChange: (next) => setForm((prev) => ({ ...prev, dueDate: next })),
            })),
          h('div', { style: S.field },
            h('span', { style: S.fieldLabel }, t('fieldTime')),
            h(TimeField, {
              t,
              value: form.dueTime,
              onChange: (next) => setForm((prev) => ({ ...prev, dueTime: next })),
            }))),

        h('div', { style: S.field },
          h('span', { style: S.fieldLabel }, t('fieldPriority')),
          h('div', { style: S.seg },
            [['high', 'priorityHigh'], ['medium', 'priorityMedium'], ['low', 'priorityLow']].map(([value, key]) =>
              h('button', {
                key: value, type: 'button',
                className: 'td-btn',
                'aria-pressed': form.priority === value ? 'true' : 'false',
                style: { ...S.segItem, ...(form.priority === value ? S.segItemOn : null) },
                onClick: () => setForm((prev) => ({
                  ...prev,
                  priority: prev.priority === value ? null : value,
                })),
              }, t(key))))),

        h('div', { style: S.field },
          h('span', { style: S.fieldLabel }, t('fieldCategory')),
          h(CategoryCombo, {
            t,
            value: form.category,
            categories: categoryRows,
            onChange: (next) => setForm((prev) => ({ ...prev, category: next })),
            onManage: onManageCategories,
          })),

        h('label', { style: S.field },
          h('span', { style: S.fieldLabel }, t('fieldRepeat')),
          h('select', {
            className: 'td-input',
            style: S.input,
            value: form.repeatFreq,
            onChange: (e) => setForm((prev) => ({ ...prev, repeatFreq: e.target.value })),
          },
          [['', 'repeatNone'], ['daily', 'repeatDaily'], ['weekly', 'repeatWeekly'], ['monthly', 'repeatMonthly']].map(([value, key]) =>
            h('option', { key: value === '' ? 'none' : value, value }, t(key))))),

        form.repeatFreq === 'weekly'
          ? h('div', { style: S.field },
              h('span', { style: S.fieldLabel }, t('fieldWeekdays')),
              h('div', { style: S.seg }, WEEKDAY_OPTIONS.map(([key, iso]) =>
                h('button', {
                  key: iso, type: 'button', className: 'td-btn',
                  'aria-pressed': form.weekdays.includes(iso) ? 'true' : 'false',
                  style: { ...S.segItem, ...(form.weekdays.includes(iso) ? S.segItemOn : null) },
                  onClick: () => setForm((prev) => ({
                    ...prev,
                    weekdays: prev.weekdays.includes(iso)
                      ? prev.weekdays.filter((day) => day !== iso)
                      : [...prev.weekdays, iso],
                  })),
                }, t(key)))))
          : null,

        form.repeatFreq === 'monthly'
          ? h('label', { style: S.field },
              h('span', { style: S.fieldLabel }, t('fieldMonthDay')),
              h('select', {
                className: 'td-input',
                style: S.input,
                value: String(form.monthDay),
                onChange: (e) => setForm((prev) => ({ ...prev, monthDay: Number(e.target.value) })),
              }, MONTH_DAYS.map((day) => h('option', { key: day, value: String(day) }, String(day)))))
          : null,

        form.repeatFreq !== ''
          ? h('div', { style: S.field },
              h('span', { style: S.fieldLabel }, t('fieldUntil')),
              h(DateField, {
                t,
                value: form.until,
                onChange: (next) => setForm((prev) => ({ ...prev, until: next })),
              }))
          : null,

        error !== null ? h('div', { style: S.dialogError }, error) : null,
        h('div', { style: S.dialogFoot },
          h('button', { type: 'button', className: 'td-btn', style: S.btnGhost, onClick: onClose, disabled: saving }, t('cancel')),
          h('button', { type: 'button', className: 'td-primary', style: S.btnPrimary, onClick: () => void submit(), disabled: saving }, t('save'))),
      ))
    }

    function TodoIcon({ size = 16 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 16 16', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.4, 'aria-hidden': true,
      },
      h('rect', { x: 2.4, y: 2.4, width: 11.2, height: 11.2, rx: 2.4 }),
      h('path', { d: 'M5.4 8.2l1.9 1.9 3.4-3.6', strokeLinecap: 'round', strokeLinejoin: 'round' }))
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.effect(() => ensureStyles(), 'dsh-sidebar-todo: styles')

        const locale = ctx.get('locale')
        let t = (key) => dict.zh[key] ?? key
        if (locale) {
          ctx.effect(() => locale.register(NS, dict), 'dsh-sidebar-todo: dictionaries')
          t = locale.bind(NS)
        }

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: 'todo', order: 20,
          label: () => t('nav'), locale: NS, inject: () => ({ t }),
        }, ({ size } = {}) => h(TodoIcon, { size: size ?? 16 })))

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: 'todo', locale: NS, inject: () => ({ t }),
        }, TodoPage))

        // 通知轮询挂在插件层：面板开着才轮询，等于「盯着看的时候才有提醒」。
        ctx.effect(() => startNotificationWatch(() => t), 'dsh-sidebar-todo: notify-watch')
      },
    }
  },
})
