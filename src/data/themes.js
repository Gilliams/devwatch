// Thèmes de veille et de révision.
// `quiz: true` = une banque de questions existe dans src/data/questions/
export const THEMES = [
  { id: 'php', name: 'PHP', icon: '🐘', quiz: true },
  { id: 'symfony', name: 'Symfony', icon: '🎼', quiz: true },
  { id: 'sql', name: 'SQL', icon: '🗃️', quiz: true },
  { id: 'database', name: 'Bases de données & Doctrine', icon: '🛢️', quiz: true },
  { id: 'patterns', name: 'Design Patterns', icon: '🧩', quiz: true },
  { id: 'devops', name: 'DevOps', icon: '🚀', quiz: true },
  { id: 'securite', name: 'Sécurité / Hack', icon: '🔐', quiz: true },
  { id: 'laravel', name: 'Laravel', icon: '🔺', quiz: true },
  { id: 'vuejs', name: 'VueJS', icon: '💚', quiz: true },
  { id: 'ia', name: 'IA', icon: '🤖', quiz: true },
  { id: 'devweb', name: 'Développement Web', icon: '🌐', quiz: false },
  { id: 'frontend', name: 'FrontEnd', icon: '🎨', quiz: false },
  { id: 'threed', name: '3D', icon: '🧊', quiz: false },
  { id: 'drupal', name: 'Drupal', icon: '💧', quiz: false },
]

export function themeById(id) {
  return THEMES.find((t) => t.id === id)
}
