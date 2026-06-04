const express = require('express');
const axios = require('axios');
const RSSParser = require('rss-parser');
const router = express.Router();
const parser = new RSSParser();

const CUBS_ID = 112;
const YEAR = new Date().getFullYear();

router.get('/', async (req, res) => {
  try {
    const [scheduleRes, standingsRes, rssRes] = await Promise.allSettled([
      axios.get(`https://statsapi.mlb.com/api/v1/schedule?teamId=${CUBS_ID}&sportId=1&season=${YEAR}&gameType=R`),
      axios.get(`https://statsapi.mlb.com/api/v1/standings?leagueId=104&season=${YEAR}`),
      parser.parseURL('https://www.espn.com/espn/rss/mlb/news')
    ]);

    // standings
    let record = null, standing = null;
    if (standingsRes.status === 'fulfilled') {
      for (const division of standingsRes.value.data.records) {
        const entry = division.teamRecords.find(t => t.team.id === CUBS_ID);
        if (entry) {
          record = { wins: entry.wins, losses: entry.losses };
          standing = {
            rank: entry.divisionRank,
            gb: entry.gamesBack,
            division: division.division?.name || 'NL Central'
          };
          break;
        }
      }
    }

    // schedule — find today's game or most recent
    let recentGame = null;
    if (scheduleRes.status === 'fulfilled') {
      const dates = scheduleRes.value.data.dates || [];
      const today = new Date().toISOString().split('T')[0];
      const sorted = dates.slice().sort((a, b) => a.date.localeCompare(b.date));
      const pastOrToday = sorted.filter(d => d.date <= today);
      const mostRecent = pastOrToday[pastOrToday.length - 1];
      if (mostRecent && mostRecent.games[0]) {
        const g = mostRecent.games[0];
        recentGame = {
          date: mostRecent.date,
          status: g.status?.detailedState,
          home: g.teams?.home?.team?.name,
          away: g.teams?.away?.team?.name,
          homeScore: g.teams?.home?.score,
          awayScore: g.teams?.away?.score,
          cubsWin: g.teams?.home?.team?.id === CUBS_ID
            ? g.teams?.home?.isWinner
            : g.teams?.away?.isWinner
        };
      }

      // magic number: total games = 162, remaining = 162 - (wins + losses)
      if (record) {
        const played = record.wins + record.losses;
        const remaining = 162 - played;
        record.magicNumber = remaining <= 30 ? Math.max(0, remaining - standing?.gb) : null;
      }
    }

    // headlines
    let headlines = [];
    if (rssRes.status === 'fulfilled') {
      headlines = rssRes.value.items.slice(0, 5).map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate
      }));
    }

    res.json({ record, standing, recentGame, headlines });
  } catch (err) {
    res.status(500).json({ error: 'Cubs fetch failed', detail: err.message });
  }
});

module.exports = router;
