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
        stats: '统计', statsUndone: '未完成', statsTotal: '共 {count} 项', statsAllDone: '这个周期都完成了',
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
        category: '分类', noCategory: '无分类', categoryEmpty: '暂无分类', categoryNamePlaceholder: '分类名称',
        categoryCount: '{count} 条',
        dialogNew: '新建待办', dialogEdit: '编辑待办',
        fieldTitle: '标题', fieldNote: '备注', fieldDate: '日期', fieldTime: '时间',
        fieldPriority: '优先级', fieldCategory: '分类',
        fieldRepeat: '重复', repeatNone: '不循环', repeatDaily: '每日', repeatWeekly: '每周', repeatMonthly: '每月',
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
        plan: '做计划', view: '月视图', focus: '周视图',
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
        subtaskPlaceholder: '输入子计划…',
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
        inboxCount: '收集箱 {count}',
        quadrantCount: '{count} 条',
        noTodos: '暂无待办', noSubtasks: '暂无子计划',
        saveSuccess: '已保存', saveFail: '保存失败',
        settingsSaved: '设置已保存',
        quietStart: '开始', quietEnd: '结束',
        weekdays: '星期', monthDay: '每月几号', until: '结束日期',
        confirm: '确认', add: '添加', delete: '删除',
        // --- 周视图 / 时间段 ---
        weekPrefix: '周', weekRange: '{from} – {to}',
        weekDayFull: '{y}年{m}月{d}日', weekDayShort: '{m}月{d}日', weekDateShort: '{m}/{d}',
        prevWeek: '上一周', nextWeek: '下一周',
        allDay: '全天', nowLine: '现在',
        timeRange: '时间段', timeStart: '开始', timeEnd: '结束',
        timeRangeInvalid: '结束时间必须晚于开始时间',
        // 周视图拖拽：块整体拖动 / 拖底边改时长 / 方向键等价操作
        rescheduleHint: '拖动可调整时间，拖底部边缘可改时长（每次 30 分钟）',
        resizeHint: '拖动调整时长',
        // --- v4: 时间单一化 / 完成期限 / 超期处理 / 重复 ---
        timePoint: '时间点', propertyTime: '时间',
        deadlineAt: '时限 {time}',
        dueDialogTitle: '设置计划完成期限',
        dueThisWeek: '本周内完成', dueThisWorkWeek: '本周工作日内完成', dueCustom: '自定义完成期限',
        dueCustomRequired: '请先选择自定义完成期限的日期',
        overdueSection: '超过期限未完成', onOverdueNone: '无操作', onOverdueAbandon: '标记为放弃', abandonedTag: '已放弃',
        repeatDialogTitle: '设置重复规则', repeatNonePill: '无重复',
        repeatYearly: '每年', repeatEbbinghaus: '艾宾浩斯记忆曲线', repeatWorkday: '法定工作日',
        repeatTabDate: '日期', repeatTabWeekday: '星期', repeatEnd: '结束重复',
        repeatWorkdayHint: '「法定工作日」当前按周一至周五计算；暂无节假日数据。',
      },
      en: {
        nav: 'To-do', title: 'To-do', new: 'New', search: 'Search',
        today: 'Today', overdue: 'Overdue', tomorrow: 'Tomorrow', week: 'This week', month: 'This month', later: 'Later', stale: 'Backlog',
        unplanned: 'Unscheduled', done: 'Completed', doneEmpty: 'No completions in this range', empty: 'No todos yet',
        stats: 'Stats', statsUndone: 'Not done', statsTotal: '{count} total', statsAllDone: 'All done for this period',
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
        category: 'Category', noCategory: 'No category', categoryEmpty: 'No categories', categoryNamePlaceholder: 'Category name',
        categoryCount: '{count} items',
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
        plan: 'Plan', view: 'Month view', focus: 'Week view',
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
        subtaskPlaceholder: 'Enter subtask…',
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
        inboxCount: 'Inbox {count}',
        quadrantCount: '{count} items',
        noTodos: 'No todos', noSubtasks: 'No subtasks',
        saveSuccess: 'Saved', saveFail: 'Save failed',
        settingsSaved: 'Settings saved',
        quietStart: 'Start', quietEnd: 'End',
        weekdays: 'Weekdays', monthDay: 'Day of month', until: 'Until',
        confirm: 'Confirm', add: 'Add', delete: 'Delete',
        // --- Week view / time range ---
        weekPrefix: '', weekRange: '{from} – {to}',
        weekDayFull: '{m}/{d}/{y}', weekDayShort: '{m}/{d}', weekDateShort: '{m}/{d}',
        prevWeek: 'Previous week', nextWeek: 'Next week',
        allDay: 'All day', nowLine: 'Now',
        timeRange: 'Time range', timeStart: 'Start', timeEnd: 'End',
        timeRangeInvalid: 'End time must be after start time',
        // Week view drag: move the block / drag the bottom edge to resize / arrow keys
        rescheduleHint: 'Drag to move, drag the bottom edge to resize (30-minute steps)',
        resizeHint: 'Drag to resize',
        // --- v4: single time source / due presets / overdue handling / repeat ---
        timePoint: 'Time point', propertyTime: 'Time',
        deadlineAt: 'Due at {time}',
        dueDialogTitle: 'Set planned due date',
        dueThisWeek: 'By the end of this week', dueThisWorkWeek: 'By the end of this work week', dueCustom: 'Custom due date',
        dueCustomRequired: 'Pick a date for the custom due date first',
        overdueSection: 'If not completed in time', onOverdueNone: 'No action', onOverdueAbandon: 'Mark as abandoned', abandonedTag: 'Abandoned',
        repeatDialogTitle: 'Repeat rule', repeatNonePill: 'Never',
        repeatYearly: 'Yearly', repeatEbbinghaus: 'Ebbinghaus curve', repeatWorkday: 'Workdays',
        repeatTabDate: 'Date', repeatTabWeekday: 'Weekday', repeatEnd: 'End repeat',
        repeatWorkdayHint: 'Workdays currently means Monday–Friday; no holiday data is available yet.',
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

    // --- Icons ---
    // 图标来自 Bootstrap Icons（MIT）。路径原样取自 https://github.com/twbs/icons
    // 许可证见 THIRD-PARTY-NOTICES.md。16x16、fill=currentColor。
    const ICONS = {
      // grid-3x3-gap-fill — 2x2 象限矩阵入口
      plan: ['M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM1 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z'],
      // calendar3 — 月视图 / 日历
      calendar: [
        'M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857z',
        'M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
      ],
      // calendar-week-fill — 周视图
      week: ['M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M9.5 7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5m3 0h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5M2 10.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5'],
      // bell-fill — 通知
      bell: ['M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901'],
      // inbox — 收集箱 / 空状态
      inbox: ['M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4zm9.954 5H10.45a2.5 2.5 0 0 1-4.9 0H1.066l.32 2.562a.5.5 0 0 0 .497.438h12.234a.5.5 0 0 0 .496-.438zM3.809 3.563A1.5 1.5 0 0 1 4.981 3h6.038a1.5 1.5 0 0 1 1.172.563l3.7 4.625a.5.5 0 0 1 .105.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374z'],
      // circle — 「全部」
      circle: ['M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16'],
      // slash-circle — 「无分类」
      slashCircle: [
        'M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16',
        'M11.354 4.646a.5.5 0 0 0-.708 0l-6 6a.5.5 0 0 0 .708.708l6-6a.5.5 0 0 0 0-.708',
      ],
      // tag-fill — 分类
      tag: ['M2 1a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 6.586 1zm4 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0'],
      // chevron-down — 选择器展开指示
      chevronDown: ['M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708'],
      // chevron-left / chevron-right — 上/下个月、上/下一周
      chevronLeft: ['M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0'],
      chevronRight: ['M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708'],
      // plus-lg — 新建
      plus: ['M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2'],
      // pie-chart-fill — 周/月统计卡的抬头
      chart: ['M15.985 8.5H8.207l-5.5 5.5a8 8 0 0 0 13.277-5.5zM2 13.292A8 8 0 0 1 7.5.015v7.778zM8.5.015V7.5h7.485A8 8 0 0 0 8.5.015'],
      // x-lg — 关闭 / 清除
      x: ['M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z'],
      // check2-square — 侧栏「待办」入口
      todo: [
        'M3 14.5A1.5 1.5 0 0 1 1.5 13V3A1.5 1.5 0 0 1 3 1.5h8a.5.5 0 0 1 0 1H3a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V8a.5.5 0 0 1 1 0v5a1.5 1.5 0 0 1-1.5 1.5z',
        'm8.354 10.354 7-7a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0',
      ],
      // check-lg — 复选框勾
      check: ['M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z'],
      // clipboard-x — 空象限
      clipboardX: [
        'M6.146 7.146a.5.5 0 0 1 .708 0L8 8.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 9l1.147 1.146a.5.5 0 0 1-.708.708L8 9.707l-1.146 1.147a.5.5 0 0 1-.708-.708L7.293 9 6.146 7.854a.5.5 0 0 1 0-.708',
        'M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z',
        'M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z',
      ],
    }

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
    // 周视图的几何常量：小时高度、左侧时间轴宽度、星期表头高度。
    // 表头是 sticky 的，weekAllDayRow 的 top 必须正好等于表头高度，否则会错位。
    const HOUR_PX = 48
    const WEEK_GUTTER = 56
    const WEEK_HEAD_H = 44
    // 周视图时间块的拖拽：每 30 分钟为一档（24px），移动超过这个像素数才算拖拽，否则算点击。
    const SNAP_MIN = 30
    const DRAG_SLOP_PX = 3
    // 只给了 startTime 的「时间点」排期没有真实时长，按 60 分钟参与拖拽计算（与画块口径一致）。
    const POINT_BLOCK_MIN = 60
    const S = {
      // Main layout
      page: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', fontFamily: 'var(--dsw-font-family, sans-serif)' },
      topBar: { display: 'flex', alignItems: 'center', height: 72, padding: '0 20px', flex: 'none', borderBottom: '0.5px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-specific-input-major)' },
      mainBody: { display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' },
      // Left rail
      leftRail: { width: 120, flex: 'none', background: 'var(--dsw-alias-bg-layer-1)', borderRight: '0.5px solid var(--dsw-alias-border-l2)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 4 },
      railItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 0', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 8, transition: 'background 0.12s', fontSize: 11, color: 'var(--dsw-alias-label-secondary)' },
      railItemActive: { background: 'var(--dsw-specific-input-major)', color: 'var(--dsw-alias-label-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
      railIcon: { display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
      railLabel: { fontSize: 11, lineHeight: 1 },
      railAvatar: { width: 32, height: 32, borderRadius: '50%', background: 'var(--dsw-alias-bg-module-platform)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginTop: 'auto', marginBottom: 12, color: 'var(--dsw-alias-label-tertiary)' },
      // Left panel
      leftPanel: { width: 369, flex: 'none', background: 'var(--dsw-alias-bg-layer-1)', borderRight: '0.5px solid var(--dsw-alias-border-l2)', display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' },
      panelSection: { padding: '12px 16px', borderBottom: '0.5px solid var(--dsw-alias-border-l2)' },
      // Calendar mini
      miniCalendar: { padding: '8px 12px 12px' },
      calendarHead: { display: 'flex', alignItems: 'center', gap: 4, height: 28, marginBottom: 4 },
      calendarTitle: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600 },
      calendarBtn: { width: 24, height: 24, padding: 0, border: 'none', borderRadius: 4, color: 'var(--dsw-alias-label-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'transparent' },
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
      categoryIcon: { flex: 'none', width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' },
      categoryName: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      categoryCount: { flex: 'none', fontSize: 11, color: 'var(--dsw-alias-label-tertiary)' },
      newCategoryBtn: { display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 12px', margin: '8px 12px', borderRadius: 6, border: '0.5px dashed var(--dsw-alias-border-l3)', background: 'transparent', color: 'var(--dsw-alias-label-tertiary)', fontSize: 12, cursor: 'pointer', justifyContent: 'center' },
      // 「+ 新建分类」就地展开的一行输入：不再走旧的「管理分类」弹窗。
      newCategoryBox: { display: 'flex', flexDirection: 'column', gap: 4, margin: '0 12px 8px' },
      newCategoryRow: { display: 'flex', alignItems: 'center', gap: 6 },
      newCategoryInput: { flex: 1, minWidth: 0, height: 30, boxSizing: 'border-box', padding: '0 8px', borderRadius: 6, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', fontSize: 12.5, fontFamily: 'inherit' },
      newCategoryConfirm: { flex: 'none', height: 30, padding: '0 10px', borderRadius: 6, border: 'none', background: 'var(--dsw-alias-state-business-primary)', color: 'var(--dsw-alias-label-primary-inverted)', fontSize: 12, cursor: 'pointer' },
      newCategoryError: { fontSize: 11, lineHeight: '15px', color: 'var(--dsw-alias-state-error-primary)' },
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
      todoTitle: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 },
      todoTitleDone: { textDecoration: 'line-through', color: 'var(--dsw-alias-label-tertiary)' },
      // Detail panel
      detailPanel: { width: 497, flex: 'none', background: 'var(--dsw-specific-input-major)', borderLeft: '0.5px solid var(--dsw-alias-border-l2)', display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' },
      detailHeader: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '20px 20px 12px' },
      detailIcon: { width: 24, height: 24, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
      detailTitleInput: { flex: 1, fontSize: 18, fontWeight: 600, border: 'none', background: 'transparent', color: 'var(--dsw-alias-label-primary)', fontFamily: 'inherit', outline: 'none', padding: 0, lineHeight: '28px' },
      detailSection: { padding: '0 20px 12px' },
      subtaskList: { display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 },
      subtaskRow: { display: 'flex', alignItems: 'center', gap: 8, minHeight: 30, padding: '0 4px', borderRadius: 4 },
      subtaskInput: { flex: 1, height: 28, background: 'transparent', color: 'var(--dsw-alias-label-primary)', fontSize: 13, fontFamily: 'inherit', outline: 'none', padding: '0 8px', borderRadius: 4 },
      subtaskDeleteBtn: { width: 22, height: 22, padding: 0, border: 'none', borderRadius: 4, background: 'transparent', color: 'var(--dsw-alias-label-tertiary)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
      noteTextarea: { width: '100%', minHeight: 100, borderRadius: 6, background: 'var(--dsw-specific-input-major)', color: 'var(--dsw-alias-label-primary)', fontSize: 13, fontFamily: 'inherit', padding: 10, resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: '20px' },
      divider: { height: '0.5px', background: 'var(--dsw-alias-border-l2)', margin: '12px 20px' },
      propertyRow: { display: 'flex', alignItems: 'center', height: 38, padding: '0 4px', cursor: 'pointer', borderRadius: 4, transition: 'background 0.12s' },
      propertyLabel: { width: 80, flex: 'none', fontSize: 13, color: 'var(--dsw-alias-label-tertiary)' },
      propertyValue: { flex: 1, fontSize: 13, color: 'var(--dsw-alias-label-primary)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      propertyChevron: { flex: 'none', display: 'flex', alignItems: 'center', color: 'var(--dsw-alias-label-tertiary)', marginLeft: 4 },
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
      noticeClose: { flex: 'none', width: 20, height: 20, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 4, color: 'inherit', cursor: 'pointer' },
      // Category combo
      popEmpty: { padding: '8px', fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' },
      popList: { maxHeight: 208, overflowY: 'auto' },
      popItem: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: 30, padding: '0 8px', border: 'none', borderRadius: 6, color: 'var(--dsw-alias-label-primary)', fontSize: 12.5, cursor: 'pointer', textAlign: 'left', background: 'transparent' },
      popCount: { marginLeft: 'auto', flex: 'none', fontSize: 11, color: 'var(--dsw-alias-label-tertiary)' },
      popSep: { height: '0.5px', margin: 4, background: 'var(--dsw-alias-border-l2)' },
      popCreate: { display: 'flex', alignItems: 'center', width: '100%', height: 30, padding: '0 8px', border: 'none', borderRadius: 6, color: 'var(--dsw-alias-state-business-primary)', fontSize: 12.5, cursor: 'pointer', textAlign: 'left', background: 'transparent' },
      popCreateRow: { display: 'flex', alignItems: 'center', gap: 6 },
      popCreateInput: { flex: 1, minWidth: 0, height: 28, boxSizing: 'border-box', padding: '0 8px', borderRadius: 6, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', fontSize: 12.5, fontFamily: 'inherit' },
      popCreateConfirm: { flex: 'none', height: 28, padding: '0 10px', borderRadius: 6, border: 'none', background: 'var(--dsw-alias-state-business-primary)', color: 'var(--dsw-alias-label-primary-inverted)', fontSize: 12, cursor: 'pointer' },
      popCreateError: { padding: '4px 4px 0', fontSize: 11, lineHeight: '15px', color: 'var(--dsw-alias-state-error-primary)' },
      comboClear: { position: 'absolute', top: 0, right: 0, width: 30, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 8, color: 'var(--dsw-alias-label-tertiary)', cursor: 'pointer', background: 'transparent' },
      // Picker
      pickerTrigger: { width: '100%', height: 32, boxSizing: 'border-box', padding: '0 10px', borderRadius: 8, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left', cursor: 'pointer' },
      pickerPlaceholder: { color: 'var(--dsw-alias-label-tertiary)' },
      pickerIcon: { flex: 'none', display: 'flex', alignItems: 'center', color: 'var(--dsw-alias-label-tertiary)' },
      pickerHead: { display: 'flex', alignItems: 'center', gap: 2, height: 28 },
      pickerTitle: { flex: 1, minWidth: 0, textAlign: 'center', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--dsw-alias-label-primary)' },
      pickerIconBtn: { flex: 'none', width: 26, height: 26, padding: 0, border: 'none', borderRadius: 6, color: 'var(--dsw-alias-label-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'transparent' },
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
      // v4：完成期限弹窗（单选行）+ 重复弹窗（频率胶囊 / 日期格 / 结束重复行）
      radioRow: { display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 4px', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: 'var(--dsw-alias-label-primary)' },
      radioInput: { flex: 'none', width: 14, height: 14, margin: 0, cursor: 'pointer', accentColor: 'var(--dsw-alias-state-business-primary)' },
      dialogSectionLabel: { marginTop: 12, marginBottom: 2, fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' },
      duePickerBody: { marginTop: 6, marginBottom: 2 },
      repeatPillRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
      repeatPill: { height: 30, padding: '0 12px', borderRadius: 15, border: '0.5px solid var(--dsw-alias-border-l3)', background: 'transparent', color: 'var(--dsw-alias-label-secondary)', fontSize: 12.5, cursor: 'pointer', whiteSpace: 'nowrap' },
      repeatPillOn: { border: '0.5px solid transparent', background: 'var(--dsw-alias-state-business-primary)', color: 'var(--dsw-alias-label-primary-inverted)' },
      repeatDayGrid: { display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4, marginTop: 8 },
      repeatDay: { height: 30, padding: 0, border: 'none', borderRadius: 6, background: 'transparent', color: 'var(--dsw-alias-label-primary)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
      repeatDayOn: { background: 'var(--dsw-alias-state-business-primary)', color: 'var(--dsw-alias-label-primary-inverted)' },
      untilRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '0.5px solid var(--dsw-alias-border-l2)' },
      powerBtn: { flex: 'none', width: 30, height: 30, padding: 0, borderRadius: 8, border: '0.5px solid var(--dsw-alias-border-l3)', background: 'transparent', color: 'var(--dsw-alias-label-tertiary)', fontSize: 15, lineHeight: '28px', textAlign: 'center', cursor: 'pointer' },
      powerBtnOn: { border: '0.5px solid transparent', background: 'var(--dsw-alias-state-business-primary)', color: 'var(--dsw-alias-label-primary-inverted)' },
      untilLabel: { flex: 'none', fontSize: 13, color: 'var(--dsw-alias-label-primary)' },
      untilValue: { flex: 'none', minWidth: 96, fontSize: 12.5, color: 'var(--dsw-alias-label-secondary)', textAlign: 'right' },
      untilClear: { flex: 'none', width: 26, height: 26, padding: 0, border: 'none', borderRadius: 6, background: 'transparent', color: 'var(--dsw-alias-label-tertiary)', fontSize: 14, lineHeight: '26px', textAlign: 'center', cursor: 'pointer' },
      untilField: { flex: 'none', width: 150 },
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
      // Week view（周视图：7 列 × 0-24 时段）
      weekView: { flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '12px 16px 16px', overflow: 'hidden' },
      weekNav: { display: 'flex', alignItems: 'center', gap: 6, height: 32, marginBottom: 8, flex: 'none' },
      weekNavTitle: { flex: 1, minWidth: 0, textAlign: 'center', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
      weekScroll: { flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', border: '0.5px solid var(--dsw-alias-border-l2)', borderRadius: 'var(--dsw-radius-md)', background: 'var(--dsw-specific-input-major)' },
      weekHeadRow: { display: 'flex', position: 'sticky', top: 0, zIndex: 3, height: WEEK_HEAD_H, boxSizing: 'border-box', flex: 'none', background: 'var(--dsw-alias-bg-layer-1)', borderBottom: '0.5px solid var(--dsw-alias-border-l2)' },
      weekAllDayRow: { display: 'flex', position: 'sticky', top: WEEK_HEAD_H, zIndex: 2, boxSizing: 'border-box', flex: 'none', minHeight: 28, background: 'var(--dsw-alias-bg-layer-1)', borderBottom: '0.5px solid var(--dsw-alias-border-l2)' },
      weekGutter: { width: WEEK_GUTTER, flex: 'none', boxSizing: 'border-box' },
      weekAllDayLabel: { width: WEEK_GUTTER, flex: 'none', boxSizing: 'border-box', padding: '4px 6px 0 0', textAlign: 'right', fontSize: 10, lineHeight: '13px', color: 'var(--dsw-alias-label-tertiary)' },
      weekDayCol: { flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, borderLeft: '0.5px solid var(--dsw-alias-border-l2)' },
      weekDayName: { fontSize: 11.5, fontWeight: 600, color: 'var(--dsw-alias-label-secondary)', lineHeight: '14px' },
      weekDayDate: { fontSize: 10.5, color: 'var(--dsw-alias-label-tertiary)', lineHeight: '13px' },
      weekDayToday: { color: 'var(--dsw-alias-state-business-primary)' },
      weekAllDayCol: { flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, padding: 3, boxSizing: 'border-box', borderLeft: '0.5px solid var(--dsw-alias-border-l2)' },
      weekChip: { display: 'block', width: '100%', boxSizing: 'border-box', padding: '1px 4px', borderRadius: 4, fontSize: 10.5, lineHeight: '15px', color: 'var(--dsw-alias-label-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' },
      weekGrid: { display: 'flex', position: 'relative' },
      weekHourCol: { width: WEEK_GUTTER, flex: 'none' },
      weekHourLabel: { height: HOUR_PX, boxSizing: 'border-box', paddingRight: 6, textAlign: 'right', fontSize: 10, lineHeight: '11px', color: 'var(--dsw-alias-label-tertiary)' },
      weekDayStrip: { flex: '1 1 0', minWidth: 0, position: 'relative', borderLeft: '0.5px solid var(--dsw-alias-border-l2)' },
      weekBlock: { position: 'absolute', boxSizing: 'border-box', borderRadius: 4, padding: '2px 4px', fontSize: 10.5, lineHeight: '13px', overflow: 'hidden', cursor: 'pointer', color: 'var(--dsw-alias-label-primary)' },
      // 时间块底部 ~6px 的缩放热区：默认几乎透明，悬停/拖动时才显出一条 grip。
      weekResize: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 9, maxHeight: '40%', cursor: 'ns-resize', touchAction: 'none' },
      weekBlockDragging: { zIndex: 5, boxShadow: 'var(--dsw-elevation-panel)' },
      weekNowLine: { position: 'absolute', left: 0, right: 0, height: 2, zIndex: 4, pointerEvents: 'none', background: 'var(--dsw-alias-state-error-primary)' },
      // 统计是左栏独立的一屏：两张卡并排，窄面板下自动换行。
      statsPane: { flex: 1, minWidth: 0, minHeight: 0, overflowY: 'auto', paddingTop: 16 },
      statsWrap: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, padding: '0 16px 16px' },
      statsCard: { display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 8, border: '0.5px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', minWidth: 0 },
      statsHead: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-secondary)' },
      statsTotal: { marginLeft: 'auto', fontSize: 11, fontWeight: 400, color: 'var(--dsw-alias-label-tertiary)' },
      statsBody: { display: 'flex', alignItems: 'center', gap: 14 },
      statsLegend: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 },
      statsRow: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 },
      statsSwatch: { width: 8, height: 8, borderRadius: 2, flex: 'none' },
      statsLabel: { color: 'var(--dsw-alias-label-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      statsCount: { marginLeft: 'auto', fontWeight: 600, color: 'var(--dsw-alias-label-primary)' },
      // 每列：环形卡片 + 该周期的未完成清单。清单行直接复用 TodoRow，
      // 所以勾选/选中的行为和矩阵完全一致。
      statsCol: { display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 },
      statsListCard: { display: 'flex', flexDirection: 'column', borderRadius: 8, border: '0.5px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', overflow: 'hidden', minWidth: 0 },
      statsListHead: { display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: '0.5px solid var(--dsw-alias-border-l2)', fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-secondary)' },
      statsListBody: { overflowY: 'auto', maxHeight: 380, padding: '6px 8px' },
      statsEmpty: { padding: '28px 8px', textAlign: 'center', fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' },
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

/* 周视图的块/胶囊：键盘可达，但不能带 role=button（保持行内 checkbox 可读） */
.td-week-item { transition: filter .12s ease; }
.td-week-item:hover { filter: brightness(1.12); }
.td-week-item:focus { outline: none; }
.td-week-item:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--dsw-alias-state-business-primary); }

/* 时间块底部的缩放 grip：平时只有一条极淡的线，悬停/键盘聚焦时才明显 */
.td-week-resize::after {
  content: '';
  position: absolute;
  left: 30%;
  right: 30%;
  bottom: 1px;
  height: 2px;
  border-radius: 1px;
  background: currentColor;
  opacity: .22;
  transition: opacity .12s ease;
}
.td-week-item:hover .td-week-resize::after,
.td-week-item:focus-visible .td-week-resize::after { opacity: .6; }
.td-week-resize:hover::after { opacity: .85; }

@media (prefers-reduced-motion: reduce) {
  .td-overlay, .td-dialog, .td-btn, .td-primary, .td-input, .td-row, .td-pop, .td-notify-pop, .td-rail-btn, .td-quadrant-card, .td-todo-row, .td-week-item { animation: none; transition: none; }
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

    // 周视图沿用月历那套日期工具，不再自己推一遍周边界：先算 ISO 星期几，再回退到周一。
    function mondayOfKey(key) {
      const at = parseDateKey(key)
      if (at === null) return dateKeyOf(new Date())
      return shiftKeyLocal(key, -(isoWeekday(at) - 1))
    }

    function weekDayKeys(mondayKey) {
      const keys = []
      for (let index = 0; index < 7; index += 1) keys.push(shiftKeyLocal(mondayKey, index))
      return keys
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

    // 时间块用的纯函数：分钟数、日期格式化、以及同一列的重叠分道。
    function minutesOfTime(value) {
      const parts = splitTimeKey(value)
      if (parts === null) return null
      return Number(parts.hour) * 60 + Number(parts.minute)
    }

    function formatWeekDayKey(key, t, full) {
      const at = parseDateKey(key)
      if (at === null) return key
      return String(t(full ? 'weekDayFull' : 'weekDayShort'))
        .replace('{y}', String(at.getFullYear()))
        .replace('{m}', String(at.getMonth() + 1))
        .replace('{d}', String(at.getDate()))
    }

    function formatWeekDateKey(key, t) {
      const at = parseDateKey(key)
      if (at === null) return key
      return String(t('weekDateShort'))
        .replace('{m}', String(at.getMonth() + 1))
        .replace('{d}', String(at.getDate()))
    }

    /**
     * 同一列里的重叠块不能互相盖住：按开始时间排序，逐个塞进第一条空着的道。
     * 返回 { blocks, lanes }，调用方按 lanes 均分列宽。
     * 缺 endTime（或 end <= start）时按 60 分钟画，与产品口径一致。
     */
    function layoutDayBlocks(rows) {
      const blocks = []
      for (const item of rows) {
        // dueTime 在 v4 已废弃且恒为 null，这里只认 startTime。
        const start = minutesOfTime(item.startTime)
        if (start === null) continue
        let end = minutesOfTime(item.endTime)
        if (end === null || end <= start) end = start + 60
        if (end > 24 * 60) end = 24 * 60
        blocks.push({ item, start, end, lane: 0 })
      }
      blocks.sort((a, b) => (a.start - b.start) || (a.end - b.end))
      const laneEnds = []
      for (const block of blocks) {
        let lane = -1
        for (let index = 0; index < laneEnds.length; index += 1) {
          if (laneEnds[index] <= block.start) { lane = index; break }
        }
        if (lane === -1) {
          lane = laneEnds.length
          laneEnds.push(block.end)
        } else {
          laneEnds[lane] = block.end
        }
        block.lane = lane
      }
      return { blocks, lanes: Math.max(1, laneEnds.length) }
    }

    // --- 周视图拖拽/缩放：时间算术（纯函数，无 DOM） ---
    // 一整天 = 1440 分钟；1440 只在写回时出现（"24:00"），read 端 splitTimeKey 仍然只认 00:00–23:59。
    const DAY_MIN = 24 * 60

    function timeOfMinutes(total) {
      const value = Math.round(total)
      if (!Number.isFinite(value) || value < 0 || value > DAY_MIN) return null
      return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
    }

    /** 像素位移 → 30 分钟整数档。 */
    function snapMinutes(deltaPx) {
      return Math.round(Number(deltaPx) / (HOUR_PX / 2)) * SNAP_MIN
    }

    /**
     * 把一次拖拽（或方向键）折算成新的排期。
     *
     * - `mode === 'move'`：start 与 end 同时平移 delta（增量已吸附到 30 分钟）
     * - `mode === 'resize'`：只改 end，且保持「至少 30 分钟」
     * - 只给了 startTime 的时间点排期：没有真实 end，按 60 分钟计算。整体拖动只写回 startTime
     *   （不把它偷偷变成时间段）；拖底边才补上 endTime，等于给它定一个真实时长。
     * - 夹取只在 00:00–24:00 内进行；夹取结果若与拖拽方向相反，按「没动」处理（返回 null）。
     *
     * 返回 `{ startTime, endTime }`（`endTime` 为 null = 保持「时间点」），或 `null` 表示
     * 这一步没有产生任何变化、调用方应跳过提交。
     */
    function rescheduleTimes(item, mode, deltaMinutes) {
      const baseStart = minutesOfTime(item.startTime)
      if (baseStart === null) return null
      // 「有没有结束时间」只看字段本身。endTime 是 "24:00" 时 minutesOfTime 读不回来
      // （splitTimeKey 只认 00:00–23:59），那种情况要按默认时长算，但绝不能把 endTime 丢掉。
      const hasEnd = asText(item.endTime) !== ''
      const rawEnd = minutesOfTime(item.endTime)
      const duration = rawEnd !== null && rawEnd > baseStart ? rawEnd - baseStart : POINT_BLOCK_MIN
      const delta = Math.round(Number(deltaMinutes) || 0)

      let start
      let end
      if (mode === 'resize') {
        // 结束边不动 start：新 end = 原 end（读不回来时用「原 start + 默认时长」）＋ delta。
        start = baseStart
        end = Math.min(DAY_MIN, Math.max(baseStart + SNAP_MIN, baseStart + duration + delta))
      } else {
        const requested = baseStart + delta
        const moved = Math.min(DAY_MIN - duration, Math.max(0, requested))
        // 夹取绝不能把块往反方向推：往下拖被 24:00 挡住时，宁可什么都不做，
        // 也不能把 23:30-24:00 的块挪到 23:00（那是往上）。
        if (delta > 0 && moved < baseStart) return null
        if (delta < 0 && moved > baseStart) return null
        start = moved
        end = moved + duration
      }

      const startText = timeOfMinutes(start)
      const endText = timeOfMinutes(end)
      if (startText === null || endText === null || end <= start) return null
      if (hasEnd) {
        if (startText === asText(item.startTime) && endText === asText(item.endTime)) return null
        return { startTime: startText, endTime: endText }
      }
      // 时间点排期（没有 endTime）：拖动只写回 startTime，不把它偷偷变成时间段；
      // 但「拖底边」是在给它定一个真实时长，这时才允许补上 endTime。
      if (mode === 'resize') return { startTime: startText, endTime: endText }
      // 夹到边界后可能又落回原位置（例如 23:30 往下拖：按 60 分钟算放不下，只能回到 23:00），
      // 那就当没变化，不提交。
      return startText === asText(item.startTime) ? null : { startTime: startText, endTime: null }
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

    /**
     * 「时间」只有一个事实源：时间点 = startTime，时间段 = startTime + endTime。
     * 行徽标与详情面板都走这里，避免两处各显示一个时间（历史 bug）。
     */
    function timeRangeLabel(start, end) {
      const from = asText(start)
      const to = asText(end)
      if (from === '' && to === '') return ''
      if (from === '') return to
      if (to === '') return from
      return `${from}–${to}`
    }

    function timeLabel(item) {
      if (item === null || item === undefined) return ''
      return timeRangeLabel(item.startTime, item.endTime)
    }

    /** 「什么时候到期」：时间段看结束，时间点看开始；都没有就是 null。 */
    function deadlineOf(item) {
      if (item === null || item === undefined) return null
      const end = asText(item.endTime)
      if (end !== '') return end
      const start = asText(item.startTime)
      if (start !== '') return start
      return null
    }

    /** 行尾徽标：日期 + 时间（时间段显示 开始–结束），与右侧详情面板同源。 */
    function dueLabel(item) {
      const date = asText(item.dueDate)
      const time = timeLabel(item)
      if (date === '' && time === '') return ''
      if (date === '') return time
      const short = date.slice(5)
      return time === '' ? short : `${short} ${time}`
    }

    function deadlineTitle(item, t) {
      const deadline = deadlineOf(item)
      if (deadline === null) return undefined
      return String(t('deadlineAt')).replace('{time}', deadline)
    }

    // --- v4 常量：完成期限预设 / 超期处理 / 重复频率 ---
    const DUE_PRESETS = ['today', 'this_week', 'this_work_week', 'custom']
    const OVERDUE_MODES = ['none', 'abandon']
    const REPEAT_LABEL_KEY = {
      daily: 'repeatDaily', weekly: 'repeatWeekly', monthly: 'repeatMonthly',
      yearly: 'repeatYearly', ebbinghaus: 'repeatEbbinghaus', workday: 'repeatWorkday',
    }
    const REPEAT_FREQ_PILLS = [
      ['', 'repeatNonePill'], ['daily', 'repeatDaily'], ['weekly', 'repeatWeekly'],
      ['monthly', 'repeatMonthly'], ['yearly', 'repeatYearly'],
      ['ebbinghaus', 'repeatEbbinghaus'], ['workday', 'repeatWorkday'],
    ]

    /** 完成期限预设 → 具体日期。周一是一周的第一天：周日 = 周一 + 6，周五 = 周一 + 4。 */
    function presetDateKey(preset, customKey) {
      const today = new Date()
      if (preset === 'today') return dateKeyOf(today)
      if (preset === 'this_week') return shiftKeyLocal(mondayOfKey(dateKeyOf(today)), 6)
      if (preset === 'this_work_week') return shiftKeyLocal(mondayOfKey(dateKeyOf(today)), 4)
      if (preset === 'custom') return asText(customKey)
      return ''
    }

    /** 存了 duePreset 就用它；只存了日期就回落到 custom；什么都没有则默认「当天」。 */
    function normalizeDuePreset(preset, dueDate) {
      if (DUE_PRESETS.includes(preset)) return preset
      return asText(dueDate) === '' ? 'today' : 'custom'
    }

    function duePresetLabelKey(preset) {
      if (preset === 'this_week') return 'dueThisWeek'
      if (preset === 'this_work_week') return 'dueThisWorkWeek'
      if (preset === 'custom') return 'dueCustom'
      return 'dueToday'
    }

    /** 英文的 weekPrefix 是空串；字典缺键时回落到 key 本身，这里兜一下。 */
    function weekPrefixOf(t) {
      const raw = t('weekPrefix')
      return raw === 'weekPrefix' ? '' : asText(raw)
    }

    function weekdayLabel(iso, t) {
      const entry = WEEKDAY_OPTIONS[iso - 1]
      if (entry === undefined) return String(iso)
      return weekPrefixOf(t) + t(entry[0])
    }

    function repeatDisplayLabel(repeat, t) {
      if (repeat === null || repeat === undefined || typeof repeat !== 'object') return t('repeatNoneShort')
      const key = REPEAT_LABEL_KEY[repeat.freq]
      if (key === undefined) return t('repeatNoneShort')
      const parts = [t(key)]
      if (repeat.freq === 'weekly' && Array.isArray(repeat.weekdays) && repeat.weekdays.length > 0) {
        parts.push(repeat.weekdays.slice().sort((left, right) => left - right).map((iso) => weekdayLabel(iso, t)).join(' '))
      }
      if (asText(repeat.until) !== '') parts.push(`${t('until')} ${repeat.until}`)
      return parts.join(' · ')
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
    /**
     * 计划分类选择器。输入框既是「直接填写分类名」，也是「过滤列表」；
     * 弹层底部不再是「管理分类」弹窗入口，而是就地新建：
     * 点「+ 新建分类」把底栏换成 [输入][确定]，成功后选中新分类并关闭弹层。
     */
    function CategoryCombo({ t, value, categories, onChange, onCreateCategory }) {
      const [open, setOpen] = useState(false)
      const [query, setQuery] = useState('')
      // 新建成功后把名字并进可见列表：调用方（详情面板 / 新建弹窗）各自持有一份
      // categories，可能还没重新拉取，不能等它们刷新才让新分类出现在列表里。
      const [createdNames, setCreatedNames] = useState([])
      const [creating, setCreating] = useState(false)
      const [draft, setDraft] = useState('')
      const [saving, setSaving] = useState(false)
      const [createError, setCreateError] = useState(null)

      const resetCreate = useCallback(() => {
        setCreating(false)
        setDraft('')
        setCreateError(null)
      }, [])
      const close = useCallback(() => { setOpen(false); resetCreate() }, [resetCreate])
      const popover = useAnchoredPopover(open, CATEGORY_POP.width, CATEGORY_POP.height, close)

      const openAll = () => {
        setQuery('')
        resetCreate()
        setOpen(true)
      }

      const rows = useMemo(() => {
        const known = new Set(categories.map((row) => row.name))
        const extra = createdNames
          .filter((name) => !known.has(name))
          .map((name) => ({ name, count: 0, icon: '' }))
        return extra.length === 0 ? categories : [...categories, ...extra]
      }, [categories, createdNames])

      const text = asText(value)
      const needle = query.trim().toLowerCase()
      const visible = needle === ''
        ? rows
        : rows.filter((row) => row.name.toLowerCase().includes(needle))
      const countLabel = t('categoryCount')

      const submitCreate = async () => {
        const name = draft.trim()
        if (name === '' || saving) return
        setSaving(true)
        setCreateError(null)
        try {
          await onCreateCategory?.(name)
          setCreatedNames((prev) => (prev.includes(name) ? prev : [...prev, name]))
          onChange(name)
          setQuery('')
          resetCreate()
          close()
        } catch (err) {
          setCreateError(err instanceof Error && err.message ? err.message : t('requestFailed'))
        } finally {
          setSaving(false)
        }
      }

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
          }, h(Icon, { name: 'x', size: 14 }))
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
            creating
              ? h('div', null,
                  h('div', { style: S.popCreateRow },
                    h('input', {
                      className: 'td-input',
                      autoFocus: true,
                      style: S.popCreateInput,
                      value: draft,
                      placeholder: t('categoryNamePlaceholder'),
                      'aria-label': t('categoryNamePlaceholder'),
                      disabled: saving,
                      onChange: (event) => setDraft(event.target.value),
                      onKeyDown: (event) => {
                        if (event.nativeEvent?.isComposing === true) return
                        if (event.key === 'Enter') { event.preventDefault?.(); void submitCreate() }
                        if (event.key === 'Escape') {
                          event.preventDefault?.()
                          event.stopPropagation?.()
                          resetCreate()
                        }
                      },
                    }),
                    h('button', {
                      type: 'button',
                      className: 'td-btn td-primary',
                      style: S.popCreateConfirm,
                      disabled: saving || draft.trim() === '',
                      onClick: () => void submitCreate(),
                    }, t('confirm'))),
                  createError !== null ? h('div', { style: S.popCreateError }, createError) : null)
              : h('button', {
                  type: 'button',
                  className: 'td-btn',
                  style: S.popCreate,
                  'aria-label': t('newCategory'),
                  onClick: () => { setDraft(''); setCreateError(null); setCreating(true) },
                }, '+ ' + t('newCategory')))
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
      h('span', { style: S.pickerIcon, 'aria-hidden': 'true' }, h(Icon, { name: 'chevronDown', size: 12 }))),

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
            }, h(Icon, { name: 'chevronLeft', size: 14 })),
            h('span', { style: S.pickerTitle }, monthTitle(cursor.year, cursor.month)),
            h('button', {
              type: 'button', className: 'td-btn', style: S.pickerIconBtn,
              'aria-label': monthAt(1), onClick: () => moveMonth(1),
            }, h(Icon, { name: 'chevronRight', size: 14 }))),
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
      h('span', { style: S.pickerIcon, 'aria-hidden': 'true' }, h(Icon, { name: 'chevronDown', size: 12 }))),

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

    /**
     * 一张统计卡：环形图 + 图例（已完成 / 未完成 / 合计）。
     *
     * 数量按**发生次数**算 —— 用的是日历那份 occurrences，所以「每日站会」一周就是 7 项。
     * 已放弃的算「未完成」，这样 总数 = 已完成 + 未完成 永远成立。
     *
     * 环形图是手绘 SVG：用 stroke-dasharray 画进度弧，不引图表库，也不做弧线三角计算。
     */
    function StatsColumn({ t, titleKey, from, to, version, selectedId, onSelect, onToggle }) {
      const [stat, setStat] = useState({ total: 0, done: 0, list: [] })

      useEffect(() => {
        let alive = true
        fetchApi('occurrences', { from, to }, t)
          .then((res) => {
            if (!alive) return
            const items = Array.isArray(res?.items) ? res.items : []
            // occurrences 给的是 todoId/date/repeat，而 TodoRow 要 id/dueDate/isRepeating。
            // 这里做一次适配，好处是清单能**直接复用矩阵那一行**：外观、勾选语义、
            // 循环任务按「这一次」打勾的行为，全都和别处一模一样，不会各写一套。
            const list = items
              .filter((i) => i.done !== true)
              .map((i) => ({
                id: i.todoId,
                title: i.title,
                done: false,
                dueDate: i.date,
                isRepeating: Boolean(i.repeat),
                startTime: i.startTime,
                endTime: i.endTime,
                quadrant: i.quadrant,
                abandoned: i.abandoned === true,
              }))
              .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
            setStat({ total: items.length, done: items.filter((i) => i.done === true).length, list })
          })
          .catch(() => { if (alive) setStat({ total: 0, done: 0, list: [] }) })
        return () => { alive = false }
      }, [from, to, version])

      const total = stat.total
      const done = stat.done
      const undone = total - done
      const pct = total === 0 ? 0 : Math.round((done / total) * 100)

      const R = 34
      const C = 2 * Math.PI * R
      const ring = { fill: 'none', strokeWidth: 8, strokeLinecap: 'round' }
      const doneColor = 'var(--dsw-alias-state-business-primary)'
      const undoneColor = 'var(--dsw-alias-state-warn-primary)'

      const legendRow = (color, label, count) => h('div', { style: S.statsRow },
        h('span', { style: { ...S.statsSwatch, background: color } }),
        h('span', { style: S.statsLabel }, label),
        h('span', { style: S.statsCount }, String(count)))

      return h('div', { style: S.statsCol },
        h('div', { style: S.statsCard },
          h('div', { style: S.statsHead },
            h(Icon, { name: 'chart', size: 13 }),
            h('span', null, t(titleKey)),
            h('span', { style: S.statsTotal }, String(t('statsTotal')).replace('{count}', String(total)))),
          h('div', { style: S.statsBody },
            h('svg', { width: 84, height: 84, viewBox: '0 0 84 84', 'aria-hidden': 'true', style: { flex: 'none' } },
              h('circle', { cx: 42, cy: 42, r: R, ...ring, stroke: undoneColor, opacity: total === 0 ? 0.28 : 1 }),
              total > 0 && done > 0
                ? h('circle', {
                    cx: 42, cy: 42, r: R, ...ring,
                    stroke: doneColor,
                    strokeDasharray: `${(done / total) * C} ${C}`,
                    transform: 'rotate(-90 42 42)',
                  })
                : null,
              h('text', {
                x: 42, y: 42, textAnchor: 'middle', dominantBaseline: 'central',
                fontSize: 16, fontWeight: 600, fill: 'var(--dsw-alias-label-primary)',
              }, `${pct}%`)),
            h('div', { style: S.statsLegend },
              legendRow(doneColor, t('done'), done),
              legendRow(undoneColor, t('statsUndone'), undone)))),
        h('div', { style: S.statsListCard },
          h('div', { style: S.statsListHead },
            h('span', null, `${t(titleKey)} · ${t('statsUndone')}`),
            h('span', { style: S.statsTotal }, String(stat.list.length))),
          h('div', { style: S.statsListBody },
            stat.list.length === 0
              ? h('div', { style: S.statsEmpty }, t('statsAllDone'))
              : stat.list.map((item) => h(TodoRow, {
                  key: `${item.id}-${item.dueDate}`,
                  t, item, selectedId, onSelect, onToggle,
                })))))
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
          }, h(Icon, { name: 'chevronLeft', size: 14 })),
          h('div', { style: S.calendarViewTitle }, monthTitle(cursor.year, cursor.month)),
          h('button', {
            type: 'button', className: 'td-btn', style: S.calendarBtn,
            'aria-label': t('nextMonth'), onClick: () => move(1),
          }, h(Icon, { name: 'chevronRight', size: 14 })),
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
            h('span', { style: { ...S.dot, background: QUADRANT_COLORS[item.quadrant] ?? priorityColor(item.priority) }, 'aria-hidden': 'true' }),
            h('span', {
              // 完成态与矩阵行一致：删除线 + 淡色，而不是让它看不出来。
              style: item.done
                ? { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'line-through', color: 'var(--dsw-alias-label-tertiary)' }
                : { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
            }, asText(item.title)))),
            items.length > 2 ? h('div', { style: S.calendarViewMore }, `+${items.length - 2}`) : null)
          })),
      )
    }

    /**
     * 周视图：所选周的 7 天 × 0-24 时段。
     *
     * 分时网格里的时间块可以拖动改期（整体拖动 = start/end 同时平移；拖底部边缘 = 只改 end），
     * 每次吸附 30 分钟；提交统一走 `onReschedule(item, next)`，本组件不直接发请求。
     * 全天带里的胶囊（重复任务、没有时间块的任务）没有时间块，仍然只能点击选中。
     * 方向键是等价的键盘通道：↑/↓ 平移 30 分钟，Shift+↑/↓ 改时长 30 分钟。
     *
     * 布局要点：星期表头 + 全天带 + 分时网格放在同一个滚动容器里，
     * 表头两行用 position: sticky 吸顶。这样 7 列与左侧时间轴天然对齐，
     * 不会因为滚动条宽度差出十几像素。
     */
    function WeekView({ t, onSelect, onReschedule, version }) {
      const [mondayKey, setMondayKey] = useState(() => mondayOfKey(dateKeyOf(new Date())))
      const [items, setItems] = useState([])
      const scrollRef = useRef(null)

      const weekDays = weekDayKeys(mondayKey)
      const from = weekDays[0]
      const to = weekDays[6]
      const todayKey = dateKeyOf(new Date())
      const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()
      // 英文的 weekPrefix 是空串；字典查不到时会回落到 key 本身，这里兜一下。
      const prefixRaw = t('weekPrefix')
      const weekPrefix = prefixRaw === 'weekPrefix' ? '' : asText(prefixRaw)

      // 独立于月历那份 fetch：切周、数据变更各自重取，互不干扰。
      useEffect(() => {
        let alive = true
        fetchApi('occurrences', { from, to }, t)
          .then((result) => {
            if (!alive) return
            setItems(Array.isArray(result?.items) ? result.items : [])
          })
          .catch((err) => {
            if (!alive) return
            console.error('[dsh-sidebar-todo] week occurrences failed', err)
            setItems([])
          })
        return () => { alive = false }
      }, [from, to, version])

      // 首次渲染（以及切到另一周）把 07:00 滚到表头下方：sticky 表头正好盖住 0-6 点，
      // 所以 scrollTop 就等于 7 小时的像素高度。
      useEffect(() => {
        const node = scrollRef.current
        if (node === null) return
        node.scrollTop = 7 * HOUR_PX
      }, [mondayKey])

      // 全天带 = 重复任务 ∪ 没有时间块的任务（否则它们会整周看不见）。
      const allDayByDate = {}
      const timedByDate = {}
      for (const item of items) {
        const key = asText(item.date)
        if (key === '') continue
        const repeating = item.repeat !== null && item.repeat !== undefined && item.repeat !== false
        // dueTime 在 v4 已废弃且恒为 null，这里只认 startTime。
        const start = minutesOfTime(item.startTime)
        if (repeating || start === null) (allDayByDate[key] ??= []).push(item)
        else (timedByDate[key] ??= []).push(item)
      }

      const rangeLabel = String(t('weekRange'))
        .replace('{from}', formatWeekDayKey(from, t, true))
        .replace('{to}', formatWeekDayKey(to, t, false))

      const accentOf = (item) => QUADRANT_COLORS[item.quadrant] ?? priorityColor(item.priority)

      const openItem = (item) => {
        if (typeof onSelect === 'function') onSelect(item.todoId)
      }

      const keyHandler = (item) => (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault?.()
        openItem(item)
      }

      // --- 时间块拖拽 / 缩放 ---
      // dragRef 存手势的可变状态（不触发渲染），dragState 只存需要画出来的部分。
      // 关键点：拖动期间冻结「原始时间」，免得 2.5s 轮询回来的旧数据把块拽回去。
      const dragRef = useRef(null)
      const [dragState, setDragState] = useState(null)
      const [frozenTimes, setFrozenTimes] = useState(() => new Map())
      const frozenRef = useRef(new Map())
      // 刚拖完的那一下 pointerup 之后浏览器还会补一个 click；用它挡掉「拖完又选中」。
      const suppressClickRef = useRef(false)

      // 拖拽期间不跟着轮询走：只在新数据到达（version 变化）时重新冻结一次。
      useEffect(() => {
        frozenRef.current = new Map(items.map((item) => [asText(item.todoId), {
          startTime: asText(item.startTime),
          endTime: asText(item.endTime),
        }]))
        setFrozenTimes(frozenRef.current)
      }, [items, version])

      const beginDrag = (item, mode) => (event) => {
        if (event.button !== undefined && event.button !== 0) return
        // 缩放条是时间块的**子元素**。pointerdown 先命中子元素再冒泡到父块，
        // 父块挂的是 move 处理器——不拦住冒泡，mode 会立刻被改回 'move'，
        // 表现就是「只能整体拖动，怎么拉都改不了时长」。
        if (mode === 'resize') event.stopPropagation?.()
        const target = event.currentTarget
        const id = asText(item.todoId)
        const frozen = frozenRef.current.get(id)
        // 以「当前画出来的时间」为基准：拖动期间它被冻结，所以不会跟轮询打架。
        const base = frozen ?? {
          startTime: asText(item.startTime),
          endTime: asText(item.endTime),
        }
        // 上一次手势遗留的抑制标记不能吃掉这一次的点击。
        suppressClickRef.current = false
        dragRef.current = {
          item,
          id,
          mode,
          pointerId: event.pointerId,
          startY: event.clientY,
          active: false,
          base,
          preview: null,
        }
        // 指针捕获：手势走出块甚至走出 webview 也不会丢 pointermove/pointerup。
        try { target.setPointerCapture?.(event.pointerId) } catch (err) { /* 不支持就算了 */ }
      }

      const moveDrag = (event) => {
        const drag = dragRef.current
        if (drag === null || event.pointerId !== drag.pointerId) return
        const dy = event.clientY - drag.startY
        if (!drag.active) {
          if (Math.abs(dy) < DRAG_SLOP_PX) return
          drag.active = true
        }
        const next = rescheduleTimes(drag.base, drag.mode, snapMinutes(dy))
        drag.preview = next
        setDragState({ id: drag.id, mode: drag.mode, preview: next })
      }

      const endDrag = () => {
        const drag = dragRef.current
        dragRef.current = null
        setDragState(null)
        return drag
      }

      const commitDrag = () => {
        const drag = endDrag()
        if (drag === null) return
        // 没超过阈值 = 点击：交给 onClick 去选中，这里什么都不做。
        if (!drag.active) return
        // 真拖过：挡掉浏览器补发的那一下 click，避免「拖完又选中」。
        suppressClickRef.current = true
        if (drag.preview === null || typeof onReschedule !== 'function') return
        // 先解冻，等这次更新的新数据回来（mutate 会 reload + 抬 version）。
        frozenRef.current.delete(drag.id)
        setFrozenTimes(new Map(frozenRef.current))
        Promise.resolve(onReschedule(drag.item, drag.preview)).catch((err) => {
          console.error('[dsh-sidebar-todo] reschedule failed', err)
        })
      }

      // 手势被取消（pointercancel / 丢失捕获）：什么都不提交，块回到原位。
      const cancelDrag = () => {
        const drag = endDrag()
        if (drag !== null && drag.active) suppressClickRef.current = true
      }

      const handleBlockClick = (item) => {
        if (suppressClickRef.current) { suppressClickRef.current = false; return }
        if (dragRef.current !== null) return
        openItem(item)
      }

      const blockPointerHandlers = (item, mode) => ({
        onPointerDown: beginDrag(item, mode),
        onPointerMove: moveDrag,
        onPointerUp: commitDrag,
        onPointerCancel: cancelDrag,
        onLostPointerCapture: cancelDrag,
      })

      const blockKeyHandler = (item) => (event) => {
        if (event.key === 'Escape') { cancelDrag(); return }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault?.()
          openItem(item)
          return
        }
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
        event.preventDefault?.()
        if (typeof onReschedule !== 'function') return
        const step = (event.key === 'ArrowUp' ? -1 : 1) * SNAP_MIN
        const next = rescheduleTimes(item, event.shiftKey ? 'resize' : 'move', step)
        if (next === null) return
        Promise.resolve(onReschedule(item, next)).catch((err) => {
          console.error('[dsh-sidebar-todo] reschedule failed', err)
        })
      }

      const previewOf = (id) => {
        if (dragState === null || dragState.id !== id) return null
        return dragState.preview
      }

      return h('div', { style: S.weekView },
        h('div', { style: S.weekNav },
          h('button', {
            type: 'button', className: 'td-btn', style: S.calendarBtn,
            'aria-label': t('prevWeek'),
            onClick: () => setMondayKey(shiftKeyLocal(mondayKey, -7)),
          }, h(Icon, { name: 'chevronLeft', size: 14 })),
          h('div', { style: S.weekNavTitle }, rangeLabel),
          h('button', {
            type: 'button', className: 'td-btn', style: S.calendarBtn,
            'aria-label': t('nextWeek'),
            onClick: () => setMondayKey(shiftKeyLocal(mondayKey, 7)),
          }, h(Icon, { name: 'chevronRight', size: 14 })),
          h('button', {
            type: 'button', className: 'td-btn',
            style: { ...S.btnGhost, height: 28, padding: '0 10px' },
            onClick: () => setMondayKey(mondayOfKey(dateKeyOf(new Date()))),
          }, t('week'))),

        h('div', { ref: scrollRef, style: S.weekScroll },
          // 星期行
          h('div', { style: S.weekHeadRow },
            h('div', { style: S.weekGutter }),
            weekDays.map((key, index) => {
              const isToday = key === todayKey
              return h('div', { key, style: S.weekDayCol },
                h('span', { style: isToday ? { ...S.weekDayName, ...S.weekDayToday } : S.weekDayName },
                  weekPrefix + t(WEEKDAY_OPTIONS[index][0])),
                h('span', { style: isToday ? { ...S.weekDayDate, ...S.weekDayToday } : S.weekDayDate },
                  formatWeekDateKey(key, t)))
            })),

          // 全天带（重复任务 + 无时间块的任务）
          h('div', { style: S.weekAllDayRow },
            h('div', { style: S.weekAllDayLabel }, t('allDay')),
            weekDays.map((key) => h('div', { key, style: S.weekAllDayCol },
              (allDayByDate[key] ?? []).map((item) => {
                const accent = accentOf(item)
                return h('div', {
                  key: `${asText(item.todoId)}-${key}`,
                  className: 'td-week-item',
                  tabIndex: 0,
                  'aria-label': asText(item.title),
                  style: {
                    ...S.weekChip,
                    background: `color-mix(in srgb, ${accent} 26%, transparent)`,
                    borderLeft: `3px solid ${accent}`,
                    opacity: item.done ? 0.55 : 1,
                    textDecoration: item.done ? 'line-through' : 'none',
                  },
                  onClick: () => openItem(item),
                  onKeyDown: keyHandler(item),
                }, asText(item.title))
              })))),

          // 分时网格
          h('div', { style: S.weekGrid },
            h('div', { style: S.weekHourCol },
              HOUR_OPTIONS.map((hour) => h('div', { key: hour, style: S.weekHourLabel }, `${Number(hour)}:00`))),
            weekDays.map((key) => {
              const layout = layoutDayBlocks(timedByDate[key] ?? [])
              const isToday = key === todayKey
              return h('div', {
                key,
                style: {
                  ...S.weekDayStrip,
                  backgroundImage: `repeating-linear-gradient(to bottom, var(--dsw-alias-border-l2) 0, var(--dsw-alias-border-l2) 0.5px, transparent 0.5px, transparent ${HOUR_PX}px)`,
                },
              },
              layout.blocks.map((block) => {
                const item = block.item
                const id = asText(item.todoId)
                const accent = accentOf(item)
                const width = 100 / layout.lanes
                // 拖动中优先画预览位置；没在拖就用（可能被冻结的）存下来的时间。
                const shown = previewOf(id) ?? frozenTimes.get(id) ?? null
                const startMin = shown === null ? block.start : (minutesOfTime(shown.startTime) ?? block.start)
                const rawEnd = shown === null ? null : minutesOfTime(shown.endTime)
                const endMin = rawEnd !== null && rawEnd > startMin ? rawEnd : startMin + POINT_BLOCK_MIN
                const dragging = dragState !== null && dragState.id === id
                return h('div', {
                  key: `${id}-${key}-${block.start}`,
                  className: 'td-week-item',
                  tabIndex: 0,
                  'aria-label': asText(item.title),
                  title: t('rescheduleHint'),
                  style: {
                    ...S.weekBlock,
                    top: (startMin / 60) * HOUR_PX,
                    height: Math.max(20, ((endMin - startMin) / 60) * HOUR_PX),
                    left: `${block.lane * width}%`,
                    width: `${width}%`,
                    background: `color-mix(in srgb, ${accent} 30%, transparent)`,
                    borderLeft: `3px solid ${accent}`,
                    opacity: item.done ? 0.55 : 1,
                    // 触屏上让竖直拖动归块自己，不要被滚动容器抢走。
                    touchAction: 'none',
                    cursor: dragging ? 'grabbing' : 'grab',
                    zIndex: dragging ? 5 : undefined,
                    ...(dragging ? S.weekBlockDragging : null),
                  },
                  onClick: () => handleBlockClick(item),
                  onKeyDown: blockKeyHandler(item),
                  ...blockPointerHandlers(item, 'move'),
                },
                h('span', {
                  style: {
                    display: 'block', overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', textDecoration: item.done ? 'line-through' : 'none',
                  },
                }, asText(item.title)),
                // 底部 ~6px 的缩放条：按在它上面 = 改时长，按在块的其他地方 = 整体平移。
                h('div', {
                  className: 'td-week-resize',
                  'aria-hidden': 'true',
                  title: t('resizeHint'),
                  style: S.weekResize,
                  ...blockPointerHandlers(item, 'resize'),
                }))
              }),
              isToday
                ? h('div', {
                    style: { ...S.weekNowLine, top: (nowMinutes / 60) * HOUR_PX },
                    'aria-hidden': 'true',
                    title: t('nowLine'),
                  })
                : null)
            }))))
    }

    // --- New components ---
    function Icon({ name, size = 16, style, className }) {
      const paths = ICONS[name]
      if (!paths) return null
      return h('svg', {
        width: size, height: size, viewBox: '0 0 16 16', fill: 'currentColor',
        'aria-hidden': 'true', focusable: 'false', style, className,
      }, paths.map((d, i) => h('path', { key: i, d })))
    }

    function LeftRail({ t, active, onChange, onAvatarClick }) {
      const items = [
        { key: 'plan', labelKey: 'plan', icon: 'plan' },
        { key: 'view', labelKey: 'view', icon: 'calendar' },
        { key: 'focus', labelKey: 'focus', icon: 'week' },
        { key: 'stats', labelKey: 'stats', icon: 'chart' },
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
        h('span', { style: S.railIcon }, h(Icon, { name: item.icon, size: 18 })),
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
            }, h(Icon, { name: 'bell', size: 18 })),
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
          }, h(Icon, { name: 'calendar', size: 18 }))))
    }

    function LeftPanel({ t, activeFilter, onFilterChange, categories, inboxCount, onCreateCategory, onInboxFilter, monthCursor, onMonthChange, calendarItems, onSelectDay }) {
      const [selectedDay, setSelectedDay] = useState(null)
      // 「+ 新建分类」就地展开一行输入：不再打开旧的「管理分类」弹窗。
      const [creating, setCreating] = useState(false)
      const [draft, setDraft] = useState('')
      const [saving, setSaving] = useState(false)
      const [createError, setCreateError] = useState(null)
      const createWrapRef = useRef(null)
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

      const cancelCreate = () => {
        setCreating(false)
        setDraft('')
        setCreateError(null)
      }

      const submitCreate = async () => {
        const name = draft.trim()
        if (name === '' || saving) return
        setSaving(true)
        setCreateError(null)
        try {
          await onCreateCategory?.(name)
          setDraft('')
          setCreating(false)
        } catch (err) {
          // 宿主会给出具体原因（「分类名必填」/「分类名过长（上限 24 字）」）。
          setCreateError(err instanceof Error && err.message ? err.message : t('requestFailed'))
        } finally {
          setSaving(false)
        }
      }

      // 点开输入行后点别处即取消（Escape 也在输入行里处理）。
      useEffect(() => {
        if (!creating) return undefined
        const onPointerDown = (event) => {
          const node = createWrapRef.current
          if (node !== null && typeof node.contains === 'function' && node.contains(event.target)) return
          cancelCreate()
        }
        document.addEventListener('pointerdown', onPointerDown)
        return () => document.removeEventListener('pointerdown', onPointerDown)
      }, [creating])

      return h('div', { style: S.leftPanel },
        // 收集箱：分组里只有它自己一个成员，原来的「标题 + 唯一成员」等于把同一个词
        // 写了两遍。合并成一行——既当分组标题，也当筛选项。
        h('div', { style: S.panelSection },
          h('div', {
            style: { ...S.categoryRow, ...(activeFilter === '__inbox__' ? S.categoryRowSelected : null) },
            onClick: onInboxFilter,
            role: 'button',
            tabIndex: 0,
            'aria-label': t('inbox'),
            onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onInboxFilter() } },
          },
          h('span', { style: S.categoryIcon }, h(Icon, { name: 'inbox', size: 16 })),
          h('span', { style: S.categoryName }, t('inbox')),
          h('span', { style: S.categoryCount }, String(inboxCount)))),

        // Mini calendar
        h('div', { style: S.miniCalendar },
          h('div', { style: S.calendarHead },
            h('button', {
              type: 'button', className: 'td-btn', style: S.calendarBtn,
              'aria-label': t('prevMonth'), onClick: () => onMonthChange(-1),
            }, h(Icon, { name: 'chevronLeft', size: 14 })),
            h('div', { style: S.calendarTitle }, monthTitle(monthCursor.year, monthCursor.month)),
            h('button', {
              type: 'button', className: 'td-btn', style: S.calendarBtn,
              'aria-label': t('nextMonth'), onClick: () => onMonthChange(1),
            }, h(Icon, { name: 'chevronRight', size: 14 }))),
          h('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 4 } },
            h('button', {
              type: 'button', className: 'td-btn',
              style: { ...S.btnGhost, height: 22, padding: '0 8px', fontSize: 11 },
              onClick: () => { onMonthChange(0); handleDayClick(todayKey) },
            }, t('backToToday'))),
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
          h('span', { style: S.categoryIcon }, h(Icon, { name: 'circle', size: 16 })),
          h('span', { style: S.categoryName }, t('all'))),
          h('div', {
            style: { ...S.categoryRow, ...(activeFilter === '__none__' ? S.categoryRowSelected : null) },
            onClick: () => onFilterChange('__none__'),
          },
          h('span', { style: S.categoryIcon }, h(Icon, { name: 'slashCircle', size: 16 })),
          h('span', { style: S.categoryName }, t('uncategorized'))),
          categories.map((cat) => h('div', {
            key: cat.name,
            style: { ...S.categoryRow, ...(activeFilter === cat.name ? S.categoryRowSelected : null) },
            onClick: () => onFilterChange(cat.name),
          },
          h('span', { style: S.categoryIcon }, cat.icon ? cat.icon : h(Icon, { name: 'tag', size: 16 })),
          h('span', { style: S.categoryName }, cat.name),
          h('span', { style: S.categoryCount }, String(cat.count)))),

        // 新建分类：按钮下面就地展开输入行，新建后宿主会让它出现在上面的分类列表里。
        h('div', { ref: createWrapRef },
          h('button', {
            type: 'button',
            className: 'td-btn',
            style: S.newCategoryBtn,
            'aria-expanded': creating ? 'true' : 'false',
            onClick: () => { if (creating) cancelCreate(); else { setDraft(''); setCreateError(null); setCreating(true) } },
          }, '+ ' + t('newCategory')),
          creating
            ? h('div', { style: S.newCategoryBox },
                h('div', { style: S.newCategoryRow },
                  h('input', {
                    className: 'td-input',
                    autoFocus: true,
                    style: S.newCategoryInput,
                    value: draft,
                    placeholder: t('categoryNamePlaceholder'),
                    'aria-label': t('categoryNamePlaceholder'),
                    disabled: saving,
                    onChange: (event) => setDraft(event.target.value),
                    onKeyDown: (event) => {
                      if (event.nativeEvent?.isComposing === true) return
                      if (event.key === 'Enter') { event.preventDefault?.(); void submitCreate() }
                      if (event.key === 'Escape') { event.preventDefault?.(); event.stopPropagation?.(); cancelCreate() }
                    },
                  }),
                  h('button', {
                    type: 'button',
                    className: 'td-btn td-primary',
                    style: S.newCategoryConfirm,
                    disabled: saving || draft.trim() === '',
                    onClick: () => void submitCreate(),
                  }, t('confirm'))),
                createError !== null ? h('div', { style: S.newCategoryError }, createError) : null)
            : null)))
    }

    /**
     * 一行待办。完成态 = 实心勾 + 删除线，并且**留在原处不消失** ——
     * 「完成即消失」让人无法确认自己到底做没做，也没法撤销误勾。
     */
    function TodoRow({ t, item, selectedId, onSelect, onToggle }) {
      const done = Boolean(item.done)
      const selected = item.id === selectedId
      // 循环任务以本周期实例为准：dueDate 为空说明系列已结束，
      // 复选框置灰且不响应（与 handleToggle 的提前 return 保持一致）。
      const ended = Boolean(item.isRepeating) && asText(item.dueDate) === ''
      // 已放弃：仍留在板上，但压暗并挂一个标记，避免看起来像还没开始的普通任务。
      const given = item.abandoned === true
      return h('div', {
        key: item.id,
        className: 'td-todo-row',
        style: { ...(selected ? { ...S.todoRow, ...S.todoRowSelected } : S.todoRow), ...(given ? { opacity: 0.55 } : null) },
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
          ? h(Icon, { name: 'check', size: 9, style: { color: 'var(--dsw-alias-label-primary-inverted)' } })
          : null)),
      h('button', {
        type: 'button',
        className: 'td-title',
        'aria-current': selected ? 'true' : 'false',
        style: done ? S.todoTitleDone : S.todoTitle,
        onClick: (e) => { e.stopPropagation(); onSelect(item.id) },
      }, asText(item.title)),
      given
        ? h('span', {
            style: {
              flex: 'none', fontSize: 10, lineHeight: '16px', padding: '0 6px', borderRadius: 8,
              border: '0.5px solid var(--dsw-alias-border-l3)', color: 'var(--dsw-alias-label-tertiary)',
            },
          }, t('abandonedTag'))
        : null,
      // 行尾徽标与右侧详情面板的「时间」同源（startTime / startTime–endTime）。
      h('span', {
        style: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary)', flex: 'none' },
        title: deadlineTitle(item, t),
      }, dueLabel(item)))
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
              }, h(Icon, { name: 'plus', size: 16 }))),
            h('div', { style: S.quadrantBody },
              qItems.length === 0
                ? h('div', { style: S.emptyState },
                    h(Icon, { name: 'clipboardX', size: 48, style: { color: 'var(--dsw-alias-label-tertiary)', opacity: 0.4 } }),
                    h('span', null, t(emptyCaptions[q.key])))
                : qItems.map((item) => h(TodoRow, {
                    key: item.id, t, item, selectedId, onSelect, onToggle,
                  }))))
        }))
    }

    /**
     * 收集箱：还没有象限的任务。矩阵按象限分组，这些任务在那里无处可去 ——
     * 少了这块，快捷添加建出来的任务在界面上根本看不见。
     */
    function InboxArea({ t, items, onSelect, selectedId, onToggle, onAdd }) {
      return h('div', { style: { ...S.matrixArea, gridTemplateColumns: '1fr', gridTemplateRows: '1fr' } },
        h('div', { style: S.quadrantCard, className: 'td-quadrant-card' },
          h('div', { style: S.quadrantHead },
            h('span', { style: { width: 4, height: 20, borderRadius: 2, background: 'var(--dsw-alias-label-tertiary)', flex: 'none' } }),
            h('span', { style: S.quadrantTitle }, t('inbox')),
            h('span', { style: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', marginRight: 8 } }, String(items.length)),
            h('button', {
              type: 'button',
              className: 'td-btn',
              style: S.quadrantAddBtn,
              'aria-label': t('addTodo'),
              onClick: () => onAdd(null),
            }, h(Icon, { name: 'plus', size: 16 }))),
          h('div', { style: S.quadrantBody },
            items.length === 0
              ? h('div', { style: S.emptyState }, h('span', null, t('empty')))
              : items.map((item) => h(TodoRow, { key: item.id, t, item, selectedId, onSelect, onToggle })))))
    }

    /** Esc 关闭：弹窗自己挂 document 监听，避免每个组件抄一遍。 */
    function useEscapeKey(onClose, active) {
      const closeRef = useRef(onClose)
      useEffect(() => { closeRef.current = onClose }, [onClose])
      useEffect(() => {
        if (active === false) return undefined
        const onKeyDown = (event) => {
          if (event.key !== 'Escape') return
          event.stopPropagation?.()
          closeRef.current()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [active])
    }

    /**
     * 完成期限：四个预设（当天 / 本周内 / 本周工作日内 / 自定义）+ 超期处理。
     * 保存时把 { dueDate, duePreset, onOverdue } 三件一起交回详情面板。
     */
    function DueDialog({ t, dueDate, duePreset, onOverdue, onClose, onSave }) {
      const [preset, setPreset] = useState(() => normalizeDuePreset(duePreset, dueDate))
      const [customDate, setCustomDate] = useState(() => asText(dueDate))
      const [overdue, setOverdue] = useState(() => (OVERDUE_MODES.includes(onOverdue) ? onOverdue : 'none'))
      const [error, setError] = useState(null)

      useEscapeKey(onClose, true)

      const submit = () => {
        const nextDate = presetDateKey(preset, customDate)
        // 自定义但没挑日期：宿主只认具体日期，这里先拦一下并给出原因。
        if (nextDate === '') {
          setError(t('dueCustomRequired'))
          return
        }
        onSave({ dueDate: nextDate, duePreset: preset, onOverdue: overdue })
      }

      const radio = (name, value, checked, label, onChange) => h('label', { key: value, style: S.radioRow },
        h('input', { type: 'radio', name, value, checked, style: S.radioInput, onChange }),
        h('span', null, label))

      return h('div', {
        className: 'td-overlay',
        style: S.overlay,
        onClick: (event) => { if (event.target === event.currentTarget) onClose() },
      },
      h('div', { className: 'td-dialog', style: { ...S.dialog, width: 420 }, role: 'dialog', 'aria-modal': 'true', 'aria-label': t('dueDialogTitle') },
        h('div', { style: S.dialogHead }, t('dueDialogTitle')),
        h('div', { role: 'radiogroup', 'aria-label': t('dueDialogTitle') },
          DUE_PRESETS.map((value) => radio(
            'td-due-preset',
            value,
            preset === value,
            t(duePresetLabelKey(value)),
            () => { setPreset(value); setError(null) },
          ))),
        preset === 'custom'
          ? h('div', { style: S.duePickerBody },
              h(DateField, { t, value: customDate, onChange: (next) => { setCustomDate(next); setError(null) } }))
          : null,
        h('div', { style: S.dialogSectionLabel }, t('overdueSection')),
        h('div', { role: 'radiogroup', 'aria-label': t('overdueSection') },
          OVERDUE_MODES.map((value) => radio(
            'td-overdue-mode',
            value,
            overdue === value,
            t(value === 'abandon' ? 'onOverdueAbandon' : 'onOverdueNone'),
            () => setOverdue(value),
          ))),
        error !== null ? h('div', { style: S.dialogError }, error) : null,
        h('div', { style: S.dialogFoot },
          h('button', {
            type: 'button',
            className: 'td-btn',
            style: S.btnGhost,
            onClick: () => onSave({ dueDate: null, duePreset: null, onOverdue: overdue }),
          }, t('clearValue')),
          h('button', { type: 'button', className: 'td-btn', style: S.btnGhost, onClick: onClose }, t('cancel')),
          h('button', { type: 'button', className: 'td-primary', style: S.btnPrimary, onClick: submit }, t('save')))))
    }

    /**
     * 重复规则：7 个频率胶囊 + 日期 / 星期 分段 + 结束重复。
     * 保存时把整个 repeat 对象（无重复 → null）交回详情面板。
     */
    function RepeatDialog({ t, repeat, dueDate, onClose, onSave }) {
      const source = repeat !== null && repeat !== undefined && typeof repeat === 'object' ? repeat : null
      const [freq, setFreq] = useState(() => (source !== null && REPEAT_LABEL_KEY[source.freq] !== undefined ? source.freq : ''))
      const [tab, setTab] = useState(() => (source !== null && source.freq === 'weekly' ? 'weekday' : 'date'))
      const [weekdays, setWeekdays] = useState(() => (source !== null && Array.isArray(source.weekdays)
        ? source.weekdays.filter((day) => Number.isInteger(day) && day >= 1 && day <= 7)
        : []))
      const [monthDay, setMonthDay] = useState(() => {
        if (source !== null && Number.isInteger(source.monthDay)) return source.monthDay
        const at = parseDateKey(asText(dueDate)) ?? new Date()
        return at.getDate()
      })
      const [untilOn, setUntilOn] = useState(() => source !== null && asText(source.until) !== '')
      const [until, setUntil] = useState(() => (source !== null ? asText(source.until) : ''))
      const [error, setError] = useState(null)

      useEscapeKey(onClose, true)

      const pickFreq = (next) => {
        setError(null)
        setFreq(next)
        // 频率决定默认看哪一块：weekly → 星期；monthly / yearly → 日期。
        if (next === 'weekly') {
          setTab('weekday')
          setWeekdays((prev) => (prev.length === 0 ? [1, 2, 3, 4, 5] : prev))
        } else if (next === 'monthly' || next === 'yearly') {
          setTab('date')
        }
      }

      const toggleWeekday = (iso) => {
        setError(null)
        setWeekdays((prev) => (prev.includes(iso) ? prev.filter((day) => day !== iso) : [...prev, iso].sort((left, right) => left - right)))
      }

      const toggleUntil = () => {
        if (untilOn) { setUntilOn(false); return }
        // 打开「结束重复」时给个一年后的默认值，用户再自己调。
        if (until === '') {
          const at = new Date()
          setUntil(dateKeyOf(new Date(at.getFullYear() + 1, at.getMonth(), at.getDate())))
        }
        setUntilOn(true)
      }

      const submit = () => {
        if (freq === '') { onSave(null); return }
        // 宿主对 weekly 要求 weekdays 非空（否则直接抛 weekdays 不能为空）。
        if (freq === 'weekly' && weekdays.length === 0) { setError(t('weekdaysRequired')); return }
        const next = { freq, interval: 1, until: untilOn && until !== '' ? until : null }
        if (freq === 'weekly') next.weekdays = weekdays.slice().sort((left, right) => left - right)
        if (freq === 'monthly' || freq === 'yearly') next.monthDay = monthDay
        onSave(next)
      }

      const showGrid = freq === 'weekly' || freq === 'monthly' || freq === 'yearly'

      return h('div', {
        className: 'td-overlay',
        style: S.overlay,
        onClick: (event) => { if (event.target === event.currentTarget) onClose() },
      },
      h('div', { className: 'td-dialog', style: S.dialog, role: 'dialog', 'aria-modal': 'true', 'aria-label': t('repeatDialogTitle') },
        h('div', { style: S.repeatPillRow, role: 'group', 'aria-label': t('repeatDialogTitle') },
          REPEAT_FREQ_PILLS.map(([value, key]) => h('button', {
            key: value === '' ? 'none' : value,
            type: 'button',
            className: 'td-btn',
            'aria-pressed': freq === value ? 'true' : 'false',
            style: { ...S.repeatPill, ...(freq === value ? S.repeatPillOn : null) },
            onClick: () => pickFreq(value),
          }, t(key)))),

        showGrid
          ? h('div', { style: { marginTop: 14 } },
              h('div', { style: { ...S.seg, maxWidth: 220 } },
                h('button', {
                  type: 'button', className: 'td-btn',
                  'aria-pressed': tab === 'date' ? 'true' : 'false',
                  style: { ...S.segItem, ...(tab === 'date' ? S.segItemOn : null) },
                  onClick: () => setTab('date'),
                }, t('repeatTabDate')),
                h('button', {
                  type: 'button', className: 'td-btn',
                  'aria-pressed': tab === 'weekday' ? 'true' : 'false',
                  style: { ...S.segItem, ...(tab === 'weekday' ? S.segItemOn : null) },
                  onClick: () => setTab('weekday'),
                }, t('repeatTabWeekday'))),
              tab === 'weekday'
                ? h('div', { style: { ...S.seg, marginTop: 8 } }, WEEKDAY_OPTIONS.map(([key, iso]) => h('button', {
                    key: iso,
                    type: 'button',
                    className: 'td-btn',
                    'aria-pressed': weekdays.includes(iso) ? 'true' : 'false',
                    style: { ...S.segItem, ...(weekdays.includes(iso) ? S.segItemOn : null) },
                    onClick: () => toggleWeekday(iso),
                  }, weekdayLabel(iso, t))))
                : h('div', { style: S.repeatDayGrid }, MONTH_DAYS.map((day) => h('button', {
                    key: day,
                    type: 'button',
                    className: 'td-btn',
                    'aria-pressed': monthDay === day ? 'true' : 'false',
                    style: { ...S.repeatDay, ...(monthDay === day ? S.repeatDayOn : null) },
                    onClick: () => { setMonthDay(day); setError(null) },
                  }, String(day)))))
          : null,

        freq === 'workday' ? h('div', { style: S.hint }, t('repeatWorkdayHint')) : null,

        h('div', { style: S.untilRow },
          h('button', {
            type: 'button',
            className: 'td-btn',
            style: untilOn ? { ...S.powerBtn, ...S.powerBtnOn } : S.powerBtn,
            'aria-pressed': untilOn ? 'true' : 'false',
            'aria-label': t('repeatEnd'),
            title: t('repeatEnd'),
            onClick: toggleUntil,
          }, '⏻'),
          h('span', { style: S.untilLabel }, t('repeatEnd')),
          h('span', { style: { flex: 1, minWidth: 0 } }),
          untilOn
            ? h('div', { style: S.untilField },
                h(DateField, { t, value: until, onChange: (next) => { setUntil(next); setError(null) } }))
            : h('span', { style: S.untilValue }, t('dueNone')),
          untilOn && until !== ''
            ? h('button', {
                type: 'button',
                className: 'td-btn',
                style: S.untilClear,
                'aria-label': t('clearValue'),
                title: t('clearValue'),
                onClick: () => setUntil(''),
              }, '⊗')
            : null),

        error !== null ? h('div', { style: S.dialogError }, error) : null,
        h('div', { style: S.dialogFoot },
          h('button', { type: 'button', className: 'td-btn', style: S.btnGhost, onClick: onClose }, t('cancel')),
          h('button', { type: 'button', className: 'td-primary', style: S.btnPrimary, onClick: submit }, t('save')))))
    }

    function DetailPanel({ t, item, categories, onCreateCategory, onAddSubtask, onToggleSubtask, onRemoveSubtask, onSave, onRemove }) {
      const [title, setTitle] = useState(asText(item.title))
      const [note, setNote] = useState(asText(item.note))
      const [category, setCategory] = useState(asText(item.category))
      const [quadrant, setQuadrant] = useState(item.quadrant ?? null)
      const [dueDate, setDueDate] = useState(asText(item.dueDate))
      const [duePreset, setDuePreset] = useState(() => (asText(item.dueDate) === '' ? null : normalizeDuePreset(item.duePreset, item.dueDate)))
      const [onOverdue, setOnOverdue] = useState(() => (OVERDUE_MODES.includes(item.onOverdue) ? item.onOverdue : 'none'))
      const [startTime, setStartTime] = useState(asText(item.startTime))
      const [endTime, setEndTime] = useState(asText(item.endTime))
      // 时间点 / 时间段：有结束时间就是时间段，否则是时间点。
      const [timeMode, setTimeMode] = useState(() => (asText(item.endTime) === '' ? 'point' : 'range'))
      const [repeat, setRepeat] = useState(item.repeat ?? null)
      const [subtaskInput, setSubtaskInput] = useState('')
      const [showCategoryPicker, setShowCategoryPicker] = useState(false)
      const [showQuadrantPicker, setShowQuadrantPicker] = useState(false)
      const [showRepeatDialog, setShowRepeatDialog] = useState(false)
      const [showTimePicker, setShowTimePicker] = useState(false)
      const [showDueDialog, setShowDueDialog] = useState(false)
      // 同一时刻只开一个属性选择器 / 弹窗，避免弹层互相叠着。
      const openPicker = (which) => {
        setShowCategoryPicker(which === 'category' ? !showCategoryPicker : false)
        setShowQuadrantPicker(which === 'quadrant' ? !showQuadrantPicker : false)
        setShowTimePicker(which === 'time' ? !showTimePicker : false)
        setShowDueDialog(which === 'due' ? !showDueDialog : false)
        setShowRepeatDialog(which === 'repeat' ? !showRepeatDialog : false)
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
      h('span', { style: S.propertyChevron }, h(Icon, { name: 'chevronRight', size: 12 })))
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
          setDuePreset(asText(item.dueDate) === '' ? null : normalizeDuePreset(item.duePreset, item.dueDate))
          setOnOverdue(OVERDUE_MODES.includes(item.onOverdue) ? item.onOverdue : 'none')
          setStartTime(asText(item.startTime))
          setEndTime(asText(item.endTime))
          setTimeMode(asText(item.endTime) === '' ? 'point' : 'range')
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
          // 宿主会拒绝「结束不晚于开始」的时间段；先在这里拦一下，
          // 否则用户只会看到笼统的「保存失败」，不知道错在哪。
          if (startTime !== '' && endTime !== '' && endTime <= startTime) {
            setSavedMsg({ ok: false, msg: t('timeRangeInvalid') })
            setTimeout(() => setSavedMsg(null), 3000)
            return
          }
          // dueTime 已废弃：只写 startTime（时间点）/ startTime + endTime（时间段）。
          const payload = {
            title: title.trim() || asText(item.title),
            note: note.trim(),
            category: category.trim() === '' ? null : category.trim(),
            quadrant: quadrant || null,
            dueDate: dueDate === '' ? null : dueDate,
            duePreset: dueDate === '' ? null : normalizeDuePreset(duePreset, dueDate),
            onOverdue,
            startTime: startTime === '' ? null : startTime,
            endTime: timeMode === 'range' && endTime !== '' ? endTime : null,
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
        return dueDate
      }

      const repeatDisplay = () => repeatDisplayLabel(repeat, t)

      // 时间行与矩阵行徽标同源：开始 = startTime，结束 = endTime（时段才有）。
      const timeDisplay = () => {
        const label = timeRangeLabel(startTime, timeMode === 'range' ? endTime : '')
        return label === '' ? t('dueNone') : label
      }

      const timeInvalid = startTime !== '' && timeMode === 'range' && endTime !== '' && endTime <= startTime

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
          h('div', { style: { display: 'flex', gap: 6 } },
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
                      ? h(Icon, { name: 'check', size: 9, style: { color: 'var(--dsw-alias-label-primary-inverted)' } })
                      : null)),
                  h('span', { style: { flex: 1, fontSize: 13, color: sub.done ? 'var(--dsw-alias-label-tertiary)' : 'var(--dsw-alias-label-primary)', textDecoration: sub.done ? 'line-through' : 'none' } }, asText(sub.title)),
                  h('button', {
                    type: 'button',
                    className: 'td-btn td-subtask-delete',
                    style: S.subtaskDeleteBtn,
                    'aria-label': t('subtaskDelete'),
                    onClick: () => onRemoveSubtask(sub),
                  }, h(Icon, { name: 'x', size: 14 })))))),

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
                  onCreateCategory,
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

          propRow(t('propertyDueDate'), dueDisplay(), 'due'),
          showDueDialog
            ? h(DueDialog, {
                t,
                dueDate,
                duePreset,
                onOverdue,
                onClose: () => setShowDueDialog(false),
                onSave: (next) => {
                  setDueDate(next.dueDate === null ? '' : next.dueDate)
                  setDuePreset(next.duePreset)
                  setOnOverdue(next.onOverdue)
                  setShowDueDialog(false)
                  markDirty()
                },
              })
            : null,

          propRow(t('propertyTime'), timeDisplay(), 'time'),
          showTimePicker
            ? h('div', { style: S.pickerBody },
                h('div', { style: S.seg },
                  h('button', {
                    type: 'button', className: 'td-btn',
                    'aria-pressed': timeMode === 'point' ? 'true' : 'false',
                    style: { ...S.segItem, ...(timeMode === 'point' ? S.segItemOn : null) },
                    // 切到时间点：开始 = 时限 = 这个时刻，endTime 必须一起清掉。
                    onClick: () => { setTimeMode('point'); setEndTime(''); markDirty() },
                  }, t('timePoint')),
                  h('button', {
                    type: 'button', className: 'td-btn',
                    'aria-pressed': timeMode === 'range' ? 'true' : 'false',
                    style: { ...S.segItem, ...(timeMode === 'range' ? S.segItemOn : null) },
                    onClick: () => setTimeMode('range'),
                  }, t('timeRange'))),
                h('div', { style: { marginTop: 8 } },
                  timeMode === 'point'
                    ? h(TimeField, {
                        t,
                        value: startTime,
                        onChange: (next) => { setStartTime(next); setEndTime(''); markDirty() },
                      })
                    : h('div', null,
                        h('div', { style: S.fieldRow },
                          h('div', { style: { ...S.field, flex: '1 1 0' } },
                            h('span', { style: S.fieldLabel }, t('timeStart')),
                            h(TimeField, {
                              t,
                              value: startTime,
                              onChange: (next) => { setStartTime(next); markDirty() },
                            })),
                          h('div', { style: { ...S.field, flex: '1 1 0' } },
                            h('span', { style: S.fieldLabel }, t('timeEnd')),
                            h(TimeField, {
                              t,
                              value: endTime,
                              onChange: (next) => { setEndTime(next); markDirty() },
                            }))),
                        h('button', {
                          type: 'button', className: 'td-btn', style: S.pickerClear,
                          onClick: () => { setStartTime(''); setEndTime(''); markDirty() },
                        }, t('clearValue')))),
                timeInvalid ? h('div', { style: S.dialogError }, t('timeRangeInvalid')) : null)
            : null,

          propRow(t('propertyRepeat'), repeatDisplay(), 'repeat'),
          showRepeatDialog
            ? h(RepeatDialog, {
                t,
                repeat,
                dueDate,
                onClose: () => setShowRepeatDialog(false),
                onSave: (next) => {
                  setRepeat(next)
                  setShowRepeatDialog(false)
                  markDirty()
                },
              })
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
      const [monthCursor, setMonthCursor] = useState(() => { const at = new Date(); return { year: at.getFullYear(), month: at.getMonth() } })
      const [calendarItems, setCalendarItems] = useState([])
      const [settings, setSettings] = useState({ notify: { system: true, feishu: true, leadMinutes: 0, overdueDaily: true, quietHours: { enabled: false, start: '22:00', end: '08:00' } } })
      const [noticeHidden, setNoticeHidden] = useState(corruptDismissed)
      const [actionError, setActionError] = useState(false)
      const [dataVersion, setDataVersion] = useState(0)
      // 左栏选中的具体某一天（再点一次取消），只影响矩阵里显示哪些计划。
      const [dayFilter, setDayFilter] = useState(null)
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

      const mutate = useCallback(async (method, payload, options) => {
        try {
          await fetchApi(method, payload, tRef.current)
          dismissActionError()
          setDataVersion((v) => v + 1)
          await reload()
          return true
        } catch (err) {
          console.error(`[dsh-sidebar-todo] ${method} failed`, err)
          // 新建分类要把宿主的具体原因（「分类名必填」/「分类名过长（上限 24 字）」）
          // 显示在输入行上，所以允许调用方选择把错误原样抛回；其余调用维持通用错误条。
          if (options?.rethrow === true) throw err
          showActionError()
          await reload()
          return false
        }
      }, [reload, dismissActionError, showActionError])

      /**
       * 新建分类：走 mutate 拿到「重载 + dataVersion 自增」，
       * 失败时把宿主的消息抛回给调用方（左栏输入行 / 分类选择器）。
       */
      const createCategory = useCallback(async (name) => {
        const trimmed = asText(name).trim()
        if (trimmed === '') return false
        await mutate('addCategory', { name: trimmed }, { rethrow: true })
        return true
      }, [mutate])

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
            // parse 识别到的时间走旧别名 dueTime，这里并进 startTime；不再写 dueTime。
            startTime: parsed.startTime || parsed.dueTime || null,
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

      // 周视图拖拽/键盘改期：next 只带 startTime / endTime，其余字段由宿主端 patch 合并。
      // 只给 startTime 的时间点排期拖完仍然是时间点（endTime 传 null，不偷偷变成时间段）。
      const handleReschedule = useCallback((item, next) => {
        const id = asText(item?.todoId)
        if (id === '' || next === null || typeof next !== 'object') return Promise.resolve(false)
        const patch = {}
        if (typeof next.startTime === 'string') patch.startTime = next.startTime
        if ('endTime' in next) patch.endTime = next.endTime === null ? null : asText(next.endTime)
        if (Object.keys(patch).length === 0) return Promise.resolve(false)
        return mutate('update', { id, patch })
      }, [mutate])

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

      // 点某天 = 只看那天的计划（再点一次取消）。选中的格子本身会高亮，
      // 不再额外挂一枚「11-03 ×」胶囊——那是重复信息，用户明确说没必要。
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

      /** 未完成在前、已完成后在后。完成的行**不再被剔除**。 */
      const byDoneLast = (rows) => rows.slice().sort((a, b) => Number(Boolean(a.done)) - Number(Boolean(b.done)))

      // 矩阵 = 已归入象限的计划（**含已完成**），再叠加可选的按天筛选。
      const quadrantItems = useMemo(() => {
        let rows = items.filter((item) => Boolean(item.quadrant))
        if (dayFilter !== null) rows = rows.filter((item) => asText(item.dueDate) === dayFilter)
        return byDoneLast(rows)
      }, [items, dayFilter])

      // 收集箱 = 还没有象限的任务。矩阵按象限分组，它们在那里无处可去。
      const inboxItems = useMemo(() => {
        let rows = items.filter((item) => !item.quadrant)
        if (dayFilter !== null) rows = rows.filter((item) => asText(item.dueDate) === dayFilter)
        return byDoneLast(rows)
      }, [items, dayFilter])

      const handleSelect = (id) => {
        setSelected(id)
      }

      // Render
      if (state.loading && items.length === 0) {
        return h('div', { style: S.page }, h('div', { style: S.empty }, t('loading')))
      }

      const activeRailContent = () => {
        // 视图 = 月历（始终是月历，不再有「列表/日历」二选一的分支）
        if (activeRail === 'view') {
          return h(CalendarView, {
            t,
            selectedDay: null,
            onPickDay: handleSelectDay,
            version: dataVersion,
          })
        }
        // 专注 = 周视图（7 天 × 0-24 时段）
        if (activeRail === 'focus') {
          return h(WeekView, {
            t,
            onSelect: handleSelect,
            onReschedule: handleReschedule,
            version: dataVersion,
          })
        }
        // 统计 = 独立一屏：本周 / 本月各一列（环形图 + 未完成清单）
        if (activeRail === 'stats') {
          // 固定看「当前」这一周 / 这一月（标签写的就是本周/本月）。
          const statsToday = dateKeyOf(new Date())
          const statsAt = new Date()
          const weekFrom = mondayOfKey(statsToday)
          const statsProps = { t, version: dataVersion, selectedId: selected, onSelect: handleSelect, onToggle: handleToggle }
          return h('div', { style: S.statsPane },
            h('div', { style: S.statsWrap },
              h(StatsColumn, {
                ...statsProps, titleKey: 'week',
                from: weekFrom, to: shiftKeyLocal(weekFrom, 6),
              }),
              h(StatsColumn, {
                ...statsProps, titleKey: 'month',
                from: `${statsToday.slice(0, 7)}-01`,
                to: dateKeyOf(new Date(statsAt.getFullYear(), statsAt.getMonth() + 1, 0)),
              })))
        }
        // 收集箱单独一屏：矩阵只吃有象限的任务，否则这些任务在界面上无处可见。
        if (activeFilter === '__inbox__') {
          return h(InboxArea, {
            t,
            items: inboxItems,
            onSelect: handleSelect,
            selectedId: selected,
            onToggle: handleToggle,
            onAdd: handleAddToQuadrant,
          })
        }
        // Default: plan (matrix)
        return h(MatrixArea, {
          t,
          items: quadrantItems,
          onSelect: handleSelect,
          selectedId: selected,
          onToggle: handleToggle,
          onAdd: handleAddToQuadrant,
        })
      }

      return h('div', { style: S.page },
        h(TopBar, {
          t,
          onQuickAdd: handleQuickAdd,
          onToggleCalendar: () => setActiveRail((prev) => (prev === 'view' ? 'plan' : 'view')),
          notificationOn,
          calendarActive: activeRail === 'view',
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
            onCreateCategory: createCategory,
            onInboxFilter: handleInboxFilter,
            monthCursor,
            onMonthChange: handleMonthChange,
            calendarItems,
            onSelectDay: handleSelectDay,
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
                onCreateCategory: createCategory,
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
              }, h(Icon, { name: 'x', size: 14 })))
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
              onCreateCategory: createCategory,
            })
          : null,
      )
    }

    function TodoDialog({ t, initial, mutate, onClose, onSaved, onCreateCategory }) {
      const editing = initial !== null && initial !== undefined && initial.id !== null && initial.id !== undefined
      const [form, setForm] = useState(() => ({
        id: editing ? initial.id : null,
        title: editing ? asText(initial.title) : '',
        note: editing ? asText(initial.note) : '',
        dueDate: editing ? asText(initial.dueDate) : (asText(initial?.dueDate) || dateKeyOf(new Date())),
        startTime: editing ? asText(initial.startTime) : '',
        endTime: editing ? asText(initial.endTime) : '',
        timeMode: editing && asText(initial.endTime) !== '' ? 'range' : 'point',
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
        const onKeyDown = (event) => {
          if (event.key !== 'Escape') return
          event.stopPropagation?.()
          closeRef.current()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [])

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
                // parse 把识别到的时间放在 dueTime 这个旧别名上，这里并进 startTime。
                startTime: parsed.startTime || parsed.dueTime || prev.startTime,
                // 时间点模式下开始即时限，不能再留一个结束时间。
                endTime: prev.timeMode === 'point' ? '' : (parsed.endTime || prev.endTime),
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
        if (form.startTime !== '' && form.timeMode === 'range' && form.endTime !== '' && form.endTime <= form.startTime) {
          setError(t('timeRangeInvalid'))
          return
        }
        const category = form.category.trim()
        const payload = {
          title,
          note: form.note,
          dueDate: form.dueDate || null,
          // dueTime 是已废弃的别名：只写 startTime / endTime。
          startTime: form.startTime || null,
          endTime: form.timeMode === 'range' && form.endTime !== '' ? form.endTime : null,
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

        h('div', { style: S.field },
          h('span', { style: S.fieldLabel }, t('fieldDate')),
          h(DateField, {
            t,
            value: form.dueDate,
            onChange: (next) => setForm((prev) => ({ ...prev, dueDate: next })),
          })),

        // 时间：时间点 = 只填开始（开始即时限）；时间段 = 开始 + 结束。
        h('div', { style: S.field },
          h('span', { style: S.fieldLabel }, t('propertyTime')),
          h('div', { style: S.seg },
            h('button', {
              type: 'button',
              className: 'td-btn',
              'aria-pressed': form.timeMode === 'point' ? 'true' : 'false',
              style: { ...S.segItem, ...(form.timeMode === 'point' ? S.segItemOn : null) },
              onClick: () => setForm((prev) => ({ ...prev, timeMode: 'point', endTime: '' })),
            }, t('timePoint')),
            h('button', {
              type: 'button',
              className: 'td-btn',
              'aria-pressed': form.timeMode === 'range' ? 'true' : 'false',
              style: { ...S.segItem, ...(form.timeMode === 'range' ? S.segItemOn : null) },
              onClick: () => setForm((prev) => ({ ...prev, timeMode: 'range' })),
            }, t('timeRange'))),
          h('div', { style: { marginTop: 8 } },
            form.timeMode === 'point'
              ? h(TimeField, {
                  t,
                  value: form.startTime,
                  onChange: (next) => setForm((prev) => ({ ...prev, startTime: next, endTime: '' })),
                })
              : h('div', null,
                  h('div', { style: S.fieldRow },
                    h('div', { style: { ...S.field, flex: '1 1 0', marginBottom: 0 } },
                      h('span', { style: S.fieldLabel }, t('timeStart')),
                      h(TimeField, {
                        t,
                        value: form.startTime,
                        onChange: (next) => setForm((prev) => ({ ...prev, startTime: next })),
                      })),
                    h('div', { style: { ...S.field, flex: '1 1 0', marginBottom: 0 } },
                      h('span', { style: S.fieldLabel }, t('timeEnd')),
                      h(TimeField, {
                        t,
                        value: form.endTime,
                        onChange: (next) => setForm((prev) => ({ ...prev, endTime: next })),
                      }))),
                  h('button', {
                    type: 'button', className: 'td-btn', style: S.pickerClear,
                    onClick: () => setForm((prev) => ({ ...prev, startTime: '', endTime: '' })),
                  }, t('clearValue'))))),

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
            onCreateCategory,
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
      return h(Icon, { name: 'todo', size })
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
