export default [
  {
    level: 'inter',
    q: 'Quelle est la différence entre les patterns **Strategy** et **State** ?',
    choices: [
      "State s'appuie sur l'héritage pour varier le comportement, Strategy sur la composition d'interfaces",
      "Structure proche, intention différente : Strategy = algorithme choisi de l'extérieur ; State = l'objet change de comportement selon son état, transitions incluses",
      'Strategy est un pattern créationnel, State un pattern comportemental dans la classification du GoF',
      'Aucune : State est simplement l\'ancien nom de Strategy dans la première édition du Gang of Four',
    ],
    answer: 1,
    explain:
      "Les deux délèguent à un objet interchangeable. Dans Strategy, le choix vient de l'extérieur et les stratégies s'ignorent (calcul de frais de port). Dans State, l'objet transite d'un état à l'autre, souvent les états déclenchent eux-mêmes la transition (cycle de vie d'une commande).",
    why: "En entretien design patterns, c'est l'INTENTION qu'on teste, pas l'UML — et le composant Workflow de Symfony est un State industrialisé.",
    doc: 'https://refactoring.guru/fr/design-patterns/state',
  },
  {
    level: 'inter',
    q: 'Pourquoi le Singleton est-il considéré comme un anti-pattern dans le code applicatif moderne ?',
    choices: [
      "Sa création paresseuse n'est pas thread-safe en PHP, ce qui provoque des doubles instanciations sous FPM",
      'État global déguisé : dépendances cachées, tests couplés ; le conteneur DI fournit l\'instance unique sans ces défauts',
      'Il maintient son instance en mémoire pour toute la durée du process, contrairement aux services du conteneur',
      'Il est incompatible avec l\'autoloading PSR-4 car getInstance() doit être déclaré avant toute utilisation',
    ],
    answer: 1,
    explain:
      "Le besoin légitime (une instance partagée) est couvert par le conteneur : les services Symfony sont partagés par défaut MAIS injectés explicitement — dépendance visible dans le constructeur, remplaçable par un mock. `Foo::getInstance()` cache la dépendance et fige l'implémentation.",
    why: "Reconnaître le besoin derrière l'anti-pattern et sa solution moderne (DI) est un marqueur de séniorité bien plus fort que réciter le GoF.",
    doc: 'https://refactoring.guru/fr/design-patterns/singleton',
  },
  {
    level: 'avance',
    q: 'Les `DataTransformer` chaînés du composant Form de Symfony (model → norm → view) illustrent quel pattern ?',
    choices: [
      'Observer : chaque transformer écoute les événements du formulaire et réagit à la soumission des données',
      'Flyweight : les transformers sont partagés entre tous les champs du même type pour économiser la mémoire',
      'Pipeline / Chain of Responsibility appliqué à la transformation : chaque maillon transforme puis passe au suivant',
      'Prototype : chaque champ clone un transformer de référence pré-configuré par son FormType parent',
    ],
    answer: 2,
    explain:
      "Les transformers s'appliquent en chaîne dans les deux sens (model data ↔ view data). On retrouve la même idée dans les middlewares PSR-15, les middlewares Messenger ou les pipes Laravel : un pipeline d'étapes composables.",
    why: "Le motif pipeline est partout dans les frameworks modernes ; le repérer aide à comprendre (et étendre) leur code interne sereinement.",
    doc: 'https://refactoring.guru/fr/design-patterns/chain-of-responsibility',
  },
  {
    level: 'avance',
    q: 'Quelle différence entre **Decorator** et **Proxy** ?',
    choices: [
      "Decorator change l'interface publique de l'objet enveloppé, Proxy la conserve strictement identique",
      'Proxy ne peut envelopper que des interfaces, Decorator uniquement des classes concrètes non finales',
      "Même forme, intentions opposées : Decorator AJOUTE du comportement composable, Proxy CONTRÔLE l'accès (lazy, cache, droits)",
      'Decorator est résolu statiquement à la compilation du conteneur, Proxy est généré dynamiquement au runtime',
    ],
    answer: 2,
    explain:
      "Les deux enveloppent un objet derrière la même interface. Decorator : empiler des responsabilités (`CachedRepo(LoggedRepo(DoctrineRepo))`) — supporté nativement par Symfony avec `#[AsDecorator]`. Proxy : contrôler l'accès — les entités lazy de Doctrine sont des proxies.",
    why: "Tu utilises déjà les deux tous les jours (décoration de services, proxies Doctrine) — savoir les nommer et les différencier fait la différence en entretien.",
    doc: 'https://refactoring.guru/fr/design-patterns/decorator',
  },
  {
    level: 'avance',
    q: 'Architecture hexagonale (ports & adapters) : où vivent les interfaces (ports) ?',
    choices: [
      "Dans la couche infrastructure, à côté des adaptateurs qui les implémentent, pour faciliter la navigation",
      "Dans le domaine/application : le cœur définit SES besoins, l'infra fournit les adaptateurs (inversion de dépendance)",
      'Dans un package partagé publié séparément, importé à la fois par le domaine et par l\'infrastructure',
      "Peu importe leur emplacement : seule compte la direction des appels observée au runtime de l'application",
    ],
    answer: 1,
    explain:
      "Les dépendances pointent vers le domaine : `App\\Domain\\Repository\\OrderRepositoryInterface` appartient au domaine ; `App\\Infrastructure\\Doctrine\\DoctrineOrderRepository` l'implémente. Le domaine ignore Doctrine et Symfony — testable sans infra, migrable sans douleur.",
    why: "La direction des dépendances (le D de SOLID) est LE critère qui rend un domaine testable et une infra remplaçable — sujet d'archi récurrent.",
    doc: 'https://alistair.cockburn.us/hexagonal-architecture/',
  },
  {
    level: 'avance',
    q: 'CQRS signifie…',
    choices: [
      'Mettre en cache les résultats des requêtes SQL répétitives dans un store dédié type Redis ou Varnish',
      "Séparer le modèle d'écriture (commands, invariants métier) du modèle de lecture (queries, projections optimisées)",
      "Employer l'event sourcing : l'état du système est reconstruit en rejouant le journal des événements",
      'Créer un repository par entité exposant des méthodes distinctes pour la lecture et pour l\'écriture',
    ],
    answer: 1,
    explain:
      "Command Query Responsibility Segregation : les écritures passent par des Commands qui protègent les invariants ; les lectures utilisent des Queries directes (DTO, SQL brut, vues dénormalisées). Avec Messenger : bus `command.bus` et `query.bus` distincts. L'event sourcing est optionnel et bien plus engageant.",
    why: "CQRS « léger » (sans event sourcing) est très répandu et souvent mal compris — pouvoir le démystifier est un vrai plus.",
    doc: 'https://martinfowler.com/bliki/CQRS.html',
  },
  {
    level: 'expert',
    q: "Ajouter logging, cache et gestion d'erreurs autour de 15 services existants SANS les modifier : l'approche la plus propre en Symfony ?",
    choices: [
      'Hériter de chaque service et surcharger les méthodes concernées en appelant parent:: pour le comportement de base',
      'Décorer les services (#[AsDecorator]) : chaque préoccupation transverse devient un décorateur générique par interface',
      'Ajouter un trait par préoccupation (LoggableTrait, CacheableTrait) afin de mutualiser le code entre les 15 classes',
      'Créer un listener kernel.controller qui intercepte tous les appels de services et y injecte les préoccupations',
    ],
    answer: 1,
    explain:
      "La décoration compose les préoccupations transverses sans toucher au code décoré (open/closed). L'héritage fige la hiérarchie et casse à la moindre signature ; les traits dupliquent l'appel dans chaque méthode ; le listener kernel n'intercepte pas les appels de services.",
    why: "Cas d'école d'entretien architecture : l'open/closed principle appliqué concrètement avec l'outillage natif du framework.",
    doc: 'https://symfony.com/doc/current/service_container/service_decoration.html',
  },
  {
    level: 'expert',
    q: 'Pattern **Specification** : quel intérêt principal côté métier + Doctrine ?',
    choices: [
      'Générer automatiquement les migrations de schéma en comparant les spécifications au schéma de la base',
      'Encapsuler une règle métier composable (and/or/not), évaluable en mémoire ET traduisible en requête (Criteria)',
      'Centraliser la validation des formulaires en réutilisant les contraintes Symfony directement côté domaine',
      "Remplacer les voters de sécurité : la spécification décide des droits d'accès selon l'état de l'entité",
    ],
    answer: 1,
    explain:
      "Une Specification comme `ClientPremium()->and(CommandeRecente(30))` porte la règle en un seul endroit : évaluable sur un objet en mémoire ET traduisible en critères Doctrine. Fini la règle dupliquée entre un `if` PHP et trois QueryBuilders — `Criteria` l'implémente déjà en partie.",
    why: "Élimine le bug du « client premium » défini différemment en trois endroits du code — un problème réel de tous les projets métier.",
    doc: 'https://en.wikipedia.org/wiki/Specification_pattern',
  },
]
