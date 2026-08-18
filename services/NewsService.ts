import { NewsItem } from '../types';

// ─── Trusted Sources ───────────────────────────────────────────────────────────
// 1. IRCC official Atom feed (Canada.ca Government API)
const IRCC_FEED =
    'https://api.io.canada.ca/io-server/gc/news/en/v2' +
    '?dept=departmentofcitizenshipandimmigration' +
    '&sort=publishedDate&orderBy=desc&pick=15&format=atom';

// 2. CIC News RSS (leading Canadian immigration news site)
const CIC_NEWS_FEED = 'https://cicnews.com/feed/';

// ─── Fallback data (shown only when ALL network requests fail) ─────────────────
const FALLBACK_NEWS: NewsItem[] = [
    {
        id: 'fallback-001',
        title: 'Check IRCC for the Latest Immigration Updates',
        summary: 'Visit the official IRCC website for the most up-to-date news on Express Entry draws, processing times, and immigration policies.',
        source: 'IRCC',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/news.html',
        publishedAt: new Date(),
        category: 'Official',
    },
    {
        id: 'fallback-002',
        title: 'CIC News — Canadian Immigration News & Updates',
        summary: 'CIC News covers Express Entry draws, PNP streams, processing time changes, and other key immigration developments.',
        source: 'CIC News',
        url: 'https://cicnews.com',
        publishedAt: new Date(Date.now() - 86400000),
        category: 'General',
    },
];

// ─── In-memory cache ───────────────────────────────────────────────────────────
let cache: NewsItem[] | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ─── XML helpers ───────────────────────────────────────────────────────────────

/** Extract the first match of a tag's text/CDATA content. */
function extractTag(xml: string, tag: string): string {
    // Matches <tag>…</tag> or <tag type="…">…</tag>
    const re = new RegExp(`<${tag}(?:[^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const m = xml.match(re);
    if (!m) return '';
    return m[1]
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // unwrap CDATA
        .replace(/<[^>]+>/g, '')                       // strip any inner tags
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

/** Extract the value of an attribute (e.g. href="…") from a tag. */
function extractAttr(xml: string, tag: string, attr: string): string {
    const re = new RegExp(`<${tag}[^>]*?${attr}="([^"]*)"`, 'i');
    const m = xml.match(re);
    return m ? m[1].trim() : '';
}

/** Split an XML string into individual entry/item blocks. */
function splitEntries(xml: string, tagName: 'entry' | 'item'): string[] {
    const re = new RegExp(`<${tagName}[\\s\\S]*?<\\/${tagName}>`, 'gi');
    return xml.match(re) ?? [];
}

/** Map an IRCC feed category term to a friendly label. */
function mapIrccCategory(term: string): string {
    const map: Record<string, string> = {
        'news releases': 'News Release',
        'statements': 'Statement',
        'speeches': 'Speech',
        'backgrounders': 'Backgrounder',
        'media advisories': 'Advisory',
        'readouts': 'Readout',
    };
    return map[term.toLowerCase()] ?? 'IRCC';
}

/** Infer a category from a CIC News title/content string. */
function inferCicCategory(title: string): string {
    const t = title.toLowerCase();
    if (t.includes('express entry')) return 'Express Entry';
    if (t.includes('pnp') || t.includes('provincial nominee')) return 'Provincial';
    if (t.includes('study permit') || t.includes('student')) return 'Study';
    if (t.includes('work permit')) return 'Work Permit';
    if (t.includes('citizenship')) return 'Citizenship';
    if (t.includes('processing time')) return 'Processing';
    if (t.includes('family') || t.includes('sponsorship')) return 'Family';
    if (t.includes('crs') || t.includes('score')) return 'Express Entry';
    return 'Immigration';
}

// ─── Feed parsers ──────────────────────────────────────────────────────────────

async function fetchIrccNews(): Promise<NewsItem[]> {
    const res = await fetch(IRCC_FEED, { headers: { Accept: 'application/atom+xml, application/xml, text/xml' } });
    const xml = await res.text();

    return splitEntries(xml, 'entry').map((entry, i) => {
        const title = extractTag(entry, 'title');
        const summary = extractTag(entry, 'summary') || extractTag(entry, 'content');
        const url = extractAttr(entry, 'link', 'href') || extractTag(entry, 'id');
        const updated = extractTag(entry, 'updated');
        const catTerm = extractAttr(entry, 'category', 'term');

        return {
            id: `ircc-${i}-${Date.now()}`,
            title,
            summary,
            source: 'IRCC',
            url,
            publishedAt: updated ? new Date(updated) : new Date(),
            category: mapIrccCategory(catTerm),
        } satisfies NewsItem;
    }).filter(n => n.title.length > 0);
}

async function fetchCicNews(): Promise<NewsItem[]> {
    const res = await fetch(CIC_NEWS_FEED, { headers: { Accept: 'application/rss+xml, application/xml, text/xml' } });
    const xml = await res.text();

    return splitEntries(xml, 'item').map((item, i) => {
        const title = extractTag(item, 'title');
        const summary = extractTag(item, 'description') || extractTag(item, 'content:encoded');
        const url = extractTag(item, 'link') || extractTag(item, 'guid');
        const pubDate = extractTag(item, 'pubDate');

        return {
            id: `cic-${i}-${Date.now()}`,
            title,
            summary: summary.substring(0, 280).trim() + (summary.length > 280 ? '…' : ''),
            source: 'CIC News',
            url,
            publishedAt: pubDate ? new Date(pubDate) : new Date(),
            category: inferCicCategory(title),
        } satisfies NewsItem;
    }).filter(n => n.title.length > 0);
}

// ─── Public API ────────────────────────────────────────────────────────────────

async function loadNews(): Promise<NewsItem[]> {
    const results = await Promise.allSettled([fetchIrccNews(), fetchCicNews()]);

    const items: NewsItem[] = [];
    for (const r of results) {
        if (r.status === 'fulfilled') items.push(...r.value);
    }

    if (items.length === 0) return FALLBACK_NEWS;

    // Deduplicate by URL, sort newest first
    const seen = new Set<string>();
    return items
        .filter(n => {
            if (seen.has(n.url)) return false;
            seen.add(n.url);
            return true;
        })
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
        .slice(0, 10);
}

export const NewsService = {
    async fetchNews(): Promise<NewsItem[]> {
        const now = Date.now();
        if (cache && now - cacheTime < CACHE_TTL_MS) return cache;

        try {
            const items = await loadNews();
            cache = items;
            cacheTime = now;
            return items;
        } catch {
            return cache ?? FALLBACK_NEWS;
        }
    },

    async refresh(): Promise<NewsItem[]> {
        cache = null;
        cacheTime = 0;
        return this.fetchNews();
    },
};
