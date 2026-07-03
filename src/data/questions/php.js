export default [
  {
    level: 'inter',
    q: "Que vaut `0 == 'foo'` en PHP 8, et pourquoi ?",
    choices: [
      "true : la chaîne 'foo' est convertie en 0 par le type juggling, comme dans toutes les versions de PHP jusqu'ici",
      "false : PHP 8 convertit désormais l'int en string quand l'autre opérande n'est pas numérique, donc '0' == 'foo'",
      "Une TypeError est levée : PHP 8 interdit la comparaison lâche entre types incompatibles sans cast explicite",
      "true, sauf si le fichier déclare strict_types=1, qui étend le typage strict aux opérateurs de comparaison",
    ],
    answer: 1,
    explain:
      "PHP 8 a changé la sémantique des comparaisons lâches : face à une string **non numérique**, c'est l'int qui est converti en string (et non l'inverse). `0 == 'foo'` → `'0' == 'foo'` → false. En PHP 7, c'était true.",
    why: "Failles historiques de comparaison (magic hashes `'0e123…' == '0'`) et code legacy qui casse à la migration : c'est LA question piège des entretiens PHP 8.",
    doc: 'https://www.php.net/manual/fr/language.operators.comparison.php',
  },
  {
    level: 'inter',
    q: 'Que fait `declare(strict_types=1)` ?',
    choices: [
      "Il active le typage strict pour tout le projet dès qu'un seul fichier le déclare, d'où son placement dans index.php",
      "Il désactive le type juggling des comparaisons == et impose l'usage systématique de === dans le fichier",
      'Il force le respect strict des types scalaires pour les appels de fonctions écrits dans CE fichier (côté appelant)',
      'Il rend obligatoire la déclaration de types sur toutes les fonctions du fichier, arguments comme valeurs de retour',
    ],
    answer: 2,
    explain:
      "strict_types s'applique **au fichier appelant** : c'est là où l'appel est écrit que PHP décide de coercer ou non les scalaires. Aucun effet sur `==`, aucune portée projet.",
    why: "Mal compris, le « côté appelant » produit des bugs de coercion silencieux ('5' accepté pour un int) découverts en prod.",
    doc: 'https://www.php.net/manual/fr/language.types.declarations.php',
  },
  {
    level: 'inter',
    q: 'Quelle est la différence entre `self::` et `static::` ?',
    choices: [
      "self:: est résolu au runtime alors que static:: est figé à la compilation, d'où un léger surcoût de self::",
      'static:: ne peut être employé que dans des méthodes déclarées static, self:: fonctionne partout ailleurs',
      'Aucune depuis PHP 8 : static:: est simplement l\'écriture moderne recommandée par les standards PSR-12',
      'self:: cible la classe où le code est écrit, static:: la classe réellement appelée (late static binding)',
    ],
    answer: 3,
    explain:
      "`static::` utilise le *late static binding* : dans une méthode héritée, `static::create()` appelle la version de la classe enfant réellement utilisée, alors que `self::` reste figé sur la classe où le code est défini.",
    why: "Indispensable pour les factory methods héritées : un `new self()` mal placé renvoie la classe parente au lieu de l'enfant — bug subtil et classique.",
    doc: 'https://www.php.net/manual/fr/language.oop5.late-static-bindings.php',
  },
  {
    level: 'avance',
    q: "Que renvoie ce code ?\n```php\nfunction gen() { yield 1; yield 2; return 3; }\n$g = gen();\nforeach ($g as $v) {}\necho $g->getReturn();\n```",
    choices: [
      '1, car getReturn() renvoie la première valeur produite par le generator une fois celui-ci consommé',
      '2, car getReturn() renvoie la dernière valeur yield-ée après épuisement complet du generator',
      '3, car un generator peut retourner une valeur finale, récupérable via getReturn() après épuisement',
      'Une exception : return avec valeur est interdit dans un generator, seul un return nu est autorisé',
    ],
    answer: 2,
    explain:
      "Depuis PHP 7, un generator peut avoir une valeur de `return`, récupérable via `getReturn()` **après épuisement**. Le foreach consomme les yields (1 et 2), puis getReturn() renvoie 3. Appelé avant la fin, il lèverait une exception.",
    why: "Pattern utile pour renvoyer un bilan après un traitement en flux (ex : nombre de lignes importées) sans sacrifier le streaming mémoire.",
    doc: 'https://www.php.net/manual/fr/generator.getreturn.php',
  },
  {
    level: 'avance',
    q: 'Quel est le comportement exact des propriétés readonly (PHP 8.1+) ?',
    choices: [
      "Écrites une seule fois, depuis n'importe quel scope, ce qui permet l'hydratation par un ORM ou un serializer externe",
      "Initialisables une seule fois, et uniquement depuis le scope de la classe qui les déclare",
      "Immuables au point d'interdire aussi le clonage et toute modification via l'API de réflexion",
      'Obligatoirement initialisées dans le constructeur, sans quoi une erreur est levée au chargement de la classe',
    ],
    answer: 1,
    explain:
      "Une propriété readonly s'initialise **une seule fois et depuis le scope de la classe** (constructeur, méthode interne). Depuis PHP 8.3, `__clone()` peut les réécrire. Attention : readonly ≠ immutabilité profonde, un objet contenu reste mutable.",
    why: "Les value objects immuables (constructor promotion + readonly) sont devenus le standard des DTO ; en connaître les limites évite un faux sentiment de sécurité.",
    doc: 'https://www.php.net/manual/fr/language.oop5.properties.php#language.oop5.properties.readonly-properties',
  },
  {
    level: 'avance',
    q: 'Attributs PHP 8 `#[Attribute]` vs annotations Doctrine `@Annotation` : quelle différence de fond ?',
    choices: [
      'Les annotations restent plus rapides car doctrine/annotations les met en cache, contrairement à la Reflection',
      'Les attributs sont limités aux classes et méthodes ; les annotations couvrent aussi propriétés et paramètres',
      'Natifs au langage : syntaxe validée par le parseur, lecture via Reflection, sans lib externe ni parsing de docblock',
      "Différence purement cosmétique : #[...] est compilé vers @Annotation pour préserver la compatibilité",
    ],
    answer: 2,
    explain:
      "Les attributs font partie du langage : erreurs de syntaxe détectées au parsing, lecture par `ReflectionClass::getAttributes()`, autocomplétion IDE. Les annotations n'étaient que des docblocks parsés au runtime par doctrine/annotations, aujourd'hui déprécié.",
    why: "Symfony et Doctrine ont migré routes, mapping et configuration vers les attributs — un projet moderne n'utilise plus d'annotations.",
    doc: 'https://www.php.net/manual/fr/language.attributes.overview.php',
  },
  {
    level: 'avance',
    q: "Que produit ce code, et pourquoi ?\n```php\n$a = [1, 2, 3];\n$b = $a;\n$b[] = 4;\necho count($a);\n```",
    choices: [
      '4 : les tableaux sont des objets passés par référence, $a et $b pointent donc la même structure interne',
      '3 : PHP copie physiquement tout le tableau au moment de l\'affectation $b = $a, comme en C',
      "3 : copy-on-write — l'affectation partage la zval, la copie réelle n'a lieu qu'à la modification de $b",
      "4 : $b[] écrit dans la zval partagée tant qu'un unset($a) n'a pas détaché les deux variables",
    ],
    answer: 2,
    explain:
      "PHP utilise le **copy-on-write** : `$b = $a` ne copie rien (refcount++ sur la même zval). Ce n'est qu'à la modification de `$b` que PHP duplique le tableau. `$a` reste donc à 3 éléments.",
    why: "Comprendre le COW évite les fausses optimisations : passer un gros tableau par référence « pour la perf » est souvent inutile, voire contre-productif.",
    doc: 'https://www.php.net/manual/fr/features.gc.refcounting-basics.php',
  },
  {
    level: 'expert',
    q: 'À quoi sert `WeakMap` (PHP 8) par rapport à `SplObjectStorage` ?',
    choices: [
      "WeakMap est thread-safe et conçu pour partager des données entre workers, SplObjectStorage ne l'est pas",
      'WeakMap accepte des scalaires comme clés alors que SplObjectStorage exige impérativement des objets',
      'WeakMap est simplement la réécriture moderne et plus performante de SplObjectStorage, désormais déprécié',
      "WeakMap ne retient pas ses clés : un objet-clé sans autre référence est garbage-collecté et son entrée disparaît",
    ],
    answer: 3,
    explain:
      "Une WeakMap tient des **références faibles** : elle n'empêche pas le GC de détruire l'objet-clé, et l'entrée disparaît alors automatiquement. SplObjectStorage, lui, garde l'objet vivant.",
    why: "C'est l'outil anti-fuite mémoire pour associer caches ou métadonnées à des objets dans les process longs (workers Messenger, ORM).",
    doc: 'https://www.php.net/manual/fr/class.weakmap.php',
  },
  {
    level: 'expert',
    q: 'Dans quel cas les Fibers (PHP 8.1) sont-elles réellement utiles ?',
    choices: [
      'Elles créent de vrais threads légers gérés par la VM PHP, permettant du calcul parallèle sur plusieurs cœurs',
      "Elles suspendent une pile d'appels complète — la base des frameworks async (Revolt/AMPHP) aux API synchrones",
      'Elles remplacent les generators pour itérer de gros volumes avec une empreinte mémoire réduite de moitié',
      'Elles parallélisent automatiquement les I/O bloquantes (SQL, HTTP) sans modification du code appelant',
    ],
    answer: 1,
    explain:
      "Une Fiber suspend **toute une pile d'appels** (yield ne suspend que la fonction courante). Aucun thread créé : c'est de la concurrence coopérative, exploitée par Revolt/AMPHP pour masquer l'event loop derrière du code d'apparence synchrone.",
    why: "Savoir que PHP n'a PAS de threads natifs et situer les Fibers (concurrence ≠ parallélisme) est un excellent discriminant de séniorité en entretien.",
    doc: 'https://www.php.net/manual/fr/language.fibers.php',
  },
  {
    level: 'expert',
    q: 'OPcache preloading : quelle affirmation est vraie ?',
    choices: [
      'Les classes préchargées sont relues depuis le cache disque OPcache à chaque requête, économisant le parsing',
      'Le preloading s\'applique aussi au CLI, ce qui accélère sensiblement le démarrage des commandes console',
      'Chargées une fois en mémoire partagée comme des classes internes ; tout changement impose un restart de PHP-FPM',
      "Il remplace l'autoload Composer : les classes préchargées ne passent plus par le class loader ni par PSR-4",
    ],
    answer: 2,
    explain:
      "`opcache.preload` compile et lie les classes au démarrage du process ; elles restent disponibles pour toutes les requêtes. Contrepartie : un déploiement nécessite un restart FPM, et ça ne s'applique pas au CLI.",
    why: "Optimisation de prod au gain réel sur les gros frameworks, avec un piège opérationnel : oublier le restart FPM = vieux code servi après déploiement.",
    doc: 'https://www.php.net/manual/fr/opcache.preloading.php',
  },
]
