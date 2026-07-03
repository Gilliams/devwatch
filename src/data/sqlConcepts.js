// Boîte à outils SQL : chaque étape d'enquête référence les concepts utiles
// (clé `concepts` des étapes). Affiché avec syntaxe, explication et lien doc.
export const SQL_CONCEPTS = {
  where: {
    name: 'WHERE',
    syntax: "SELECT * FROM commandes WHERE statut = 'payee' AND montant > 100;",
    desc: "Filtre les lignes AVANT tout regroupement. Combine les conditions avec AND / OR / NOT, et pense aux parenthèses dès que tu mélanges les deux.",
    doc: 'https://sql.sh/cours/where',
  },
  like: {
    name: 'LIKE (motifs)',
    syntax: "WHERE horodatage LIKE '2026-06-15%'  -- commence par…\nWHERE email LIKE '%@gmail.com'      -- finit par…",
    desc: "Comparaison par motif : % remplace n'importe quelle suite de caractères, _ un seul. Très pratique sur des dates stockées en texte (SQLite) pour cibler un jour entier. Attention : un % en DÉBUT de motif empêche l'usage d'un index.",
    doc: 'https://sql.sh/cours/where/like',
  },
  between: {
    name: 'BETWEEN',
    syntax: "WHERE montant BETWEEN 9000 AND 9999.99\nWHERE horodatage BETWEEN '2026-06-15 21:40' AND '2026-06-15 22:10'",
    desc: "Teste l'appartenance à un intervalle, bornes INCLUSES (équivaut à >= AND <=). Fonctionne sur les nombres, les dates et le texte. Idéal pour les fenêtres temporelles d'une enquête.",
    doc: 'https://sql.sh/cours/where/between',
  },
  join: {
    name: 'INNER JOIN',
    syntax: 'SELECT e.nom, b.horodatage\nFROM acces_badges b\nJOIN employes e ON e.id = b.employe_id;',
    desc: "Croise deux tables sur une condition et ne garde que les lignes qui matchent DES DEUX côtés. La condition du ON n'est pas limitée à l'égalité : tu peux joindre sur un intervalle (ON l.date < t.date AND ...).",
    doc: 'https://sql.sh/cours/jointures',
  },
  leftjoin: {
    name: 'LEFT JOIN',
    syntax: 'SELECT a.*, p.id AS planning\nFROM acces_badges a\nLEFT JOIN plannings p ON p.employe_id = a.employe_id;',
    desc: "Garde TOUTES les lignes de la table de gauche ; celles sans correspondance reçoivent des NULL. Piège : filtrer la table de droite dans le WHERE retransforme le LEFT JOIN en INNER JOIN — mets la condition dans le ON.",
    doc: 'https://sql.sh/cours/jointures',
  },
  antijointure: {
    name: 'Anti-jointure (NOT EXISTS / IS NULL)',
    syntax: "SELECT e.nom FROM employes e\nWHERE NOT EXISTS (\n  SELECT 1 FROM plannings p\n  WHERE p.employe_id = e.id AND p.jour = '2026-06-15'\n);",
    desc: "Trouver les lignes SANS correspondance : soit NOT EXISTS avec une sous-requête corrélée, soit LEFT JOIN … WHERE droite.id IS NULL. C'est LE motif pour « qui n'était PAS censé être là ».",
    doc: 'https://sql.sh/cours/exists',
  },
  groupby: {
    name: 'GROUP BY',
    syntax: 'SELECT compte_dest, COUNT(*) AS nb, SUM(montant) AS total\nFROM transactions\nGROUP BY compte_dest;',
    desc: "Regroupe les lignes partageant une valeur pour leur appliquer des agrégats (COUNT, SUM, AVG…). Toute colonne du SELECT doit être soit agrégée, soit dans le GROUP BY.",
    doc: 'https://sql.sh/cours/group-by',
  },
  having: {
    name: 'HAVING',
    syntax: 'SELECT compte_dest, COUNT(*) AS nb\nFROM transactions\nGROUP BY compte_dest\nHAVING COUNT(*) >= 3;',
    desc: "Filtre APRÈS le regroupement, sur les valeurs agrégées — là où WHERE filtre avant. « Les destinataires ayant reçu au moins 3 virements » = HAVING COUNT(*) >= 3.",
    doc: 'https://sql.sh/cours/having',
  },
  distinct: {
    name: 'DISTINCT',
    syntax: 'SELECT COUNT(DISTINCT compte_source) FROM transactions WHERE compte_dest = 707;',
    desc: "Élimine les doublons. COUNT(DISTINCT col) compte les valeurs différentes — indispensable quand une même personne apparaît plusieurs fois dans les logs.",
    doc: 'https://sql.sh/cours/distinct',
  },
  agregats: {
    name: 'Agrégats (COUNT, SUM, AVG, MIN, MAX)',
    syntax: 'SELECT COUNT(*), SUM(montant), AVG(duree_sec), MIN(debut), MAX(fin) FROM ...;',
    desc: "Réduisent un ensemble de lignes à une valeur. COUNT(*) compte les lignes, COUNT(col) ignore les NULL. Combinés à GROUP BY, ils donnent des statistiques par groupe.",
    doc: 'https://sql.sh/fonctions/agregation',
  },
  orderby: {
    name: 'ORDER BY … LIMIT',
    syntax: 'SELECT morceau_id, COUNT(*) AS nb\nFROM ecoutes GROUP BY morceau_id\nORDER BY nb DESC LIMIT 5;',
    desc: "Trie le résultat (ASC par défaut, DESC pour décroissant) ; LIMIT n ne garde que les n premières lignes. Le combo classique pour « le top N » ou « la valeur la plus anormale ».",
    doc: 'https://sql.sh/cours/order-by',
  },
  sousrequete: {
    name: 'Sous-requêtes / IN',
    syntax: 'SELECT * FROM comptes\nWHERE id IN (SELECT compte_source FROM transactions WHERE compte_dest = 707);',
    desc: "Une requête imbriquée utilisable dans WHERE (IN, EXISTS, comparaison), FROM (table dérivée) ou SELECT (scalaire). Permet de réutiliser le résultat d'une étape dans la suivante.",
    doc: 'https://sql.sh/cours/sous-requete',
  },
  dates: {
    name: 'Fonctions de dates SQLite',
    syntax: "datetime(t.horodatage, '-2 hours')          -- décaler un timestamp\n(julianday(fin) - julianday(debut)) * 24 * 60 -- durée en minutes",
    desc: "SQLite stocke les dates en texte ISO (triables telles quelles). datetime() applique des modificateurs ('+1 day', '-2 hours'…), julianday() convertit en jours décimaux — parfait pour calculer des durées.",
    doc: 'https://www.sqlite.org/lang_datefunc.html',
  },
  recursive: {
    name: 'CTE récursive (WITH RECURSIVE)',
    syntax: "WITH RECURSIVE sub AS (\n  SELECT id, nom FROM employes WHERE manager_id = 2   -- ancre\n  UNION ALL\n  SELECT e.id, e.nom FROM employes e JOIN sub ON e.manager_id = sub.id\n)\nSELECT * FROM sub;",
    desc: "Parcourt une structure hiérarchique (organigramme, catégories) niveau par niveau : l'ancre initialise, la partie récursive se joint au résultat précédent jusqu'à épuisement. Le sens de la jointure décide si tu montes ou descends l'arbre.",
    doc: 'https://www.sqlite.org/lang_with.html',
  },
  window: {
    name: 'Fonctions fenêtres (OVER)',
    syntax: 'SELECT nom, salaire,\n  RANK() OVER (PARTITION BY dept ORDER BY salaire DESC) AS rang\nFROM employes;',
    desc: "Calculent une valeur par ligne en « regardant » les lignes voisines, SANS réduire le résultat (contrairement à GROUP BY). PARTITION BY découpe en groupes, ORDER BY ordonne dans la fenêtre.",
    doc: 'https://www.sqlite.org/windowfunctions.html',
  },
  lag: {
    name: 'LAG / LEAD',
    syntax: "SELECT cabine, horodatage,\n  LAG(horodatage) OVER (PARTITION BY cabine ORDER BY horodatage) AS evt_precedent\nFROM capteurs_portes;",
    desc: "LAG lit la valeur de la ligne PRÉCÉDENTE dans la fenêtre (LEAD : la suivante). Combiné à julianday(), c'est l'outil parfait pour mesurer le délai entre deux événements consécutifs d'un même log.",
    doc: 'https://www.sqlite.org/windowfunctions.html#built_in_window_functions',
  },
}

export function conceptsFor(step) {
  return (step.concepts || []).map((id) => SQL_CONCEPTS[id]).filter(Boolean)
}
