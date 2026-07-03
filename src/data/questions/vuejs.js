export default [
  {
    level: 'inter',
    q: 'Différence entre `ref()` et `reactive()` dans Vue 3 ?',
    choices: [
      'reactive() est déprécié depuis Vue 3.4 au profit de ref() et du futur système de Signals natifs',
      'ref() enveloppe toute valeur (accès .value, réassignable) ; reactive() proxifie un objet, sans réassignation ni primitifs',
      'ref() ne crée qu\'une réactivité superficielle tandis que reactive() proxifie récursivement en profondeur',
      'reactive() est réservé au state global des stores Pinia, ref() au state local des composants',
    ],
    answer: 1,
    explain:
      "`ref(0)` fonctionne pour les primitifs et peut être réassigné (`count.value = 5`). `reactive({})` perd sa réactivité si on le déstructure ou le réassigne. Recommandation actuelle de l'équipe Vue : ref() par défaut. Dans le template, le .value est auto-déballé.",
    why: "Perdre la réactivité en déstructurant un reactive est LE bug Vue 3 le plus fréquent en code review.",
    doc: 'https://fr.vuejs.org/guide/essentials/reactivity-fundamentals',
  },
  {
    level: 'inter',
    q: 'Quand utiliser `computed()` plutôt qu\'une méthode appelée dans le template ?',
    choices: [
      'computed() peut être asynchrone et suspend le rendu le temps du calcul, contrairement à une méthode',
      'computed() est mémoïsé selon ses dépendances réactives ; une méthode est réexécutée à chaque re-render',
      'Les méthodes n\'ont pas accès aux refs déclarées dans le setup, seulement aux props du composant',
      'Aucune différence depuis Vue 3.3 : le compilateur mémoïse aussi les appels de méthodes du template',
    ],
    answer: 1,
    explain:
      "Un computed traque ses dépendances et met le résultat en cache — filtrer 1 000 éléments dans une méthode template les refiltrerait à CHAQUE rendu. Règle : dérivation d'état = computed ; action ponctuelle = méthode.",
    why: "Règle simple, violée en permanence : les filtres de listes dans des méthodes template plombent les perfs des composants.",
    doc: 'https://fr.vuejs.org/guide/essentials/computed',
  },
  {
    level: 'avance',
    q: 'Pourquoi `watch(props.user, ...)` ne se déclenche-t-il pas quand la prop change ?',
    choices: [
      'Les props ne sont pas réactives : il faut d\'abord les copier dans un ref local pour pouvoir les observer',
      "watch(props.user) passe la VALEUR lue à l'appel ; il faut une source traçable : watch(() => props.user, ...)",
      'watch n\'accepte que des refs comme source ; pour observer des objets il faut obligatoirement watchEffect',
      "Il manque l'option { immediate: true }, sans laquelle le watcher ne s'abonne qu'après le premier changement",
    ],
    answer: 1,
    explain:
      "`watch` a besoin d'une source traçable (ref, getter, reactive). `props.user` évalué immédiatement donne une valeur figée. Avec `() => props.user`, Vue peut suivre l'accès. Pour les mutations internes : `{ deep: true }`.",
    why: "Piège Vue 3 ultra-courant ; le getter doit devenir un réflexe, sous peine de watchers silencieusement morts.",
    doc: 'https://fr.vuejs.org/guide/essentials/watchers',
  },
  {
    level: 'avance',
    q: 'À quoi sert un **composable** (`useSomething()`) ?',
    choices: [
      'À remplacer les composants d\'ordre supérieur (HOC) pour factoriser le rendu conditionnel des templates',
      "À extraire de la logique d'état réutilisable (refs, computed, cycle de vie) — les mixins sans collisions ni magie",
      'À déclarer des directives personnalisées et des plugins globaux depuis le setup d\'un composant racine',
      'À encapsuler exclusivement les appels API et leur état de chargement, à la manière des services Angular',
    ],
    answer: 1,
    explain:
      "Un composable est une fonction utilisant les API de composition et renvoyant de l'état réactif : `useFetch()`, `usePagination()`. Contrairement aux mixins, les dépendances sont explicites (paramètres/retour) et l'origine de chaque propriété est traçable. C'est le pattern central de VueUse.",
    why: "C'est LE pattern de réutilisation Vue 3 ; savoir en écrire un propre (entrées/sorties explicites) est un marqueur de niveau.",
    doc: 'https://fr.vuejs.org/guide/reusability/composables',
  },
  {
    level: 'expert',
    q: 'Que fait `shallowRef()`, et quand est-ce pertinent ?',
    choices: [
      'Un ref en lecture seule dont le .value ne peut être réassigné que depuis le composable qui l\'a créé',
      'Seule la réassignation de .value est réactive : idéal pour de gros objets immuables ou des instances externes (éditeur, scène 3D)',
      "Une copie superficielle de l'objet est créée à chaque lecture, protégeant l'original de toute mutation",
      'Un ref sans suivi de dépendances, dont la mise à jour ne se propage que via un appel explicite à triggerRef()',
    ],
    answer: 1,
    explain:
      "reactive()/ref() proxifient récursivement — coûteux sur un gros arbre, destructeur pour des instances de classes tierces (three.js, éditeurs). shallowRef ne réagit qu'à `state.value = nouvelObjet` (pattern immuable) ; `triggerRef()` force la notification si besoin.",
    why: "Le réflexe perf à connaître dès que tu manipules de grosses structures ou des libs externes dans du Vue.",
    doc: 'https://fr.vuejs.org/api/reactivity-advanced.html#shallowref',
  },
]
