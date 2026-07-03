export default [
  {
    level: 'inter',
    q: 'Venant de Doctrine (Data Mapper), quelle est la différence fondamentale avec Eloquent ?',
    choices: [
      'Eloquent est un ActiveRecord : le modèle porte save()/delete() et connaît sa table ; Doctrine sépare entités pures et EntityManager',
      'Eloquent ne gère pas les relations complexes (many-to-many avec pivot enrichi), contrairement à Doctrine',
      'Doctrine est systématiquement plus performant grâce à son cache de premier niveau et son identity map',
      'Eloquent exige MySQL ou MariaDB ; Doctrine fonctionne avec tous les SGBD grâce à sa couche DBAL',
    ],
    answer: 0,
    explain:
      "En ActiveRecord, `$user->save()` mélange métier et persistance — productif, mais entités couplées à la base. En Data Mapper, les entités ignorent la persistance (testables sans DB) et l'UnitOfWork suit les changements.",
    why: "Si ton CV affiche Symfony ET du Laravel, cette question d'architecture tombera — sache défendre les trade-offs des deux sans dogmatisme.",
    doc: 'https://laravel.com/docs/eloquent',
  },
  {
    level: 'inter',
    q: 'Que sont les **middlewares** Laravel, et leur équivalent Symfony le plus proche ?',
    choices: [
      'Des observers de modèles Eloquent ; équivalent Symfony : les listeners d\'événements du cycle de vie Doctrine',
      'Des couches traversées par la requête avant/après le contrôleur ; équivalent : listeners kernel.request/kernel.response',
      'Des règles de validation croisées appliquées automatiquement à toutes les requêtes entrantes de l\'application',
      'Des jobs synchrones exécutés dans le cycle de démarrage du service container à chaque requête',
    ],
    answer: 1,
    explain:
      "Le middleware Laravel (`handle($request, Closure $next)`) suit le pattern pipeline PSR-15. Symfony obtient le même résultat via l'EventDispatcher sur le cycle HttpKernel. Même besoins : auth, throttle, CORS, locale.",
    why: "Transposer les concepts d'un framework à l'autre est exactement ce qu'on attend d'un profil multi-frameworks en entretien.",
    doc: 'https://laravel.com/docs/middleware',
  },
  {
    level: 'avance',
    q: 'Comment se résout le problème N+1 dans Eloquent ?',
    choices: [
      'En ajoutant un index sur la clé étrangère : MySQL fusionne alors automatiquement les N requêtes en une seule',
      "Eager loading `with('posts.comments')` + `Model::preventLazyLoading()` en dev pour détecter les oublis",
      'En remplaçant Eloquent par le Query Builder (DB::table) sur toutes les listes dépassant cent lignes',
      'En activant le query cache de Laravel : les N requêtes identiques sont servies depuis la mémoire',
    ],
    answer: 1,
    explain:
      "`with()` charge la relation en 2 requêtes (IN sur les ids) au lieu de N+1. `preventLazyLoading(!app()->isProduction())` lève une exception dès qu'une relation est chargée paresseusement — l'équivalent moral du profiler Symfony qui hurle.",
    why: "preventLazyLoading en dev transforme le N+1 en exception immédiate au lieu d'un incident de prod silencieux — réflexe pro à citer.",
    doc: 'https://laravel.com/docs/eloquent-relationships#eager-loading',
  },
  {
    level: 'avance',
    q: 'Queues Laravel vs Symfony Messenger : quelle comparaison est juste ?',
    choices: [
      "Les jobs Laravel ne supportent ni retry ni backoff nativement : il faut Horizon pour obtenir ces fonctions",
      'Concept identique (travail asynchrone via broker) ; Laravel centre son API sur le job auto-dispatché, Messenger sur messages/bus/middlewares',
      'Messenger impose RabbitMQ comme broker tandis que Laravel impose Redis pour ses files d\'attente',
      'Les queues Laravel sont synchrones par défaut en production, contrairement aux transports Messenger',
    ],
    answer: 1,
    explain:
      "Les deux couvrent le même besoin. Laravel : `dispatch(new SendInvoice($order))`, tries/backoff déclarés sur le job, Horizon pour le monitoring. Messenger : messages DTO routés vers des transports, handlers séparés, bus multiples. Philosophies différentes, concepts 100 % portables.",
    why: "Broker, retry, DLQ, idempotence : ce sont ces concepts transverses qu'on teste — la syntaxe du framework s'apprend en un après-midi.",
    doc: 'https://laravel.com/docs/queues',
  },
  {
    level: 'avance',
    q: 'Que fait le Service Container de Laravel face à une interface type-hintée sans binding explicite ?',
    choices: [
      'Il instancie la première implémentation trouvée dans le namespace, par ordre alphabétique de FQCN',
      'Il lève une exception : une interface sans binding n\'est pas résoluble ; il faut bind() dans un ServiceProvider',
      'Il injecte null et laisse le type-hint nullable de la signature gérer l\'absence de dépendance',
      'Il génère un mock à la volée en environnement de test, et lève une erreur uniquement en production',
    ],
    answer: 1,
    explain:
      "Le container Laravel résout les classes concrètes par réflexion (zero config), mais une interface exige un binding déclaré dans un ServiceProvider. Différence avec Symfony : l'autowiring y lie automatiquement une interface si UNE seule implémentation existe.",
    why: "Cette différence d'autowiring entre les deux frameworks est un excellent point de comparaison à placer en entretien multi-stack.",
    doc: 'https://laravel.com/docs/container',
  },
]
