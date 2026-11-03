# 本地分支改造说明

> 基线：`dsh-sidebar-todo@0.2.3`（作者 Natte，上游 https://github.com/Natte/dsh-sidebar-todo）
> 本分支：`feat/matrix-ui-notify`，版本 **0.3.0**
> 仓库位置：`D:\杂七杂八\dsh-sidebar-todo`（git 仓库，`main` = pristine 0.2.3）

## 改了什么

### 1. 界面 → 四象限矩阵（按老板提供的截图）

| 区域 | 内容 |
|---|---|
| 左侧 rail | 做计划 / 视图 / 专注 |
| 左面板 | 收集箱（含计数）、月历、带 emoji 图标的分类列表、新建分类 |
| 顶部栏 | 快捷添加（回车入收集箱）、通知开关、日历 |
| 主区 | 2×2 四象限卡片 + 空态插画 |
| 右侧 | 详情面板：标题、子计划、备注、计划分类、重要优先级、完成期限、重复、保存 |

### 2. 数据模型 v1 → v2（自动迁移）

新增：`quadrant`（四象限，`null` = 收集箱）、`subtasks`（子计划）、
`categories`（分类图标表）、`settings.notify`（通知设置）。

迁移是一次性自动的：

- 每条待办补 `quadrant: null`、`subtasks: []`
- **旧数据里写在 `category` 的象限名会被搬到 `quadrant`**（历史遗留：agent 曾把「重要且紧急」当分类写）
- 迁移前原件备份为 `todos.v1-backup-<时间戳>.json`，与 `todos.json` 同目录

### 3. 通知

| 通道 | 实现 |
|---|---|
| 系统通知 | 客户端拿宿主的待弹队列 → `new Notification()`（Electron 下即 Windows toast） |
| 飞书通知 | 宿主端经 `ctx.get('dshIm')`（dsh-im 的共享服务）发给你本人 |

- 巡检间隔 30 秒（宿主端定时器，不受浏览器后台节流影响）
- **到期**：`dueDate` + (`dueTime` 或当天 09:00)，可配提前 N 分钟
- **逾期**：过了截止日就只报逾期，不再报到期（否则停机一周会补出一堆无意义的「到期」）
- 去重账本：`notify-state.json`（与 `todos.json` 同目录），键 `<todoId>|<日期>|<kind>`，保留 30 天
- 静默时段内**不投递也不记账**，等静默结束后再发
- 队列 TTL 10 分钟：离线久了不会一次性炸出几十条

## 怎么配置

界面顶部栏的喇叭图标里改；也可直接改 `todos.json` 的 `settings.notify`：

```jsonc
{
  "system": true,        // 系统通知
  "feishu": true,        // 飞书通知
  "leadMinutes": 0,      // 提前提醒分钟数
  "overdueDaily": true,  // 逾期后每天 09:00 再提醒
  "quietHours": { "enabled": false, "start": "22:00", "end": "08:00" }
}
```

巡检间隔可在 `cordis.patch.yml` 的插件行里用 `notifyIntervalMs` 覆盖。

## 飞书的前提

- 需要 **dsh-im 插件**在同一宿主里启用（本机已启用）。缺失时飞书通道自动降级，只记一条日志，不影响待办本身
- 首次发送会自动建一个投递目标 `todo-alerts`（发给飞书配置里的 `ownerOpenIds[0]`，即你本人）
- 用的是 dsh-im 文档化的「在同一 Host 的插件中发送」路径，文本投递；**不支持**卡片/图片（那是投递接口的限制）

## 怎么回退

npm 原包**没有被改动**。回退只要把 profile 的依赖改回去：

```bash
# profile: ~/.dsh/profiles/desktop/package.json
# 把  "dsh-sidebar-todo": "link:D:/杂七杂八/dsh-sidebar-todo"
# 改回 "dsh-sidebar-todo": "^0.2.3"
# 然后重装依赖并重载插件行
```

数据也兼容：v2 文件里 `todos` 的结构对 v1 是超集（多了 `quadrant`/`subtasks`），
v1 的 0.2.3 读到多出来的字段会忽略，不会崩。要彻底回到 v1 的「象限名放在 category」形态，
用 `todos.v1-backup-*.json`。

## 开发 / 验证

```bash
node --test          # 52 个测试
node --check client.js
```

- 改 `client.js` → HMR 自动拾取（500ms 轮询）
- 改 `index.js` / `lib/*.js` → **不热更**，必须重载插件行
