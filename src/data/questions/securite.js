export default [
  {
    level: 'inter',
    q: "Pourquoi les requêtes préparées empêchent-elles l'injection SQL ?",
    choices: [
      'Elles échappent les quotes automatiquement',
      "La requête (structure) et les données sont envoyées séparément au moteur : les valeurs ne sont jamais interprétées comme du SQL",
      'Elles chiffrent les paramètres',
      'Elles limitent la longueur des entrées',
    ],
    answer: 1,
    explain:
      "Avec un prepare, le plan de la requête est figé avant que les valeurs arrivent — `' OR 1=1 --` reste une bête chaîne. L'échappement, lui, est fragile (encodages, contextes). Attention : les identifiants (noms de table/colonne, ORDER BY dynamique) ne sont PAS paramétrables → whitelist obligatoire.",
  },
  {
    level: 'inter',
    q: "Différence entre XSS stocké, réfléchi et DOM-based ?",
    choices: [
      "Stocké : payload persisté en base et servi aux autres ; réfléchi : payload dans l'URL/requête renvoyé dans la réponse ; DOM-based : l'injection se fait côté client via le JS qui manipule le DOM",
      'Le XSS stocké ne concerne que les cookies',
      'Le XSS réfléchi nécessite un accès à la base',
      'Le DOM-based nécessite une faille serveur',
    ],
    answer: 0,
    explain:
      "Trois vecteurs, une même conséquence : exécuter du JS dans le navigateur de la victime. Défenses : échappement contextuel en sortie (Twig auto-échappe, mais gare à `|raw`), Content-Security-Policy, cookies HttpOnly, et côté SPA éviter v-html/innerHTML avec des données non maîtrisées.",
  },
  {
    level: 'avance',
    q: "Un endpoint `GET /api/documents/1234` renvoie le document sans vérifier qu'il appartient à l'utilisateur connecté. Comment s'appelle cette faille ?",
    choices: [
      'CSRF',
      "IDOR (Insecure Direct Object Reference) / Broken Object Level Authorization — n°1 de l'OWASP API Top 10",
      'Injection',
      'Clickjacking',
    ],
    answer: 1,
    explain:
      "L'utilisateur est authentifié mais pas AUTORISÉ sur cette ressource précise : il suffit d'incrémenter l'id pour lire les documents des autres. Parade : contrôle d'autorisation par objet (voter Symfony : `denyAccessUnlessGranted('VIEW', $document)`), et des UUID plutôt que des ids séquentiels pour ne pas faciliter l'énumération (défense en profondeur, pas une correction).",
  },
  {
    level: 'avance',
    q: "Pourquoi `password_hash()` avec bcrypt/argon2 plutôt que SHA-256 salé « maison » ?",
    choices: [
      'SHA-256 est cryptographiquement cassé',
      "bcrypt/argon2 sont volontairement lents et paramétrables en coût (+ mémoire pour argon2), rendant le brute-force massif hors de prix ; SHA-256 se calcule par milliards/seconde sur GPU",
      'password_hash() stocke le mot de passe chiffré réversible',
      "Le sel n'est pas utile avec SHA-256",
    ],
    answer: 1,
    explain:
      "Un hash « rapide » est une qualité pour l'intégrité, un défaut pour les mots de passe. bcrypt/argon2id intègrent le sel, un facteur de coût ajustable dans le temps, et argon2 ajoute un coût mémoire qui neutralise les GPU/ASIC. `password_needs_rehash()` permet de migrer les hashes au fil des connexions. Symfony gère tout ça via le PasswordHasher.",
  },
  {
    level: 'avance',
    q: "Un token CSRF est inutile pour une API stateless authentifiée par header `Authorization: Bearer ...`. Vrai ou faux, et pourquoi ?",
    choices: [
      "Faux, le CSRF menace toutes les API",
      "Vrai : le CSRF exploite l'envoi AUTOMATIQUE de credentials (cookies) par le navigateur ; un header Authorization doit être ajouté explicitement par du JS, ce qu'un site tiers ne peut pas faire grâce à la same-origin policy",
      "Vrai, car les API REST ne sont pas accessibles depuis un navigateur",
      "Faux, le token JWT peut être deviné",
    ],
    answer: 1,
    explain:
      "Le CSRF repose sur le fait que le cookie de session part automatiquement avec toute requête vers le domaine. Si l'authentification exige un header posé par le JS de VOTRE origine, le site attaquant ne peut pas le forger. Mais si votre « API » lit aussi un cookie de session (cas hybride fréquent !), le CSRF redevient d'actualité — d'où SameSite=Lax/Strict en défense complémentaire.",
  },
  {
    level: 'expert',
    q: "Qu'est-ce qu'une attaque SSRF et pourquoi les environnements cloud y sont-ils particulièrement sensibles ?",
    choices: [
      "Un déni de service distribué",
      "Server-Side Request Forgery : faire émettre par le serveur une requête vers une cible interne — en cloud, le metadata endpoint (169.254.169.254) peut livrer des credentials IAM",
      'Une injection dans les headers SMTP',
      'Un vol de session par sniffing',
    ],
    answer: 1,
    explain:
      "Toute fonctionnalité « le serveur va chercher une URL » (webhook, import, aperçu de lien, génération PDF) est un vecteur : l'attaquant fournit `http://169.254.169.254/latest/meta-data/iam/...` ou `http://localhost:6379`. Parades : whitelist de domaines, blocage des IP privées/link-local APRÈS résolution DNS (attention au DNS rebinding), IMDSv2 chez AWS, egress filtré.",
  },
]
