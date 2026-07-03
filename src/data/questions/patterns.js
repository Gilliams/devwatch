export default [
  {
    level: 'inter',
    q: "Quelle est la différence entre les patterns **Strategy** et **State** ?",
    choices: [
      'Aucune, ce sont deux noms du même pattern',
      "Structure identique, intention différente : Strategy = le client choisit un algorithme interchangeable ; State = l'objet change lui-même de comportement selon son état interne, les états connaissent les transitions",
      'State utilise des classes abstraites, Strategy des interfaces',
      'Strategy est créationnel, State comportemental',
    ],
    answer: 1,
    explain:
      "Les deux délèguent à un objet interchangeable. Mais dans Strategy, le choix vient de l'extérieur et les stratégies s'ignorent entre elles (ex : calculateurs de frais de port). Dans State, l'objet transite d'un état à l'autre, souvent les états eux-mêmes déclenchent la transition (ex : cycle de vie d'une commande). Le composant Workflow de Symfony est un cousin de State.",
  },
  {
    level: 'inter',
    q: "Pourquoi le Singleton est-il considéré comme un anti-pattern dans le code applicatif moderne ?",
    choices: [
      'Il est trop lent',
      "État global déguisé : dépendances cachées, tests difficiles (état partagé entre tests), couplage fort — le conteneur DI fournit le même « une seule instance » sans ces défauts",
      'Il ne fonctionne pas en PHP',
      'Il consomme trop de mémoire',
    ],
    answer: 1,
    explain:
      "Le besoin légitime (une instance partagée) est couvert par le conteneur d'injection : les services Symfony sont partagés par défaut, MAIS injectés explicitement — la dépendance est visible dans le constructeur, remplaçable par un mock en test. `Foo::getInstance()` dans le code cache la dépendance et fige l'implémentation.",
  },
  {
    level: 'avance',
    q: "Le composant Form de Symfony qui transforme les données via des `DataTransformer` chaînés illustre quel pattern ?",
    choices: ['Observer', 'Pipeline / Chain of Responsibility appliqué à la transformation', 'Flyweight', 'Prototype'],
    answer: 1,
    explain:
      "Les transformers sont appliqués en chaîne (model data → norm data → view data et retour). Chaque maillon fait une transformation et passe au suivant. On retrouve la même idée dans les middlewares PSR-15, les middlewares Messenger, ou les pipes Laravel — un pipeline d'étapes composables.",
  },
  {
    level: 'avance',
    q: "Quelle différence entre **Decorator** et **Proxy** ?",
    choices: [
      'Decorator change l\'interface, Proxy la conserve',
      "Les deux enveloppent un objet avec la même interface, mais l'intention diffère : Decorator AJOUTE du comportement (composable), Proxy CONTRÔLE l'accès (lazy loading, cache, droits)",
      'Proxy ne peut envelopper que des classes finales',
      'Decorator est structurel, Proxy créationnel',
    ],
    answer: 1,
    explain:
      "Même forme, intentions différentes. Decorator : empiler des responsabilités (`CachedRepository(LoggedRepository(DoctrineRepository))`) — Symfony le supporte nativement avec `#[AsDecorator]`. Proxy : contrôler l'accès à l'objet réel — les entités lazy de Doctrine sont des proxies qui déclenchent le chargement au premier accès.",
  },
  {
    level: 'avance',
    q: "Dans une architecture hexagonale (ports & adapters), où vivent les interfaces (ports) ?",
    choices: [
      "Dans la couche infrastructure, près des implémentations",
      "Dans le domaine/application : le cœur définit SES besoins (interfaces), l'infrastructure fournit les adaptateurs qui les implémentent — inversion de dépendance",
      'Dans un package séparé partagé',
      "Peu importe, c'est une question de goût",
    ],
    answer: 1,
    explain:
      "Le principe clé (le D de SOLID) : les dépendances pointent vers le domaine. `App\\Domain\\Repository\\OrderRepositoryInterface` appartient au domaine ; `App\\Infrastructure\\Doctrine\\DoctrineOrderRepository` l'implémente. Le domaine ne connaît ni Doctrine, ni Symfony — on peut le tester sans infra et changer d'ORM sans le toucher.",
  },
  {
    level: 'avance',
    q: 'CQRS signifie…',
    choices: [
      "Séparer le modèle d'écriture (commands, validation métier) du modèle de lecture (queries, projections optimisées), potentiellement avec des stockages différents",
      'Mettre en cache les requêtes SQL répétitives',
      'Utiliser obligatoirement de l\'event sourcing',
      'Créer une classe Repository par entité',
    ],
    answer: 0,
    explain:
      "Command Query Responsibility Segregation : les écritures passent par des Commands qui protègent les invariants métier ; les lectures utilisent des Queries directes (DTO, SQL brut, vues dénormalisées) sans passer par les entités. Avec Messenger, on matérialise ça par des bus `command.bus` et `query.bus` distincts. L'event sourcing est optionnel et bien plus engageant.",
  },
  {
    level: 'expert',
    q: "Vous devez ajouter du logging, du cache et de la gestion d'erreurs autour de 15 services existants sans les modifier. Quelle approche est la plus propre dans Symfony ?",
    choices: [
      'Hériter de chaque service et surcharger les méthodes',
      "Décorer les services (#[AsDecorator] / decoration du conteneur), chaque préoccupation étant un décorateur générique appliqué par interface",
      'Ajouter un trait LoggableTrait à chaque classe',
      'Copier le code de log dans chaque méthode',
    ],
    answer: 1,
    explain:
      "La décoration de services compose les préoccupations transverses sans toucher au code décoré (open/closed). L'héritage fige la hiérarchie et casse à la moindre signature ; les traits dupliquent l'appel dans chaque méthode. Pour du 100 % générique on peut aussi générer des proxies (AOP), mais la décoration explicite reste la plus lisible et debuggable.",
  },
  {
    level: 'expert',
    q: "Pattern **Specification** : quel est son intérêt principal côté métier + Doctrine ?",
    choices: [
      "Générer les migrations automatiquement",
      "Encapsuler une règle métier réutilisable et composable (and/or/not), utilisable à la fois pour filtrer en mémoire (isSatisfiedBy) et pour construire la requête (Criteria/QueryBuilder)",
      'Valider les formulaires',
      "Remplacer les voters de sécurité",
    ],
    answer: 1,
    explain:
      "Une Specification comme `ClientPremium()->and(CommandeRecente(30))` porte la règle métier en un seul endroit. Elle peut s'évaluer sur un objet en mémoire ET se traduire en critères Doctrine — fini la règle dupliquée entre un `if` PHP et trois QueryBuilders. Doctrine fournit d'ailleurs `Criteria`, utilisable sur les repositories comme sur les Collections.",
  },
]
