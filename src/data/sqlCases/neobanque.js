export default {
  id: 'neobanque',
  emoji: '🏦',
  title: 'Les comptes fantômes de la NeoBanque',
  level: 'Avancé',
  skills: 'Agrégations, HAVING, jointures temporelles, GROUP BY',
  story: `**Cellule anti-fraude, 16 juin 2026.** L'algorithme de conformité de la NeoBanque a levé une alerte : des mouvements inhabituels sur des comptes clients... inactifs depuis des années.

Le soupçon : un **employé** détourne de l'argent en « schtroumpfant » (*smurfing*) — des virements répétés juste sous le seuil de déclaration de 10 000 €, depuis des comptes dormants que personne ne surveille, vers un compte de passage, puis vers l'extérieur.

Tables à votre disposition : \`clients\`, \`comptes\`, \`transactions\`, \`employes\`, \`logs_admin\`. Remontez la piste de l'argent.`,
  setupSql: `
CREATE TABLE clients (id INTEGER PRIMARY KEY, nom TEXT, email TEXT, date_inscription TEXT);
INSERT INTO clients VALUES
 (1,'Amélie Verne','a.verne@mail.fr','2019-03-12'),
 (2,'Bruno Chatel','b.chatel@mail.fr','2018-07-25'),
 (3,'Carla Diaz','c.diaz@mail.fr','2020-01-30'),
 (4,'Denis Forestier','d.forestier@mail.fr','2017-11-02'),
 (5,'Elsa Kaminski','e.kaminski@mail.fr','2019-09-14'),
 (6,'Farid Meziane','f.meziane@mail.fr','2021-05-08'),
 (7,'Gaëlle Riou','g.riou@mail.fr','2018-02-19'),
 (8,'Henri Blanchard','h.blanchard@mail.fr','2020-10-11'),
 (9,'Damien Rousseau','d.rousseau@tempmail.xyz','2026-05-28'),
 (10,'Iris Lopez','i.lopez@mail.fr','2022-04-03'),
 (11,'Jules Anselme','j.anselme@mail.fr','2021-08-22'),
 (12,'Katia Nowak','k.nowak@mail.fr','2019-12-05');

CREATE TABLE comptes (id INTEGER PRIMARY KEY, client_id INTEGER, iban TEXT, statut TEXT, derniere_activite TEXT);
INSERT INTO comptes VALUES
 (101,1,'FR7630001000011234567890101','actif','2026-06-10'),
 (102,2,'FR7630001000011234567890102','dormant','2023-01-18'),
 (103,3,'FR7630001000011234567890103','actif','2026-06-12'),
 (104,4,'FR7630001000011234567890104','actif','2026-06-14'),
 (105,5,'FR7630001000011234567890105','dormant','2022-11-30'),
 (106,6,'FR7630001000011234567890106','actif','2026-06-01'),
 (107,7,'FR7630001000011234567890107','cloture','2024-05-20'),
 (108,8,'FR7630001000011234567890108','actif','2026-05-28'),
 (110,10,'FR7630001000011234567890110','dormant','2023-08-02'),
 (111,11,'FR7630001000011234567890111','actif','2026-06-13'),
 (113,12,'FR7630001000011234567890113','dormant','2022-06-15'),
 (115,1,'FR7630001000011234567890115','actif','2026-04-22'),
 (118,4,'FR7630001000011234567890118','dormant','2023-12-01'),
 (121,7,'FR7630001000011234567890121','dormant','2023-04-10'),
 (707,9,'FR7630001000011234567890707','actif','2026-06-15'),
 (999,NULL,'EXTERNE','externe',NULL);

CREATE TABLE employes (id INTEGER PRIMARY KEY, nom TEXT, role TEXT);
INSERT INTO employes VALUES
 (1,'Alice Marchand','Administratrice systeme'),
 (2,'Yann Kerbrat','Conseiller support'),
 (3,'David Cohen','Conseiller support'),
 (4,'Inès Fabre','Analyste conformite'),
 (5,'Olivier Toussaint','Directeur agence');

CREATE TABLE transactions (id INTEGER PRIMARY KEY, compte_source INTEGER, compte_dest INTEGER, montant REAL, horodatage TEXT, libelle TEXT);
INSERT INTO transactions VALUES
 (1,101,106,120.00,'2026-06-01 10:15','Remboursement resto'),
 (2,104,101,45.50,'2026-06-01 14:22','Cadeau'),
 (3,102,707,9450.00,'2026-06-02 02:41','Regularisation epargne'),
 (4,103,999,1200.00,'2026-06-02 09:10','Loyer juin'),
 (5,106,999,89.99,'2026-06-02 11:05','Abonnement annuel'),
 (6,105,707,9800.00,'2026-06-03 03:12','Regularisation epargne'),
 (7,101,999,9500.00,'2026-06-03 10:44','Achat vehicule occasion'),
 (8,111,104,300.00,'2026-06-04 16:20','Participation cadeau'),
 (9,110,707,9120.00,'2026-06-05 02:58','Regularisation epargne'),
 (10,108,999,2100.00,'2026-06-05 12:30','Facture artisan'),
 (11,104,999,75.00,'2026-06-06 09:15','Courses en ligne'),
 (12,113,707,9990.00,'2026-06-07 03:27','Regularisation epargne'),
 (13,101,111,60.00,'2026-06-07 19:45','Remboursement'),
 (14,106,101,420.00,'2026-06-08 08:50','Vente meuble'),
 (15,118,707,9600.00,'2026-06-09 02:36','Regularisation epargne'),
 (16,103,106,150.00,'2026-06-09 13:12','Anniversaire'),
 (17,111,999,9700.00,'2026-06-10 15:08','Acompte travaux toiture'),
 (18,121,707,9840.00,'2026-06-11 03:05','Regularisation epargne'),
 (19,104,103,88.00,'2026-06-11 17:40','Remboursement essence'),
 (20,108,111,230.00,'2026-06-12 10:25','Location week-end'),
 (21,101,999,340.00,'2026-06-12 14:55','Billets train'),
 (22,106,999,55.00,'2026-06-13 09:30','Pharmacie'),
 (23,115,101,500.00,'2026-06-13 18:10','Virement epargne'),
 (24,707,999,57500.00,'2026-06-15 04:02','Consulting international SARL'),
 (25,103,999,64.90,'2026-06-15 11:20','Restaurant'),
 (26,111,106,95.00,'2026-06-15 16:45','Concert');

CREATE TABLE logs_admin (id INTEGER PRIMARY KEY, employe_id INTEGER, action TEXT, compte_id INTEGER, horodatage TEXT);
INSERT INTO logs_admin VALUES
 (1,1,'reset_mot_de_passe',101,'2026-05-20 09:12'),
 (2,3,'reactivation',121,'2026-05-21 14:30'),
 (3,3,'mise_en_sommeil',121,'2026-05-21 15:02'),
 (4,2,'creation_compte',707,'2026-05-28 11:47'),
 (5,1,'maj_plafond',104,'2026-05-29 10:05'),
 (6,2,'reactivation',102,'2026-06-02 01:55'),
 (7,2,'mise_en_sommeil',102,'2026-06-02 03:20'),
 (8,3,'reset_mot_de_passe',108,'2026-06-02 15:41'),
 (9,2,'reactivation',105,'2026-06-03 02:30'),
 (10,2,'mise_en_sommeil',105,'2026-06-03 04:01'),
 (11,4,'controle_conformite',101,'2026-06-04 09:00'),
 (12,2,'reactivation',110,'2026-06-05 02:12'),
 (13,2,'mise_en_sommeil',110,'2026-06-05 03:33'),
 (14,3,'maj_plafond',111,'2026-06-05 16:20'),
 (15,2,'reactivation',113,'2026-06-07 02:48'),
 (16,2,'mise_en_sommeil',113,'2026-06-07 04:15'),
 (17,1,'reset_mot_de_passe',106,'2026-06-08 11:30'),
 (18,2,'reactivation',118,'2026-06-09 02:01'),
 (19,2,'mise_en_sommeil',118,'2026-06-09 03:40'),
 (20,4,'controle_conformite',108,'2026-06-10 14:00'),
 (21,2,'reactivation',121,'2026-06-11 02:29'),
 (22,2,'mise_en_sommeil',121,'2026-06-11 03:58'),
 (23,3,'reset_mot_de_passe',103,'2026-06-12 10:10'),
 (24,1,'maj_plafond',115,'2026-06-13 09:45');
`,
  steps: [
    {
      question:
        "Le smurfing consiste à multiplier les virements JUSTE sous 10 000 €. Quel compte (ID) reçoit de façon répétée ce type de virements ?",
      placeholder: 'ID du compte',
      answer: ['707'],
      mode: 'exact',
      concepts: ['groupby', 'having', 'between', 'agregats'],
      hints: [
        'Cherche dans `transactions` les montants entre 9 000 et 9 999,99 — puis regarde vers OÙ ils vont.',
        "Un virement isolé sous le seuil est banal (regarde le compte 999). Le motif suspect, c'est la RÉPÉTITION vers un même destinataire : GROUP BY compte_dest HAVING COUNT(*) >= 3.",
        'SELECT compte_dest, COUNT(*), SUM(montant) FROM transactions WHERE montant BETWEEN 9000 AND 9999.99 GROUP BY compte_dest HAVING COUNT(*) >= 3',
      ],
      explain:
        "Le compte **707** a reçu 6 virements entre 9 120 € et 9 990 € en dix jours, tous libellés « Regularisation epargne », tous entre 2h et 4h du matin. Les autres virements sous le seuil (achat de voiture, travaux) sont isolés et diurnes : c'est la répétition qui trahit le schéma.",
      solutionQuery:
        'SELECT compte_dest, COUNT(*) AS nb, SUM(montant) AS total FROM transactions WHERE montant BETWEEN 9000 AND 9999.99 GROUP BY compte_dest ORDER BY nb DESC;',
    },
    {
      question: 'Combien de comptes sources DISTINCTS alimentent le compte 707 avec ces virements suspects ?',
      placeholder: 'un nombre',
      answer: ['6'],
      mode: 'exact',
      concepts: ['distinct', 'agregats'],
      hints: [
        'Repars des transactions vers le compte 707.',
        'COUNT(DISTINCT ...) est ton ami.',
        'SELECT COUNT(DISTINCT compte_source) FROM transactions WHERE compte_dest = 707',
      ],
      explain:
        "Six comptes sources différents (102, 105, 110, 113, 118, 121), appartenant à six clients différents. Éparpiller les sources évite qu'un client remarque un gros trou — encore faut-il que ces clients ne regardent pas leurs comptes...",
      solutionQuery:
        'SELECT DISTINCT t.compte_source, c.statut, cl.nom FROM transactions t JOIN comptes c ON c.id = t.compte_source JOIN clients cl ON cl.id = c.client_id WHERE t.compte_dest = 707;',
    },
    {
      question:
        "Quel point commun partagent TOUS les comptes sources de ces virements ? (répondez par leur `statut`)",
      placeholder: 'un mot',
      answer: ['dormant', 'dormants'],
      mode: 'exact',
      concepts: ['join', 'sousrequete', 'distinct'],
      hints: [
        'Joins les comptes sources avec la table `comptes` et regarde leurs colonnes.',
        'Compare aussi `derniere_activite` : ces comptes bougeaient-ils avant juin 2026 ?',
        "SELECT DISTINCT c.statut FROM transactions t JOIN comptes c ON c.id = t.compte_source WHERE t.compte_dest = 707",
      ],
      explain:
        "Tous sont **dormants** — aucune activité depuis 2022-2023. Des victimes parfaites : personne ne consulte ces comptes. Mais un compte dormant ne peut pas émettre de virement... quelqu'un a donc dû les réactiver. Et ça, ça laisse des traces dans `logs_admin`.",
      solutionQuery:
        "SELECT c.id, c.statut, c.derniere_activite FROM comptes c WHERE c.id IN (SELECT compte_source FROM transactions WHERE compte_dest = 707);",
    },
    {
      question:
        "L'argent n'est pas resté sur le 707. Quel montant total (en €) a été transféré du compte 707 vers l'extérieur ?",
      placeholder: 'ex : 12000',
      answer: ['57500', '57 500', '57500.00', '57500€'],
      mode: 'exact',
      concepts: ['agregats', 'join'],
      hints: [
        "Cherche les transactions dont la SOURCE est 707.",
        "Le compte 999 représente les virements sortants de la banque (IBAN 'EXTERNE').",
        'SELECT SUM(montant) FROM transactions WHERE compte_source = 707 AND compte_dest = 999',
      ],
      explain:
        "**57 500 €** évaporés le 15 juin à 4h02 vers « Consulting international SARL » — la quasi-totalité des 57 800 € siphonnés. Le compte 707 n'était qu'un compte de passage, ouvert le 28 mai au nom d'un « client » inscrit avec une adresse jetable (tempmail.xyz). Reste à trouver QUI, en interne, tirait les ficelles.",
      solutionQuery:
        "SELECT t.*, c.iban FROM transactions t JOIN comptes c ON c.id = t.compte_dest WHERE t.compte_source = 707;",
    },
    {
      question:
        "Croisez `logs_admin` et les virements : qui a réactivé chaque compte dormant quelques minutes avant chaque virement (et l'a remis en sommeil juste après) ? **Nommez le fraudeur.**",
      placeholder: 'Prénom Nom',
      answer: ['kerbrat'],
      mode: 'contains',
      final: true,
      concepts: ['dates', 'join', 'groupby'],
      hints: [
        "Cherche les actions 'reactivation' dans logs_admin sur les 6 comptes sources. Attention : David Cohen a aussi réactivé le compte 121... mais en mai, pour un contrôle légitime.",
        "Joins logs_admin et transactions sur le compte, avec une condition temporelle : la réactivation doit précéder le virement de moins de 2 heures.",
        "SELECT e.nom, COUNT(*) FROM logs_admin l JOIN transactions t ON t.compte_source = l.compte_id AND l.horodatage < t.horodatage AND l.horodatage > datetime(t.horodatage, '-2 hours') JOIN employes e ON e.id = l.employe_id WHERE l.action = 'reactivation' AND t.compte_dest = 707 GROUP BY e.nom",
      ],
      explain:
        "**Yann Kerbrat**, conseiller support. Le schéma complet : il crée le compte 707 le 28 mai (log n°4) au nom d'un faux client, puis pour chaque compte dormant — réactivation vers 2h du matin, virement de ~9 500 €, remise en sommeil dans l'heure. Six fois. David Cohen avait bien réactivé le compte 121, mais trois semaines avant le virement : un contrôle de routine. La jointure temporelle (réactivation < virement < réactivation + 2h) ne désigne que Yann, sur les 6 comptes.",
      solutionQuery:
        "SELECT e.nom, l.compte_id, l.horodatage AS reactivation, t.horodatage AS virement, t.montant FROM logs_admin l JOIN transactions t ON t.compte_source = l.compte_id AND t.compte_dest = 707 AND l.horodatage < t.horodatage AND l.horodatage > datetime(t.horodatage, '-2 hours') JOIN employes e ON e.id = l.employe_id WHERE l.action = 'reactivation' ORDER BY l.horodatage;",
    },
  ],
  conclusion:
    "🎉 Fraude démantelée ! Yann Kerbrat est confondu par la corrélation temporelle entre ses actions admin et les virements. Compétences travaillées : GROUP BY / HAVING pour détecter un motif répétitif, COUNT(DISTINCT), sous-requêtes IN, et surtout la jointure sur condition temporelle (datetime + intervalle) — l'arme absolue de l'analyse de logs.",
}
