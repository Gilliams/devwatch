<script setup>
import { computed } from 'vue'
import { state } from '../stores/progress.js'
import { THEMES } from '../data/themes.js'
import { themeStatus, masteryLabel, INTERVALS_DAYS } from '../lib/spaced.js'
import { questionsFor } from '../data/questions/index.js'

const quizThemes = computed(() => THEMES.filter((t) => t.quiz))

function lastScore(id) {
  const h = state.themes[id]?.history
  if (!h || !h.length) return null
  const last = h[h.length - 1]
  return `${last.score}/${last.total}`
}
</script>

<template>
  <h1>🎯 Quiz &amp; Révisions</h1>
  <p class="subtitle">
    Répétition espacée façon Ebbinghaus : réussis un thème (≥ 80 %) et il s'espace
    ({{ INTERVALS_DAYS.join(' → ') }} jours). Rate-le (&lt; 60 %) et il revient dès demain.
  </p>

  <router-link to="/quiz/random">
    <button class="primary" style="margin-bottom: 1.5rem">🎲 Quiz aléatoire tous thèmes</button>
  </router-link>

  <div class="grid">
    <router-link
      v-for="t in quizThemes"
      :key="t.id"
      :to="`/quiz/${t.id}`"
      style="text-decoration: none; color: inherit"
    >
      <div class="card clickable" style="height: 100%">
        <div class="flex-between">
          <strong>{{ t.icon }} {{ t.name }}</strong>
          <span class="badge" :class="themeStatus(state, t.id).cls">{{ themeStatus(state, t.id).label }}</span>
        </div>
        <div class="small muted mt">
          {{ questionsFor(t.id).length }} questions ·
          <template v-if="state.themes[t.id]">
            niveau {{ masteryLabel(state.themes[t.id].level) }} · dernier score {{ lastScore(t.id) }}
          </template>
          <template v-else>jamais testé</template>
        </div>
      </div>
    </router-link>
  </div>
</template>
