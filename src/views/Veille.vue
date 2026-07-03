<script setup>
import { ref, computed, onMounted } from 'vue'
import { state } from '../stores/progress.js'
import { THEMES } from '../data/themes.js'

const articles = ref([])
const loading = ref(true)
const generatedAt = ref(null)
const filter = ref('all')
const search = ref('')
const hideRead = ref(false)

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/articles.json`)
    if (res.ok) {
      const data = await res.json()
      articles.value = data.articles
      generatedAt.value = data.generatedAt
    }
  } catch { /* fichier absent en local avant le premier fetch */ }
  loading.value = false
})

const filtered = computed(() =>
  articles.value.filter((a) => {
    if (filter.value !== 'all' && a.theme !== filter.value) return false
    if (hideRead.value && state.readArticles.includes(a.link)) return false
    if (search.value && !a.title.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  })
)

function toggleRead(link) {
  const i = state.readArticles.indexOf(link)
  if (i >= 0) state.readArticles.splice(i, 1)
  else state.readArticles.push(link)
}
</script>

<template>
  <h1>📡 Veille technologique</h1>
  <p class="subtitle">
    Flux RSS agrégés automatiquement toutes les 6 h par GitHub Actions.
    <span v-if="generatedAt">Dernière mise à jour : {{ new Date(generatedAt).toLocaleString('fr-FR') }}</span>
  </p>

  <div class="flex" style="margin-bottom: 1.2rem">
    <select v-model="filter" style="max-width: 260px">
      <option value="all">Tous les thèmes</option>
      <option v-for="t in THEMES" :key="t.id" :value="t.id">{{ t.icon }} {{ t.name }}</option>
    </select>
    <input type="text" v-model="search" placeholder="Rechercher un titre…" style="max-width: 300px" />
    <label style="margin: 0; display: flex; align-items: center; gap: 0.4rem; cursor: pointer">
      <input type="checkbox" v-model="hideRead" style="width: auto" /> masquer les lus
    </label>
  </div>

  <p v-if="loading" class="muted">Chargement…</p>
  <div v-else-if="!articles.length" class="card">
    <p>
      Aucun article pour l'instant. Le fichier <code>public/data/articles.json</code> est généré :
    </p>
    <ul>
      <li>automatiquement toutes les 6 h par le workflow GitHub <code>veille.yml</code> une fois le repo poussé ;</li>
      <li>ou manuellement avec <code>npm run fetch-feeds</code>.</li>
    </ul>
  </div>
  <p v-else-if="!filtered.length" class="muted">Aucun article ne correspond aux filtres.</p>

  <div
    v-for="a in filtered"
    :key="a.link"
    class="card"
    :style="state.readArticles.includes(a.link) ? 'opacity:0.5' : ''"
  >
    <div class="flex-between">
      <a :href="a.link" target="_blank" rel="noopener" @click="!state.readArticles.includes(a.link) && toggleRead(a.link)">
        {{ a.title }}
      </a>
      <div class="flex" style="gap: 0.4rem; flex-shrink: 0">
        <span class="badge accent">{{ a.themeName }}</span>
        <button class="small" @click="toggleRead(a.link)" :title="state.readArticles.includes(a.link) ? 'Marquer non lu' : 'Marquer lu'">
          {{ state.readArticles.includes(a.link) ? '↩' : '✓' }}
        </button>
      </div>
    </div>
    <div class="small muted">{{ a.source }} · {{ new Date(a.date).toLocaleDateString('fr-FR') }}</div>
    <p v-if="a.summary" class="small" style="margin: 0.4rem 0 0">{{ a.summary }}</p>
  </div>
</template>
