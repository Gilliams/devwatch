// Agrège les flux RSS déclarés dans scripts/feeds.json vers public/data/articles.json
// Lancé toutes les 6 h par .github/workflows/veille.yml (ou en local : npm run fetch-feeds)
import Parser from 'rss-parser'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { feeds } = JSON.parse(readFileSync(join(root, 'scripts/feeds.json'), 'utf8'))

const parser = new Parser({ timeout: 15000, headers: { 'User-Agent': 'DevWatch/1.0 (veille perso)' } })
const MAX_PER_FEED = 8
const MAX_AGE_DAYS = 45

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

const articles = []
for (const feed of feeds) {
  try {
    const parsed = await parser.parseURL(feed.url)
    for (const item of (parsed.items || []).slice(0, MAX_PER_FEED)) {
      const date = item.isoDate || item.pubDate || new Date().toISOString()
      const ageDays = (Date.now() - new Date(date).getTime()) / 86400000
      if (ageDays > MAX_AGE_DAYS) continue
      articles.push({
        title: (item.title || 'Sans titre').trim(),
        link: item.link,
        date,
        theme: feed.theme,
        themeName: feed.themeName,
        source: feed.source,
        summary: stripHtml(item.contentSnippet || item.summary || '').slice(0, 220),
      })
    }
    console.log(`✔ ${feed.source} (${parsed.items?.length ?? 0} items)`)
  } catch (e) {
    console.warn(`✖ ${feed.source} : ${e.message}`)
  }
}

articles.sort((a, b) => new Date(b.date) - new Date(a.date))

const outDir = join(root, 'public/data')
mkdirSync(outDir, { recursive: true })
writeFileSync(
  join(outDir, 'articles.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), articles }, null, 1)
)
console.log(`\n${articles.length} articles écrits dans public/data/articles.json`)
