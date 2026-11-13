/**
 * 声明顺序守卫：TodoPage 里 `selectedItem` 用了 `windowRows`，两者都是 `const`。
 *
 * 真实事故：把 `selectedItem` 写在 `windowRows` 之前 → 打开任意一条**循环待办**时
 * 抛 ReferenceError（暂时性死区），整个详情面板白屏。非循环待办走 early-return
 * 不碰 windowRows，所以只有重复待办会崩，看着像「数据坏了」。
 *
 * 这不是靠肉眼能长期守住的东西，所以用源码顺序断言兜住。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(HERE, '..', 'client.js')
const LINES = fs.readFileSync(SRC, 'utf8').split('\n')

/** TodoPage 的行范围（到下一个顶层 function 为止）。 */
function todoPageRange() {
  const start = LINES.findIndex((l) => /^    function TodoPage\(/.test(l))
  assert.ok(start >= 0, 'TodoPage not found')
  let end = LINES.length
  for (let i = start + 1; i < LINES.length; i += 1) {
    if (/^    function \w/.test(LINES[i])) { end = i; break }
  }
  return { start, end }
}

const declOf = (name, { start, end }) => {
  const re = new RegExp(`^\\s*const (\\[)?${name}\\b`)
  return LINES.findIndex((l, i) => i >= start && i < end && re.test(l))
}

test('windowRows 必须声明在 selectedItem 之前（否则循环待办面板白屏）', () => {
  const range = todoPageRange()
  const rows = declOf('windowRows', range)
  const selected = declOf('selectedItem', range)
  assert.ok(rows >= 0, '没找到 windowRows 声明')
  assert.ok(selected >= 0, '没找到 selectedItem 声明')
  assert.ok(
    rows < selected,
    `windowRows 在 ${rows + 1} 行、selectedItem 在 ${selected + 1} 行：`
    + 'selectedItem 用到了 windowRows，写在前面会触发暂时性死区',
  )
})

test('windowRows 依赖的四个值都声明在它之前', () => {
  const range = todoPageRange()
  const rows = declOf('windowRows', range)
  for (const dep of ['items', 'windowRange', 'windowOccurrence', 'statusFilter']) {
    const at = declOf(dep, range)
    assert.ok(at >= 0, `没找到 ${dep} 声明`)
    assert.ok(at < rows, `${dep}(${at + 1}) 必须声明在 windowRows(${rows + 1}) 之前`)
  }
})

test('详情面板挂载点引用的 selectedItem / windowRows 都在渲染之前声明', () => {
  const range = todoPageRange()
  const renderAt = LINES.findIndex((l, i) => i >= range.start && i < range.end && /h\('div', \{ style: S\.mainBody \}/.test(l))
  assert.ok(renderAt > 0, '没找到 mainBody 渲染')
  for (const name of ['selectedItem', 'windowRows', 'handleSaveDetail']) {
    const at = declOf(name, range)
    assert.ok(at >= 0 && at < renderAt, `${name} 应声明在渲染前`)
  }
})
