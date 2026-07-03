export default {
  id: 'galerie',
  emoji: '🖼️',
  title: 'Le vol de la Galerie Vermeille',
  level: 'Intermédiaire',
  skills: 'Jointures, filtres temporels, sous-requêtes',
  story: `**15 juin 2026, 22h15.** Le gardien Marc Dubois découvre que « La Jeune Fille au Prisme », joyau de la Galerie Vermeille, a disparu de la salle 3 (le Cabinet des Merveilles).

La police scientifique a établi que le tableau était encore en place à 21h30. Le système de badges a tout enregistré, et — coïncidence troublante — la caméra de la salle 3 est tombée en panne pendant la soirée.

Vous avez accès aux tables : \`employes\`, \`salles\`, \`acces_badges\`, \`plannings\`, \`pannes_cameras\` et \`temoignages\`. À vous de trouver le voleur, requête après requête.`,
  setupSql: `
CREATE TABLE employes (id INTEGER PRIMARY KEY, nom TEXT, poste TEXT);
INSERT INTO employes VALUES
 (1,'Claire Fontaine','Gardienne'),
 (2,'Marc Dubois','Gardien'),
 (3,'Sophie Renard','Agent d''entretien'),
 (4,'Lucas Moreau','Restaurateur d''art'),
 (5,'Emma Petit','Conférencière'),
 (6,'Hugo Lambert','Régisseur'),
 (7,'Léa Girard','Directrice'),
 (8,'Antoine Roche','Électricien'),
 (9,'Nadia Benali','Agent d''accueil'),
 (10,'Paul Vasseur','Gardien');

CREATE TABLE salles (id INTEGER PRIMARY KEY, nom TEXT);
INSERT INTO salles VALUES
 (1,'Hall d''entrée'),
 (2,'Salle 2 - Impressionnistes'),
 (3,'Salle 3 - Cabinet des Merveilles'),
 (4,'Réserve'),
 (5,'Sortie de service');

CREATE TABLE pannes_cameras (id INTEGER PRIMARY KEY, salle_id INTEGER, debut TEXT, fin TEXT);
INSERT INTO pannes_cameras VALUES
 (1,2,'2026-06-14 10:02','2026-06-14 10:21'),
 (2,1,'2026-06-15 03:00','2026-06-15 03:06'),
 (3,3,'2026-06-15 21:40','2026-06-15 22:10');

CREATE TABLE plannings (id INTEGER PRIMARY KEY, employe_id INTEGER, jour TEXT, heure_debut TEXT, heure_fin TEXT);
INSERT INTO plannings VALUES
 (1,1,'2026-06-15','18:00','23:59'),
 (2,2,'2026-06-15','18:00','23:59'),
 (3,3,'2026-06-15','20:00','23:00'),
 (4,9,'2026-06-15','09:00','18:00'),
 (5,10,'2026-06-15','08:00','16:00'),
 (6,6,'2026-06-15','14:00','22:00'),
 (7,5,'2026-06-15','10:00','17:00'),
 (8,7,'2026-06-15','09:00','19:00'),
 (9,4,'2026-06-12','09:00','17:00'),
 (10,8,'2026-06-16','08:00','12:00'),
 (11,1,'2026-06-14','18:00','23:59'),
 (12,2,'2026-06-14','18:00','23:59');

CREATE TABLE acces_badges (id INTEGER PRIMARY KEY, employe_id INTEGER, salle_id INTEGER, horodatage TEXT, sens TEXT);
INSERT INTO acces_badges VALUES
 (1,9,1,'2026-06-15 08:55','entree'),
 (2,10,1,'2026-06-15 08:58','entree'),
 (3,7,1,'2026-06-15 09:05','entree'),
 (4,5,1,'2026-06-15 09:58','entree'),
 (5,5,2,'2026-06-15 10:30','entree'),
 (6,5,2,'2026-06-15 11:45','sortie'),
 (7,10,4,'2026-06-15 14:10','entree'),
 (8,10,4,'2026-06-15 14:40','sortie'),
 (9,6,1,'2026-06-15 13:58','entree'),
 (10,10,1,'2026-06-15 16:03','sortie'),
 (11,5,1,'2026-06-15 17:04','sortie'),
 (12,9,1,'2026-06-15 18:01','sortie'),
 (13,1,1,'2026-06-15 17:55','entree'),
 (14,2,1,'2026-06-15 17:57','entree'),
 (15,7,1,'2026-06-15 19:02','sortie'),
 (16,3,1,'2026-06-15 19:58','entree'),
 (17,3,2,'2026-06-15 20:15','entree'),
 (18,3,2,'2026-06-15 20:55','sortie'),
 (19,3,3,'2026-06-15 21:05','entree'),
 (20,3,3,'2026-06-15 21:25','sortie'),
 (21,6,4,'2026-06-15 21:30','entree'),
 (22,4,1,'2026-06-15 21:35','entree'),
 (23,5,1,'2026-06-15 21:38','entree'),
 (24,1,2,'2026-06-15 21:30','entree'),
 (25,1,2,'2026-06-15 21:38','sortie'),
 (26,1,3,'2026-06-15 21:41','entree'),
 (27,1,3,'2026-06-15 21:44','sortie'),
 (28,4,3,'2026-06-15 21:47','entree'),
 (29,6,4,'2026-06-15 21:50','sortie'),
 (30,5,3,'2026-06-15 21:52','entree'),
 (31,1,4,'2026-06-15 21:55','entree'),
 (32,5,3,'2026-06-15 21:58','sortie'),
 (33,5,1,'2026-06-15 21:59','entree'),
 (34,5,1,'2026-06-15 22:01','sortie'),
 (35,1,4,'2026-06-15 22:02','sortie'),
 (36,2,5,'2026-06-15 22:03','entree'),
 (37,4,3,'2026-06-15 22:04','sortie'),
 (38,4,5,'2026-06-15 22:06','entree'),
 (39,6,1,'2026-06-15 22:05','sortie'),
 (40,2,3,'2026-06-15 22:14','entree');

CREATE TABLE temoignages (id INTEGER PRIMARY KEY, temoin TEXT, texte TEXT);
INSERT INTO temoignages VALUES
 (1,'Marc Dubois','Vers 22h05, j''ai croisé quelqu''un près de la sortie de service avec un grand tube en carton. Il faisait sombre, je n''ai pas vu son visage.'),
 (2,'Claire Fontaine','Pendant ma ronde, je suis passée en salle 3 vers 21h41 : le tableau était encore accroché quand je suis repartie.'),
 (3,'Emma Petit','Je suis repassée en salle 3 vers 21h52 récupérer mes notes de conférence. Le restaurateur examinait le tableau, rien d''anormal — c''est son métier après tout.'),
 (4,'Hugo Lambert','J''ai préparé les caisses de transport en réserve toute la soirée, je n''ai rien vu.');
`,
  steps: [
    {
      question:
        "La caméra de la salle 3 est tombée en panne le soir du vol. À quelle heure la panne a-t-elle commencé ? (format HH:MM)",
      placeholder: 'ex : 20:15',
      answer: ['21:40', '21h40'],
      mode: 'exact',
      hints: [
        'La table `pannes_cameras` contient une colonne `salle_id` et des horodatages `debut` / `fin`.',
        "Filtre sur la salle 3 ET sur la date du 15 juin : la table contient d'autres pannes pour te piéger.",
        "SELECT debut, fin FROM pannes_cameras WHERE salle_id = 3 AND debut LIKE '2026-06-15%'",
      ],
      explain:
        "La panne a duré de **21:40 à 22:10** — exactement la fenêtre du vol (le tableau était encore là à 21h41 d'après Claire). Une panne aussi bien synchronisée n'est probablement pas un hasard : le voleur connaissait le système.",
      solutionQuery: "SELECT * FROM pannes_cameras WHERE salle_id = 3 AND debut LIKE '2026-06-15%';",
    },
    {
      question:
        "Pendant la panne (21:40 → 22:10), combien de personnes ont badgé en ENTRÉE dans la salle 3 ?",
      placeholder: 'un nombre',
      answer: ['3'],
      mode: 'exact',
      hints: [
        "La table `acces_badges` a une colonne `sens` ('entree'/'sortie') et `salle_id`.",
        "Compare `horodatage` avec BETWEEN '2026-06-15 21:40' AND '2026-06-15 22:10' — les timestamps sont des chaînes triables.",
        "SELECT COUNT(*) FROM acces_badges WHERE salle_id = 3 AND sens = 'entree' AND horodatage BETWEEN '2026-06-15 21:40' AND '2026-06-15 22:10'",
      ],
      explain:
        "Trois entrées pendant la panne : **Claire Fontaine** (21:41, sa ronde), **Lucas Moreau** (21:47) et **Emma Petit** (21:52). Sophie Renard, elle, a nettoyé la salle AVANT la panne — la caméra l'a filmée, elle est hors de cause.",
      solutionQuery:
        "SELECT e.nom, a.horodatage FROM acces_badges a JOIN employes e ON e.id = a.employe_id WHERE a.salle_id = 3 AND a.sens = 'entree' AND a.horodatage BETWEEN '2026-06-15 21:40' AND '2026-06-15 22:10';",
    },
    {
      question:
        "Parmi ces trois personnes, combien n'étaient PAS de service ce soir-là (aucun planning couvrant 21:40 le 15 juin) ?",
      placeholder: 'un nombre',
      answer: ['2'],
      mode: 'exact',
      hints: [
        'Joins `acces_badges` avec `plannings` sur employe_id + jour, en LEFT JOIN pour repérer les absents du planning.',
        "Attention : être planifié de 10:00 à 17:00 ne couvre PAS 21:40. Compare heure_debut <= '21:40' AND heure_fin >= '21:40'.",
        "SELECT e.nom FROM employes e WHERE e.id IN (1,4,5) AND NOT EXISTS (SELECT 1 FROM plannings p WHERE p.employe_id = e.id AND p.jour = '2026-06-15' AND p.heure_debut <= '21:40' AND p.heure_fin >= '21:40')",
      ],
      explain:
        "**Lucas Moreau** (aucun planning le 15) et **Emma Petit** (planifiée 10h-17h, repartie puis revenue le soir) n'avaient rien à faire là. Claire, elle, effectuait sa ronde planifiée. Deux suspects restent en lice.",
      solutionQuery:
        "SELECT e.nom, a.horodatage FROM acces_badges a JOIN employes e ON e.id = a.employe_id LEFT JOIN plannings p ON p.employe_id = e.id AND p.jour = '2026-06-15' AND p.heure_debut <= '21:40' AND p.heure_fin >= '21:40' WHERE a.salle_id = 3 AND a.sens = 'entree' AND a.horodatage BETWEEN '2026-06-15 21:40' AND '2026-06-15 22:10' AND p.id IS NULL;",
    },
    {
      question:
        "Le témoignage de Marc évoque la sortie de service vers 22h05. Croisez les badges et les témoignages : **qui est le voleur ?**",
      placeholder: 'Prénom Nom',
      answer: ['moreau'],
      mode: 'contains',
      final: true,
      hints: [
        'Relis les témoignages (`SELECT * FROM temoignages`) puis regarde qui a badgé à la sortie de service (salle 5) autour de 22h05.',
        "Emma est ressortie par le hall à 22:01. Qui est resté en salle 3 jusqu'à 22:04, puis a filé vers la salle 5 ?",
        "SELECT e.nom, a.horodatage, s.nom FROM acces_badges a JOIN employes e ON e.id = a.employe_id JOIN salles s ON s.id = a.salle_id WHERE a.horodatage >= '2026-06-15 22:00' ORDER BY a.horodatage",
      ],
      explain:
        "**Lucas Moreau**, le restaurateur d'art. Il connaissait le système de caméras, est entré en salle 3 à 21:47 pendant la panne, a attendu le départ d'Emma (21:58), a décroché la toile, est sorti à 22:04 et a filé par la sortie de service à 22:06 — où Marc a aperçu le fameux « grand tube en carton »... parfait pour transporter une toile roulée. Emma, elle, est ressortie par le hall avant la disparition.",
      solutionQuery:
        "SELECT e.nom, a.horodatage, s.nom AS salle, a.sens FROM acces_badges a JOIN employes e ON e.id = a.employe_id JOIN salles s ON s.id = a.salle_id WHERE a.employe_id = 4 AND a.horodatage LIKE '2026-06-15 2%' ORDER BY a.horodatage;",
    },
  ],
  conclusion:
    "🎉 Affaire classée ! Lucas Moreau a avoué : criblé de dettes, il comptait vendre la toile à un collectionneur privé. Compétences travaillées : filtres sur intervalles temporels, jointures multi-tables, LEFT JOIN + IS NULL (anti-jointure), et surtout le croisement méthodique des sources de données.",
}
