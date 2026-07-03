// Répétition espacée inspirée de la courbe d'Ebbinghaus.
// Chaque réussite espace la prochaine révision ; un échec ramène au début.
export const INTERVALS_DAYS = [1, 3, 7, 14, 30, 60, 120]

const DAY = 24 * 60 * 60 * 1000

export function recordQuizResult(state, themeId, score, total) {
  const pct = total > 0 ? score / total : 0
  const t = state.themes[themeId] || { level: 0, lastReview: null, nextReview: null, history: [] }

  if (pct >= 0.8) {
    t.level = Math.min(t.level + 1, INTERVALS_DAYS.length - 1)
  } else if (pct < 0.6) {
    t.level = 0 // on repart de demain : la mémoire a besoin d'être réamorcée
  }
  // entre 60 et 79 % : on garde le même palier, on re-teste au même intervalle

  const now = new Date()
  t.lastReview = now.toISOString()
  t.nextReview = new Date(now.getTime() + INTERVALS_DAYS[t.level] * DAY).toISOString()
  t.history = (t.history || []).slice(-19)
  t.history.push({ date: now.toISOString(), score, total })
  state.themes[themeId] = t
  return t
}

export function dueThemes(state) {
  const now = Date.now()
  return Object.entries(state.themes)
    .filter(([, t]) => t.nextReview && new Date(t.nextReview).getTime() <= now)
    .map(([id]) => id)
}

export function themeStatus(state, themeId) {
  const t = state.themes[themeId]
  if (!t || !t.nextReview) return { label: 'Jamais testé', cls: '', due: true }
  const next = new Date(t.nextReview).getTime()
  const days = Math.ceil((next - Date.now()) / DAY)
  if (days <= 0) return { label: 'À réviser !', cls: 'orange', due: true }
  return { label: `Acquis · revoir dans ${days} j`, cls: 'green', due: false }
}

export function masteryLabel(level) {
  const labels = ['Novice', 'Débutant', 'En cours', 'Solide', 'Avancé', 'Maîtrisé', 'Expert']
  return labels[Math.min(level, labels.length - 1)]
}
