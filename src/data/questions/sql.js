export default [
  {
    level: 'inter',
    q: 'Quelle est la différence entre `WHERE` et `HAVING` ?',
    choices: [
      "HAVING est optimisé via l'index alors que WHERE est évalué ligne à ligne par le moteur d'exécution",
      'WHERE filtre les lignes avant agrégation ; HAVING filtre les groupes après le GROUP BY',
      "HAVING n'accepte que des fonctions d'agrégat et provoque une erreur sur une colonne simple",
      'Aucune différence fonctionnelle : HAVING est simplement requis dès que GROUP BY est présent',
    ],
    answer: 1,
    explain:
      "Ordre logique : FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. WHERE élimine les lignes avant regroupement (plus efficace quand c'est possible) ; HAVING s'applique aux agrégats : `HAVING COUNT(*) > 5`.",
    why: "Filtrer au plus tôt réduit le volume traité : réflexe perf ET question éliminatoire dans tout entretien SQL.",
    doc: 'https://sql.sh/cours/having',
  },
  {
    level: 'inter',
    q: "`LEFT JOIN` : condition dans le `ON` ou dans le `WHERE` ?\n```sql\nFROM a LEFT JOIN b ON a.id = b.a_id AND b.statut = 'actif'\n-- vs\nFROM a LEFT JOIN b ON a.id = b.a_id WHERE b.statut = 'actif'\n```",
    choices: [
      "Aucune différence : l'optimiseur réécrit systématiquement les deux formes vers le même plan d'exécution",
      'La condition placée dans le ON est ignorée pour le côté externe : seul le WHERE est réellement appliqué',
      'La condition dans le WHERE élimine les lignes à NULL : le LEFT JOIN se comporte alors comme un INNER JOIN',
      'La version WHERE est refusée par le standard SQL:2016 ; seuls MySQL et SQLite la tolèrent encore',
    ],
    answer: 2,
    explain:
      "Dans le ON, la condition restreint seulement les lignes de `b` à joindre : les lignes de `a` sans correspondance restent (avec des NULL). Dans le WHERE, `b.statut = 'actif'` est faux pour les NULL → ces lignes disparaissent.",
    why: "Piège n°1 des jointures externes : des lignes « disparaissent » d'un rapport. Le diagnostiquer d'un coup d'œil fait gagner des heures.",
    doc: 'https://sql.sh/cours/jointures',
  },
  {
    level: 'inter',
    q: 'Que renvoie `COUNT(colonne)` par rapport à `COUNT(*)` ?',
    choices: [
      'COUNT(colonne) compte les valeurs distinctes de la colonne, doublons automatiquement exclus',
      'COUNT(*) lit la ligne entière et coûte donc plus cher que COUNT(colonne) sur une colonne indexée',
      'Strictement la même chose : l\'argument de COUNT est purement décoratif pour la lisibilité',
      'COUNT(colonne) ignore les lignes où la colonne est NULL ; COUNT(*) compte toutes les lignes',
    ],
    answer: 3,
    explain:
      "COUNT(*) compte toutes les lignes ; COUNT(col) uniquement celles où col IS NOT NULL ; COUNT(DISTINCT col) les valeurs distinctes non nulles. Sur un LEFT JOIN, `COUNT(b.id)` donne 0 là où COUNT(*) donnerait 1.",
    why: "Source classique de statistiques fausses dans les dashboards — surtout combiné aux jointures externes.",
    doc: 'https://sql.sh/fonctions/agregation',
  },
  {
    level: 'avance',
    q: 'Quelle requête trouve le 2e salaire le plus élevé PAR département ?',
    choices: [
      'SELECT dept, MAX(salaire) FROM emp WHERE salaire < (SELECT MAX(salaire) FROM emp) GROUP BY dept',
      'DENSE_RANK() OVER (PARTITION BY dept ORDER BY salaire DESC) dans une sous-requête, filtrée sur rang = 2',
      'SELECT dept, salaire FROM emp GROUP BY dept ORDER BY salaire DESC LIMIT 1 OFFSET 1, appliqué par groupe',
      'NTH_VALUE(salaire, 2) combiné à un GROUP BY dept, qui renvoie la deuxième valeur de chaque groupe',
    ],
    answer: 1,
    explain:
      "PARTITION BY classe les salaires au sein de chaque département sans réduire les lignes. DENSE_RANK gère les ex æquo sans sauter de rang. La 1re option compare au max GLOBAL (faux) ; LIMIT/OFFSET ne s'applique pas par groupe.",
    why: "Les « top N par groupe » sont LE cas d'usage des fonctions fenêtres — sujet SQL moderne incontournable en entretien.",
    doc: 'https://dev.mysql.com/doc/refman/8.0/en/window-functions-usage.html',
  },
  {
    level: 'avance',
    q: 'Sur les valeurs 100, 100, 90 : que renvoient `RANK()`, `DENSE_RANK()` et `ROW_NUMBER()` ?',
    choices: [
      'RANK : 1,1,2 · DENSE_RANK : 1,1,3 · ROW_NUMBER : 1,2,3',
      'RANK : 1,2,3 · DENSE_RANK : 1,1,2 · ROW_NUMBER : 1,1,3',
      'RANK : 1,1,3 · DENSE_RANK : 1,1,2 · ROW_NUMBER : 1,2,3',
      'Les trois renvoient 1,1,2 : elles ne divergent qu\'à partir de deux groupes d\'ex æquo distincts',
    ],
    answer: 2,
    explain:
      "RANK() laisse des « trous » après les ex æquo (1,1,3), DENSE_RANK() n'en laisse pas (1,1,2), ROW_NUMBER() numérote arbitrairement (1,2,3). Le choix change le résultat métier dès qu'il y a des doublons.",
    why: "Classements, scores, ventes : dès qu'il y a des ex æquo, le choix de la fonction doit être justifié — et l'intervieweur le sait.",
    doc: 'https://www.postgresql.org/docs/current/functions-window.html',
  },
  {
    level: 'avance',
    q: 'Requête lente malgré un index sur date_creation :\n```sql\nWHERE YEAR(date_creation) = 2024\n```\nPourquoi ?',
    choices: [
      "L'index est fragmenté par les insertions récentes ; un OPTIMIZE TABLE restaurerait ses performances",
      "Appliquer une fonction sur la colonne rend l'index inutilisable (non sargable) : réécrire en bornes de dates",
      "Il manque un index composite (annee, date_creation) : sans lui, l'ordre des colonnes bloque le range scan",
      'Les fonctions de date sont évaluées deux fois par ligne dans MySQL, ce qui double le coût du parcours',
    ],
    answer: 1,
    explain:
      "`date_creation >= '2024-01-01' AND date_creation < '2025-01-01'` permet un range scan sur l'index ; `YEAR(col) = 2024` force le calcul sur chaque ligne → full scan. Mêmes pièges : `LIKE '%mot'`, cast implicite.",
    why: "Réécrire en bornes est l'optimisation SQL la plus rentable et la plus simple qui soit — à connaître par cœur pour ta remise à niveau.",
    doc: 'https://use-the-index-luke.com/sql/where-clause/obfuscation',
  },
  {
    level: 'avance',
    q: "Qu'est-ce qu'un index couvrant (covering index) ?",
    choices: [
      "Un index UNIQUE sur la clé primaire, étendu automatiquement aux colonnes du SELECT par l'optimiseur",
      'Un index déclaré sur toutes les colonnes de la table, que le planificateur utilise en dernier recours',
      'Un index contenant toutes les colonnes nécessaires à la requête : le moteur répond sans lire la table',
      "Un index dupliqué sur chaque partition d'une table partitionnée, couvrant ainsi tous les segments",
    ],
    answer: 2,
    explain:
      "Si l'index contient toutes les colonnes du SELECT/WHERE/ORDER BY, le moteur répond depuis le seul index (« Using index » chez MySQL, Index Only Scan chez Postgres) sans toucher aux pages de données.",
    why: "Supprimer les allers-retours vers la table donne des gains ×10 fréquents sur les requêtes de listing — l'optimisation ciblée par excellence.",
    doc: 'https://use-the-index-luke.com/sql/clustering/index-only-scan-covering-index',
  },
  {
    level: 'avance',
    q: "Que fait ce CTE récursif ?\n```sql\nWITH RECURSIVE r AS (\n  SELECT id, manager_id, nom FROM emp WHERE id = 42\n  UNION ALL\n  SELECT e.id, e.manager_id, e.nom\n  FROM emp e JOIN r ON e.id = r.manager_id\n)\nSELECT nom FROM r;\n```",
    choices: [
      "Il liste tous les subordonnés directs et indirects de l'employé 42, en descendant niveau par niveau",
      "Il remonte la chaîne hiérarchique de l'employé 42 jusqu'au sommet (lui puis ses managers successifs)",
      'Il boucle indéfiniment : rien ne borne la récursion dans cette écriture, d\'où une erreur de profondeur',
      "Il renvoie les collègues directs de l'employé 42, c'est-à-dire les employés partageant son manager_id",
    ],
    answer: 1,
    explain:
      "L'ancre sélectionne l'employé 42 ; la partie récursive joint `e.id = r.manager_id` : « l'employé qui est le manager du niveau précédent » → on REMONTE. Pour descendre, on écrirait `e.manager_id = r.id`.",
    why: "Le sens de la jointure décide de la direction du parcours — l'erreur classique donne un résultat plausible mais faux.",
    doc: 'https://dev.mysql.com/doc/refman/8.0/en/with.html#common-table-expressions-recursive',
  },
  {
    level: 'expert',
    q: 'InnoDB, REPEATABLE READ : T1 verrouille la ligne A (`SELECT FOR UPDATE`) et attend B ; T2 verrouille B et attend A. Résultat ?',
    choices: [
      'Grâce au MVCC, chaque transaction travaille sur son snapshot et les deux aboutissent au commit',
      'Les deux transactions attendent innodb_lock_wait_timeout (50 s par défaut) puis échouent ensemble',
      'Deadlock : InnoDB détecte le cycle immédiatement et annule la transaction la moins coûteuse (erreur 1213)',
      'La seconde transaction lit la version non commitée de la ligne et poursuit, au prix d\'une lecture sale',
    ],
    answer: 2,
    explain:
      "C'est le deadlock en croix classique. InnoDB détecte le cycle d'attente et tue la transaction au rollback le moins cher. Le code applicatif doit être prêt à REJOUER la transaction ; verrouiller dans un ordre stable prévient le problème.",
    why: "En prod, gérer l'erreur 1213 par un retry et ordonner ses verrous est le discours attendu d'un back-end senior.",
    doc: 'https://dev.mysql.com/doc/refman/8.0/en/innodb-deadlocks.html',
  },
  {
    level: 'expert',
    q: "Que sont les « phantom reads », et quel niveau d'isolation les élimine en SQL standard ?",
    choices: [
      'Des lignes modifiées par une autre transaction entre deux lectures ; REPEATABLE READ les élimine par verrous de ligne',
      'De nouvelles lignes correspondant au prédicat entre deux exécutions de la même requête ; SERIALIZABLE les élimine',
      "Des lectures de données non commitées d'une transaction concurrente ; READ COMMITTED suffit à les éviter",
      'Des lectures obsolètes servies par un réplica en retard ; seul le routage vers le primaire les évite',
    ],
    answer: 1,
    explain:
      "Le phantom : votre COUNT renvoie 5, une autre transaction INSÈRE une ligne correspondant au prédicat, votre 2e COUNT renvoie 6. REPEATABLE READ protège les lignes LUES, pas les nouvelles. Nuance : InnoDB bloque déjà largement les phantoms en RR via les gap locks.",
    why: "Différencier dirty read / non-repeatable read / phantom est un incontournable ; le bonus gap locks InnoDB fait la différence.",
    doc: 'https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html',
  },
  {
    level: 'expert',
    q: 'Comment paginer efficacement 10M de lignes triées par date, quand `LIMIT 20 OFFSET 500000` s\'effondre ?',
    choices: [
      "Créer un index couvrant sur (date_creation) pour que l'OFFSET soit résolu entièrement dans l'index",
      'Pagination par curseur (keyset) : WHERE (date_creation, id) < (:derniers_vus) ORDER BY … LIMIT 20',
      'Activer le cache de requêtes du serveur pour que les pages suivantes soient servies sans nouveau scan',
      "Partitionner la table par mois afin que l'OFFSET ne s'applique qu'à la partition la plus récente",
    ],
    answer: 1,
    explain:
      "OFFSET lit et jette 500 000 lignes. La keyset pagination repart de la dernière valeur vue via un index sur (date_creation, id) — coût constant. Contraintes : pas de saut direct à la page N, tri déterministe (id en tie-breaker).",
    why: "Les listings qui rament en page 1000 sont un problème réel ; la « seek method » est LA réponse attendue, trade-offs compris.",
    doc: 'https://use-the-index-luke.com/no-offset',
  },
  {
    level: 'expert',
    q: 'EXPLAIN MySQL : `type: ALL, rows: 2000000, Extra: Using filesort`. Quelle action prioritaire ?',
    choices: [
      "Augmenter sort_buffer_size jusqu'à ce que le tri tienne en mémoire, ce qui fait disparaître le filesort",
      "Créer un index aligné sur le WHERE et l'ORDER BY : ALL = full scan, filesort = tri non résolu par un index",
      "Forcer STRAIGHT_JOIN pour que l'optimiseur respecte l'ordre des tables tel qu'écrit dans la requête",
      'Convertir la table en ROW_FORMAT=COMPRESSED afin de réduire le volume de pages lues par le scan',
    ],
    answer: 1,
    explain:
      "`type: ALL` = lecture complète de la table ; `Using filesort` = tri à part (mémoire ou disque) au lieu de lire un index déjà trié. Un index composite (filtre puis tri, ex : `(statut, date_creation)`) peut supprimer les deux problèmes d'un coup.",
    why: "Lire un EXPLAIN et en déduire l'index à créer est exactement la compétence SQL opérationnelle qu'on sonde pour un back senior.",
    doc: 'https://dev.mysql.com/doc/refman/8.0/en/explain-output.html',
  },
]
