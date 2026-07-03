import galerie from './galerie.js'
import neobanque from './neobanque.js'
import datacore from './datacore.js'

export const SQL_CASES = [galerie, neobanque, datacore]

export function caseById(id) {
  return SQL_CASES.find((c) => c.id === id)
}

// Normalise une réponse utilisateur pour comparaison tolérante
const COMBINING_MARKS = /[̀-ͯ]/g

export function normalizeAnswer(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function checkAnswer(step, userInput) {
  const input = normalizeAnswer(userInput)
  if (!input) return false
  return step.answer.some((a) => {
    const expected = normalizeAnswer(a)
    return step.mode === 'contains' ? input.includes(expected) : input === expected
  })
}
