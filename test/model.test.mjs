/** v2 model tests: quadrant + subtasks validation, patch semantics. */
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  normalizeCreate,
  applyPatch,
  newSubtaskId,
  QUADRANTS,
  LEGACY_QUADRANT_NAMES,
  TodoError,
} from '../lib/model.js'

test('create defaults: quadrant null (inbox), subtasks empty', () => {
  const t = normalizeCreate({ title: '买个面包' })
  assert.equal(t.quadrant, null)
  assert.deepEqual(t.subtasks, [])
  assert.equal(t.done, false)
})

test('create accepts each quadrant', () => {
  for (const q of QUADRANTS) {
    assert.equal(normalizeCreate({ title: 'x', quadrant: q }).quadrant, q)
  }
})

test('create rejects an unknown quadrant', () => {
  assert.throws(() => normalizeCreate({ title: 'x', quadrant: 'bogus' }), (e) => e instanceof TodoError && e.code === 'invalid-input')
})

test('create normalizes subtasks and assigns ids', () => {
  const t = normalizeCreate({ title: 'x', subtasks: [{ title: ' 子一 ' }, { title: '子二', done: true }] })
  assert.equal(t.subtasks.length, 2)
  assert.equal(t.subtasks[0].title, '子一')
  assert.equal(t.subtasks[0].done, false)
  assert.equal(t.subtasks[0].doneAt, null)
  assert.equal(t.subtasks[1].done, true)
  assert.ok(t.subtasks[1].doneAt, 'done subtask gets doneAt')
  assert.match(t.subtasks[0].id, /^s_/)
})

test('create keeps an existing subtask id (round-trip)', () => {
  const id = newSubtaskId()
  const t = normalizeCreate({ title: 'x', subtasks: [{ id, title: '子' }] })
  assert.equal(t.subtasks[0].id, id)
})

test('create rejects non-array subtasks, empty titles, and oversize lists', () => {
  assert.throws(() => normalizeCreate({ title: 'x', subtasks: 'nope' }), (e) => e.code === 'invalid-input')
  assert.throws(() => normalizeCreate({ title: 'x', subtasks: [{ title: '   ' }] }), (e) => e.code === 'invalid-input')
  const many = Array.from({ length: 101 }, (_, i) => ({ title: `s${i}` }))
  assert.throws(() => normalizeCreate({ title: 'x', subtasks: many }), (e) => e.code === 'invalid-input')
})

test('patch can move a todo between quadrants and null it back to inbox', () => {
  const t = normalizeCreate({ title: 'x', quadrant: 'urgent_important' })
  assert.equal(applyPatch(t, { quadrant: 'neither' }).quadrant, 'neither')
  assert.equal(applyPatch(t, { quadrant: null }).quadrant, null)
  assert.equal(applyPatch(t, { quadrant: '' }).quadrant, null)
})

test('patch replaces subtasks wholesale and preserves ids', () => {
  const t = normalizeCreate({ title: 'x', subtasks: [{ title: 'a' }, { title: 'b' }] })
  const keep = t.subtasks[1].id
  const next = applyPatch(t, { subtasks: [{ id: keep, title: 'b2', done: true }] })
  assert.equal(next.subtasks.length, 1)
  assert.equal(next.subtasks[0].id, keep)
  assert.equal(next.subtasks[0].title, 'b2')
  assert.equal(next.subtasks[0].done, true)
})

test('patch ignores unknown keys', () => {
  const t = normalizeCreate({ title: 'x' })
  assert.equal(applyPatch(t, { nonsense: 1 }).nonsense, undefined)
})

test('patch bumps updatedAt', () => {
  const t = normalizeCreate({ title: 'x' })
  const next = applyPatch(t, { note: 'hi' })
  assert.ok(next.updatedAt >= t.updatedAt)
})

test('legacy quadrant names map to the four keys', () => {
  assert.deepEqual(Object.values(LEGACY_QUADRANT_NAMES).sort(), [...QUADRANTS].sort())
})
