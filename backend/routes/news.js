const express = require('express');
const RSSParser = require('rss-parser');
const router = express.Router();
const parser = new RSSParser();

const FEEDS = {
  topNews: [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml'
  ],
  tech: [
    'https://www.theverge.com/rss/index.xml',
    'https://feeds.arstechnica.com/arstechnica/index'
  ]
};

async function fetchFeed(urls) {
  for (const url of urls) {
    try {
      const feed = await parser.parseURL(url);
      return feed.items.slice(0, 8).map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate || item.isoDate,
        summary: item.contentSnippet?.slice(0, 200)
      }));
    } catch {
      // try next URL
    }
  }
  return [];
}

router.get('/', async (req, res) => {
  try {
    const [topNews, tech] = await Promise.all([
      fetchFeed(FEEDS.topNews),
      fetchFeed(FEEDS.tech)
    ]);
    res.json({ topNews, tech });
  } catch (err) {
    res.status(500).json({ error: 'News fetch failed', detail: err.message });
  }
});

module.exports = router;
