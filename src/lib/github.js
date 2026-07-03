// Synchronisation de la progression vers le repo GitHub (fichier progress/progress.json).
// Le workflow de rappels par mail lit ce fichier pour calculer les thèmes à réviser.
import { state, exportProgress, importProgress } from '../stores/progress.js'

const FILE_PATH = 'progress/progress.json'

function apiUrl() {
  const { githubOwner, githubRepo } = state.settings
  return `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${FILE_PATH}`
}

function headers() {
  return {
    Authorization: `Bearer ${state.settings.githubToken}`,
    Accept: 'application/vnd.github+json',
  }
}

export function syncConfigured() {
  const s = state.settings
  return !!(s.githubOwner && s.githubRepo && s.githubToken)
}

// btoa gère mal l'UTF-8 : on encode proprement
function toBase64(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)))
}
function fromBase64(b64) {
  return new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)))
}

export async function pullProgress() {
  if (!syncConfigured()) return { ok: false, message: 'Sync non configurée' }
  const res = await fetch(`${apiUrl()}?ref=${state.settings.githubBranch}`, { headers: headers() })
  if (res.status === 404) return { ok: true, message: 'Aucune progression distante (premier sync)' }
  if (!res.ok) return { ok: false, message: `GitHub a répondu ${res.status}` }
  const json = await res.json()
  importProgress(JSON.parse(fromBase64(json.content.replace(/\n/g, ''))))
  state.lastSync = new Date().toISOString()
  return { ok: true, message: 'Progression récupérée depuis GitHub' }
}

export async function pushProgress() {
  if (!syncConfigured()) return { ok: false, message: 'Sync non configurée' }

  // Récupérer le sha actuel du fichier s'il existe
  let sha
  const check = await fetch(`${apiUrl()}?ref=${state.settings.githubBranch}`, { headers: headers() })
  if (check.ok) sha = (await check.json()).sha

  const res = await fetch(apiUrl(), {
    method: 'PUT',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'chore: mise à jour de la progression DevWatch',
      content: toBase64(JSON.stringify(exportProgress(), null, 2)),
      branch: state.settings.githubBranch,
      ...(sha ? { sha } : {}),
    }),
  })
  if (!res.ok) return { ok: false, message: `Échec du push (${res.status})` }
  state.lastSync = new Date().toISOString()
  return { ok: true, message: 'Progression sauvegardée sur GitHub ☁️' }
}

// Push silencieux après un quiz / une enquête (ne bloque pas l'UI si ça échoue)
export function pushQuietly() {
  if (!syncConfigured()) return
  pushProgress().catch((e) => console.warn('Sync GitHub échouée', e))
}
