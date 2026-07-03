import php from './php.js'
import symfony from './symfony.js'
import sql from './sql.js'
import database from './database.js'
import patterns from './patterns.js'
import devops from './devops.js'
import securite from './securite.js'
import laravel from './laravel.js'
import vuejs from './vuejs.js'
import ia from './ia.js'

export const QUESTION_BANKS = { php, symfony, sql, database, patterns, devops, securite, laravel, vuejs, ia }

export function questionsFor(themeId) {
  return QUESTION_BANKS[themeId] || []
}

// n questions mélangées d'un thème (ou de tous les thèmes si themeId === 'random')
export function pickQuestions(themeId, n) {
  let pool
  if (themeId === 'random') {
    pool = Object.entries(QUESTION_BANKS).flatMap(([id, qs]) => qs.map((q) => ({ ...q, theme: id })))
  } else {
    pool = questionsFor(themeId).map((q) => ({ ...q, theme: themeId }))
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, shuffled.length))
}
