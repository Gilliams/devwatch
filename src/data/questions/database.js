export default [
  {
    level: 'inter',
    q: "Doctrine : quelle est la différence entre `persist()` et `flush()` ?",
    choices: [
      'persist() exécute un INSERT immédiat, flush() valide la transaction',
      "persist() marque l'entité comme gérée par l'UnitOfWork ; flush() calcule le changeset et exécute réellement les requêtes SQL",
      'flush() est optionnel si on utilise persist()',
      'persist() valide les contraintes, flush() les envoie',
    ],
    answer: 1,
    explain:
      "Doctrine implémente le pattern Unit of Work : persist() ne fait qu'enregistrer l'entité auprès de l'EntityManager. Au flush(), Doctrine compare l'état actuel des entités gérées avec leur snapshot, en déduit les INSERT/UPDATE/DELETE nécessaires et les exécute dans une transaction.",
  },
  {
    level: 'inter',
    q: 'Le problème « N+1 queries » avec un ORM, c\'est…',
    choices: [
      "Une requête de trop dans une boucle for",
      "Charger une liste de N entités puis déclencher une requête par entité en accédant à une relation lazy — 1 + N requêtes au total",
      "Un index manquant sur la clé étrangère",
      "Un bug de Doctrine corrigé depuis la version 2.10",
    ],
    answer: 1,
    explain:
      "Classique : `findAll()` sur Article puis `$article->getAuthor()->getName()` dans la boucle Twig → une requête par article. Solutions : jointure fetch (`addSelect('a')->leftJoin('article.author', 'a')`), `fetch: 'EAGER'` ciblé, ou le batch fetching. À détecter avec le profiler Symfony.",
  },
  {
    level: 'avance',
    q: "Dans Doctrine, quelle différence entre `EAGER`, `LAZY` et `EXTRA_LAZY` sur une collection ?",
    choices: [
      "EAGER charge à la demande, LAZY immédiatement",
      "LAZY hydrate toute la collection au premier accès ; EXTRA_LAZY permet count()/contains()/slice() en SQL sans hydrater toute la collection",
      "EXTRA_LAZY désactive complètement le chargement",
      "LAZY et EXTRA_LAZY sont identiques pour les OneToMany",
    ],
    answer: 1,
    explain:
      "Avec LAZY, un simple `count($commande->getLignes())` hydrate TOUTES les lignes. EXTRA_LAZY traduit count(), contains(), slice() en requêtes SQL ciblées (COUNT(*), EXISTS, LIMIT) sans charger la collection. Précieux sur les grosses relations.",
  },
  {
    level: 'avance',
    q: "Pourquoi préférer un UPDATE avec verrouillage optimiste (`#[Version]`) plutôt qu'un verrou pessimiste dans une appli web classique ?",
    choices: [
      'Le verrou optimiste est plus sûr contre les injections',
      "Entre l'affichage du formulaire et la soumission, on ne peut pas tenir un verrou DB ; la colonne version détecte le conflit au flush et lève OptimisticLockException",
      "Le verrou pessimiste n'existe pas dans Doctrine",
      'Le verrou optimiste évite les transactions',
    ],
    answer: 1,
    explain:
      "Un verrou pessimiste (SELECT ... FOR UPDATE) ne vit que le temps d'une transaction — impossible de couvrir le « temps humain » d'édition d'un formulaire. Le lock optimiste ajoute `WHERE version = :ancienne` à l'UPDATE : si un autre utilisateur a modifié entre-temps, 0 ligne affectée → exception → on informe l'utilisateur du conflit.",
  },
  {
    level: 'avance',
    q: "Quand la 3e forme normale (3NF) doit-elle être volontairement violée ?",
    choices: [
      'Jamais, la 3NF est obligatoire',
      "Dénormalisation ciblée pour la lecture : agrégats précalculés, colonnes dupliquées sur des tables très lues, tables de reporting — au prix d'une cohérence à maintenir",
      'Dès que la table dépasse un million de lignes',
      'Quand on utilise un ORM',
    ],
    answer: 1,
    explain:
      "La normalisation optimise l'écriture et la cohérence ; la dénormalisation optimise la lecture. Exemples légitimes : `commandes.total` précalculé, compteur `articles.nb_commentaires`, tables de faits en étoile pour l'analytique. La règle : dénormaliser consciemment, documenter, et maintenir via triggers/events/jobs.",
  },
  {
    level: 'expert',
    q: "Une migration ajoute une colonne NOT NULL sans DEFAULT sur une table de 50M lignes en production MySQL 5.7. Quel est le risque principal ?",
    choices: [
      "Aucun, MySQL gère ça instantanément",
      "L'ALTER TABLE reconstruit la table et pose un verrou métadonnées : écritures bloquées potentiellement pendant de longues minutes",
      'Les données existantes sont supprimées',
      'La réplication est désactivée automatiquement',
    ],
    answer: 1,
    explain:
      "Sur les grosses tables, un ALTER peut copier la table entière (surtout avant MySQL 8.0 et son ADD COLUMN INSTANT). Pendant ce temps : metadata lock, requêtes en file, timeouts en cascade. Solutions : gh-ost / pt-online-schema-change, migrations en plusieurs étapes (colonne nullable → backfill par lots → contrainte).",
  },
  {
    level: 'expert',
    q: "Différence fondamentale entre le MVCC de PostgreSQL et celui d'InnoDB (MySQL) ?",
    choices: [
      "PostgreSQL n'a pas de MVCC",
      "PostgreSQL garde les anciennes versions dans la table elle-même (d'où le VACUUM) ; InnoDB les reconstruit via les undo logs",
      "InnoDB copie la table à chaque UPDATE",
      "Les deux utilisent exactement le même mécanisme",
    ],
    answer: 1,
    explain:
      "Postgres écrit chaque nouvelle version de ligne dans la heap (les mortes deviennent du « bloat » nettoyé par VACUUM/autovacuum). InnoDB modifie la ligne en place et stocke l'ancienne version dans l'undo log pour les lecteurs concurrents. Conséquences pratiques : updates massifs → bloat côté PG, longs SELECT → historique undo qui gonfle côté MySQL.",
  },
  {
    level: 'expert',
    q: "Dans une architecture avec réplication primaire → réplicas en lecture, quel problème le « read-your-own-writes » pose-t-il ?",
    choices: [
      'Les réplicas refusent les lectures des données récentes',
      "Après un INSERT sur le primaire, une lecture immédiate routée vers un réplica en retard peut ne pas voir la donnée que l'utilisateur vient de créer",
      'Les écritures sont dupliquées',
      "C'est impossible avec MySQL",
    ],
    answer: 1,
    explain:
      "La réplication est asynchrone : le réplica a un lag. L'utilisateur crée un article, est redirigé vers la liste… servie par un réplica qui ne l'a pas encore → « où est mon article ? ». Parades : épingler les lectures au primaire quelques secondes après une écriture (sticky session), lecture causale (attendre le GTID), ou lire le primaire pour les données de l'utilisateur courant.",
  },
]
