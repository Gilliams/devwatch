export default {
  id: 'zephyr',
  emoji: '🚂',
  title: 'Meurtre à bord du Zéphyr Express',
  level: 'Avancé',
  skills: 'Intervalles temporels, jointures, fenêtres (LAG), calculs de durées',
  story: `**Nuit du 20 au 21 juin 2026, quelque part entre Lausanne et Milan.** Le Zéphyr Express, train de nuit Paris → Venise, file dans les Alpes. À 6h30, le contrôleur découvre le magnat **Aurélien Croze** sans vie dans sa cabine 12. Le médecin de bord situe le décès **entre 02h00 et 03h00**.

Le train n'a fait qu'un arrêt dans la nuit (Lausanne, 01h47-01h55, quais contrôlés : personne n'est monté ni descendu). **L'assassin est donc toujours à bord.** Chaque porte de cabine est équipée d'un capteur, et le wagon-bar note toutes les commandes.

Tables : \`passagers\`, \`personnel\`, \`capteurs_portes\`, \`commandes_bar\`, \`arrets\`, \`temoignages\`. Le coupable compte sur le tunnel du Simplon pour disparaître à Milan — prenez-le de vitesse.`,
  setupSql: `
CREATE TABLE passagers (id INTEGER PRIMARY KEY, nom TEXT, cabine INTEGER);
INSERT INTO passagers VALUES
 (1,'Aurélien Croze',12),
 (2,'Maud Ferrand',7),
 (3,'Bianca Rey',3),
 (4,'Léo Vasquez',9),
 (5,'Ingrid Malet',15),
 (6,'Théo Sablon',5),
 (7,'Rosa Quinter',14),
 (8,'Jules Ambert',16),
 (9,'Nora Vidal',11),
 (10,'Stan Kader',18);

CREATE TABLE personnel (id INTEGER PRIMARY KEY, nom TEXT, fonction TEXT);
INSERT INTO personnel VALUES
 (1,'Bruno Lopes','Contrôleur'),
 (2,'Anna Keller','Barmaid'),
 (3,'Diego Fontan','Conducteur');

CREATE TABLE capteurs_portes (id INTEGER PRIMARY KEY, cabine INTEGER, horodatage TEXT, evenement TEXT);
INSERT INTO capteurs_portes VALUES
 (1,3,'2026-06-20 22:05','ouverture'),
 (2,3,'2026-06-20 22:06','fermeture'),
 (3,5,'2026-06-20 22:40','ouverture'),
 (4,5,'2026-06-20 22:41','fermeture'),
 (5,9,'2026-06-20 23:12','ouverture'),
 (6,9,'2026-06-20 23:13','fermeture'),
 (7,7,'2026-06-20 23:30','ouverture'),
 (8,7,'2026-06-20 23:31','fermeture'),
 (9,12,'2026-06-20 23:45','ouverture'),
 (10,12,'2026-06-20 23:46','fermeture'),
 (11,9,'2026-06-20 23:58','ouverture'),
 (12,9,'2026-06-20 23:59','fermeture'),
 (13,11,'2026-06-21 00:20','ouverture'),
 (14,11,'2026-06-21 00:21','fermeture'),
 (15,9,'2026-06-21 02:05','ouverture'),
 (16,9,'2026-06-21 02:06','fermeture'),
 (17,7,'2026-06-21 02:14','ouverture'),
 (18,7,'2026-06-21 02:15','fermeture'),
 (19,12,'2026-06-21 02:17','ouverture'),
 (20,12,'2026-06-21 02:24','fermeture'),
 (21,7,'2026-06-21 02:29','ouverture'),
 (22,7,'2026-06-21 02:30','fermeture'),
 (23,9,'2026-06-21 02:36','ouverture'),
 (24,9,'2026-06-21 02:37','fermeture'),
 (25,15,'2026-06-21 03:40','ouverture'),
 (26,15,'2026-06-21 03:42','fermeture'),
 (27,14,'2026-06-21 05:50','ouverture'),
 (28,14,'2026-06-21 05:51','fermeture'),
 (29,12,'2026-06-21 06:28','ouverture'),
 (30,16,'2026-06-21 06:45','ouverture'),
 (31,16,'2026-06-21 06:46','fermeture'),
 (32,18,'2026-06-21 07:02','ouverture');

CREATE TABLE commandes_bar (id INTEGER PRIMARY KEY, passager_id INTEGER, horodatage TEXT, article TEXT, montant REAL);
INSERT INTO commandes_bar VALUES
 (1,3,'2026-06-20 21:30','Verre de rouge',8.50),
 (2,6,'2026-06-20 21:45','Bière pression',6.00),
 (3,4,'2026-06-20 23:15','Vodka tonic',12.50),
 (4,8,'2026-06-20 22:10','Planche mixte',16.00),
 (5,3,'2026-06-20 22:20','Tisane',4.00),
 (6,4,'2026-06-21 02:10','Vodka tonic',12.50),
 (7,4,'2026-06-21 02:28','Whisky 12 ans',14.00),
 (8,7,'2026-06-21 06:55','Café double',5.50),
 (9,5,'2026-06-21 07:05','Thé vert',4.50);

CREATE TABLE arrets (id INTEGER PRIMARY KEY, gare TEXT, arrivee TEXT, depart TEXT);
INSERT INTO arrets VALUES
 (1,'Paris Gare de Lyon',NULL,'2026-06-20 21:12'),
 (2,'Dijon','2026-06-20 23:41','2026-06-20 23:44'),
 (3,'Lausanne','2026-06-21 01:47','2026-06-21 01:55'),
 (4,'Milan','2026-06-21 05:12','2026-06-21 05:20'),
 (5,'Venise','2026-06-21 08:05',NULL);

CREATE TABLE temoignages (id INTEGER PRIMARY KEY, temoin TEXT, texte TEXT);
INSERT INTO temoignages VALUES
 (1,'Bruno Lopes — contrôleur','Vers 23h, une dispute dans le couloir des cabines 7 à 12. Une voix de femme criait « tu m''as ruinée, Aurélien ». Je n''ai pas vu qui c''était.'),
 (2,'Anna Keller — barmaid','Un passager a passé une partie de la nuit au wagon-bar. Il a commandé vers 2h10 puis 2h30, il n''a pas quitté le bar avant 2h35 au moins, il me racontait sa vie.'),
 (3,'Ingrid Malet — cabine 15','Je me suis levée vers 3h40 pour aller aux toilettes. Le couloir était désert et la porte de la 12 était fermée.'),
 (4,'Rosa Quinter — cabine 14','La victime avait rendez-vous à Venise pour signer la vente de sa société. Son ancienne associée n''a jamais digéré d''être évincée du conseil.');
`,
  steps: [
    {
      question:
        "Cadrez la scène de crime : à quelle heure la porte de la cabine 12 s'est-elle OUVERTE pendant la fenêtre du crime (02h00 → 03h00) ? (format HH:MM)",
      placeholder: 'ex : 02:45',
      answer: ['02:17', '2:17', '02h17', '2h17'],
      mode: 'exact',
      concepts: ['where', 'between', 'like'],
      hints: [
        "La table `capteurs_portes` journalise chaque ouverture/fermeture avec la cabine et l'horodatage.",
        "Filtre cabine = 12, evenement = 'ouverture', et l'horodatage dans la fenêtre du 21 juin entre 02:00 et 03:00.",
        "SELECT * FROM capteurs_portes WHERE cabine = 12 AND horodatage BETWEEN '2026-06-21 02:00' AND '2026-06-21 03:00'",
      ],
      explain:
        "La porte de la victime s'ouvre à **02h17** et se referme à **02h24** : sept minutes fatales. Aurélien Croze s'était retiré à 23h45 et n'a pas rouvert lui-même à 6h28 (c'est le contrôleur qui découvre le corps). Quelqu'un est donc entré à 02h17.",
      solutionQuery:
        "SELECT * FROM capteurs_portes WHERE cabine = 12 AND horodatage BETWEEN '2026-06-21 02:00' AND '2026-06-21 03:00' ORDER BY horodatage;",
    },
    {
      question:
        "Qui circulait à cette heure-là ? Combien de cabines DIFFÉRENTES (hors la 12) ont enregistré au moins une ouverture pendant la fenêtre 02h00 → 03h00 ?",
      placeholder: 'un nombre',
      answer: ['2'],
      mode: 'exact',
      concepts: ['distinct', 'between', 'where'],
      hints: [
        "Même fenêtre temporelle, mais cette fois cabine <> 12 et evenement = 'ouverture'.",
        'COUNT(DISTINCT cabine) évite de compter deux fois une cabine ouverte deux fois.',
        "SELECT COUNT(DISTINCT cabine) FROM capteurs_portes WHERE cabine <> 12 AND evenement = 'ouverture' AND horodatage BETWEEN '2026-06-21 02:00' AND '2026-06-21 03:00'",
      ],
      explain:
        "Deux cabines ont bougé pendant la fenêtre : la **7** (02h14 puis 02h29) et la **9** (02h05 puis 02h36). Tout le reste du wagon dormait. Nos deux suspects : **Maud Ferrand** (cabine 7) et **Léo Vasquez** (cabine 9).",
      solutionQuery:
        "SELECT c.cabine, p.nom, c.horodatage, c.evenement FROM capteurs_portes c JOIN passagers p ON p.cabine = c.cabine WHERE c.cabine <> 12 AND c.horodatage BETWEEN '2026-06-21 02:00' AND '2026-06-21 03:00' ORDER BY c.horodatage;",
    },
    {
      question:
        "L'un des deux a un alibi en béton armé. Croisez les commandes du bar avec les passagers : quel NUMÉRO DE CABINE est hors de cause ?",
      placeholder: 'numéro de cabine',
      answer: ['9'],
      mode: 'exact',
      concepts: ['join', 'sousrequete', 'between'],
      hints: [
        'La table `commandes_bar` référence un passager_id — joins-la avec `passagers` pour retrouver la cabine.',
        "Cherche des commandes passées ENTRE 02h00 et 03h00 : difficile de poignarder quelqu'un en sirotant un whisky sous les yeux de la barmaid.",
        "SELECT p.nom, p.cabine, cb.horodatage FROM commandes_bar cb JOIN passagers p ON p.id = cb.passager_id WHERE cb.horodatage BETWEEN '2026-06-21 02:00' AND '2026-06-21 03:00'",
      ],
      explain:
        "**Léo Vasquez, cabine 9**, a commandé au bar à **02h10** puis **02h28** — et la barmaid confirme qu'il ne l'a pas quittée avant 02h35 (témoignage n°2). Sa porte (02h05 : départ au bar, 02h36 : retour) colle parfaitement. Alibi solide. Reste la cabine 7.",
      solutionQuery:
        "SELECT p.nom, p.cabine, cb.horodatage, cb.article FROM commandes_bar cb JOIN passagers p ON p.id = cb.passager_id WHERE cb.horodatage BETWEEN '2026-06-21 02:00' AND '2026-06-21 03:00';",
    },
    {
      question:
        "Interrogée, l'occupante de la cabine 7 jure : « je suis juste allée aux toilettes deux minutes ». Vérifiez au capteur : combien de MINUTES sa cabine est-elle restée vide (entre sa fermeture de 02h15 et sa réouverture) ?",
      placeholder: 'un nombre de minutes',
      answer: ['14'],
      mode: 'exact',
      concepts: ['lag', 'window', 'dates'],
      hints: [
        "Il te faut le délai entre deux événements CONSÉCUTIFS de la cabine 7 : LAG(horodatage) OVER (ORDER BY horodatage) te donne l'événement précédent de chaque ligne.",
        "Pour convertir en minutes : (julianday(courant) - julianday(precedent)) * 24 * 60. Filtre ensuite la ligne 'ouverture' de 02:29.",
        "SELECT horodatage, evenement, ROUND((julianday(horodatage) - julianday(LAG(horodatage) OVER (ORDER BY horodatage))) * 24 * 60) AS minutes_depuis_evt_precedent FROM capteurs_portes WHERE cabine = 7",
      ],
      explain:
        "Porte fermée à **02h15**, rouverte à **02h29** : **14 minutes** d'absence, pas deux. Largement le temps d'aller cabine 12 (ouverte 02h17, refermée 02h24) et de revenir. Le mensonge sur la durée est souvent l'aveu le plus bavard.",
      solutionQuery:
        "SELECT horodatage, evenement, ROUND((julianday(horodatage) - julianday(LAG(horodatage) OVER (ORDER BY horodatage))) * 24 * 60) AS minutes_ecart FROM capteurs_portes WHERE cabine = 7 ORDER BY horodatage;",
    },
    {
      question:
        "Bouclez le dossier avec le mobile (relisez les témoignages) : **qui a tué Aurélien Croze ?**",
      placeholder: 'Prénom Nom',
      answer: ['ferrand', 'maud ferrand'],
      mode: 'contains',
      final: true,
      concepts: ['join'],
      hints: [
        'SELECT * FROM temoignages — la dispute de 23h et le témoignage de Rosa Quinter dessinent un mobile.',
        "Qui occupe la cabine 7 ? Et quelle « voix de femme » criait « tu m'as ruinée » dans ce couloir à 23h ?",
        'SELECT nom FROM passagers WHERE cabine = 7',
      ],
      explain:
        "**Maud Ferrand**, cabine 7 — l'ancienne associée évincée du conseil (témoignage de Rosa Quinter), celle qui criait « tu m'as ruinée, Aurélien » à 23h (témoignage du contrôleur). Sa cabine s'ouvre à 02h14, celle de la victime à 02h17, la sienne se rouvre à 02h29 : quatorze minutes que son « aller aux toilettes » n'explique pas. Léo Vasquez, lui, hydratait son alibi au wagon-bar.",
      solutionQuery:
        "SELECT p.nom, p.cabine, t.texte FROM passagers p LEFT JOIN temoignages t ON t.texte LIKE '%' || substr(p.nom, 1, instr(p.nom, ' ') - 1) || '%' WHERE p.cabine = 7;",
    },
  ],
  conclusion:
    "🎉 Arrestation à Milan, quai n°4 ! Maud Ferrand a avoué : ruinée par son éviction, elle voulait empêcher la signature de Venise. Compétences travaillées : fenêtres temporelles avec BETWEEN, alibis par jointure, et surtout LAG + julianday pour mesurer un trou dans un journal d'événements — la technique reine de l'analyse de logs.",
}
