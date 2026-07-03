<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { state } from '../stores/progress.js'
import { caseById, checkAnswer } from '../data/sqlCases/index.js'
import { conceptsFor } from '../data/sqlConcepts.js'
import { createDatabase, runQuery, describeSchema } from '../lib/sqlEngine.js'
import { pushQuietly } from '../lib/github.js'

const route = useRoute()
const affaire = caseById(route.params.id)

const db = ref(null)
const dbError = ref('')
const schema = ref([])
const sql = ref('')
const result = ref(null)
const showSchema = ref(true)

// Progression persistée (+ migration des sauvegardes sans champ notes)
if (affaire) {
  if (!state.sqlCases[affaire.id]) {
    state.sqlCases[affaire.id] = { solvedSteps: [], solved: false, hintsUsed: 0, notes: '' }
  } else if (state.sqlCases[affaire.id].notes === undefined) {
    state.sqlCases[affaire.id].notes = ''
  }
}
const progress = computed(() => state.sqlCases[affaire.id])
const currentStep = computed(() => progress.value.solvedSteps.length)

const answer = ref('')
const answerFeedback = ref('')
const shownHints = ref(0)

onMounted(async () => {
  try {
    db.value = await createDatabase(affaire.setupSql)
    schema.value = describeSchema(db.value)
  } catch (e) {
    dbError.value = e.message
  }
})
onUnmounted(() => db.value?.close())

function execute() {
  if (!db.value || !sql.value.trim()) return
  result.value = runQuery(db.value, sql.value)
}

function showHint() {
  if (shownHints.value < 3) {
    shownHints.value++
    progress.value.hintsUsed++
  }
}

function submitAnswer() {
  const step = affaire.steps[currentStep.value]
  answerFeedback.value = checkAnswer(step, answer.value) ? 'ok' : 'ko'
}

function nextStep() {
  progress.value.solvedSteps.push(currentStep.value)
  if (progress.value.solvedSteps.length >= affaire.steps.length) {
    progress.value.solved = true
    pushQuietly()
  }
  answer.value = ''
  answerFeedback.value = ''
  shownHints.value = 0
}

function restart() {
  const notes = progress.value.notes
  state.sqlCases[affaire.id] = { solvedSteps: [], solved: false, hintsUsed: 0, notes }
  answer.value = ''
  answerFeedback.value = ''
  shownHints.value = 0
}

// Rendu markdown ultra-léger (** gras ** et `code`)
function fmt(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
}
</script>

