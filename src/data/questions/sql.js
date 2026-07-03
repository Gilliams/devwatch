export default [
  {
    level: 'inter',
    q: "Quelle est la différence entre `WHERE` et `HAVING` ?",
    choices: [
      'HAVING est plus rapide car exécuté en premier',
      "WHERE filtre les lignes avant agrégation, HAVING filtre les groupes après GROUP BY",
      'HAVING ne peut être utilisé que sur des colonnes indexées',
      "WHERE ne fonctionne pas avec les jointures",
    ],
    answer: 1,
    explain:
      "Ordre logique d'exécution : FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. WHERE élimine les lignes avant le regroupement (donc plus efficace quand c'est possible) ; HAVING s'applique aux résultats agrégés : `HAVING COUNT(*) > 5`.",
  },
  {
    level: 'inter',
    q: "`LEFT JOIN` avec une condition dans le `ON` vs dans le `WHERE` : quelle différence ?\n```sql\n... FROM a LEFT JOIN b ON a.id = b.a_id AND b.statut = 'actif'\n-- vs\n... FROM a LEFT JOIN b ON a.id = b.a_id WHERE b.statut = 'actif'\n```",
    choices: [
      'Aucune, l\'optimiseur produit le même plan',
      "La condition dans le WHERE élimine les lignes où b est NULL : le LEFT JOIN se comporte alors comme un INNER JOIN",
      'La condition dans le ON est ignorée pour les LEFT JOIN',
      'La version WHERE est invalide en SQL standard',
    ],
    answer: 1,
    explain:
      "Dans le ON, la condition restreint seulement les lignes de `b` à joindre : les lignes de `a` sans correspondance restent (avec des NULL). Dans le WHERE, `b.statut = 'actif'` est faux quand b.statut est NULL → les lignes sans correspondance disparaissent. Piège classique d'entretien !",
  },
  {
    level: 'inter',
    q: "Que renvoie `COUNT(colonne)` par rapport à `COUNT(*)` ?",
    choices: [
      'Exactement la même chose',
      'COUNT(colonne) ignore les lignes où la colonne est NULL',
      'COUNT(*) est toujours plus lent',
      'COUNT(colonne) compte les valeurs distinctes',
    ],
    answer: 1,
    explain:
      "COUNT(*) compte toutes les lignes ; COUNT(col) ne compte que les lignes où col IS NOT NULL ; COUNT(DISTINCT col) compte les valeurs distinctes non nulles. Sur un LEFT JOIN, `COUNT(b.id)` donne 0 pour les lignes sans correspondance là où COUNT(*) donnerait 1.",
  },
  {
    level: 'avance',
    q: "Quelle requête trouve le 2e salaire le plus élevé PAR département ?",
    choices: [
      'SELECT dept, MAX(salaire) FROM emp GROUP BY dept LIMIT 2',
      "SELECT dept, salaire FROM (SELECT dept, salaire, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salaire DESC) rg FROM emp) t WHERE rg = 2",
      'SELECT dept, salaire FROM emp ORDER BY salaire DESC LIMIT 1 OFFSET 1',
      'SELECT dept, NTH_VALUE(salaire, 2) FROM emp GROUP BY dept',
    ],
    answer: 1,
    explain:
      "Les fonctions fenêtres avec PARTITION BY sont l'outil idéal : DENSE_RANK() classe les salaires au sein de chaque département sans réduire les lignes. ROW_NUMBER() ignorerait les ex æquo, RANK() sauterait des rangs. LIMIT/OFFSET ne marche que globalement, pas par groupe.",
  },
  {
    level: 'avance',
    q: "Différence entre `RANK()`, `DENSE_RANK()` et `ROW_NUMBER()` sur les valeurs 100, 100, 90 ?",
    choices: [
      'RANK : 1,1,2 · DENSE_RANK : 1,1,3 · ROW_NUMBER : 1,2,3',
      'RANK : 1,1,3 · DENSE_RANK : 1,1,2 · ROW_NUMBER : 1,2,3',
      'RANK : 1,2,3 · DENSE_RANK : 1,1,2 · ROW_NUMBER : 1,1,3',
      'Les trois donnent 1,1,2',
    ],
    answer: 1,
    explain:
      "RANK() laisse des « trous » après les ex æquo (1,1,3), DENSE_RANK() n'en laisse pas (1,1,2), ROW_NUMBER() numérote arbitrairement les ex æquo (1,2,3). Le choix change le résultat dès qu'il y a des doublons — d'où l'importance de le justifier en entretien.",
  },
  {
    level: 'avance',
    q: "Une requête `SELECT ... WHERE annee = 2024 AND YEAR(date_creation) = 2024` est lente malgré un index sur date_creation. Pourquoi ?",
    choices: [
      "L'index est corrompu",
      "Appliquer une fonction sur la colonne (YEAR(...)) rend l'index inutilisable : la condition n'est pas sargable",
      'Il faut un index composite sur (annee, date_creation)',
      'Les index ne fonctionnent pas sur les dates',
    ],
    answer: 1,
    explain:
      "Une condition est « sargable » si le moteur peut utiliser l'index : `date_creation >= '2024-01-01' AND date_creation < '2025-01-01'` permet un range scan. `YEAR(date_creation) = 2024` force le calcul sur chaque ligne → full scan. Même piège avec `LIKE '%mot'`, ou une comparaison avec cast implicite.",
  },
  {
    level: 'avance',
    q: "Qu'est-ce qu'un index couvrant (covering index) ?",
    choices: [
      'Un index sur toutes les colonnes de la table',
      'Un index qui contient toutes les colonnes nécessaires à la requête, évitant de lire la table elle-même',
      'Un index unique sur la clé primaire',
      'Un index partitionné sur plusieurs disques',
    ],
    answer: 1,
    explain:
      "Si l'index contient toutes les colonnes du SELECT/WHERE/ORDER BY, le moteur répond depuis le seul index (« Using index » dans EXPLAIN MySQL, Index Only Scan dans Postgres) sans accès aux pages de données. On peut inclure des colonnes non filtrantes : `INCLUDE (...)` en Postgres, colonnes en fin d'index en MySQL.",
  },
  {
    level: 'avance',
    q: "Que fait ce CTE récursif ?\n```sql\nWITH RECURSIVE r AS (\n  SELECT id, manager_id, nom FROM emp WHERE id = 42\n  UNION ALL\n  SELECT e.id, e.manager_id, e.nom FROM emp e JOIN r ON e.id = r.manager_id\n)\nSELECT nom FROM r;\n```",
    choices: [
      "Il liste tous les subordonnés de l'employé 42",
      "Il remonte la chaîne hiérarchique de l'employé 42 jusqu'au sommet (lui + tous ses managers successifs)",
      'Il liste tous les employés du même manager',
      'Il boucle indéfiniment',
    ],
    answer: 1,
    explain:
      "L'ancre sélectionne l'employé 42 ; la partie récursive joint `e.id = r.manager_id`, c'est-à-dire « l'employé dont l'id est le manager du niveau précédent » → on remonte. Pour descendre (les subordonnés), on écrirait `e.manager_id = r.id`. Le sens de la jointure détermine la direction du parcours.",
  },
  {
    level: 'expert',
    q: "Sous MySQL InnoDB en isolation REPEATABLE READ, deux transactions font `SELECT ... FOR UPDATE` sur des lignes différentes puis chacune tente de modifier la ligne de l'autre. Que se passe-t-il ?",
    choices: [
      'Les deux réussissent grâce au MVCC',
      "Deadlock : InnoDB le détecte et tue l'une des deux transactions (rollback)",
      "Les deux attendent indéfiniment le timeout",
      'La deuxième transaction lit la valeur non commitée',
    ],
    answer: 1,
    explain:
      "C'est le deadlock classique en croix : T1 verrouille A et attend B, T2 verrouille B et attend A. InnoDB détecte le cycle immédiatement et annule la transaction la moins coûteuse avec l'erreur 1213. Le code applicatif doit être prêt à rejouer la transaction. Verrouiller les lignes dans un ordre stable évite le problème.",
  },
  {
    level: 'expert',
    q: 'Que sont les « phantom reads » et quel niveau d\'isolation les élimine complètement en SQL standard ?',
    choices: [
      'Des lectures de valeurs non commitées, éliminées par READ COMMITTED',
      "De nouvelles lignes apparaissant entre deux exécutions de la même requête dans une transaction ; SERIALIZABLE les élimine",
      'Des lignes modifiées par une autre transaction, éliminées par REPEATABLE READ',
      "Des lectures depuis un réplica en retard",
    ],
    answer: 1,
    explain:
      "Le phantom : `SELECT COUNT(*) WHERE prix > 100` renvoie 5, une autre transaction INSÈRE une ligne à 150, votre 2e SELECT en renvoie 6. REPEATABLE READ protège les lignes lues mais pas (en standard) les nouveaux INSERT correspondant au prédicat. SERIALIZABLE verrouille le prédicat. Nuance : l'InnoDB de MySQL bloque déjà largement les phantoms en RR via les gap locks.",
  },
  {
    level: 'expert',
    q: "Comment paginer efficacement une table de 10M lignes triée par date (le `LIMIT 20 OFFSET 500000` devient très lent) ?",
    choices: [
      'Augmenter le buffer pool',
      "Utiliser la pagination par curseur (keyset) : WHERE (date_creation, id) < (:derniere_date, :dernier_id) ORDER BY date_creation DESC, id DESC LIMIT 20",
      'Créer un index sur OFFSET',
      'Utiliser SQL_CALC_FOUND_ROWS',
    ],
    answer: 1,
    explain:
      "OFFSET force le moteur à lire et jeter 500 000 lignes. La pagination keyset (« seek method ») repart de la dernière valeur vue grâce à un index sur (date_creation, id) — coût constant quelle que soit la page. Contrainte : pas de saut direct à la page N ; le tri doit être déterministe (d'où l'id en tie-breaker).",
  },
  {
    level: 'expert',
    q: "Dans un EXPLAIN MySQL, vous voyez `type: ALL, rows: 2000000, Extra: Using filesort`. Que faire en priorité ?",
    choices: [
      "Rien, filesort signifie que le tri est fait sur disque et c'est normal",
      "Créer un index adapté au WHERE et/ou à l'ORDER BY : type ALL = full table scan, et filesort = tri non résolu par un index",
      'Passer le moteur en MyISAM',
      'Augmenter sort_buffer_size et le problème disparaît',
    ],
    answer: 1,
    explain:
      "`type: ALL` signifie que MySQL lit toute la table ; `Using filesort` qu'il doit trier le résultat (en mémoire ou sur disque) au lieu de lire un index déjà trié. Un index composite couvrant le filtre puis le tri (ex : `(statut, date_creation)`) peut transformer la requête : range scan + ordre de l'index, plus aucun tri.",
  },
]
