export default {
  id: 'streamfest',
  emoji: '🎧',
  title: 'Streams fantômes sur ZikCloud',
  level: 'Avancé',
  skills: 'GROUP BY / HAVING, BETWEEN, sous-requêtes, agrégats comparés',
  story: `**Service financier de ZikCloud, 16 juin 2026.** La plateforme de streaming rémunère les artistes **0,004 € par écoute d'au moins 30 secondes**. En bouclant les royalties de juin, la comptabilité tombe de sa chaise : un artiste jusqu'ici confidentiel explose tous les compteurs.

Le soupçon : une **ferme de faux comptes** qui « écoute » un morceau juste assez longtemps pour déclencher le paiement, puis passe au suivant. Reste à le prouver, chiffres à l'appui.

Tables : \`artistes\`, \`morceaux\`, \`comptes\`, \`ecoutes\`, \`paiements_royalties\`. Suivez l'argent, pas la musique.`,
  setupSql: `
CREATE TABLE artistes (id INTEGER PRIMARY KEY, nom TEXT, label TEXT, manager TEXT);
INSERT INTO artistes VALUES
 (1,'Nova Léon','Indigo Records','Sarah Lin'),
 (2,'Les Fauves','Barclay','Marc Odoul'),
 (3,'Mira Sol','Sony','Julia Perez'),
 (4,'DJ Kwartz','Indé','—'),
 (5,'Orage','Universal','Tom Berger'),
 (6,'Capitaine Écho','Indé','—'),
 (7,'Lil Vortex','Autoprod','Kévin Brice');

CREATE TABLE morceaux (id INTEGER PRIMARY KEY, artiste_id INTEGER, titre TEXT, duree_sec INTEGER);
INSERT INTO morceaux VALUES
 (50,1,'Aurore',198),
 (51,2,'Sauvage',242),
 (52,3,'Luz',187),
 (53,4,'Bassline 404',210),
 (54,5,'Tempête',225),
 (55,7,'Nuit Néon',201),
 (56,6,'Sonar',233),
 (57,7,'Vortex Anthem',195);

CREATE TABLE comptes (id INTEGER PRIMARY KEY, pseudo TEXT, email TEXT, date_creation TEXT, ip_inscription TEXT);
INSERT INTO comptes VALUES
 (1,'melodie_bx','melodie.bx@mail.fr','2023-04-12','92.140.12.34'),
 (2,'karim.dz','karim.dz@mail.fr','2022-11-03','78.201.44.18'),
 (3,'lucie_pop','lucie.pop@mail.fr','2024-02-27','92.140.88.21'),
 (4,'tonton_rock','tonton.rock@mail.fr','2021-08-15','88.162.30.77'),
 (5,'ninon_lofi','ninon.lofi@mail.fr','2024-09-30','92.154.61.90'),
 (6,'seb_metal','seb.metal@mail.fr','2023-01-19','78.245.10.05'),
 (7,'ava_beats','ava.beats@mail.fr','2025-03-08','88.170.52.44'),
 (8,'leo_jazz','leo.jazz@mail.fr','2022-06-21','92.148.77.13'),
 (9,'zoe_indie','zoe.indie@mail.fr','2025-11-11','78.220.91.60'),
 (10,'max_dnb','max.dnb@mail.fr','2024-05-06','88.165.14.28'),
 (11,'flore_soul','flore.soul@mail.fr','2023-10-02','92.142.36.55'),
 (12,'yanis_rap','yanis.rap@mail.fr','2025-07-14','78.230.68.42'),
 (201,'nuitneon_fan01','fan01@boostplay.ru','2026-06-01','185.220.101.41'),
 (202,'nuitneon_fan02','fan02@boostplay.ru','2026-06-01','185.220.101.42'),
 (203,'vortexlover_03','fan03@boostplay.ru','2026-06-01','185.220.101.43'),
 (204,'neonfan_04','fan04@boostplay.ru','2026-06-01','185.220.101.44'),
 (205,'vortex_army05','fan05@boostplay.ru','2026-06-01','185.220.101.45'),
 (206,'neon_addict06','fan06@boostplay.ru','2026-06-01','185.220.101.46');

CREATE TABLE ecoutes (id INTEGER PRIMARY KEY, compte_id INTEGER, morceau_id INTEGER, duree_sec INTEGER, horodatage TEXT, appareil TEXT);
INSERT INTO ecoutes VALUES
 (1,1,50,198,'2026-06-01 08:15','iOS'),
 (2,2,51,242,'2026-06-01 12:40','Android'),
 (3,3,52,120,'2026-06-01 18:22','Web'),
 (4,4,51,242,'2026-06-02 09:05','Android'),
 (5,5,54,225,'2026-06-02 14:30','iOS'),
 (6,1,50,150,'2026-06-02 20:11','iOS'),
 (7,6,53,210,'2026-06-03 07:45','Web'),
 (8,7,55,201,'2026-06-03 16:20','iOS'),
 (9,201,55,31,'2026-06-05 02:10','Android 4.4'),
 (10,202,55,32,'2026-06-05 02:11','Android 4.4'),
 (11,203,55,31,'2026-06-05 02:12','Android 4.4'),
 (12,8,56,233,'2026-06-05 11:00','Web'),
 (13,204,55,33,'2026-06-05 02:13','Android 4.4'),
 (14,205,55,31,'2026-06-05 02:14','Android 4.4'),
 (15,206,55,32,'2026-06-05 02:15','Android 4.4'),
 (16,9,52,187,'2026-06-06 19:34','iOS'),
 (17,10,53,95,'2026-06-07 08:50','Android'),
 (18,201,55,32,'2026-06-08 03:05','Android 4.4'),
 (19,202,55,31,'2026-06-08 03:06','Android 4.4'),
 (20,203,55,33,'2026-06-08 03:07','Android 4.4'),
 (21,204,55,31,'2026-06-08 03:08','Android 4.4'),
 (22,205,55,32,'2026-06-08 03:09','Android 4.4'),
 (23,206,55,31,'2026-06-08 03:10','Android 4.4'),
 (24,11,54,225,'2026-06-08 17:42','Web'),
 (25,12,57,195,'2026-06-09 21:15','Android'),
 (26,2,51,242,'2026-06-10 13:08','Android'),
 (27,201,55,31,'2026-06-12 02:40','Android 4.4'),
 (28,202,55,33,'2026-06-12 02:41','Android 4.4'),
 (29,203,55,31,'2026-06-12 02:42','Android 4.4'),
 (30,204,55,32,'2026-06-12 02:43','Android 4.4'),
 (31,205,55,31,'2026-06-12 02:44','Android 4.4'),
 (32,206,55,33,'2026-06-12 02:45','Android 4.4'),
 (33,3,55,180,'2026-06-12 19:30','Web'),
 (34,4,50,198,'2026-06-13 10:25','Android'),
 (35,5,56,233,'2026-06-13 15:55','iOS'),
 (36,1,55,195,'2026-06-14 09:12','iOS'),
 (37,6,51,60,'2026-06-14 12:33','Web'),
 (38,7,54,225,'2026-06-14 22:08','iOS'),
 (39,8,50,198,'2026-06-15 08:47','Web'),
 (40,9,57,195,'2026-06-15 20:19','iOS');

CREATE TABLE paiements_royalties (id INTEGER PRIMARY KEY, artiste_id INTEGER, mois TEXT, montant REAL);
INSERT INTO paiements_royalties VALUES
 (1,1,'2026-05',1240.00),
 (2,1,'2026-06',1310.00),
 (3,2,'2026-05',2210.00),
 (4,2,'2026-06',2150.00),
 (5,3,'2026-05',890.00),
 (6,3,'2026-06',940.00),
 (7,5,'2026-05',1875.00),
 (8,5,'2026-06',1930.00),
 (9,7,'2026-05',310.00),
 (10,7,'2026-06',4820.00);
`,
  steps: [
    {
      question:
        "Commencez par la vue d'ensemble : quel morceau (donnez son id) totalise un nombre d'écoutes anormalement élevé en juin ?",
      placeholder: 'id du morceau',
      answer: ['55'],
      mode: 'exact',
      concepts: ['groupby', 'agregats', 'orderby'],
      hints: [
        "Compte les écoutes par morceau_id dans la table `ecoutes`.",
        'GROUP BY morceau_id, puis trie par COUNT(*) décroissant pour faire remonter l\'anomalie.',
        'SELECT morceau_id, COUNT(*) AS nb FROM ecoutes GROUP BY morceau_id ORDER BY nb DESC',
      ],
      explain:
        "Le morceau **55** (« Nuit Néon » de Lil Vortex) cumule 21 écoutes quand aucun autre ne dépasse 4. Un hit peut exploser, bien sûr… mais regardons la QUALITÉ de ces écoutes avant de féliciter l'artiste.",
      solutionQuery:
        'SELECT e.morceau_id, m.titre, COUNT(*) AS nb_ecoutes FROM ecoutes e JOIN morceaux m ON m.id = e.morceau_id GROUP BY e.morceau_id ORDER BY nb_ecoutes DESC;',
    },
    {
      question:
        "La plateforme paie à partir de 30 secondes d'écoute. Combien d'écoutes du morceau 55 durent entre 30 et 35 secondes — pile de quoi déclencher le paiement ?",
      placeholder: 'un nombre',
      answer: ['18'],
      mode: 'exact',
      concepts: ['between', 'agregats', 'where'],
      hints: [
        'Filtre `ecoutes` sur le morceau 55 ET sur la colonne duree_sec.',
        "BETWEEN 30 AND 35 inclut les deux bornes — exactement l'intervalle « juste au-dessus du seuil ».",
        'SELECT COUNT(*) FROM ecoutes WHERE morceau_id = 55 AND duree_sec BETWEEN 30 AND 35',
      ],
      explain:
        "**18 écoutes sur 21** durent entre 31 et 33 secondes, toutes entre 2h et 4h du matin, toutes depuis un antique « Android 4.4 » (l'OS favori des fermes d'émulateurs). Les 3 écoutes restantes sont de vrais auditeurs. Un morceau qu'on aime, on ne le coupe pas à la 31e seconde, 18 fois.",
      solutionQuery:
        "SELECT duree_sec, horodatage, appareil FROM ecoutes WHERE morceau_id = 55 AND duree_sec BETWEEN 30 AND 35 ORDER BY horodatage;",
    },
    {
      question:
        "Ces écoutes calibrées proviennent de combien de comptes DISTINCTS ? (au passage, jetez un œil à leur date de création et à leur IP d'inscription…)",
      placeholder: 'un nombre',
      answer: ['6'],
      mode: 'exact',
      concepts: ['distinct', 'sousrequete', 'join'],
      hints: [
        'Repars des écoutes suspectes (morceau 55, durée 30-35 s) et compte les compte_id distincts.',
        "Pour le portrait-robot des comptes : joins `comptes` ou utilise IN (sous-requête) et regarde date_creation / ip_inscription / email.",
        "SELECT COUNT(DISTINCT compte_id) FROM ecoutes WHERE morceau_id = 55 AND duree_sec BETWEEN 30 AND 35",
      ],
      explain:
        "**6 comptes**, tous créés le **1er juin 2026**, tous inscrits depuis la plage **185.220.101.4x**, tous avec un email en **@boostplay.ru**. Une portée de bots née le même jour dans le même sous-réseau : la ferme de clics est démasquée. Reste à chiffrer le préjudice et à trouver le commanditaire.",
      solutionQuery:
        "SELECT c.id, c.pseudo, c.email, c.date_creation, c.ip_inscription FROM comptes c WHERE c.id IN (SELECT DISTINCT compte_id FROM ecoutes WHERE morceau_id = 55 AND duree_sec BETWEEN 30 AND 35);",
    },
    {
      question:
        "Chiffrons la fraude : de combien d'euros les royalties de l'artiste du morceau 55 ont-elles augmenté entre mai et juin 2026 ?",
      placeholder: 'ex : 1200',
      answer: ['4510', '4 510', '4510€', '4510.00'],
      mode: 'exact',
      concepts: ['sousrequete', 'agregats'],
      hints: [
        "La table `paiements_royalties` contient un montant par artiste et par mois ('2026-05', '2026-06').",
        "Deux sous-requêtes scalaires (juin moins mai), ou une auto-jointure de la table sur artiste_id avec deux alias.",
        "SELECT (SELECT montant FROM paiements_royalties WHERE artiste_id = 7 AND mois = '2026-06') - (SELECT montant FROM paiements_royalties WHERE artiste_id = 7 AND mois = '2026-05')",
      ],
      explain:
        "**+ 4 510 €** en un mois (310 € → 4 820 €), soit ×15,5, quand les artistes honnêtes évoluent de ±5 %. À 0,004 € l'écoute, un tel bond suppose un volume industriel de streams — nos 18 écoutes ne sont que l'échantillon visible du mois.",
      solutionQuery:
        "SELECT juin.artiste_id, juin.montant - mai.montant AS hausse FROM paiements_royalties mai JOIN paiements_royalties juin ON juin.artiste_id = mai.artiste_id AND mai.mois = '2026-05' AND juin.mois = '2026-06' ORDER BY hausse DESC;",
    },
    {
      question:
        "Assemblez le dossier : **quel artiste bénéficie de la fraude ?** (la commission anti-fraude veut un nom de scène)",
      placeholder: "Nom d'artiste",
      answer: ['vortex', 'lil vortex'],
      mode: 'contains',
      final: true,
      concepts: ['join'],
      hints: [
        'Le morceau 55 appartient à quel artiste_id ? Joins `morceaux` et `artistes`.',
        "Vérifie que tout converge : le morceau boosté, la hausse de royalties, et même les pseudos des comptes bots.",
        'SELECT a.nom, a.manager FROM morceaux m JOIN artistes a ON a.id = m.artiste_id WHERE m.id = 55',
      ],
      explain:
        "**Lil Vortex** (artiste 7). Le faisceau est accablant : son morceau concentre les écoutes calibrées, ses royalties font ×15, et les bots s'appellent « nuitneon_fan » et « vortex_army ». L'enquête interne révélera que son manager, Kévin Brice, a acheté le « pack visibilité » d'une ferme de clics moldave.",
      solutionQuery:
        "SELECT a.id, a.nom, a.manager, m.titre FROM artistes a JOIN morceaux m ON m.artiste_id = a.id WHERE m.id = 55;",
    },
  ],
  conclusion:
    "🎉 Fraude au streaming démontrée ! ZikCloud annule les royalties de juin de Lil Vortex et porte plainte contre son manager. Compétences travaillées : détection d'anomalie par GROUP BY/ORDER BY, caractérisation d'un motif avec BETWEEN, portrait-robot par sous-requête IN, et comparaison de périodes par auto-jointure — le quotidien d'un analyste anti-fraude.",
}
