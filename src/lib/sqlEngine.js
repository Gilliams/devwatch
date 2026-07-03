// Moteur SQLite dans le navigateur via sql.js (WASM), chargé depuis un CDN.
const SQLJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js'
const WASM_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/'

let sqlJsPromise = null

function loadSqlJs() {
  if (sqlJsPromise) return sqlJsPromise
  sqlJsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SQLJS_URL
    script.onload = () => {
      window
        .initSqlJs({ locateFile: (f) => WASM_BASE + f })
        .then(resolve, reject)
    }
    script.onerror = () => reject(new Error('Impossible de charger sql.js — vérifie ta connexion internet.'))
    document.head.appendChild(script)
  })
  return sqlJsPromise
}

export async function createDatabase(setupSql) {
  const SQL = await loadSqlJs()
  const db = new SQL.Database()
  db.run(setupSql)
  return db
}

// Exécute une requête et renvoie { columns, rows } ou { error }
export function runQuery(db, sql) {
  try {
    const results = db.exec(sql)
    if (!results.length) return { columns: [], rows: [], empty: true }
    const { columns, values } = results[results.length - 1]
    return { columns, rows: values }
  } catch (e) {
    return { error: e.message }
  }
}

// Liste les tables et leurs colonnes pour l'explorateur de schéma
export function describeSchema(db) {
  const tables = []
  const res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
  if (!res.length) return tables
  for (const [name] of res[0].values) {
    const info = db.exec(`PRAGMA table_info(${name})`)
    const columns = info.length ? info[0].values.map((r) => ({ name: r[1], type: r[2] })) : []
    const count = db.exec(`SELECT COUNT(*) FROM ${name}`)[0].values[0][0]
    tables.push({ name, columns, count })
  }
  return tables
}