<template>
  <div v-if="!affaire">
    <p>Enquête introuvable. <router-link to="/sql">← Retour</router-link></p>
  </div>
  <div v-else>
    <router-link to="/sql" class="small">← Toutes les enquêtes</router-link>
    <h1>{{ affaire.emoji }} {{ affaire.title }}</h1>
    <p class="subtitle"><span class="badge purple">{{ affaire.level }}</span> · {{ affaire.skills }}</p>

    <div class="card"><p v-html="'<p>' + fmt(affaire.story) + '</p>'" style="margin: 0"></p></div>

    <div v-if="dbError" class="error-box">{{ dbError }}</div>

    <!-- Console SQL -->
    <h2>💻 Console SQL</h2>
    <p class="small muted" style="margin-top: -0.5rem">
      Tu peux enchaîner plusieurs requêtes séparées par <code>;</code> — chaque SELECT affiche son propre tableau.
    </p>
    <div class="flex" style="align-items: flex-start">
      <div style="flex: 1; min-width: 20rem">
        <textarea
          class="sql-input"
          v-model="sql"
          placeholder="SELECT * FROM table1;&#10;SELECT * FROM table2;"
          @keydown.ctrl.enter.prevent="execute"
          spellcheck="false"
        ></textarea>
        <div class="flex mt">
          <button class="primary" @click="execute" :disabled="!db">▶ Exécuter (Ctrl+Entrée)</button>
          <button @click="showSchema = !showSchema">{{ showSchema ? 'Masquer' : 'Afficher' }} le schéma</button>
        </div>

        <div v-if="result" class="mt">
          <div v-if="result.error" class="error-box">{{ result.error }}</div>
          <p v-else-if="result.empty" class="muted small">Requête exécutée — aucun résultat à afficher.</p>
          <template v-else>
            <div v-for="(set, si) in result.sets" :key="si" :class="{ mt: si > 0 }">
              <p v-if="result.sets.length > 1" class="small muted" style="margin: 0 0 0.3rem">
                Résultat {{ si + 1 }} / {{ result.sets.length }}
              </p>
              <div class="table-scroll">
                <table class="result-table">
                  <thead><tr><th v-for="c in set.columns" :key="c">{{ c }}</th></tr></thead>
                  <tbody>
                    <tr v-for="(row, i) in set.rows" :key="i">
                      <td v-for="(cell, j) in row" :key="j">{{ cell === null ? 'NULL' : cell }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="small muted" style="margin-top: 0.2rem">{{ set.rows.length }} ligne(s)</p>
            </div>
          </template>
        </div>
      </div>

      <div v-if="showSchema" class="card" style="width: 19rem; flex-shrink: 0; font-size: 0.82rem">
        <strong>📋 Schéma</strong>
        <div v-for="t in schema" :key="t.name" style="margin-top: 0.6rem">
          <code>{{ t.name }}</code> <span class="muted">({{ t.count }} lignes)</span>
          <div class="muted" style="padding-left: 0.8rem">
            <div v-for="c in t.columns" :key="c.name">{{ c.name }} <em>{{ c.type }}</em></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Carnet d'enquête -->
    <h2>📝 Carnet d'enquête</h2>
    <textarea
      class="notes-area"
      v-model="progress.notes"
      placeholder="Tes hypothèses, suspects, résultats intermédiaires… Sauvegardé automatiquement, il survit à la fermeture du navigateur."
      spellcheck="false"
    ></textarea>

    <!-- Étapes de l'enquête -->
    <h2>🧭 L'enquête</h2>

    <div v-for="(step, i) in affaire.steps.slice(0, currentStep)" :key="i" class="card" style="opacity: 0.75">
      <strong>✅ Étape {{ i + 1 }}</strong>
      <p class="small">{{ step.question }}</p>
      <div class="explanation small" v-html="fmt(step.explain)"></div>
      <details class="small mt solution-details">
        <summary>Voir la requête solution</summary>
        <pre><code>{{ step.solutionQuery }}</code></pre>
      </details>
    </div>

    <div v-if="!progress.solved" class="card" style="border-color: var(--accent)">
      <strong>{{ affaire.steps[currentStep].final ? '🎯 Question finale' : `Étape ${currentStep + 1} / ${affaire.steps.length}` }}</strong>
      <p>{{ affaire.steps[currentStep].question }}</p>

      <details v-if="conceptsFor(affaire.steps[currentStep]).length" class="toolbox">
        <summary>🧰 Boîte à outils SQL de cette étape ({{ conceptsFor(affaire.steps[currentStep]).length }} concepts)</summary>
        <div v-for="c in conceptsFor(affaire.steps[currentStep])" :key="c.name" class="concept">
          <span class="concept-name">{{ c.name }}</span>
          <pre><code>{{ c.syntax }}</code></pre>
          <p style="margin: 0.2rem 0">{{ c.desc }}</p>
          <a :href="c.doc" target="_blank" rel="noopener" class="small">📖 Documentation</a>
        </div>
      </details>

      <div v-for="h in shownHints" :key="h" class="hint-box">
        💡 <strong>Indice {{ h }}/3 :</strong> {{ affaire.steps[currentStep].hints[h - 1] }}
      </div>

      <div class="flex mt">
        <input
          type="text"
          v-model="answer"
          :placeholder="affaire.steps[currentStep].placeholder"
          style="max-width: 20rem"
          @keydown.enter="submitAnswer"
          :disabled="answerFeedback === 'ok'"
        />
        <button class="primary" @click="submitAnswer" :disabled="answerFeedback === 'ok'">Vérifier</button>
        <button v-if="shownHints < 3 && answerFeedback !== 'ok'" @click="showHint">
          💡 Indice ({{ shownHints }}/3)
        </button>
      </div>

      <p v-if="answerFeedback === 'ko'" class="small" style="color: var(--red)">
        ❌ Ce n'est pas ça — continue de creuser (ou prends un indice).
      </p>
      <div v-if="answerFeedback === 'ok'">
        <div class="explanation mt">✅ <span v-html="fmt(affaire.steps[currentStep].explain)"></span></div>
        <p class="small muted" style="margin: 0.8rem 0 0.2rem">Une requête qui résout cette étape :</p>
        <pre><code>{{ affaire.steps[currentStep].solutionQuery }}</code></pre>
        <button class="success" @click="nextStep">
          {{ currentStep + 1 >= affaire.steps.length ? '🏆 Clore l\'enquête' : 'Étape suivante →' }}
        </button>
      </div>
    </div>

    <div v-else class="card" style="border-color: var(--green)">
      <p style="margin: 0">{{ affaire.conclusion }}</p>
      <p class="small muted mt">Indices utilisés : {{ progress.hintsUsed }} — {{ progress.hintsUsed === 0 ? 'sans-faute magistral ! 🏅' : progress.hintsUsed <= 3 ? 'très propre.' : 'l\'important c\'est d\'apprendre. 😄' }}</p>

      <h2>📚 Le corrigé complet, étape par étape</h2>
      <div class="step-recap">
        <div v-for="(step, i) in affaire.steps" :key="i">
          <strong class="small">{{ step.final ? '🎯 Question finale' : `Étape ${i + 1}` }} — {{ step.question }}</strong>
          <pre><code>{{ step.solutionQuery }}</code></pre>
        </div>
      </div>

      <button @click="restart">Rejouer l'enquête</button>
    </div>
  </div>
</template>
