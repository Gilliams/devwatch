export default [
  {
    level: 'inter',
    q: "Venant de Doctrine (Data Mapper), quelle est la différence fondamentale avec Eloquent ?",
    choices: [
      'Eloquent ne supporte pas les relations',
      "Eloquent est un ActiveRecord : le modèle EST la ligne (il porte save(), delete(), la connexion) ; Doctrine sépare entités pures et EntityManager qui les persiste",
      'Doctrine est plus rapide dans tous les cas',
      'Eloquent ne fonctionne que avec MySQL',
    ],
    answer: 1,
    explain:
      "En ActiveRecord, `$user->save()` mélange logique métier et persistance — simple et productif, mais entités couplées à la base. En Data Mapper, les entités ignorent la persistance (testables sans DB), l'UnitOfWork suit les changements. C'est LA question d'architecture classique quand on connaît les deux mondes.",
  },
  {
    level: 'inter',
    q: "Que sont les **middlewares** Laravel et leur équivalent Symfony le plus proche ?",
    choices: [
      "Des observers Eloquent ; équivalent : les listeners Doctrine",
      "Des couches traversées par la requête avant/après le contrôleur ; équivalent Symfony : les listeners/subscribers sur les événements kernel (kernel.request / kernel.response)",
      'Des validateurs de formulaire',
      'Des jobs de queue',
    ],
    answer: 1,
    explain:
      "Le middleware Laravel (`handle($request, Closure $next)`) suit le pattern pipeline PSR-15. Symfony obtient le même résultat via l'EventDispatcher sur le cycle HttpKernel. Même besoin (auth, throttle, CORS, locale...), deux mécanismes différents.",
  },
  {
    level: 'avance',
    q: "Le problème N+1 dans Eloquent se résout avec…",
    choices: [
      '$users->load() dans la boucle',
      "Le eager loading : `User::with('posts.comments')->get()`, et `Model::preventLazyLoading()` en dev pour détecter les oublis",
      'DB::raw() systématiquement',
      'Un index sur la clé étrangère',
    ],
    answer: 1,
    explain:
      "`with()` charge la relation en 2 requêtes (IN sur les ids) au lieu de N+1. `preventLazyLoading(!app()->isProduction())` fait lever une exception dès qu'une relation est chargée paresseusement — l'équivalent moral du profiler Symfony qui hurle. `withCount()` évite de charger pour compter.",
  },
  {
    level: 'avance',
    q: "Différence entre `Queue::push` (jobs) Laravel et Symfony Messenger ?",
    choices: [
      "Aucun rapport, Messenger ne gère pas l'async",
      "Concept identique (travail asynchrone via broker) ; Messenger est centré messages+bus avec middlewares et routing par type de message, Laravel est centré jobs auto-dispatchés avec une API plus directe (retry, backoff sur la classe)",
      'Les jobs Laravel ne peuvent pas être retentés',
      'Messenger nécessite obligatoirement RabbitMQ, Laravel Redis',
    ],
    answer: 1,
    explain:
      "Les deux couvrent le même besoin. Laravel : `dispatch(new SendInvoice($order))->onQueue('emails')`, tries/backoff déclarés sur le job, Horizon pour le monitoring Redis. Messenger : messages (souvent de purs DTO) routés vers des transports, handlers séparés, bus multiples (command/query/event). Philosophies différentes, portabilité des concepts totale.",
  },
  {
    level: 'avance',
    q: "Que fait le **Service Container** de Laravel quand vous typez une interface dans un constructeur sans binding explicite ?",
    choices: [
      'Il instancie automatiquement la première implémentation trouvée',
      "Il lève une exception : une interface non bindée n'est pas résoluble ; il faut `$this->app->bind(Interface::class, Implementation::class)` dans un ServiceProvider",
      'Il injecte null',
      'Il crée un mock automatiquement',
    ],
    answer: 1,
    explain:
      "Le container Laravel résout les classes concrètes par réflexion (zero config), mais une interface exige un binding déclaré dans un ServiceProvider. Différence notable avec Symfony où l'autowiring lie automatiquement une interface si UNE seule implémentation existe (ou via un alias explicite).",
  },
]
