# 🧠 DevWatch — Veille · Quiz · Enquêtes SQL

Application web personnelle qui concentre trois outils :

- **📡 Veille technologique** — agrégation automatique de flux RSS (PHP, Symfony, VueJS, Laravel, Sécurité, IA, FrontEnd, 3D, Bases de données, DevOps, Design Patterns, Drupal…) toutes les 6 h via GitHub Actions.
- **🎯 Quiz de révision** — 60+ questions back-end (niveau intermédiaire → expert) avec explications, pilotées par une **répétition espacée façon courbe d'Ebbinghaus** : un thème réussi à ≥ 80 % s'espace (1 → 3 → 7 → 14 → 30 → 60 → 120 jours), un thème raté (< 60 %) revient dès le lendemain.
- **🕵️ Enquêtes SQL** — trois affaires criminelles à résoudre en vraies requêtes SQL (SQLite dans le navigateur via sql.js) : jointures, agrégations, jointures temporelles, CTE récursives. Indices progressifs si tu bloques, requêtes solutions commentées.

Le tout est **hébergé gratuitement sur GitHub** (Pages + Actions), avec **rappels par mail** chaque matin quand des thèmes sont dus.

## 🚀 Démarrage local

```bash
npm install
npm run dev          # http://localhost:5173
npm run fetch-feeds  # remplit public/data/articles.json avec la veille
```

## ☁️ Mise en ligne sur GitHub (une seule fois)

1. **Crée un repo** (public ou privé) et pousse le code :
   ```bash
   git init -b main
   git add . && git commit -m "feat: DevWatch initial"
   git remote add origin https://github.com/<ton-pseudo>/devwatch.git
   git push -u origin main
   ```
2. **Active GitHub Pages** : repo → *Settings* → *Pages* → *Source* : **GitHub Actions**.
   Le workflow `deploy.yml` construit et publie le site à chaque push.
   L'appli sera sur `https://<ton-pseudo>.github.io/devwatch/`.
3. **La veille RSS** (`veille.yml`) tourne toutes les 6 h et commite `public/data/articles.json`
   (ce qui redéploie le site). Tu peux la lancer à la main : onglet *Actions* → *Veille RSS* → *Run workflow*.

## 📧 Rappels par mail (Ebbinghaus)

Le workflow `reminders.yml` tourne chaque matin à 7 h (Paris) : il lit `progress/progress.json`
(synchronisé par l'appli) et t'envoie la liste des thèmes à réviser.

1. **Secrets du repo** (*Settings* → *Secrets and variables* → *Actions* → *New repository secret*) :

   | Secret      | Valeur (exemple Gmail)                          |
   |-------------|--------------------------------------------------|
   | `SMTP_HOST` | `smtp.gmail.com`                                 |
   | `SMTP_PORT` | `465`                                            |
   | `SMTP_USER` | `toi@gmail.com`                                  |
   | `SMTP_PASS` | un [mot de passe d'application](https://myaccount.google.com/apppasswords) (pas ton mot de passe Gmail !) |
   | `MAIL_TO`   | `toi@gmail.com`                                  |

   Optionnel : une *variable* `APP_URL` avec l'URL de ton appli pour avoir le lien dans le mail.
2. **Synchronise ta progression** : dans l'appli → *Paramètres* → renseigne owner/repo/branche
   et un **token fine-grained** limité à ce repo (permission *Contents : Read and write*).
   Après chaque quiz, la progression est poussée automatiquement dans `progress/progress.json`.
3. Teste : onglet *Actions* → *Rappels Ebbinghaus par mail* → *Run workflow*.

> Le token GitHub reste uniquement dans le localStorage de **ton** navigateur ; il n'est jamais
> commité. Les identifiants SMTP vivent uniquement dans les secrets GitHub.

## 🗂️ Structure

```
src/
  views/            # Dashboard, Veille, Quiz, QuizSession, Sql, SqlCase, Settings
  data/questions/   # Banques de questions par thème (ajoute les tiennes !)
  data/sqlCases/    # Les enquêtes SQL (schéma + données + étapes + indices)
  lib/spaced.js     # Logique de répétition espacée (Ebbinghaus)
  lib/github.js     # Sync progression → repo GitHub
  lib/sqlEngine.js  # SQLite navigateur (sql.js)
scripts/
  feeds.json        # Sources RSS par thème (personnalise librement)
  fetch-feeds.mjs   # Agrégateur RSS → public/data/articles.json
  send-reminders.mjs# Mail quotidien des thèmes dus
.github/workflows/  # deploy.yml · veille.yml · reminders.yml
```

## ✍️ Personnaliser

- **Ajouter des questions** : édite `src/data/questions/<theme>.js` (format : question, 4 choix,
  index de la bonne réponse, explication, niveau `inter|avance|expert`).
- **Ajouter un flux RSS** : une ligne dans `scripts/feeds.json`.
- **Ajouter une enquête SQL** : copie un fichier de `src/data/sqlCases/`, déclare-le dans `index.js`.
- **Changer les intervalles Ebbinghaus** : `INTERVALS_DAYS` dans `src/lib/spaced.js`
  (et l'heure du mail dans `reminders.yml`).
