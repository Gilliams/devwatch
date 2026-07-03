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

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Anti-triche : l'ordre des choix est remélangé à chaque session,
// la position de la bonne réponse change donc à chaque fois.
function shuffleChoices(q) {
  const order = shuffle(q.choices.map((_, i) => i))
  return { ...q, choices: order.map((i) => q.choices[i]), answer: order.indexOf(q.answer) }
}

// n questions mélangées d'un thème (ou de tous les thèmes si themeId === 'random')
export function pickQuestions(themeId, n) {
  let pool
  if (themeId === 'random') {
    pool = Object.entries(QUESTION_BANKS).flatMap(([id, qs]) => qs.map((q) => ({ ...q, theme: id })))
  } else {
    pool = questionsFor(themeId).map((q) => ({ ...q, theme: themeId }))
  }
  return shuffle(pool).slice(0, Math.min(n, pool.length)).map(shuffleChoices)
}
