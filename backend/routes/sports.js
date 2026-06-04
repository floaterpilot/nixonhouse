const express = require('express');
const axios = require('axios');
const RSSParser = require('rss-parser');
const router = express.Router();
const parser = new RSSParser();

const UT_ID = 2633;

router.get('/tennessee', async (req, res) => {
  try {
    const [teamRes, rssRes] = await Promise.allSettled([
      axios.get(`https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/${UT_ID}`),
      parser.parseURL('https://www.espn.com/espn/rss/ncf/news')
    ]);

    let teamData = null;
    if (teamRes.status === 'fulfilled') {
      const t = teamRes.value.data.team;
      teamData = {
        name: t.displayName,
        record: t.record?.items?.[0]?.summary || 'N/A',
        ranking: t.rank || null,
        nextEvent: t.nextEvent?.[0] ? {
          opponent: t.nextEvent[0].competitions?.[0]?.competitors?.find(c => c.id !== String(UT_ID))?.team?.displayName,
          date: t.nextEvent[0].date,
          venue: t.nextEvent[0].competitions?.[0]?.venue?.fullName
        } : null
      };
    }

    let headlines = [];
    if (rssRes.status === 'fulfilled') {
      headlines = rssRes.value.items.slice(0, 5).map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate
      }));
    }

    res.json({ team: teamData, headlines });
  } catch (err) {
    res.status(500).json({ error: 'Sports fetch failed', detail: err.message });
  }
});

module.exports = router;
