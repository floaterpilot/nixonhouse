import { parseAtomEntries } from './xml.mjs';

const VERGE_FEED = 'https://www.theverge.com/rss/index.xml';
const TEN_MINUTES = 10 * 60 * 1000;
const TECH_CATEGORIES = [
  'tech',
  'technology',
  'gadgets',
  'reviews',
  'ai',
  'artificial intelligence',
  'apple',
  'google',
  'microsoft',
  'samsung',
  'cyber',
  'security',
  'streaming',
  'smart home',
  'business'
];
const TECH_TEXT_PATTERN =
  /\b(tech|technology|gadget|iphone|ipad|mac|android|robot|camera|streaming|youtube|tiktok|apple|google|microsoft|samsung|cybersecurity|security|smart home|ai)\b/i;

let cachedNews = null;

function isTechUseful(item) {
  const categories = (item.categories || []).map((category) => category.toLowerCase());
  const categoryMatch = categories.some((category) =>
    TECH_CATEGORIES.some((term) => category === term || (term.length >= 4 && category.includes(term)))
  );

  return categoryMatch || TECH_TEXT_PATTERN.test(`${item.title} ${item.summary}`);
}

export async function getNews() {
  if (cachedNews && cachedNews.expiresAt > Date.now()) {
    return cachedNews.payload;
  }

  const response = await fetch(VERGE_FEED, {
    headers: { accept: 'application/atom+xml, application/xml' }
  });

  if (!response.ok) {
    throw new Error(`News feed failed: ${response.status}`);
  }

  const entries = parseAtomEntries(await response.text());
  const preferred = entries.filter(isTechUseful);
  const items = (preferred.length >= 4 ? preferred : entries).slice(0, 6).map((entry) => ({
    title: entry.title,
    url: entry.link,
    published: entry.published || entry.updated,
    summary: entry.summary,
    source: 'The Verge'
  }));

  const payload = {
    source: 'The Verge',
    sourceUrl: VERGE_FEED,
    updatedAt: new Date().toISOString(),
    items
  };

  cachedNews = {
    expiresAt: Date.now() + TEN_MINUTES,
    payload
  };

  return payload;
}
