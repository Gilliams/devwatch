<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { state } from '../stores/progress.js'
import { themeById } from '../data/themes.js'
import { pickQuestions } from '../data/questions/index.js'
import { recordQuizResult, INTERVALS_DAYS } from '../lib/spaced.js'
import { pushQuietly } from '../lib/github.js'

const route = useRoute()
const themeId = route.params.theme
const theme = themeById(themeId)
const isRandom = themeId === 'random'
const title = isRandom ? '🎲 Quiz aléatoire' : `${theme?.icon} ${theme?.name}`

const NB_QUESTIONS = isRandom ? 12 : 8
const questions = ref(pickQuestions(themeId, NB_QUESTIONS))

const current = ref(0)
const selected = ref(null) // index numérique | 'idk' | null
const revealed = ref(false)
const score = ref(0)
const finished = ref(false)
const resultTheme = ref(null)

const q = computed(() => questions.value[current.value])

const LEVEL_BADGES = { inter: ['Intermédiaire', 'accent'], avance: ['Avancé', 'purple'], expert: ['Expert', 'red'] }

// Découpe la question en segments texte / bloc de code (```...```)
function segments(text) {
  return text.split(/```(?:\w+)?\n?/).map((part, i) => ({ code: i % 2 === 1, text: part.trim() })).filter((s) => s.text)
}

function choose(i) {
  if (revealed.value) return
  selected.value = i
}

function validate() {
  if (selected.value === null) return
  revealed.value = true
  if (selected.value === q.value.answer) score.value++
}

function next() {
  if (current.value + 1 >= questions.value.length) {
    finished.value = true
    if (!isRandom) {
      resultTheme.value = recordQuizResult(state, themeId, score.value, questions.value.length)
      pushQuietly()
    }
    return
  }
  current.value++
  selected.value = null
  revealed.value = false
}

const pct = computed(() => Math.round((score.value / questions.value.length) * 100))
const verdict = computed(() => {
  if (pct.value >= 80) return { text: 'Excellent ! Le thème s\'espace dans ta courbe de révision.', cls: 'green' }
  if (pct.value >= 60) return { text: 'Pas mal, mais le thème reste au même palier — à retravailler.', cls: 'orange' }
  return { text: 'Le thème repart au début de la courbe : révision dès demain.', cls: 'red' }
})
</script>

<template>
  <div v-if="!questions.length">
    <h1>{{ title }}</h1>
    <p class="muted">Pas encore de questions pour ce thème.</p>
    <router-link to="/quiz">← Retour</router-link>
  </div>

  <div v-else-if="!finished">
    <div class="flex-between">
      <h1>{{ title }}</h1>
      <span class="muted">{{ current + 1 }} / {{ questions.length }}</span>
    </div>
    <div class="progress-bar"><div :style="{ width: (current / questions.length) * 100 + '%' }"></div></div>

    <div class="card">
      <div class="flex-between" style="margin-bottom: 0.8rem">
        <span class="badge" :class="LEVEL_BADGES[q.level][1]">{{ LEVEL_BADGES[q.level][0] }}</span>
        <span v-if="isRandom" class="badge">{{ themeById(q.theme)?.name }}</span>
      </div>

      <template v-for="(seg, i) in segments(q.q)" :key="i">
        <pre v-if="seg.code"><code>{{ seg.text }}</code></pre>
        <p v-else style="font-weight: 600">{{ seg.text }}</p>
      </template>

      <button
        v-for="(choice, i) in q.choices"
        :key="i"
        class="quiz-option"
        :class="{
          selected: selected === i && !revealed,
          correct: revealed && i === q.answer,
          wrong: revealed && selected === i && i !== q.answer,
        }"
        @click="choose(i)"
      >
        {{ choice }}
      </button>

      <button
        class="quiz-option idk"
        :class="{ selected: selected === 'idk' && !revealed, picked: revealed && selected === 'idk' }"
        @click="choose('idk')"
      >
        🤷 Je ne sais pas — montre-moi la réponse et explique
      </button>

      <div v-if="revealed" class="explanation">
        <template v-if="selected === q.answer">
          <strong>✅ Correct !</strong> {{ q.explain }}
        </template>
        <template v-else-if="selected === 'idk'">
          <strong>🤷 Aucun souci — mieux vaut l'apprendre ici qu'en entretien.</strong>
          <p style="margin: 0.6rem 0 0.4rem"><strong>La bonne réponse :</strong> {{ q.choices[q.answer] }}</p>
          <p style="margin: 0">{{ q.explain }}</p>
        </template>
        <template v-else>
          <strong>❌ Raté.</strong> {{ q.explain }}
        </template>

        <p v-if="q.why" class="why-line small">🎯 <strong>Pourquoi c'est important :</strong> {{ q.why }}</p>
        <a v-if="q.doc" :href="q.doc" target="_blank" rel="noopener" class="doc-link small">📖 Approfondir dans la documentation →</a>
      </div>

      <div class="mt">
        <button v-if="!revealed" class="primary" :disabled="selected === null" @click="validate">Valider</button>
        <button v-else class="primary" @click="next">
          {{ current + 1 >= questions.length ? 'Voir le résultat' : 'Question suivante →' }}
        </button>
      </div>
    </div>
  </div>

  <div v-else>
    <h1>{{ title }} — Résultat</h1>
    <div class="card" style="text-align: center; padding: 2rem">
      <div style="font-size: 3rem; font-weight: 700">{{ score }} / {{ questions.length }}</div>
      <div style="font-size: 1.4rem; margin: 0.5rem 0">{{ pct }} %</div>
      <p><span class="badge" :class="verdict.cls">{{ verdict.text }}</span></p>
      <p v-if="resultTheme" class="muted small">
        Prochaine révision : {{ new Date(resultTheme.nextReview).toLocaleDateString('fr-FR') }}
        (palier {{ resultTheme.level + 1 }}/{{ INTERVALS_DAYS.length }})
      </p>
      <div class="flex" style="justify-content: center; margin-top: 1rem">
        <router-link to="/quiz"><button>← Tous les thèmes</button></router-link>
        <button class="primary" @click="$router.go(0)">Rejouer</button>
      </div>
    </div>
  </div>
</template>
