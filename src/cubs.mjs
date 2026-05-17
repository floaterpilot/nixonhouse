import { parseAtomEntries } from './xml.mjs';

const TEAM_ID = 112;
const MLB_SCHEDULE_URL = 'https://statsapi.mlb.com/api/v1/schedule';
const LOCKED_ON_CUBS_FEED = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCF6B37xRcHBPwCKAeR5N9vQ';
const FIFTEEN_MINUTES = 15 * 60 * 1000;

let cachedCubs = null;

function dateParam(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function teamSide(game, side) {
  return game.teams?.[side] || {};
}

function opponentFor(game) {
  const cubsHome = teamSide(game, 'home').team?.id === TEAM_ID;
  return cubsHome ? teamSide(game, 'away') : teamSide(game, 'home');
}

function cubsFor(game) {
  const cubsHome = teamSide(game, 'home').team?.id === TEAM_ID;
  return cubsHome ? teamSide(game, 'home') : teamSide(game, 'away');
}

function pitcherName(game, side) {
  return teamSide(game, side).probablePitcher?.fullName || 'TBD';
}

function compactGame(game, label) {
  const cubs = cubsFor(game);
  const opponent = opponentFor(game);
  const home = teamSide(game, 'home');
  const away = teamSide(game, 'away');
  const isFinal = game.status?.abstractGameState === 'Final';
  const isCubsHome = home.team?.id === TEAM_ID;
  const cubsScore = cubs.score;
  const oppScore = opponent.score;
  const result =
    isFinal && Number.isFinite(cubsScore) && Number.isFinite(oppScore)
      ? `${cubsScore > oppScore ? 'W' : 'L'} ${cubsScore}-${oppScore}`
      : game.status?.detailedState || 'Scheduled';

  return {
    label,
    gamePk: game.gamePk,
    date: game.gameDate,
    status: game.status?.detailedState || '',
    result,
    opponent: opponent.team?.name || '',
    homeAway: isCubsHome ? 'Home' : 'Away',
    venue: game.venue?.name || '',
    matchup: `${away.team?.abbreviation || away.team?.teamName || 'Away'} @ ${
      home.team?.abbreviation || home.team?.teamName || 'Home'
    }`,
    starters: {
      away: pitcherName(game, 'away'),
      home: pitcherName(game, 'home')
    },
    links: {
      gamecenter: `https://www.mlb.com/gameday/${game.gamePk}`
    }
  };
}

async function getSchedule() {
  const now = new Date();
  const params = new URLSearchParams({
    sportId: '1',
    teamId: String(TEAM_ID),
    startDate: dateParam(addDays(now, -10)),
    endDate: dateParam(addDays(now, 14)),
    hydrate: 'probablePitcher,team,venue,linescore'
  });

  const response = await fetch(`${MLB_SCHEDULE_URL}?${params.toString()}`, {
    headers: { accept: 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Cubs schedule failed: ${response.status}`);
  }

  const data = await response.json();
  const games = (data.dates || [])
    .flatMap((date) => date.games || [])
    .sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate));

  const finalGames = games.filter((game) => game.status?.abstractGameState === 'Final');
  const upcomingGames = games.filter((game) => game.status?.abstractGameState !== 'Final');
  const lastGame = finalGames.at(-1) || null;
  const nextGame = upcomingGames.find((game) => new Date(game.gameDate) >= addDays(now, -1)) || upcomingGames[0] || null;

  const recentGames = finalGames
    .slice(-3)
    .filter((game) => game.gamePk !== lastGame?.gamePk)
    .reverse()
    .map((game) => compactGame(game, 'Recent'));
  const futureGames = upcomingGames
    .slice(0, 5)
    .filter((game) => game.gamePk !== nextGame?.gamePk)
    .map((game) => compactGame(game, 'Upcoming'));
  const strip = [
    ...(lastGame ? [compactGame(lastGame, 'Last')] : []),
    ...(nextGame ? [compactGame(nextGame, 'Next')] : []),
    ...recentGames,
    ...futureGames
  ];

  return {
    lastGame: lastGame ? compactGame(lastGame, 'Last') : null,
    nextGame: nextGame ? compactGame(nextGame, 'Next') : null,
    games: strip
  };
}

async function getLatestVideo() {
  const response = await fetch(LOCKED_ON_CUBS_FEED, {
    headers: { accept: 'application/atom+xml, application/xml' }
  });

  if (!response.ok) {
    throw new Error(`Locked On Cubs feed failed: ${response.status}`);
  }

  const entries = parseAtomEntries(await response.text());
  const video = entries.find((entry) => !entry.link.includes('/shorts/')) || entries[0] || null;

  return video
    ? {
        title: video.title,
        url: video.link,
        published: video.published || video.updated,
        thumbnail: video.thumbnail,
        videoId: video.videoId
      }
    : null;
}

export async function getCubs() {
  if (cachedCubs && cachedCubs.expiresAt > Date.now()) {
    return cachedCubs.payload;
  }

  const [schedule, latestVideo] = await Promise.all([getSchedule(), getLatestVideo()]);
  const payload = {
    updatedAt: new Date().toISOString(),
    latestVideo,
    ...schedule
  };

  cachedCubs = {
    expiresAt: Date.now() + FIFTEEN_MINUTES,
    payload
  };

  return payload;
}
