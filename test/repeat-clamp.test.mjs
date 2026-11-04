/**
 * 每月/每年重复：当月（当年）没有第 N 天时，回退到当月最后一天。
 *
 * 没有这条回退时，「每月 31 号」在 2/4/6/9/11 月**一次都不会触发**，而且是静默
 * 跳过——不报错、日历上也不出现，用户只会觉得任务莫名消失。选 29/30 号在 2 月同理。
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import { occurrencesBetween, isDueOn } from '../lib/repeat.js'

const monthly = (day) => ({ id: 'x', dueDate: '2026-01-01', repeat: { freq: 'monthly', monthDay: day }, completions: {} })
// occurrencesBetween 返回的是日期键字符串数组（不是对象）。
const dates = (todo, from, to) => occurrencesBetween(todo, from, to)

test('每月 31 号在短月回退到当月最后一天，且全年 12 次', async () => {
  const t = monthly(31)
  assert.deepEqual(dates(t, '2026-02-01', '2026-02-28'), ['2026-02-28'], 'February')
  assert.deepEqual(dates(t, '2026-04-01', '2026-04-30'), ['2026-04-30'], 'April')
  assert.deepEqual(dates(t, '2026-09-01', '2026-09-30'), ['2026-09-30'], 'September')
  assert.deepEqual(dates(t, '2026-01-01', '2026-01-31'), ['2026-01-31'], 'a 31-day month is unchanged')
  assert.equal(occurrencesBetween(t, '2026-01-01', '2026-12-31').length, 12, 'no month is skipped')
})

test('每月 31 号在闰年 2 月落在 29 日', async () => {
  assert.deepEqual(dates(monthly(31), '2028-02-01', '2028-02-29'), ['2028-02-29'])
})

test('每月 29 / 30 号在 2 月同样回退，不再静默跳过', async () => {
  assert.deepEqual(dates(monthly(29), '2026-02-01', '2026-02-28'), ['2026-02-28'])
  assert.deepEqual(dates(monthly(30), '2026-02-01', '2026-02-28'), ['2026-02-28'])
  // 长月里仍然是本来的日子
  assert.deepEqual(dates(monthly(30), '2026-09-01', '2026-09-30'), ['2026-09-30'])
  assert.deepEqual(dates(monthly(29), '2026-09-01', '2026-09-30'), ['2026-09-29'])
})

test('每月 1-28 号完全不受影响', async () => {
  for (const day of [1, 15, 28]) {
    const dd = String(day).padStart(2, '0')
    assert.deepEqual(dates(monthly(day), '2026-02-01', '2026-02-28'), [`2026-02-${dd}`], `day ${day} in February`)
    assert.deepEqual(dates(monthly(day), '2026-09-01', '2026-09-30'), [`2026-09-${dd}`], `day ${day} in September`)
  }
})

test('每年 2 月 29 日在平年回退到 2 月 28 日', async () => {
  const yearly = { id: 'y', dueDate: '2024-02-29', repeat: { freq: 'yearly', month: 2, monthDay: 29 }, completions: {} }
  assert.deepEqual(dates(yearly, '2027-02-01', '2027-02-28'), ['2027-02-28'], 'non-leap')
  assert.deepEqual(dates(yearly, '2028-02-01', '2028-02-29'), ['2028-02-29'], 'leap')
})

test('isDueOn agrees with occurrencesBetween on the fallback day', async () => {
  const t = monthly(31)
  assert.equal(isDueOn(t, '2026-02-28'), true)
  assert.equal(isDueOn(t, '2026-02-27'), false)
  assert.equal(isDueOn(t, '2026-02-29'), false, '2026 is not a leap year')
})
