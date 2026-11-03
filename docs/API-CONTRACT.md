# v4 数据模型与 API 契约

> 分支 `feat/matrix-ui-notify`。宿主端与客户端共同遵守本文件。
> 传输不变：`POST /todo/api/<method>`，请求体 JSON，响应 `{ok:true,result}` / `{ok:false,error:{code,message}}`。

---

## 0a. v4 相对 v3 的增量（时间单一化 / 完成期限 / 超期处理）

### 「时间」只剩一个事实源
`dueTime` **废弃**，不再落库。`startTime` 是唯一来源：

| 模式 | 字段 | 含义 |
|---|---|---|
| 时间点 | `startTime` | 开始时刻 = 时限时刻 = 这个点 |
| 时间段 | `startTime` + `endTime` | 开始 = `startTime`；时限 = `endTime` |

- UI 上「时间」选择器内有一个 **时间点 / 时间段** 切换；切到时间段才出现结束时间。
- `create` / `update` 仍**接受** `dueTime` 作为 `startTime` 的别名（agent 老调用不破），但一律折叠进 `startTime`。
- 逾期判定：`endTime` 存在时，过了 `endTime` 即为逾期（当天也算）；只给时间点时，从次日算起（避免与同一分钟的「到期」重复）。
- 到期提醒时刻 = `startTime ?? 当天 09:00`。

### 新增字段

| 字段 | 取值 | 说明 |
|---|---|---|
| `duePreset` | `today` \| `this_week` \| `this_work_week` \| `custom` \| null | 完成期限选了哪一种；真正的日期仍写在 `dueDate` |
| `onOverdue` | `none` \| `abandon` | 超过期限未完成：无操作 / 标记为放弃（默认 `none`） |
| `abandoned` | boolean | 已放弃。仍然**留在列表里**可见、可撤销，但不再催办 |
| `abandonedAt` | iso \| null | |

### 新增重复类型
`repeat.freq` 扩展为：`daily` / `weekly` / `monthly` / `yearly` / `ebbinghaus` / `workday`

| freq | 规则 |
|---|---|
| `yearly` | 每年同月同日（取系列起始日的月/日，可用 `month` + `monthDay` 覆盖） |
| `ebbinghaus` | 艾宾浩斯复习：自起始日起第 0/1/2/4/7/15/30/60 天 |
| `workday` | 法定工作日。**当前 = 周一至周五**；真实法定节假日/调休需要一份逐年更新的数据源，本机没有可用库，已在 `lib/repeat.js` 顶部留出 `HOLIDAYS` / `MAKEUP_WORKDAYS` 扩展点 |

### 新增接口
`setAbandoned` `{id, abandoned?}` → 行；agent 工具新增 `action: 'abandon'`

## 0. v3 相对 v2 的增量（周视图 + 可改时间）

| 字段 | 说明 |
|---|---|
| `startTime` | `"HH:mm"` \| null — 排期时间段起点，周视图的时间块靠它定位 |
| `endTime` | `"HH:mm"` \| null — 排期时间段终点，必须 **严格晚于** `startTime` |

- `dueTime` **保留**（兼容 + 通知兜底）。语义分工：`startTime/endTime` 是**排期**，`dueTime` 是**截止**。
- 通知触发点：`startTime ?? dueTime ?? 当天 09:00`。
- `occurrences` 的每一项新增 `startTime` / `endTime` / `dueTime`，周视图直接消费。
- 只给 `startTime` 不给 `endTime` 是合法的（未定时长的点状排期），周视图按 60 分钟画。

## 1. 数据文件 v3

路径不变：`%DSH_PROFILE_DIR%/data/dsh-todolist/todos.json`

```jsonc
{
  "version": 3,
  "todos": [ /* 见 §2 */ ],
  "categories": { "工作": { "icon": "💻" }, "汽车": { "icon": "🚗" } },
  "settings": {
    "notify": {
      "system": true,          // 系统通知（Windows toast）
      "feishu": true,          // 飞书通知
      "leadMinutes": 0,        // 提前多少分钟提醒，0 = 准点
      "overdueDaily": true,    // 逾期后每天 09:00 再提醒一次
      "quietHours": { "enabled": false, "start": "22:00", "end": "08:00" }
    }
  },
  "notified": { "<todoId>|<date>|<kind>": "<iso>" }   // 去重账本，kind ∈ due|overdue
}
```

### 迁移（自动，一次性）

**v1 → v2**

- 每条 todo 补 `quadrant: null`、`subtasks: []`
- 补 `categories: {}`、`settings`（默认值）、`notified: {}`
- **象限名迁移**：若 `category` 的值恰好是四个象限名之一，把它搬到 `quadrant` 并把 `category` 置 `null`
  - `重要且紧急` → `urgent_important`
  - `紧急不重要` → `urgent_not_important`
  - `重要不紧急` → `important_not_urgent`
  - `不重要不紧急` → `neither`
- 迁移后写回 `version`；迁移前把原文件备份为 `todos.v1-backup-<ts>.json`

**v2 → v3**

