<script setup>
import { computed, ref, onMounted } from 'vue'
import { state } from '../stores/progress.js'
import { THEMES, themeById } from '../data/themes.js'
import { dueThemes, themeStatus, masteryLabel } from '../lib/spaced.js'
import { SQL_CASES } from '../data/sqlCases/index.js'

const due = computed(() =>
  dueThemes(state)
    .map((id) => themeById(id))
    .filter(Boolean)
)

const neverTested = computed(() =>
  THEMES.filter((t) => t.quiz && !state.themes[t.id])
)

const solvedCases = computed(
  () => SQL_CASES.filter((c) => state.sqlCases[c.id]?.solved).length
)

const totalReviews = computed(() =>
  Object.values(state.themes).reduce((n, t) => n + (t.history?.length || 0), 0)
)

const articles = ref([])
onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/articles.json`)
    if (res.ok) articles.value = (await res.json()).articles.slice(0, 5)
  } catch { /* pas encore de flux généré */ }
})
</script>

<template>
  <h1>Tableau de bord</h1>
  <p class="subtitle">Ta veille, tes révisions et tes enquêtes SQL, au même endroit.</p>

  <div class="grid">
    <div class="card">
      <h2 style="margin-top: 0">🔥 À réviser aujourd'hui</h2>
      <p v-if="!due.length && !neverTested.length" class="muted">
        Rien à réviser — la courbe d'Ebbinghaus est de ton côté. 💪
      </p>
      <div v-for="t in due" :key="t.id" class="flex-between" style="margin-bottom: 0.5rem">
        <span>{{ t.icon }} {{ t.name }}</span>
        <router-link :to="`/quiz/${t.id}`"><button class="primary">Réviser</button></router-link>
      </div>
      <div v-if="neverTested.length" class="mt small muted">
        Jamais testés : {{ neverTested.map((t) => t.name).join(', ') }}
      </div>
    </div>

    <div class="card">
      <h2 style="margin-top: 0">📊 Progression</h2>
      <div v-for="t in THEMES.filter((t) => state.themes[t.id])" :key="t.id" class="flex-between" style="margin-bottom: 0.4rem">
        <span class="small">{{ t.icon }} {{ t.name }}</span>
        <span class="badge" :class="themeStatus(state, t.id).cls">
          {{ masteryLabel(state.themes[t.id].level) }}
        </span>
      </div>
      <p v-if="!Object.keys(state.themes).length" class="muted small">
        Lance ton premier quiz pour démarrer le suivi.
      </p>
      <p class="small muted mt">
        {{ totalReviews }} session(s) de quiz · {{ solvedCases }}/{{ SQL_CASES.length }} enquête(s) SQL résolue(s)
      </p>
    </div>
  </div>

  <h2>📡 Derniers articles de veille</h2>
  <p v-if="!articles.length" class="muted small">
    Aucun article pour l'instant — le flux se remplit automatiquement une fois le repo publié sur GitHub
    (workflow <code>veille.yml</code>), ou lance <code>npm run fetch-feeds</code> en local.
  </p>
  <div v-for="a in articles" :key="a.link" class="card">
    <div class="flex-between">
      <a :href="a.link" target="_blank" rel="noopener">{{ a.title }}</a>
      <span class="badge accent">{{ a.themeName }}</span>
    </div>
    <div class="small muted">{{ a.source }} · {{ new Date(a.date).toLocaleDateString('fr-FR') }}</div>
  </div>
  <router-link to="/veille" v-if="articles.length">Toute la veille →</router-link>
</template>
