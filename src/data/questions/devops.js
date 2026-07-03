export default [
  {
    level: 'inter',
    q: "Dans un Dockerfile pour une appli PHP, pourquoi copier `composer.json` + `composer.lock` et lancer `composer install` AVANT de copier le reste du code ?",
    choices: [
      'Composer exige que le code soit absent',
      "Pour profiter du cache de layers : tant que les fichiers composer ne changent pas, le layer d'installation des dépendances est réutilisé — seuls les layers suivants sont reconstruits",
      "Pour éviter les conflits de permissions",
      "C'est une convention sans impact",
    ],
    answer: 1,
    explain:
      "Docker invalide le cache d'un layer dès qu'un fichier copié change. En copiant d'abord uniquement composer.json/lock, un simple changement de code source ne relance pas le `composer install` (souvent l'étape la plus longue). Même logique avec package.json côté front.",
  },
  {
    level: 'inter',
    q: "Différence entre `CMD` et `ENTRYPOINT` dans un Dockerfile ?",
    choices: [
      'CMD est exécuté au build, ENTRYPOINT au run',
      "ENTRYPOINT définit l'exécutable fixe du conteneur ; CMD fournit les arguments par défaut, remplaçables via `docker run image autre-commande`",
      'ENTRYPOINT est déprécié',
      'CMD peut apparaître plusieurs fois et tout est exécuté',
    ],
    answer: 1,
    explain:
      "Pattern courant : `ENTRYPOINT [\"docker-entrypoint.sh\"]` (setup : attente DB, migrations...) et `CMD [\"php-fpm\"]` (commande par défaut). `docker run image bash` remplace le CMD mais passe par l'entrypoint. Seul le dernier CMD du Dockerfile compte.",
  },
  {
    level: 'avance',
    q: "Votre pipeline CI déploie et parfois les utilisateurs voient des erreurs 502 pendant ~30 s. Quelle stratégie élimine ce problème ?",
    choices: [
      "Déployer la nuit",
      "Déploiement blue-green ou rolling avec healthchecks : le trafic ne bascule vers la nouvelle version qu'une fois celle-ci prête, l'ancienne reste jusqu'au succès",
      'Augmenter le timeout de Nginx',
      'Mettre une page de maintenance automatique',
    ],
    answer: 1,
    explain:
      "Le 502 vient du redémarrage du process pendant que le trafic arrive. En blue-green, on démarre l'environnement « green », on vérifie sa santé (healthcheck HTTP), puis on bascule le load balancer — rollback instantané en cas de souci. En rolling (Kubernetes), les pods sont remplacés progressivement avec readinessProbe.",
  },
  {
    level: 'avance',
    q: "Que garantit un healthcheck de type **readiness** par rapport à un **liveness** (Kubernetes) ?",
    choices: [
      'Ce sont des synonymes',
      "Readiness : le pod peut recevoir du trafic (sinon retiré du service, sans redémarrage) ; liveness : le pod est vivant (sinon il est tué et redémarré)",
      'Liveness vérifie la RAM, readiness le CPU',
      'Readiness ne concerne que le démarrage',
    ],
    answer: 1,
    explain:
      "Confondre les deux cause des incidents : un liveness qui teste la DB fera redémarrer en boucle tous les pods quand la DB a un souci (aggravation en cascade). La dépendance externe se teste dans la readiness (on cesse de servir), le liveness ne doit tester que le process lui-même.",
  },
  {
    level: 'avance',
    q: "Pourquoi stocker les secrets (DB password, API keys) dans les variables d'environnement plutôt que dans le code, et quelle est la limite de cette approche ?",
    choices: [
      "Aucune limite, c'est parfait",
      "Ça les sort du VCS (12-factor), mais elles restent lisibles via /proc, les logs d'erreur ou phpinfo() : un vault (Hashicorp, secrets manager, secrets Symfony) + rotation reste préférable pour le sensible",
      'Les env vars sont chiffrées par le kernel Linux',
      "C'est uniquement une question de performance",
    ],
    answer: 1,
    explain:
      "Les env vars évitent le pire (secret commité) mais fuient facilement : dump de phpinfo(), stack traces, `docker inspect`, processus enfants. Les coffres à secrets ajoutent chiffrement au repos, contrôle d'accès, audit et rotation. Symfony propose `secrets:set` (chiffrement asymétrique, la clé de déchiffrement seule est à protéger en prod).",
  },
  {
    level: 'expert',
    q: "Votre application PHP-FPM sature (`server reached pm.max_children`). Quelle analyse est la bonne ?",
    choices: [
      'Il faut toujours augmenter max_children au maximum',
      "max_children = RAM disponible / mémoire par worker ; si les workers sont lents à cause d'I/O (DB, APIs), augmenter aveuglément déplace le problème — il faut d'abord réduire le temps par requête ou déporter (cache, async)",
      'Il faut passer en mode ondemand qui supprime la limite',
      "C'est un bug de PHP-FPM",
    ],
    answer: 1,
    explain:
      "max_children plafonne la concurrence. Le calcul de base : RAM allouable ÷ RSS moyen d'un worker. Mais si chaque requête passe 800 ms à attendre la DB, doubler les workers double la pression sur la DB. Les vrais leviers : profiler (Blackfire), cache HTTP/applicatif, requêtes SQL, déport en file Messenger — puis dimensionner FPM.",
  },
]
