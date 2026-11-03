/** Host half of the todo bundle: data file, HTTP route, agent tool, notification scheduler. */

import { dirname, join } from 'node:path'

import { createStore, resolveDataFile } from './lib/store.js'
import { createApi } from './lib/api.js'
import { createTool } from './lib/tool.js'
import { createNotifier } from './lib/notify.js'
import { createHolidayService } from './lib/holidays.js'
import { setWorkdayTables } from './lib/repeat.js'

// 注意：不要在这里加 'dshIm' —— 那是可选的飞书投递服务，写进 inject 会让没有 dsh-im 的宿主
// 直接起不来。用 ctx.get('dshIm') 惰性取，取不到就只关掉飞书通道。
export const inject = ['webServer', 'connection', 'tools']

const PREFIX = '/todo/api/'
const STATUS = { 'invalid-input': 400, 'not-found': 404, 'io-error': 500 }

function writeJson(res, status, body) {
  const text = JSON.stringify(body)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(text)
}

async function readJson(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}

/** 惰性解析 cordis 可选服务：取不到返回 undefined，不抛。 */
function optionalService(ctx, name) {
  try {
    if (typeof ctx.get === 'function') return ctx.get(name)
  } catch { /* 服务未注册——按缺失处理 */ }
  return undefined
}

export function apply(ctx, config = {}) {
  // config.dataPath: 可选，覆盖默认数据文件（默认 %DSH_PROFILE_DIR%/data/dsh-todolist/todos.json）。
  // config.staleDays: 超过多少天未完成的待办算「积压」，默认 7 天。
  // config.notifyIntervalMs: 通知巡检间隔，默认 30 秒。
  const dataFile = resolveDataFile(config.dataPath)
  const store = createStore({
    file: dataFile,
    staleDays: Number.isInteger(config.staleDays) ? config.staleDays : 7,
  })
  const ready = store.load()
  void ready.catch(() => {}) // 不让 load 失败变成未处理拒绝；错误仍由 await ready 的调用方拿到

  const notifier = createNotifier({
    store,
    getIm: () => optionalService(ctx, 'dshIm'),
    logger: console,
    intervalMs: Number.isInteger(config.notifyIntervalMs) ? config.notifyIntervalMs : 30000,
  })

  // 法定工作日：抓取 → 缓存 → 注入给 repeat.js。抓不到就退回周末规则，绝不影响待办本身。
  const holidays = createHolidayService({
    file: join(dirname(dataFile), 'holidays.json'),
    logger: console,
    fetchImpl: typeof config.fetchImpl === 'function' ? config.fetchImpl : undefined,
  })

  const api = createApi(store, notifier, holidays)

  // 迁移只在进程首次 load 时发生一次；记一条日志，便于事后核对数据是怎么被改的。
  void ready.then((res) => {
    if (res && res.migrated) {
      console.info(
        `[dsh-sidebar-todo] 数据已从 v${res.migrated.from} 迁移到 v${res.migrated.to}` +
        `（${res.migrated.movedQuadrants} 条待办的象限名从「分类」搬到了「四象限」）；` +
        `原文件已备份为 todos.v1-backup-*.json`,
      )
    }
  }).catch(() => {})

  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/todo/api',
    handler: async (req, res) => {
      if (ctx.connection.requestRejection(req) !== undefined) {
        writeJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'forbidden' } })
        return
      }
      if (req.method !== 'POST') {
        writeJson(res, 405, { ok: false, error: { code: 'method', message: '只支持 POST' } })
        return
      }
      const pathname = new URL(req.url ?? '/', 'http://dsh.internal').pathname
      const method = pathname.startsWith(PREFIX) ? pathname.slice(PREFIX.length) : ''
      if (method === '' || method.includes('/') || !Object.hasOwn(api, method)) {
        writeJson(res, 404, { ok: false, error: { code: 'not-found', message: '未知接口' } })
        return
      }
      try {
        await ready
        const body = await readJson(req)
        const result = await api[method](body)
        writeJson(res, 200, { ok: true, result })
      } catch (err) {
        const code = err?.code ?? 'internal'
        writeJson(res, STATUS[code] ?? 500, {
          ok: false,
          error: { code, message: err?.message ?? '待办操作失败' },
        })
      }
    },
  }), 'dsh-sidebar-todo: http')

  ctx.effect(() => ctx.tools.register(createTool(api, ready)), 'dsh-sidebar-todo: tool')

  ctx.effect(() => {
    // 巡检必须等数据加载完，否则第一 tick 会看到空清单。
    void ready.then(() => notifier.start()).catch(() => {})
    return () => notifier.stop()
  }, 'dsh-sidebar-todo: notify')

  ctx.effect(() => {
    const cycle = async () => {
      try {
        // 顺序要紧：先把缓存换上（离线也立刻可用），再按需抓取，抓到了再换一次。
        await holidays.load()
        setWorkdayTables(holidays.tables())
        await holidays.ensure()
        setWorkdayTables(holidays.tables())
      } catch (err) {
        console.warn('[dsh-sidebar-todo] 法定工作日更新失败（继续用已有数据）：', err?.message ?? err)
      }
    }
    void cycle()
    // 每小时看一眼足够：真正的抓取一年只有一两次（当年缺失时一次、12 月首个工作日一次）。
    const timer = setInterval(cycle, 3600000)
    if (typeof timer.unref === 'function') timer.unref()
    return () => clearInterval(timer)
  }, 'dsh-sidebar-todo: workdays')

  ctx.effect(() => () => { void store.close() }, 'dsh-sidebar-todo: store')
}
