// Agrège les flux RSS déclarés dans scripts/feeds.json vers public/data/articles.json
// Lancé toutes les 6 h par .github/workflows/veille.yml (ou en local : npm run fetch-feeds)
import Parser from 'rss-parser'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { feeds } = JSON.parse(readFileSync(join(root, 'scripts/feeds.json'), 'utf8'))

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'DevWatch/1.0 (veille perso)' },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
})
const MAX_PER_FEED = 8
const MAX_AGE_DAYS = 45

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

// Image de preview : enclosure RSS, media:content/thumbnail, ou premier <img> du contenu
function extractImage(item) {
  const enc = item.enclosure
  if (enc?.url && /image|\.(png|jpe?g|webp|gif)([?#]|$)/i.test(enc.type || enc.url)) return enc.url
  const mc = (item.mediaContent || []).find((m) => m?.$?.url && (m.$.medium === 'image' || /image/.test(m.$.type || '') || /\.(png|jpe?g|webp|gif)/i.test(m.$.url)))
  if (mc) return mc.$.url
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url
  const html = item.contentEncoded || item['content:encoded'] || item.content || ''
  const m = String(html).match(/<img[^>]+src=["']([^"']+)["']/i)
  if (m && /^https?:\/\//.test(m[1])) return m[1]
  return null
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
        image: extractImage(item),
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
