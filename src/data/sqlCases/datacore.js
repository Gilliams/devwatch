export default {
  id: 'datacore',
  emoji: '💥',
  title: 'Sabotage chez DataCore',
  level: 'Expert',
  skills: 'CTE récursives, jointures temporelles, fenêtres, analyse de logs',
  story: `**20 juin 2026, 02h13.** Un déploiement nocturne pousse en production un commit contenant une porte dérobée qui exfiltre la base clients de DataCore. L'alerte tombe à 06h30.

Le commit incriminé est signé **Emma Diallo**, développeuse backend. Elle jure que ce n'est pas elle — elle était en congé. Les signatures Git se falsifient facilement... mais pas les logs réseau.

L'équipe sécurité a une conviction : le saboteur est un insider de la branche **Infrastructure** (celle de Rachid Benkacem), la seule à connaître la fenêtre de déploiement automatique. Tables : \`employes\` (avec hiérarchie \`manager_id\`), \`commits\`, \`deployments\`, \`acces_repo\`, \`sessions_vpn\`, \`badges_bureau\`. Innocentez Emma et démasquez le coupable.`,
  setupSql: `
CREATE TABLE employes (id INTEGER PRIMARY KEY, nom TEXT, equipe TEXT, manager_id INTEGER);
INSERT INTO employes VALUES
 (1,'Marie Lefort','Direction',NULL),
 (2,'Rachid Benkacem','Infrastructure',1),
 (3,'Clara Nguyen','Produit',1),
 (4,'Sam Ortega','DevOps',2),
 (5,'Julien Roy','DBA',4),
 (6,'Aïcha Diop','SRE',4),
 (7,'Karl Janssen','Sécurité',2),
 (8,'Emma Diallo','Backend',9),
 (9,'Louis Perrin','Backend',3),
 (10,'Sofia Rossi','Frontend',9),
 (11,'Nino Costa','DevOps',4),
 (12,'Léna Marchal','Backend',9),
 (13,'Hana Sato','Data',3),
 (14,'Pierre Blanc','Frontend',9);

CREATE TABLE commits (id INTEGER PRIMARY KEY, hash TEXT, auteur_declare INTEGER, message TEXT, horodatage TEXT);
INSERT INTO commits VALUES
 (1,'b7e21a90',8,'fix: validation des IBAN','2026-06-18 11:32'),
 (2,'8d4f11c2',12,'feat: export CSV des factures','2026-06-18 15:47'),
 (3,'2a9c33ef',10,'style: refonte page profil','2026-06-19 09:21'),
 (4,'77b0d4a1',9,'refactor: service de facturation','2026-06-19 14:05'),
 (5,'e1c88f02',13,'feat: pipeline anonymisation RGPD','2026-06-19 16:38'),
 (6,'f4c3d00d',8,'chore: mise a jour dependances','2026-06-20 02:11'),
 (7,'91ab5c77',12,'fix: fuseau horaire des exports','2026-06-20 10:02'),
 (8,'c5e9021b',9,'test: couverture facturation','2026-06-20 11:30');

CREATE TABLE deployments (id INTEGER PRIMARY KEY, commit_id INTEGER, environnement TEXT, horodatage TEXT, declenche_par TEXT);
INSERT INTO deployments VALUES
 (1,1,'staging','2026-06-18 12:00','ci-bot'),
 (2,1,'production','2026-06-18 18:00','ci-bot'),
 (3,2,'staging','2026-06-18 16:10','ci-bot'),
 (4,4,'staging','2026-06-19 14:30','ci-bot'),
 (5,5,'staging','2026-06-19 17:00','ci-bot'),
 (6,6,'production','2026-06-20 02:13','ci-bot'),
 (7,7,'staging','2026-06-20 10:15','ci-bot'),
 (8,4,'production','2026-06-20 18:00','ci-bot');

CREATE TABLE acces_repo (id INTEGER PRIMARY KEY, employe_id INTEGER, ip TEXT, action TEXT, horodatage TEXT);
INSERT INTO acces_repo VALUES
 (1,8,'10.8.2.15','push','2026-06-18 11:32'),
 (2,12,'10.8.2.31','push','2026-06-18 15:47'),
 (3,10,'10.8.3.77','pull','2026-06-11 09:41'),
 (4,10,'10.8.2.44','push','2026-06-19 09:21'),
 (5,9,'10.8.2.20','push','2026-06-19 14:05'),
 (6,13,'10.8.2.52','push','2026-06-19 16:38'),
 (7,5,'10.8.3.12','pull','2026-06-19 17:22'),
 (8,8,'10.8.3.77','push','2026-06-20 02:11'),
 (9,12,'10.8.2.31','push','2026-06-20 10:02'),
 (10,9,'10.8.2.20','push','2026-06-20 11:30'),
 (11,6,'10.8.3.09','pull','2026-06-20 08:15');

CREATE TABLE sessions_vpn (id INTEGER PRIMARY KEY, employe_id INTEGER, ip TEXT, debut TEXT, fin TEXT);
INSERT INTO sessions_vpn VALUES
 (1,10,'10.8.3.77','2026-06-11 08:55','2026-06-11 17:10'),
 (2,8,'10.8.2.15','2026-06-18 08:50','2026-06-18 17:40'),
 (3,12,'10.8.2.31','2026-06-18 09:02','2026-06-18 18:11'),
 (4,5,'10.8.3.12','2026-06-19 08:45','2026-06-19 18:30'),
 (5,8,'10.8.2.15','2026-06-19 08:55','2026-06-19 17:55'),
 (6,13,'10.8.2.52','2026-06-19 09:10','2026-06-19 17:20'),
 (7,7,'10.8.3.77','2026-06-16 19:58','2026-06-16 22:04'),
 (8,12,'10.8.2.31','2026-06-20 08:40','2026-06-20 17:50'),
 (9,5,'10.8.3.77','2026-06-20 01:30','2026-06-20 03:05'),
 (10,9,'10.8.2.20','2026-06-20 08:30','2026-06-20 18:00'),
 (11,6,'10.8.3.09','2026-06-20 07:55','2026-06-20 16:45'),
 (12,4,'10.8.3.40','2026-06-20 09:00','2026-06-20 17:30');

CREATE TABLE badges_bureau (id INTEGER PRIMARY KEY, employe_id INTEGER, horodatage TEXT, sens TEXT);
INSERT INTO badges_bureau VALUES
 (1,8,'2026-06-19 08:40','entree'),
 (2,8,'2026-06-19 18:02','sortie'),
 (3,9,'2026-06-19 08:35','entree'),
 (4,9,'2026-06-19 18:20','sortie'),
 (5,5,'2026-06-19 08:30','entree'),
 (6,5,'2026-06-19 18:45','sortie'),
 (7,9,'2026-06-20 08:25','entree'),
 (8,12,'2026-06-20 08:32','entree'),
 (9,6,'2026-06-20 07:50','entree'),
 (10,4,'2026-06-20 08:55','entree'),
 (11,9,'2026-06-20 18:05','sortie'),
 (12,12,'2026-06-20 17:55','sortie');
`,
  steps: [
    {
      question:
        "Identifiez le commit déployé en production à 02h13 le 20 juin. Quel est son hash ?",
      placeholder: 'ex : a1b2c3d4',
      answer: ['f4c3d00d'],
      mode: 'exact',
      concepts: ['join', 'where'],
      hints: [
        "La table `deployments` relie un `commit_id` à un environnement et un horodatage.",
        "Joins deployments et commits, filtre sur environnement = 'production' et l'horodatage de la nuit du 20.",
        "SELECT c.hash FROM deployments d JOIN commits c ON c.id = d.commit_id WHERE d.environnement = 'production' AND d.horodatage LIKE '2026-06-20 02%'",
      ],
      explain:
        "Le commit **f4c3d00d** (« chore: mise a jour dependances » — un message volontairement anodin), poussé à 02h11 et auto-déployé à 02h13 par le bot CI. Auteur déclaré : Emma Diallo (id 8).",
      solutionQuery:
        "SELECT c.hash, c.message, e.nom AS auteur_declare, c.horodatage FROM deployments d JOIN commits c ON c.id = d.commit_id JOIN employes e ON e.id = c.auteur_declare WHERE d.environnement = 'production' AND d.horodatage = '2026-06-20 02:13';",
    },
    {
      question:
        "Emma est-elle crédible quand elle clame son innocence ? Trouvez l'adresse IP depuis laquelle le push de 02h11 a été effectué.",
      placeholder: 'ex : 10.8.0.0',
      answer: ['10.8.3.77'],
      mode: 'exact',
      concepts: ['sousrequete', 'where', 'join'],
      hints: [
        "La table `acces_repo` journalise chaque push avec son IP. Le compte utilisé peut être volé, l'IP réseau non.",
        "Compare avec l'IP habituelle d'Emma (ses pushes précédents) et vérifie ses sessions VPN et badges du 19-20 juin.",
        "SELECT * FROM acces_repo WHERE action = 'push' AND horodatage = '2026-06-20 02:11'",
      ],
      explain:
        "Le push vient de **10.8.3.77**. Or Emma pousse toujours depuis 10.8.2.15, sa dernière session VPN s'est terminée le 19 à 17h55, elle a badgé en sortie à 18h02 et n'a AUCUNE session ni badge le 20. Quelqu'un a utilisé ses identifiants Git depuis une autre machine. Emma est blanchie.",
      solutionQuery:
        "SELECT r.ip, r.horodatage, (SELECT MAX(fin) FROM sessions_vpn v WHERE v.employe_id = 8) AS derniere_session_emma, (SELECT MAX(horodatage) FROM badges_bureau b WHERE b.employe_id = 8) AS dernier_badge_emma FROM acces_repo r WHERE r.action = 'push' AND r.horodatage = '2026-06-20 02:11';",
    },
    {
      question:
        "Attention au piège : les IP VPN sont attribuées dynamiquement (DHCP). Combien d'employés DISTINCTS ont utilisé l'IP 10.8.3.77 en juin ?",
      placeholder: 'un nombre',
      answer: ['3'],
      mode: 'exact',
      concepts: ['distinct', 'agregats'],
      hints: [
        'Cherche dans `sessions_vpn` toutes les sessions avec cette IP.',
        "COUNT(DISTINCT employe_id) — et retiens la leçon : une IP seule ne suffit JAMAIS à identifier quelqu'un.",
        "SELECT COUNT(DISTINCT employe_id) FROM sessions_vpn WHERE ip = '10.8.3.77'",
      ],
      explain:
        "**Trois** employés ont eu cette IP en juin : Sofia Rossi (le 11), Karl Janssen (le 16) et Julien Roy (le 20). Une requête naïve `WHERE ip = '10.8.3.77'` accuserait trois personnes. Il faut croiser l'IP **et** la fenêtre temporelle exacte du push.",
      solutionQuery:
        "SELECT e.nom, v.debut, v.fin FROM sessions_vpn v JOIN employes e ON e.id = v.employe_id WHERE v.ip = '10.8.3.77' ORDER BY v.debut;",
    },
    {
      question:
        "La sécurité soupçonne la branche Infrastructure. Avec une **CTE récursive**, comptez les employés sous la responsabilité directe ou indirecte de Rachid Benkacem (lui exclu).",
      placeholder: 'un nombre',
      answer: ['5'],
      mode: 'exact',
      concepts: ['recursive'],
      hints: [
        'Structure : WITH RECURSIVE subordonnes AS (ancre UNION ALL partie récursive) — l\'ancre sélectionne ceux dont manager_id = 2.',
        "La partie récursive joint employes e ON e.manager_id = subordonnes.id pour descendre d'un niveau à chaque itération.",
        'WITH RECURSIVE sub AS (SELECT id, nom FROM employes WHERE manager_id = 2 UNION ALL SELECT e.id, e.nom FROM employes e JOIN sub ON e.manager_id = sub.id) SELECT COUNT(*) FROM sub',
      ],
      explain:
        "**5 employés** dans la branche Infra : Sam Ortega et Karl Janssen (directs), puis Julien Roy, Aïcha Diop et Nino Costa (sous Sam). La CTE récursive descend l'arbre niveau par niveau — c'est LE motif à maîtriser pour les hiérarchies (organigrammes, catégories, arborescences).",
      solutionQuery:
        'WITH RECURSIVE sub AS (SELECT id, nom, equipe FROM employes WHERE manager_id = 2 UNION ALL SELECT e.id, e.nom, e.equipe FROM employes e JOIN sub ON e.manager_id = sub.id) SELECT * FROM sub;',
    },
    {
      question:
        "Dernière étape : qui, parmi ces suspects, était connecté au VPN avec l'IP 10.8.3.77 **au moment précis du push** (02h11) ? **Nommez le saboteur.**",
      placeholder: 'Prénom Nom',
      answer: ['julien roy', 'roy'],
      mode: 'contains',
      final: true,
      concepts: ['recursive', 'join', 'between'],
      hints: [
        "Il faut une condition d'intervalle : debut <= '2026-06-20 02:11' AND fin >= '2026-06-20 02:11', en plus de l'IP.",
        'Croise ce résultat avec la liste des subordonnés de Rachid (étape précédente) : un seul nom apparaît dans les deux.',
        "SELECT e.nom FROM sessions_vpn v JOIN employes e ON e.id = v.employe_id WHERE v.ip = '10.8.3.77' AND v.debut <= '2026-06-20 02:11' AND v.fin >= '2026-06-20 02:11'",
      ],
      explain:
        "**Julien Roy**, le DBA. Session VPN de 01h30 à 03h05 avec l'IP 10.8.3.77, couvrant précisément le push de 02h11 — et il appartient bien à la branche Infra qui connaissait la fenêtre de déploiement automatique. Il avait « emprunté » les identifiants Git d'Emma pour signer le commit à sa place. Sofia et Karl, les deux autres porteurs de l'IP, n'étaient pas connectés cette nuit-là.",
      solutionQuery:
        "WITH RECURSIVE sub AS (SELECT id, nom FROM employes WHERE manager_id = 2 UNION ALL SELECT e.id, e.nom FROM employes e JOIN sub ON e.manager_id = sub.id) SELECT e.nom, v.debut, v.fin FROM sessions_vpn v JOIN employes e ON e.id = v.employe_id JOIN sub s ON s.id = e.id WHERE v.ip = '10.8.3.77' AND v.debut <= '2026-06-20 02:11' AND v.fin >= '2026-06-20 02:11';",
    },
  ],
  conclusion:
    "🎉 Sabotage élucidé ! Julien Roy, passé over pour une promotion, voulait faire accuser l'équipe Backend. Compétences travaillées : CTE récursives sur hiérarchie, jointures sur intervalles temporels, méfiance envers les identifiants réutilisés (IP dynamiques) et raisonnement par élimination croisée — exactement ce qu'on attend d'un niveau expert en analyse de données.",
}
