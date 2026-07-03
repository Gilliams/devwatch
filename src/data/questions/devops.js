export default [
  {
    level: 'inter',
    q: 'Dockerfile PHP : pourquoi copier `composer.json` + `composer.lock` et lancer `composer install` AVANT de copier le reste du code ?',
    choices: [
      "Composer refuse d'installer si le code applicatif est déjà présent, pour ne pas écraser le dossier vendor/",
      "Cache de layers : tant que composer.json/lock ne changent pas, l'étape d'installation est réutilisée telle quelle",
      'Les permissions du dossier vendor/ doivent être posées avant la copie du code pour rester exécutables en root',
      "Convention héritée des images officielles PHP, sans impact réel depuis l'arrivée de BuildKit et son cache",
    ],
    answer: 1,
    explain:
      "Docker invalide le cache d'un layer dès qu'un fichier copié change. En copiant d'abord uniquement composer.json/lock, un changement de code source ne relance pas le `composer install` (l'étape la plus longue). Même logique avec package.json côté front.",
    why: "Passer un build CI de 6 minutes à 40 secondes juste en ordonnant les COPY : le gain le plus rentable du Dockerfile.",
    doc: 'https://docs.docker.com/build/cache/',
  },
  {
    level: 'inter',
    q: 'Différence entre `CMD` et `ENTRYPOINT` dans un Dockerfile ?',
    choices: [
      "CMD s'exécute au moment du build de l'image, ENTRYPOINT au démarrage de chaque conteneur",
      "ENTRYPOINT définit l'exécutable fixe du conteneur ; CMD fournit les arguments par défaut, remplaçables au docker run",
      'ENTRYPOINT est déprécié depuis Compose v2 au profit de la clé command des fichiers compose.yaml',
      'Les CMD multiples s\'exécutent en séquence, ce qui permet de chaîner les migrations puis le serveur',
    ],
    answer: 1,
    explain:
      "Pattern courant : `ENTRYPOINT [\"docker-entrypoint.sh\"]` (attente DB, migrations) et `CMD [\"php-fpm\"]`. `docker run image bash` remplace le CMD mais passe toujours par l'entrypoint. Seul le dernier CMD du Dockerfile compte.",
    why: "Le duo entrypoint.sh + CMD est le standard des conteneurs PHP en production — à savoir expliquer sans hésiter.",
    doc: 'https://docs.docker.com/reference/dockerfile/#entrypoint',
  },
  {
    level: 'avance',
    q: 'Votre pipeline déploie et les utilisateurs voient des 502 pendant ~30 s. Quelle stratégie élimine le problème ?',
    choices: [
      "Allonger le timeout de Nginx au-delà de la durée du redémarrage pour que les requêtes patientent en file",
      'Blue-green ou rolling avec healthchecks : le trafic ne bascule que vers une version prête, rollback instantané',
      'Déployer pendant les heures creuses avec une page de maintenance affichée automatiquement par le load balancer',
      "Précharger l'OPcache avant le restart afin de réduire la fenêtre d'indisponibilité à quelques millisecondes",
    ],
    answer: 1,
    explain:
      "Le 502 vient du redémarrage du process pendant que le trafic arrive. En blue-green, on démarre l'environnement « green », on vérifie sa santé, puis on bascule le load balancer. En rolling (Kubernetes), les pods sont remplacés progressivement avec readinessProbe.",
    why: "Le zéro-downtime est une exigence standard ; savoir dérouler le mécanisme (healthcheck → bascule → rollback) compte autant que l'outillage.",
    doc: 'https://martinfowler.com/bliki/BlueGreenDeployment.html',
  },
  {
    level: 'avance',
    q: 'Kubernetes : que garantit une probe **readiness** par rapport à une **liveness** ?',
    choices: [
      'Liveness surveille la consommation CPU/RAM du pod, readiness la latence des requêtes entrantes',
      'Readiness : apte à recevoir du trafic (retiré du service sinon) ; liveness : vivant (tué et redémarré sinon)',
      "Readiness n'est évaluée qu'au démarrage du pod ; liveness prend le relais en continu ensuite",
      'Ce sont des alias : les deux probes déclenchent un redémarrage du pod après failureThreshold échecs',
    ],
    answer: 1,
    explain:
      "Confondre les deux cause des incidents : un liveness qui teste la DB fera redémarrer TOUS les pods en boucle quand la DB a un souci. La dépendance externe se teste dans la readiness (on cesse de servir) ; le liveness ne teste que le process lui-même.",
    why: "L'anti-pattern « DB dans le liveness » transforme un incident mineur en panne totale en cascade — grand classique des post-mortems.",
    doc: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/',
  },
  {
    level: 'avance',
    q: "Secrets en variables d'environnement plutôt que dans le code : pourquoi, et quelle limite ?",
    choices: [
      "Les env vars sont chiffrées par le kernel Linux et déchiffrées à la volée par le runtime PHP, donc aucune limite",
      'Hors du VCS (12-factor) mais lisibles via phpinfo(), /proc ou docker inspect : un vault + rotation reste préférable',
      "C'est la recommandation finale de l'ANSSI pour les applications conteneurisées, sans réserve particulière",
      'Leur seule limite est la taille maximale (128 Ko par process), gênante pour les clés privées au format PEM',
    ],
    answer: 1,
    explain:
      "Les env vars évitent le pire (secret commité) mais fuient facilement : dump phpinfo(), stack traces, `docker inspect`, process enfants. Les coffres (Vault, secrets managers, secrets Symfony chiffrés) ajoutent chiffrement au repos, contrôle d'accès, audit et rotation.",
    why: "Un phpinfo() oublié qui expose DATABASE_URL, ça arrive vraiment — et `symfony secrets:set` répond au besoin sans infra supplémentaire.",
    doc: 'https://symfony.com/doc/current/configuration/secrets.html',
  },
  {
    level: 'expert',
    q: 'PHP-FPM sature : `server reached pm.max_children`. Quelle analyse est la bonne ?',
    choices: [
      'Augmenter max_children au maximum : les workers inactifs ne coûtent quasiment rien grâce au copy-on-write de fork()',
      'max_children = RAM / RSS par worker ; si la lenteur vient des I/O, augmenter déplace la pression — réduire le temps par requête d\'abord',
      'Basculer pm en mode ondemand : la limite disparaît puisque les workers sont créés à la demande selon le trafic',
      'C\'est le symptôme d\'une fuite mémoire PHP : abaisser pm.max_requests suffit à faire disparaître l\'alerte',
    ],
    answer: 1,
    explain:
      "max_children plafonne la concurrence. Calcul de base : RAM allouable ÷ RSS moyen d'un worker. Mais si chaque requête passe 800 ms à attendre la DB, doubler les workers double la pression sur la DB. Les vrais leviers : profiler, cache, requêtes SQL, déport en file — puis dimensionner.",
    why: "Dimensionner FPM en identifiant le vrai goulot (souvent la DB) est LA compétence perf back-end qu'on sonde en entretien.",
    doc: 'https://www.php.net/manual/fr/install.fpm.configuration.php',
  },
]
