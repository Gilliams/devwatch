export default [
  {
    level: 'inter',
    q: 'Doctrine : quelle est la différence entre `persist()` et `flush()` ?',
    choices: [
      "persist() exécute un INSERT immédiat ; flush() se contente de valider la transaction ouverte en amont",
      "persist() enregistre l'entité dans l'UnitOfWork ; flush() calcule le changeset et exécute les requêtes SQL",
      'persist() valide les contraintes de l\'entité ; flush() ne les envoie en base que si la validation a réussi',
      'flush() est optionnel : Doctrine flushe automatiquement en fin de requête via un listener kernel.terminate',
    ],
    answer: 1,
    explain:
      "Doctrine implémente le pattern Unit of Work : persist() marque l'entité comme gérée. Au flush(), Doctrine compare l'état des entités avec leur snapshot, en déduit les INSERT/UPDATE/DELETE et les exécute dans une transaction.",
    why: "L'UnitOfWork explique 90 % des comportements « magiques » de Doctrine : ordre des requêtes, cascades, transactions implicites.",
    doc: 'https://www.doctrine-project.org/projects/doctrine-orm/en/latest/reference/working-with-objects.html',
  },
  {
    level: 'inter',
    q: "Le problème « N+1 queries » avec un ORM, c'est…",
    choices: [
      'Une requête superflue émise dans une boucle for, corrigée en sortant simplement l\'appel de la boucle',
      'Un index manquant sur la clé étrangère, qui force N parcours complets de la table liée au lieu d\'un seul',
      'Charger N entités puis déclencher une requête par entité en accédant à une relation lazy (1 + N requêtes)',
      'Un défaut d\'hydratation de Doctrine 2, corrigé depuis la 2.10 par le batch fetching automatique',
    ],
    answer: 2,
    explain:
      "Classique : `findAll()` puis `$article->getAuthor()->getName()` dans la boucle Twig → une requête par article. Solutions : fetch join (`addSelect + leftJoin`), EAGER ciblé, batch fetching. À détecter au profiler Symfony.",
    why: "Le N+1 est LE tueur de performance des applications ORM — le repérer au profiler et le corriger est attendu partout.",
    doc: 'https://www.doctrine-project.org/projects/doctrine-orm/en/latest/reference/dql-doctrine-query-language.html',
  },
  {
    level: 'avance',
    q: 'Doctrine : `EAGER`, `LAZY` et `EXTRA_LAZY` sur une collection — quelle différence ?',
    choices: [
      'EAGER charge à la première itération, LAZY au premier accès, EXTRA_LAZY seulement au premier count()',
      'LAZY hydrate toute la collection au premier accès ; EXTRA_LAZY traduit count()/contains()/slice() en SQL ciblé',
      "EXTRA_LAZY désactive le chargement : la collection reste vide tant qu'initialize() n'est pas appelé explicitement",
      'LAZY et EXTRA_LAZY sont identiques sur un OneToMany ; la nuance n\'existe que sur les ManyToMany avec pivot',
    ],
    answer: 1,
    explain:
      "Avec LAZY, un simple `count($commande->getLignes())` hydrate TOUTES les lignes. EXTRA_LAZY traduit count(), contains(), slice() en requêtes ciblées (COUNT(*), EXISTS, LIMIT) sans charger la collection.",
    why: "Un count() qui hydrate 50 000 lignes est un incident de prod réel ; EXTRA_LAZY le transforme en COUNT(*) instantané.",
    doc: 'https://www.doctrine-project.org/projects/doctrine-orm/en/latest/tutorials/extra-lazy-associations.html',
  },
  {
    level: 'avance',
    q: "Pourquoi préférer le verrouillage optimiste (`#[Version]`) au pessimiste pour l'édition via formulaire web ?",
    choices: [
      'Le verrou optimiste chiffre la ligne pendant toute la durée d\'édition, empêchant les lectures concurrentes',
      "Le verrou pessimiste n'existe pas dans Doctrine : seul l'optimiste est implémenté, via la colonne de version",
      "Un verrou DB ne peut pas couvrir le « temps humain » d'édition ; la colonne version détecte le conflit au flush",
      "Le verrou optimiste évite d'ouvrir une transaction, ce qui libère plus vite le pool de connexions de PHP-FPM",
    ],
    answer: 2,
    explain:
      "Un verrou pessimiste (SELECT ... FOR UPDATE) ne vit que le temps d'une transaction — impossible de couvrir l'édition d'un formulaire. Le lock optimiste ajoute `WHERE version = :ancienne` à l'UPDATE : 0 ligne affectée = conflit = OptimisticLockException.",
    why: "La perte silencieuse de modifications concurrentes (deux back-offices sur la même fiche) est un bug métier grave ; c'est la parade standard.",
    doc: 'https://www.doctrine-project.org/projects/doctrine-orm/en/latest/reference/transactions-and-concurrency.html',
  },
  {
    level: 'avance',
    q: 'Quand violer volontairement la 3e forme normale (3NF) ?',
    choices: [
      'Jamais : la 3NF garantit l\'intégrité, la violer introduit des anomalies d\'update inacceptables en OLTP',
      'Dénormalisation ciblée pour la lecture : agrégats précalculés, colonnes dupliquées, tables de reporting',
      'Dès que la table dépasse le million de lignes : les jointures deviennent alors le facteur limitant',
      "Quand on utilise un ORM : les jointures qu'il génère sont trop coûteuses pour maintenir la 3NF partout",
    ],
    answer: 1,
    explain:
      "La normalisation optimise écriture et cohérence ; la dénormalisation optimise la lecture. Exemples légitimes : `commandes.total` précalculé, compteurs, schémas en étoile pour l'analytique. Règle : dénormaliser consciemment, documenter, maintenir (events, triggers, jobs).",
    why: "Savoir QUAND s'écarter de la théorie et comment maintenir la cohérence distingue le modeleur pragmatique du théoricien.",
    doc: 'https://fr.wikipedia.org/wiki/Forme_normale_(bases_de_donn%C3%A9es_relationnelles)',
  },
  {
    level: 'expert',
    q: 'Migration : ajout d\'une colonne NOT NULL sur une table de 50M de lignes en production MySQL 5.7. Le risque principal ?',
    choices: [
      'Aucun : depuis MySQL 5.6, tous les ALTER TABLE sont exécutés en INSTANT sans copie de table',
      'Les valeurs existantes de la ligne sont réinitialisées si aucune clause DEFAULT n\'est fournie',
      "L'ALTER reconstruit la table sous verrou de métadonnées : écritures bloquées pendant de longues minutes",
      "La réplication s'interrompt le temps de l'ALTER, créant un lag égal à la durée totale de la migration",
    ],
    answer: 2,
    explain:
      "Sur les grosses tables, un ALTER peut copier la table entière (surtout avant MySQL 8.0 et l'ADD COLUMN INSTANT). Pendant ce temps : metadata lock, requêtes en file, timeouts en cascade. Solutions : gh-ost / pt-online-schema-change, migrations en plusieurs étapes.",
    why: "Une migration Doctrine anodine peut coucher la prod — sujet d'exploitation qui revient dans tous les entretiens un peu costauds.",
    doc: 'https://docs.percona.com/percona-toolkit/pt-online-schema-change.html',
  },
  {
    level: 'expert',
    q: "Quelle différence fondamentale entre le MVCC de PostgreSQL et celui d'InnoDB (MySQL) ?",
    choices: [
      "PostgreSQL n'implémente pas de MVCC à proprement parler : il s'appuie sur des verrous de lecture partagés",
      'InnoDB duplique la table modifiée dans un tablespace temporaire pour servir les lecteurs concurrents',
      "PostgreSQL garde les anciennes versions dans la table même (d'où VACUUM) ; InnoDB les reconstruit via les undo logs",
      'Les deux moteurs partagent le même mécanisme, hérité de la spécification SQL:1999 sur l\'isolation',
    ],
    answer: 2,
    explain:
      "Postgres écrit chaque nouvelle version de ligne dans la heap (les mortes deviennent du bloat nettoyé par VACUUM). InnoDB modifie en place et garde l'ancienne version dans l'undo log. Conséquences : updates massifs → bloat côté PG ; longues transactions → undo qui gonfle côté MySQL.",
    why: "Explique des comportements de prod opposés entre les deux moteurs — précieux si tu passes de MySQL à Postgres (ou l'inverse) en changeant d'entreprise.",
    doc: 'https://www.postgresql.org/docs/current/routine-vacuuming.html',
  },
  {
    level: 'expert',
    q: 'Architecture primaire + réplicas en lecture : quel problème pose le « read-your-own-writes » ?',
    choices: [
      'Les réplicas rejettent les lectures des lignes écrites il y a moins d\'une seconde, provoquant des erreurs',
      'Une lecture juste après écriture, routée vers un réplica en retard, peut ne pas voir la donnée créée',
      'Les écritures sont dupliquées si le client bascule de réplica au milieu d\'une transaction ouverte',
      "Le problème n'existe qu'en réplication synchrone, lorsque le quorum d'acquittement n'est pas atteint",
    ],
    answer: 1,
    explain:
      "La réplication asynchrone a un lag : l'utilisateur crée un article, la liste est servie par un réplica qui ne l'a pas encore → « où est mon article ? ». Parades : épingler les lectures au primaire quelques secondes après écriture, lecture causale (GTID), ou primaire pour les données de l'utilisateur courant.",
    why: "Bug d'UX typique dès qu'on scale en lecture ; connaître les parades montre que tu as déjà réfléchi au-delà du serveur unique.",
    doc: 'https://jepsen.io/consistency/models/read-your-writes',
  },
]
