export default [
  {
    level: 'inter',
    q: "Quelle est la différence entre les événements `kernel.request` et `kernel.controller` ?",
    choices: [
      'Aucune, kernel.controller est déprécié',
      "kernel.request est émis avant la résolution du contrôleur (routing inclus), kernel.controller après, quand on sait quel contrôleur sera exécuté",
      'kernel.controller est émis après exécution du contrôleur',
      "kernel.request n'est émis que pour la requête principale, jamais pour les sous-requêtes",
    ],
    answer: 1,
    explain:
      "Ordre du HttpKernel : kernel.request (le routing y est branché) → résolution du contrôleur → kernel.controller (on peut y remplacer le contrôleur) → kernel.controller_arguments → contrôleur → kernel.response. Les deux événements sont émis aussi pour les sous-requêtes.",
  },
  {
    level: 'inter',
    q: 'Par défaut dans Symfony, les services du conteneur sont…',
    choices: [
      'publics et partagés (singleton par requête)',
      'privés et partagés',
      'privés et une nouvelle instance est créée à chaque injection',
      'publics et lazy',
    ],
    answer: 1,
    explain:
      "Depuis Symfony 4, les services sont **privés** (non récupérables via $container->get() sauf déclaration explicite) et **partagés** : une seule instance par container. `shared: false` permet d'obtenir une nouvelle instance à chaque injection.",
  },
  {
    level: 'inter',
    q: "À quoi sert un ParamConverter / ValueResolver (`#[MapEntity]`) ?",
    choices: [
      'À valider les données du formulaire',
      "À transformer automatiquement un paramètre de route en objet (ex : {id} → entité Doctrine) injecté dans le contrôleur",
      'À convertir la réponse du contrôleur en JSON',
      'À caster les query params en types scalaires',
    ],
    answer: 1,
    explain:
      "Les ValueResolvers (qui remplacent les ParamConverters depuis 6.2) hydratent les arguments du contrôleur : `#[MapEntity]` charge l'entité depuis la route, `#[MapRequestPayload]` désérialise et valide le corps de requête en DTO. Une 404 est levée si l'entité n'existe pas.",
  },
  {
    level: 'avance',
    q: "Que fait un **compiler pass** ?",
    choices: [
      "Il compile le code Twig en PHP",
      "Il permet de modifier la définition des services (tags, arguments...) au moment de la compilation du conteneur",
      'Il optimise les routes en expressions régulières',
      "Il précompile les traductions",
    ],
    answer: 1,
    explain:
      "Un compiler pass s'exécute pendant la compilation du conteneur : on peut y collecter tous les services portant un tag et les injecter dans un autre service (pattern registry/chaîne). C'est le mécanisme derrière les tags comme `twig.extension` ou `kernel.event_subscriber`. Aujourd'hui `#[AutoconfigureTag]` + injection d'itérateurs taggés (`#[TaggedIterator]`) couvrent la plupart des cas.",
  },
  {
    level: 'avance',
    q: "Différence entre `kernel.terminate` et une file Messenger pour du travail différé ?",
    choices: [
      'kernel.terminate est plus fiable car exécuté dans le même process',
      "kernel.terminate s'exécute après l'envoi de la réponse mais bloque toujours le worker PHP-FPM ; Messenger déporte le travail dans un process/worker séparé",
      'Messenger ne peut pas être asynchrone sans RabbitMQ',
      "kernel.terminate n'existe plus depuis Symfony 6",
    ],
    answer: 1,
    explain:
      "kernel.terminate tourne après le flush de la réponse (avec fastcgi_finish_request), l'utilisateur n'attend pas… mais le worker FPM reste occupé et un crash perd le travail. Messenger offre retry, redelivery, monitoring et scale indépendant — c'est le bon choix pour du différé sérieux. Doctrine, Redis ou même le transport `sync` fonctionnent, pas besoin de RabbitMQ.",
  },
  {
    level: 'avance',
    q: "Avec le composant Security, quelle est la différence entre un **Voter** et une **règle access_control** ?",
    choices: [
      "access_control est vérifié au niveau du firewall sur l'URL ; un voter décide dynamiquement sur un sujet précis (objet, attribut) via isGranted()",
      'Les voters ne fonctionnent que pour les rôles ROLE_*',
      'access_control peut accéder aux entités Doctrine',
      "Les deux sont équivalents, access_control est juste du YAML",
    ],
    answer: 0,
    explain:
      "access_control fait du contrôle d'accès par motif d'URL (statique, évalué très tôt). Les voters implémentent la logique métier : « cet utilisateur peut-il ÉDITER CET article ? ». Tous les voters votent et une stratégie (affirmative par défaut) tranche. `denyAccessUnlessGranted('EDIT', $post)` déclenche les voters supportant cet attribut/sujet.",
  },
  {
    level: 'avance',
    q: "Pourquoi éviter d'injecter l'EntityManager dans un constructeur de service utilisé par un worker Messenger longue durée ?",
    choices: [
      "L'EntityManager consomme trop de mémoire",
      "Après une exception Doctrine, l'EntityManager est fermé et reste inutilisable ; dans un process long il faut pouvoir le reset (ManagerRegistry)",
      "Les workers Messenger n'ont pas accès au conteneur",
      "Il faut toujours utiliser le DocumentManager dans un worker",
    ],
    answer: 1,
    explain:
      "Une exception pendant flush() **ferme** l'EntityManager (`The EntityManager is closed`). Dans une requête HTTP classique, le process meurt, peu importe. Dans un worker qui tourne des heures, il faut passer par ManagerRegistry::resetManager() — le bundle DoctrineBundle le fait automatiquement via le middleware Messenger `doctrine_ping_connection` / reset des services.",
  },
  {
    level: 'expert',
    q: "Que se passe-t-il si deux bundles enregistrent chacun un listener sur `kernel.exception` avec la même priorité ?",
    choices: [
      'Symfony lève une exception de conflit',
      "Ils sont exécutés dans l'ordre d'enregistrement dans le conteneur ; le premier qui appelle setResponse() n'empêche pas l'autre de s'exécuter sauf stopPropagation()",
      'Seul le listener du bundle chargé en premier est conservé',
      'La priorité est recalculée par ordre alphabétique',
    ],
    answer: 1,
    explain:
      "À priorité égale, l'ordre d'enregistrement fait foi. Définir une réponse via `$event->setResponse()` sur kernel.exception **stoppe automatiquement la propagation** (particularité de cet événement via ExceptionEvent) — pour les autres événements il faut appeler `stopPropagation()` explicitement.",
  },
  {
    level: 'expert',
    q: 'Comment fonctionne le mode lazy des services Symfony (`lazy: true`) ?',
    choices: [
      "Le service n'est déclaré qu'au premier appel du conteneur",
      'Un proxy (ghost object) est injecté ; la vraie instanciation a lieu au premier appel de méthode',
      'Le service est instancié dans un thread séparé',
      "Le conteneur diffère l'autowiring au runtime",
    ],
    answer: 1,
    explain:
      "Avec lazy, le conteneur injecte un **proxy** qui a la même signature que la classe ; le service réel n'est construit qu'au premier usage effectif. Utile quand un service coûteux est injecté mais rarement appelé. Depuis PHP 8.4, les *lazy objects* natifs remplacent la génération de proxy par code.",
  },
  {
    level: 'expert',
    q: "En quoi consiste le pattern « HttpKernel sous-requêtes » utilisé par `fragments` / ESI ?",
    choices: [
      'Chaque fragment est rendu par un appel HTTP externe obligatoire',
      "kernel->handle() est rappelé récursivement avec un objet Request forgé (SUB_REQUEST), permettant de rendre un contrôleur isolément et de le cacher séparément",
      'Les fragments sont rendus par des workers parallèles',
      "C'est un simple include Twig avec un cache de template",
    ],
    answer: 1,
    explain:
      "`render(controller(...))` en Twig forge une sous-requête et repasse dans tout le HttpKernel (mêmes événements, avec le flag SUB_REQUEST). Avec ESI et un reverse proxy (Varnish), chaque fragment peut avoir sa propre durée de cache — la page hôte en cache long, le panier utilisateur non caché, par exemple.",
  },
]
