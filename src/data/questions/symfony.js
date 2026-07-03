export default [
  {
    level: 'inter',
    q: 'Quelle est la différence entre les événements `kernel.request` et `kernel.controller` ?',
    choices: [
      "kernel.request n'est émis que pour la requête principale ; kernel.controller l'est aussi pour les sous-requêtes",
      'kernel.request précède la résolution du contrôleur (routing inclus) ; kernel.controller arrive une fois le contrôleur connu',
      'kernel.controller est déprécié depuis 6.4 au profit des ValueResolvers et de kernel.controller_arguments',
      "kernel.controller est émis après l'exécution du contrôleur, juste avant la construction de la réponse",
    ],
    answer: 1,
    explain:
      "Ordre du HttpKernel : kernel.request (le routing s'y branche) → résolution du contrôleur → kernel.controller (on peut le remplacer) → kernel.controller_arguments → contrôleur → kernel.response. Les deux événements concernent aussi les sous-requêtes.",
    why: "Savoir OÙ se brancher dans le cycle (auth, locale, feature flags) évite les listeners posés au mauvais endroit qui n'ont pas accès à l'info voulue.",
    doc: 'https://symfony.com/doc/current/components/http_kernel.html',
  },
  {
    level: 'inter',
    q: 'Par défaut dans Symfony moderne, les services du conteneur sont…',
    choices: [
      'Publics et partagés : récupérables via $container->get() depuis n\'importe quel code, comme en Symfony 3',
      'Privés et partagés : une instance unique par conteneur, obtenue uniquement par injection explicite',
      'Privés et recréés à chaque injection, afin d\'éviter tout état partagé entre deux requêtes HTTP',
      'Publics et lazy : instanciés au premier accès à travers un proxy généré à la compilation du conteneur',
    ],
    answer: 1,
    explain:
      "Depuis Symfony 4, les services sont **privés** (non récupérables via get() sauf déclaration contraire) et **partagés** (une instance par conteneur). `shared: false` permet d'obtenir une nouvelle instance à chaque injection.",
    why: "Ce duo privé/partagé explique les erreurs « service not found » ET les pièges d'état résiduel dans les workers longue durée.",
    doc: 'https://symfony.com/doc/current/service_container.html',
  },
  {
    level: 'inter',
    q: 'À quoi servent les ValueResolvers (`#[MapEntity]`, ex-ParamConverter) ?',
    choices: [
      "À valider automatiquement le payload contre les contraintes de validation de l'entité avant le contrôleur",
      'À caster les paramètres de query string vers les types scalaires déclarés dans la signature de l\'action',
      'À transformer un paramètre de requête en objet injecté dans le contrôleur (ex : {id} → entité, 404 si absente)',
      'À convertir le retour du contrôleur en JsonResponse selon le header Accept envoyé par le client',
    ],
    answer: 2,
    explain:
      "Les ValueResolvers hydratent les arguments du contrôleur : `#[MapEntity]` charge l'entité depuis la route (404 si introuvable), `#[MapRequestPayload]` désérialise et valide le corps de requête en DTO.",
    why: "Ces attributs suppriment un boilerplate énorme des contrôleurs — les maîtriser te positionne immédiatement côté Symfony 6/7.",
    doc: 'https://symfony.com/doc/current/controller/value_resolver.html',
  },
  {
    level: 'avance',
    q: 'Que fait un **compiler pass** ?',
    choices: [
      'Il compile les templates Twig et les catalogues de traduction en PHP natif lors du cache:warmup',
      'Il modifie les définitions de services (tags, arguments, alias) pendant la compilation du conteneur',
      'Il optimise les routes en expressions régulières compilées, stockées dans le cache var/cache',
      'Il fusionne les configurations YAML des bundles avant le chargement de leurs extensions',
    ],
    answer: 1,
    explain:
      "Un compiler pass s'exécute pendant la compilation du conteneur : on y collecte par exemple tous les services d'un tag pour les injecter dans un autre (pattern registry). C'est le mécanisme derrière `twig.extension`, `kernel.event_subscriber`… Aujourd'hui `#[AutoconfigureTag]` + `#[TaggedIterator]` couvrent la plupart des cas.",
    why: "C'est la porte d'entrée de l'extensibilité Symfony ; en entretien senior on attend un exemple concret de registry par tag.",
    doc: 'https://symfony.com/doc/current/service_container/compiler_passes.html',
  },
  {
    level: 'avance',
    q: 'Travail différé : `kernel.terminate` ou une file Messenger ?',
    choices: [
      "kernel.terminate est plus fiable : le travail s'exécute dans le même process, donc aucune perte possible",
      'Messenger exige un broker externe (RabbitMQ/Redis) ; sans infrastructure dédiée, kernel.terminate est le seul choix',
      "kernel.terminate s'exécute après l'envoi de la réponse mais monopolise le worker FPM ; Messenger déporte vers un process séparé avec retry",
      "kernel.terminate répond plus vite à l'utilisateur : Messenger attend l'accusé de réception du broker avant de flusher la réponse",
    ],
    answer: 2,
    explain:
      "kernel.terminate tourne après le flush de la réponse : l'utilisateur n'attend pas, mais le worker FPM reste occupé et un crash perd le travail. Messenger offre retry, monitoring et scaling indépendant — et le transport Doctrine suffit, pas besoin de RabbitMQ.",
    why: "Choisir le bon outil de différé (emails, exports, webhooks) est une décision d'archi récurrente ; citer retry/DLQ montre la maturité prod.",
    doc: 'https://symfony.com/doc/current/messenger.html',
  },
  {
    level: 'avance',
    q: 'Composant Security : Voter ou règle `access_control` ?',
    choices: [
      "access_control filtre par motif d'URL au niveau du firewall ; un voter tranche dynamiquement sur un objet précis via isGranted()",
      'Les voters ne s\'appliquent qu\'aux attributs ROLE_* ; pour toute autre logique il faut des expressions dans access_control',
      "access_control sait interroger la base pour vérifier la propriété d'une entité ; le voter travaille uniquement en mémoire",
      'Les deux mécanismes sont équivalents : access_control est la déclinaison YAML des voters, compilée en amont',
    ],
    answer: 0,
    explain:
      "access_control fait du contrôle par URL (statique, évalué tôt). Les voters portent la logique métier : « cet utilisateur peut-il éditer CET article ? ». `denyAccessUnlessGranted('EDIT', $post)` déclenche les voters qui supportent cet attribut/sujet.",
    why: "« Peut-il modifier CETTE ressource ? » est LE cas d'autorisation des apps métier — la bonne réponse est un voter, jamais un if dans le contrôleur.",
    doc: 'https://symfony.com/doc/current/security/voters.html',
  },
  {
    level: 'avance',
    q: "Pourquoi l'EntityManager pose-t-il problème dans un worker Messenger longue durée ?",
    choices: [
      "Il garde en mémoire toutes les entités chargées depuis le démarrage, ce qui fait dériver la RAM du worker",
      "Après une exception au flush, l'EntityManager est fermé et inutilisable ; un process long doit pouvoir le reset via ManagerRegistry",
      'Les workers Messenger tournent hors du conteneur et ne peuvent pas recevoir de services Doctrine injectés',
      'Doctrine ouvre une connexion par message consommé et finit par saturer le pool de connexions MySQL',
    ],
    answer: 1,
    explain:
      "Une exception pendant flush() **ferme** l'EntityManager. En HTTP, le process meurt : peu importe. Dans un worker qui vit des heures, il faut ManagerRegistry::resetManager() — le middleware Doctrine de Messenger le gère automatiquement.",
    why: "« The EntityManager is closed » est LE bug classique des workers ; connaître le reset et le middleware t'épargne des heures de debug.",
    doc: 'https://symfony.com/doc/current/messenger.html#middleware-for-doctrine',
  },
  {
    level: 'expert',
    q: 'Deux bundles enregistrent chacun un listener sur `kernel.exception` avec la même priorité. Que se passe-t-il ?',
    choices: [
      'Symfony détecte le conflit à la compilation du conteneur et exige de départager les priorités explicitement',
      "Exécution dans l'ordre d'enregistrement ; sur kernel.exception, setResponse() stoppe automatiquement la propagation",
      'Seul le listener du bundle chargé en premier dans config/bundles.php est conservé, l\'autre est écarté',
      "L'ordre est recalculé alphabétiquement sur le FQCN des listeners afin de rester déterministe entre déploiements",
    ],
    answer: 1,
    explain:
      "À priorité égale, l'ordre d'enregistrement fait foi. Particularité de kernel.exception : `$event->setResponse()` **stoppe automatiquement la propagation** — pour les autres événements, il faut appeler `stopPropagation()` explicitement.",
    why: "Les collisions entre listeners maison et bundles tiers produisent des pages d'erreur inattendues ; `debug:event-dispatcher` est ton ami.",
    doc: 'https://symfony.com/doc/current/reference/events.html#kernel-exception',
  },
  {
    level: 'expert',
    q: 'Comment fonctionne le mode lazy des services (`lazy: true`) ?',
    choices: [
      "Le service n'est déclaré au conteneur qu'à son premier get(), réduisant la taille du conteneur compilé",
      "Un proxy est injecté à la place du service ; l'instanciation réelle n'a lieu qu'au premier appel de méthode",
      "L'autowiring est différé au runtime : les dépendances du service sont résolues à chaque appel de méthode",
      'Le service est instancié dans un process séparé et communique par socket local, comme un mini-worker',
    ],
    answer: 1,
    explain:
      "Avec lazy, le conteneur injecte un **proxy** de même signature ; le service réel n'est construit qu'au premier usage. Depuis PHP 8.4, les lazy objects natifs remplacent la génération de code de proxy.",
    why: "Réflexe perf quand un service coûteux (client HTTP, SDK) est injecté partout mais rarement appelé réellement.",
    doc: 'https://symfony.com/doc/current/service_container/lazy_services.html',
  },
  {
    level: 'expert',
    q: 'Sur quoi repose le rendu de fragments `render(controller(...))` / ESI ?',
    choices: [
      'Chaque fragment part en requête HTTP réelle vers le serveur, ce qui permet de les répartir sur un cluster',
      'kernel->handle() est rappelé avec une Request forgée (SUB_REQUEST) : un contrôleur rendu isolément, cacheable séparément',
      'Les fragments sont de simples include Twig qui bénéficient du cache de templates compilés en PHP',
      "Les fragments sont rendus en parallèle par des Fibers depuis Symfony 6.3, d'où leur intérêt en performance",
    ],
    answer: 1,
    explain:
      "`render(controller(...))` forge une sous-requête qui repasse dans tout le HttpKernel (mêmes événements, flag SUB_REQUEST). Avec ESI et Varnish, chaque fragment a sa propre durée de cache — page en cache long, panier utilisateur non caché.",
    why: "Le combo sous-requêtes + ESI permet un cache HTTP chirurgical — grosse carte à jouer dans une discussion perf en entretien.",
    doc: 'https://symfony.com/doc/current/http_cache/esi.html',
  },
]