- 每条 todo 补 `startTime: null`、`endTime: null`
- 坏值一律清成 `null`（含 `25:99` 这类格式对但不存在的时刻，以及 `endTime <= startTime` 的倒序区间——只丢 `endTime`，保留 `startTime`）
- **不从 `dueTime` 反推 `startTime`**：不凭空造排期数据。周视图对没有 `startTime` 的任务按 `dueTime` 兜底定位

## 2. Todo 记录

```jsonc
{
  "id": "t_...",
  "title": "string ≤200 非空",
  "note": "string ≤2000",
  "quadrant": "urgent_important" | "important_not_urgent" | "urgent_not_important" | "neither" | null,
  "priority": "high" | "medium" | "low" | null,     // 保留兼容，UI 不再主用
  "category": "string ≤24" | null,
  "dueDate": "YYYY-MM-DD" | null,
  "dueTime": "HH:mm" | null,                        // 截止
  "startTime": "HH:mm" | null,                      // 排期起点（v3）
  "endTime": "HH:mm" | null,                        // 排期终点（v3，必须晚于 startTime）
  "done": false,
  "repeat": { "freq": "daily|weekly|monthly", "interval": 1, "until": null, "weekdays": [1..7], "monthDay": 1..31 } | null,
  "completions": { "YYYY-MM-DD": "iso" },
  "subtasks": [ { "id": "s_...", "title": "string ≤200", "done": false, "doneAt": null } ],
  "doneAt": null, "doneBy": null, "verifiedAt": null,
  "createdAt": "iso", "updatedAt": "iso"
}
```

**收集箱语义**：`quadrant === null` 且未完成 → 属于收集箱。给它设了象限就离开收集箱。

**客户端可见的派生字段**（宿主在 `list` 里补）：
`isRepeating`、`nextDue`、`bucket`、`categoryIcon`（从 `categories` 解析，无则 `null`）。

## 3. API 方法

### 既有（签名不变）
`list` `create` `update` `complete` `confirm` `remove` `occurrences` `retry` `parse`

`list` 入参扩展：`{ view?, q?, category?, quadrant? }`
- `category`：按分类过滤；传 `"__none__"` 表示「无分类」
- `quadrant`：按象限过滤；传 `"__inbox__"` 表示收集箱（`quadrant === null`）
- 返回增加 `inboxCount`（收集箱未完成条数）

`create` / `update` 新增可写字段：`quadrant`、`subtasks`（整体替换）、`startTime`、`endTime`

### 新增

| 方法 | 入参 | 返回 |
|---|---|---|
| `setQuadrant` | `{id, quadrant}` | 更新后的行 |
| `subtaskAdd` | `{id, title}` | 更新后的行 |
| `subtaskUpdate` | `{id, subtaskId, patch:{title?, done?}}` | 更新后的行 |
| `subtaskRemove` | `{id, subtaskId}` | 更新后的行 |
| `categories` | — | `{items:[{name,count,icon}]}` |
| `setCategoryIcon` | `{name, icon}` | `{name, icon}` |
| `settings` | — | `{notify:{...}}` |
| `saveSettings` | `{notify:{...}}`（部分字段合并） | `{notify:{...}}` |
| `notifyPoll` | — | `{toasts:[{id,title,body,kind,dueDate,dueTime}]}` |
| `notifyTest` | `{channel:"system"\|"feishu"}` | `{ok, detail}` |

`notifyPoll` 语义：取走并清空宿主端待弹队列。队列项有 10 分钟 TTL，过期丢弃。
客户端拿到后自己调 `new Notification()` 显示。

## 4. 通知调度（宿主端）

每 30 秒 tick 一次：

1. 遍历未完成 todo，算 `dueAt` = `dueDate` + (`dueTime` ?? `09:00`)
2. **due**：`now >= dueAt` 且 `notified[id|dueDate|due]` 不存在 → 触发
3. **overdue**：`dueDate < today` 且未完成，且 `overdueDaily` 开启，且当天 09:00 已过，且 `notified[id|today|overdue]` 不存在 → 触发
4. 触发时：
   - 静默时段内 → **不投递、不记账**，等静默结束后的 tick 再发
   - 否则：入队 toast（给客户端）+ 若 `feishu` 开启则发飞书 + 记账
5. 记账表按 30 天滚动清理

**飞书**：`ctx.get('dshIm')`（可选服务，缺失则静默降级并只记一次日志）
- `listBots()` 找 `channel === 'feishu'` 的 bot
- `listTargets(botId)` 找 `targetId === 'todo-alerts'`；没有则 `createTarget(botId, {targetId:'todo-alerts', kind:'user', route:{openId}, name:'待办提醒'})`
  - `openId` 从 `~/.dsh/integrations/dsh-feishu/config.json` 的 `bots[0].ownerOpenIds[0]` 读；读不到则跳过并报错
- `send(botId, 'todo-alerts', text, {format:'markdown'})` → `{sent:true}`

## 5. 象限常量

| key | 显示名 | 强调色 |
|---|---|---|
| `urgent_important` | 重要且紧急 | `#f07080` |
| `urgent_not_important` | 紧急不重要 | `#f0d080` |
| `important_not_urgent` | 重要不紧急 | `#b0b0f0` |
| `neither` | 不重要不紧急 | `#7fc9a0` |

矩阵排布（与截图一致）：
```
紧急不重要        重要且紧急
不重要不紧急      重要不紧急
```
