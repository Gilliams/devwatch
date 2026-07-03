export default [
  {
    level: 'inter',
    q: "Quelle est la différence entre `==` et `===` face à `0 == 'foo'` en PHP 8 ?",
    choices: [
      "`0 == 'foo'` vaut true car 'foo' est casté en 0",
      "`0 == 'foo'` vaut false : depuis PHP 8, c'est la string non numérique qui pilote la comparaison",
      "Les deux lèvent une TypeError en PHP 8",
      "`0 == 'foo'` vaut true uniquement en mode strict_types",
    ],
    answer: 1,
    explain:
      "PHP 8 a changé la sémantique des comparaisons lâches : quand on compare un int à une string **non numérique**, l'int est converti en string (et non l'inverse). `0 == 'foo'` → `'0' == 'foo'` → false. En PHP 7, c'était true, source de failles classiques (ex : comparaison de hash).",
  },
  {
    level: 'inter',
    q: 'Que fait `declare(strict_types=1)` ?',
    choices: [
      'Il force le typage strict dans tout le projet',
      'Il force le typage strict des arguments/retours pour les appels faits depuis CE fichier',
      'Il désactive le juggling de types dans les comparaisons ==',
      'Il rend toutes les propriétés de classes typées obligatoires',
    ],
    answer: 1,
    explain:
      "strict_types s'applique **au fichier appelant** : c'est le fichier où l'appel de fonction est écrit qui décide si les scalaires sont coercés ou non. Il n'a aucun effet sur `==` ni de portée projet.",
  },
  {
    level: 'inter',
    q: "Quelle est la différence entre `self::` et `static::` ?",
    choices: [
      'Aucune, static:: est un alias moderne',
      'self:: référence la classe où le code est écrit, static:: la classe réellement appelée (late static binding)',
      'static:: ne fonctionne que sur les méthodes statiques',
      'self:: est résolu au runtime, static:: à la compilation',
    ],
    answer: 1,
    explain:
      "`static::` utilise le *late static binding* : dans une méthode héritée, `static::create()` appellera la méthode de la classe enfant réellement utilisée, alors que `self::create()` restera figé sur la classe parente. Crucial pour les factory methods et les patterns type ActiveRecord.",
  },
  {
    level: 'avance',
    q: "Que renvoie ce code ?\n```php\nfunction gen() { yield 1; yield 2; return 3; }\n$g = gen();\nforeach ($g as $v) {}\necho $g->getReturn();\n```",
    choices: ['1', '2', '3', 'Une exception : un generator ne peut pas utiliser return'],
    answer: 2,
    explain:
      "Depuis PHP 7, un generator peut avoir une valeur de `return`, récupérable via `getReturn()` **après épuisement** du generator. Le foreach consomme les yields (1 et 2), puis getReturn() renvoie 3. Appelé avant la fin, getReturn() lèverait une exception.",
  },
  {
    level: 'avance',
    q: 'Quel est le comportement des propriétés readonly (PHP 8.1+) ?',
    choices: [
      "Elles ne peuvent être écrites qu'une seule fois, depuis n'importe où",
      "Elles ne peuvent être initialisées qu'une fois, et uniquement depuis le scope de la classe",
      'Elles sont immuables même via la réflexion et le clonage',
      'Elles doivent obligatoirement être initialisées dans le constructeur',
    ],
    answer: 1,
    explain:
      "Une propriété readonly est initialisable **une seule fois et depuis le scope de la classe** (constructeur, setter interne...). Depuis PHP 8.3, `clone` peut les réécrire dans __clone(). Attention : readonly ≠ immutabilité profonde, un objet contenu reste mutable.",
  },
  {
    level: 'avance',
    q: "Différence entre les attributs `#[Attribute]` PHP 8 et les annotations Doctrine `@Annotation` ?",
    choices: [
      "Aucune différence fonctionnelle, juste la syntaxe",
      "Les attributs sont natifs, validés à la compilation du fichier et lus via Reflection sans parser de docblocks",
      'Les attributs ne peuvent pas prendre de paramètres',
      'Les annotations sont plus rapides car mises en cache',
    ],
    answer: 1,
    explain:
      "Les attributs PHP 8 font partie du langage : syntaxe vérifiée par le parseur, lecture via `ReflectionClass::getAttributes()`, autocomplétion IDE native, pas de lib externe. Les annotations Doctrine étaient de simples docblocks parsés au runtime par doctrine/annotations (aujourd'hui déprécié).",
  },
  {
    level: 'avance',
    q: "Que produit ce code ?\n```php\n$a = [1, 2, 3];\n$b = $a;\n$b[] = 4;\necho count($a);\n```\nEt pourquoi ?",
    choices: [
      '4, car les tableaux sont passés par référence',
      '3, car PHP copie le tableau immédiatement à l\'affectation',
      "3, grâce au copy-on-write : la copie réelle n'a lieu qu'à la modification de $b",
      '4, car $b pointe vers la même zval que $a',
    ],
    answer: 2,
    explain:
      "PHP utilise le **copy-on-write** : `$b = $a` ne copie rien (refcount++ sur la même zval). Ce n'est qu'au moment où `$b` est modifié que PHP duplique réellement le tableau. `$a` reste donc à 3 éléments. C'est pour ça que passer de gros tableaux en lecture seule est peu coûteux.",
  },
  {
    level: 'expert',
    q: 'À quoi sert `WeakMap` (PHP 8) par rapport à `SplObjectStorage` ?',
    choices: [
      'WeakMap est simplement plus rapide',
      "WeakMap ne retient pas ses clés : si l'objet-clé n'est plus référencé ailleurs, il est garbage-collecté et l'entrée disparaît",
      'WeakMap accepte des scalaires comme clés',
      'WeakMap est thread-safe contrairement à SplObjectStorage',
    ],
    answer: 1,
    explain:
      "Une WeakMap tient des **références faibles** sur ses clés : elle n'empêche pas le GC de détruire l'objet. Idéal pour des caches ou métadonnées associés à des entités (ex : dans un ORM) sans créer de fuite mémoire. SplObjectStorage, lui, garde l'objet vivant.",
  },
  {
    level: 'expert',
    q: "Dans quel cas les Fibers (PHP 8.1) sont-elles utiles ?",
    choices: [
      'Pour faire du vrai multi-threading en PHP',
      "Pour interrompre/reprendre une pile d'exécution complète, ce qui permet aux frameworks async (Revolt/AMPHP) d'offrir des API synchrones",
      'Pour paralléliser automatiquement les requêtes SQL',
      'Elles remplacent les generators pour itérer de gros volumes',
    ],
    answer: 1,
    explain:
      "Une Fiber suspend **toute une pile d'appels** (contrairement à yield qui ne suspend que la fonction courante). Ça ne crée aucun thread : c'est de la concurrence coopérative. AMPHP 3 / Revolt s'en servent pour masquer l'event loop derrière du code d'apparence synchrone.",
  },
  {
    level: 'expert',
    q: "OPcache preloading : quelle affirmation est vraie ?",
    choices: [
      'Le preloading recharge les classes à chaque requête depuis le cache disque',
      'Les classes préchargées vivent en mémoire partagée et survivent aux requêtes, mais tout changement exige un redémarrage de PHP-FPM',
      "Le preloading fonctionne aussi en CLI, ce qui accélère les commandes Symfony",
      'Le preloading remplace complètement Composer autoload',
    ],
    answer: 1,
    explain:
      "`opcache.preload` compile et lie les classes une fois au démarrage du process ; elles restent disponibles pour toutes les requêtes comme des classes internes. Contrepartie : un déploiement nécessite un restart FPM, et ça ne s'applique pas au CLI. Symfony génère un fichier de preload adapté.",
  },
]
