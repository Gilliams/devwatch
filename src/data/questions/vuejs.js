export default [
  {
    level: 'inter',
    q: "Différence entre `ref()` et `reactive()` dans Vue 3 ?",
    choices: [
      'ref() est déprécié au profit de reactive()',
      "ref() enveloppe n'importe quelle valeur (accès via .value), reactive() rend un objet profondément réactif mais ne peut pas être réassigné ni contenir un primitif",
      'reactive() est plus performant dans tous les cas',
      'ref() ne fonctionne que dans les composants',
    ],
    answer: 1,
    explain:
      "`ref(0)` fonctionne pour les primitifs et peut être réassigné (`count.value = 5`). `reactive({})` perd sa réactivité si on le déstructure ou le réassigne. La recommandation actuelle de l'équipe Vue : ref() par défaut partout, reactive() pour des groupes d'état liés. Dans le template, le .value est auto-déballé.",
  },
  {
    level: 'inter',
    q: "Quand utiliser `computed()` plutôt qu'une méthode appelée dans le template ?",
    choices: [
      "Jamais, c'est équivalent",
      "computed() est mis en cache selon ses dépendances réactives : recalculé seulement quand elles changent, alors qu'une méthode est réexécutée à chaque re-render",
      'computed() peut être asynchrone',
      'Les méthodes ne peuvent pas accéder aux refs',
    ],
    answer: 1,
    explain:
      "Un computed traque ses dépendances et mémoïse le résultat — filtrer une liste de 1000 éléments dans une méthode template la refiltrerait à CHAQUE rendu du composant. Règle : dérivation d'état = computed ; action ponctuelle = méthode.",
  },
  {
    level: 'avance',
    q: "Pourquoi `watch(props.user, ...)` ne se déclenche-t-il pas quand la prop change ?",
    choices: [
      'Les props ne sont pas réactives',
      "props.user est lu à l'appel : on passe la VALEUR, pas la source réactive ; il faut un getter `watch(() => props.user, ...)`",
      'watch ne fonctionne pas sur les objets',
      'Il faut utiliser watchEffect obligatoirement',
    ],
    answer: 1,
    explain:
      "Piège très courant : `watch` a besoin d'une source traçable (ref, getter, reactive). `props.user` évalué immédiatement donne une valeur figée. Avec `() => props.user`, Vue peut suivre l'accès. Pour observer les mutations internes d'un objet, ajouter `{ deep: true }`.",
  },
  {
    level: 'avance',
    q: "À quoi sert un **composable** (`useSomething()`) ?",
    choices: [
      'À remplacer les composants',
      "À extraire de la logique d'état réutilisable (refs, computed, watchers, cycle de vie) dans une fonction — l'équivalent Vue 3 des mixins, sans leurs collisions de noms ni leur magie implicite",
      'À déclarer des directives globales',
      'À gérer uniquement les appels API',
    ],
    answer: 1,
    explain:
      "Un composable est une fonction qui utilise les API de composition et renvoie de l'état réactif : `useFetch()`, `usePagination()`, `useLocalStorage()`. Contrairement aux mixins, les dépendances sont explicites (paramètres/retour) et l'origine de chaque propriété est traçable. C'est le pattern central de VueUse.",
  },
  {
    level: 'expert',
    q: "Que fait `shallowRef()` et quand est-ce pertinent ?",
    choices: [
      "C'est un ref en lecture seule",
      "Seule la réassignation de .value est réactive, pas les mutations internes de l'objet — idéal pour de gros objets immuables ou des instances externes (éditeur, carte, scène three.js) qu'il serait coûteux de proxifier",
      'Il copie superficiellement la valeur',
      "Il empêche le garbage collector de libérer l'objet",
    ],
    answer: 1,
    explain:
      "reactive()/ref() proxifient récursivement — coûteux sur un gros arbre, et destructeur pour des instances de classes tierces. shallowRef ne réagit qu'à `state.value = nouveauTruc` (pattern immuable) et laisse l'objet intact. `triggerRef()` force la notification si besoin. Réflexe perf important sur les data lourdes.",
  },
]
