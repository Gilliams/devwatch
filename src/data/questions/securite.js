export default [
  {
    level: 'inter',
    q: "Pourquoi les requêtes préparées empêchent-elles l'injection SQL ?",
    choices: [
      'Elles échappent automatiquement les quotes selon le charset de la connexion, comme mysqli_real_escape_string',
      'Structure SQL et données voyagent séparément : les valeurs ne sont jamais interprétées comme du code',
      "Elles chiffrent les paramètres entre l'application et le serveur de base de données via le canal TLS",
      "Le moteur borne la longueur des entrées liées, ce qui bloque les payloads d'injection connus",
    ],
    answer: 1,
    explain:
      "Avec un prepare, le plan de la requête est figé avant l'arrivée des valeurs — `' OR 1=1 --` reste une bête chaîne. Limite importante : les identifiants (noms de colonnes, ORDER BY dynamique) ne sont PAS paramétrables → whitelist obligatoire.",
    why: "La limite des identifiants non paramétrables est ce qui sépare la réponse par cœur de la vraie compréhension — et c'est là que les failles persistent.",
    doc: 'https://www.php.net/manual/fr/pdo.prepared-statements.php',
  },
  {
    level: 'inter',
    q: 'Différence entre XSS stocké, réfléchi et DOM-based ?',
    choices: [
      "Stocké : payload persisté servi aux visiteurs ; réfléchi : payload de la requête renvoyé dans la réponse ; DOM-based : injection côté client via le JS",
      'Le XSS stocké vise les cookies httpOnly, le réfléchi les tokens du localStorage, le DOM-based les deux à la fois',
      "Le XSS réfléchi nécessite un compte authentifié sur l'application ; le stocké fonctionne aussi en anonyme",
      'Le DOM-based suppose une faille serveur préalable qui injecte le script dans le HTML initial de la page',
    ],
    answer: 0,
    explain:
      "Trois vecteurs, une même conséquence : exécuter du JS chez la victime. Défenses : échappement contextuel en sortie (Twig auto-échappe, gare à `|raw`), Content-Security-Policy, cookies HttpOnly, et côté SPA éviter v-html/innerHTML sur des données non maîtrisées.",
    why: "En revue de code front, `|raw` et `v-html` sont les premiers endroits à inspecter — réflexe rapide et rentable.",
    doc: 'https://owasp.org/www-community/attacks/xss/',
  },
  {
    level: 'avance',
    q: "`GET /api/documents/1234` renvoie le document sans vérifier qu'il appartient à l'utilisateur connecté. Quelle faille ?",
    choices: [
      'CSRF : la requête peut être forgée depuis un site tiers avec les cookies de session de la victime',
      'IDOR / Broken Object Level Authorization : utilisateur authentifié mais pas autorisé sur CETTE ressource',
      "Mass assignment : l'identifiant est lié directement à l'entité sans liste blanche de champs autorisés",
      "Énumération d'identifiants : les ids séquentiels révèlent le volume d'affaires de la plateforme",
    ],
    answer: 1,
    explain:
      "Il suffit d'incrémenter l'id pour lire les documents des autres. Parade : contrôle d'autorisation par objet (voter Symfony : `denyAccessUnlessGranted('VIEW', $document)`). Les UUID compliquent l'énumération mais ne CORRIGENT pas la faille (défense en profondeur).",
    why: "N°1 de l'OWASP API Top 10, trouvé dans une majorité de pentests — et la réponse propre en Symfony est un voter, pas un if éparpillé.",
    doc: 'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/',
  },
  {
    level: 'avance',
    q: 'Pourquoi `password_hash()` (bcrypt/argon2) plutôt qu\'un SHA-256 salé « maison » ?',
    choices: [
      'SHA-256 est cryptographiquement cassé depuis 2017, au même titre que SHA-1 et MD5 avant lui',
      'bcrypt/argon2 sont lents à dessein et paramétrables en coût (+ mémoire pour argon2) ; SHA-256 se brute-force par milliards/s sur GPU',
      'password_hash() produit un chiffrement réversible, ce qui permet de renvoyer son mot de passe à l\'utilisateur',
      "Le sel intégré automatiquement est l'unique différence avec un SHA-256 salé implémenté manuellement",
    ],
    answer: 1,
    explain:
      "Un hash rapide est une qualité pour l'intégrité, un défaut pour les mots de passe. bcrypt/argon2id intègrent sel + facteur de coût ajustable, argon2 ajoute un coût mémoire qui neutralise les GPU. `password_needs_rehash()` migre les hashes au fil des connexions.",
    why: "Différencier hash rapide (intégrité) et hash lent (mots de passe), et citer la migration progressive : combo gagnant en entretien sécurité.",
    doc: 'https://www.php.net/manual/fr/function.password-hash.php',
  },
  {
    level: 'avance',
    q: 'Un token CSRF est-il utile pour une API stateless authentifiée par header `Authorization: Bearer` ?',
    choices: [
      'Oui : un site tiers peut toujours poster vers l\'API depuis un formulaire, le token CSRF reste indispensable',
      'Non : le CSRF exploite l\'envoi AUTOMATIQUE des cookies ; un header posé par VOTRE JS n\'est pas forgeable par un site tiers',
      'Non, car les API REST refusent de toute façon les requêtes issues de formulaires HTML (Content-Type)',
      "Oui : le JWT peut être rejoué par le site attaquant dès lors qu'il connaît l'audience et l'issuer du token",
    ],
    answer: 1,
    explain:
      "Le CSRF repose sur le cookie qui part automatiquement avec toute requête vers le domaine. Un header Authorization doit être ajouté explicitement par du JS de VOTRE origine. MAIS : si votre « API » lit aussi un cookie de session (cas hybride fréquent !), le CSRF redevient d'actualité — d'où SameSite en complément.",
    why: "Le cas hybride cookie + API est extrêmement répandu et c'est là que les équipes se font avoir — nuance qui fait mouche en entretien.",
    doc: 'https://owasp.org/www-community/attacks/csrf',
  },
  {
    level: 'expert',
    q: "Qu'est-ce qu'une attaque SSRF, et pourquoi le cloud y est-il particulièrement sensible ?",
    choices: [
      "Un déni de service applicatif : le serveur est forcé d'émettre des milliers de requêtes sortantes simultanées",
      'Faire émettre par le serveur une requête vers une cible interne ; en cloud, le metadata endpoint peut livrer des credentials IAM',
      "Une injection d'en-têtes SMTP via un champ de formulaire de contact insuffisamment filtré côté serveur",
      "Un vol de session par rejeu du cookie intercepté depuis l'infrastructure interne de l'hébergeur cloud",
    ],
    answer: 1,
    explain:
      "Toute fonctionnalité « le serveur va chercher une URL » (webhooks, imports, previews, génération PDF) est un vecteur : `http://169.254.169.254/latest/meta-data/iam/...` ou `http://localhost:6379`. Parades : whitelist, blocage des IP privées APRÈS résolution DNS, IMDSv2, egress filtré.",
    why: "C'est la faille derrière le breach Capital One ; tout back-end qui implémente des webhooks devrait avoir ce modèle de menace en tête.",
    doc: 'https://portswigger.net/web-security/ssrf',
  },
]
