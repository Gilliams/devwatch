<script setup>
import { state } from '../stores/progress.js'
import { SQL_CASES } from '../data/sqlCases/index.js'

const LEVEL_CLS = { Intermédiaire: 'accent', Avancé: 'purple', Expert: 'red' }

function progress(c) {
  const p = state.sqlCases[c.id]
  if (!p) return null
  if (p.solved) return '✅ Résolue'
  return `${p.solvedSteps?.length || 0}/${c.steps.length} étapes`
}
</script>

<template>
  <h1>🕵️ Enquêtes SQL</h1>
  <p class="subtitle">
    Résous des affaires criminelles à coups de requêtes SQL. Base SQLite réelle dans ton navigateur :
    jointures, agrégations, fenêtres et CTE récursives au programme. Les indices sont là si tu bloques —
    mais chaque indice utilisé, c'est un peu de gloire en moins. 😏
  </p>

  <div class="grid">
    <router-link v-for="c in SQL_CASES" :key="c.id" :to="`/sql/${c.id}`" style="text-decoration: none; color: inherit">
      <div class="card clickable" style="height: 100%">
        <div style="font-size: 2rem">{{ c.emoji }}</div>
        <div class="flex-between" style="margin: 0.4rem 0">
          <strong>{{ c.title }}</strong>
          <span class="badge" :class="LEVEL_CLS[c.level]">{{ c.level }}</span>
        </div>
        <div class="small muted">{{ c.skills }}</div>
        <div class="mt small" v-if="progress(c)">
          <span class="badge" :class="state.sqlCases[c.id]?.solved ? 'green' : 'orange'">{{ progress(c) }}</span>
        </div>
      </div>
    </router-link>
  </div>
</template>
