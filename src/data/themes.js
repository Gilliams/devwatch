// Thèmes de veille et de révision.
// `quiz: true` = une banque de questions existe dans src/data/questions/
// `color` = couleur d'accent du thème (badges, cards de veille)
export const THEMES = [
  { id: 'php', name: 'PHP', icon: '🐘', quiz: true, color: '#8993be' },
  { id: 'symfony', name: 'Symfony', icon: '🎼', quiz: true, color: '#22d3ee' },
  { id: 'sql', name: 'SQL', icon: '🗃️', quiz: true, color: '#fbbf24' },
  { id: 'database', name: 'Bases de données & Doctrine', icon: '🛢️', quiz: true, color: '#3b82f6' },
  { id: 'patterns', name: 'Design Patterns', icon: '🧩', quiz: true, color: '#a855f7' },
  { id: 'devops', name: 'DevOps', icon: '🚀', quiz: true, color: '#14b8a6' },
  { id: 'securite', name: 'Sécurité / Hack', icon: '🔐', quiz: true, color: '#ef4444' },
  { id: 'laravel', name: 'Laravel', icon: '🔺', quiz: true, color: '#fb923c' },
  { id: 'vuejs', name: 'VueJS', icon: '💚', quiz: true, color: '#4ade80' },
  { id: 'ia', name: 'IA', icon: '🤖', quiz: true, color: '#d946ef' },
  { id: 'devweb', name: 'Développement Web', icon: '🌐', quiz: false, color: '#94a3b8' },
  { id: 'frontend', name: 'FrontEnd', icon: '🎨', quiz: false, color: '#ec4899' },
  { id: 'threed', name: '3D', icon: '🧊', quiz: false, color: '#84cc16' },
  { id: 'drupal', name: 'Drupal', icon: '💧', quiz: false, color: '#29a8df' },
]

export function themeById(id) {
  return THEMES.find((t) => t.id === id)
}

export function themeColor(id) {
  return themeById(id)?.color || '#8b949e'
}

export function themeIcon(id) {
  return themeById(id)?.icon || '📰'
}
