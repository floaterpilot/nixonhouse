function formatHour(value) {
  if (!value) return '--';
  return new Intl.DateTimeFormat([], { hour: 'numeric' }).format(new Date(value));
}

function setText(node, value) {
  if (node) node.textContent = value;
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${Math.round(value)}%` : '--';
}

function formatTemp(value) {
  return Number.isFinite(value) ? `${Math.round(value)}°F` : '--';
}

function formatDateTime(value, options = {}) {
  if (!value) return '--';
  return new Intl.DateTimeFormat([], options).format(new Date(value));
}

async function loadWeather() {
  const panel = document.querySelector('[data-weather-panel]');
  if (!panel) return;

  const reading = panel.querySelector('[data-weather-reading]');
  const detail = panel.querySelector('[data-weather-detail]');
  const label = panel.querySelector('[data-weather-label]');
  const feels = panel.querySelector('[data-weather-feels]');
  const precip = panel.querySelector('[data-weather-precip]');
  const wind = panel.querySelector('[data-weather-wind]');
  const radarImage = document.querySelector('[data-radar-image]');
  const radarLink = document.querySelector('[data-radar-link]');
  const hourlyList = document.querySelector('[data-hourly-list]');

  try {
    const response = await fetch('/api/weather', { headers: { accept: 'application/json' } });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Weather unavailable');
    }

    setText(label, data.label || 'Forecast');

    if (!data.current) {
      setText(reading, '--');
      setText(detail, 'No forecast period was returned.');
      return;
    }

    setText(reading, formatTemp(data.current.temperature));
    setText(
      detail,
      `${data.current.name}: ${data.current.shortForecast || 'Forecast pending'}.`
    );
    setText(feels, formatTemp(data.current.apparentTemperature));
    setText(precip, formatPercent(data.current.precipitationProbability));
    setText(
      wind,
      Number.isFinite(data.current.windSpeed) ? `${Math.round(data.current.windSpeed)} mph` : data.current.windSpeed || '--'
    );

    if (radarImage && data.radar?.imageUrl) {
      radarImage.src = data.radar.imageUrl;
    }

    if (radarLink && data.radar?.pageUrl) {
      radarLink.href = data.radar.pageUrl;
      radarLink.textContent = data.radar.station || 'Open';
    }

    if (hourlyList) {
      hourlyList.replaceChildren();

      for (const hour of data.hourly || []) {
        const item = document.createElement('div');
        item.className = 'hourly-item';

        const time = document.createElement('span');
        time.textContent = formatHour(hour.time);

        const temp = document.createElement('strong');
        temp.textContent = formatTemp(hour.temperature);

        const chance = document.createElement('span');
        chance.textContent = `${formatPercent(hour.precipitationProbability)} rain`;

        item.append(time, temp, chance);
        hourlyList.append(item);
      }
    }
  } catch (error) {
    setText(reading, '--');
    setText(detail, error.message);
    panel.classList.add('is-muted');
  }
}

async function loadSpotify() {
  const panel = document.querySelector('[data-spotify-panel]');
  if (!panel) return;

  const status = panel.querySelector('[data-spotify-status]');
  const title = panel.querySelector('[data-spotify-title]');
  const subtitle = panel.querySelector('[data-spotify-subtitle]');
  const art = panel.querySelector('[data-spotify-art]');
  const openLink = panel.querySelector('[data-spotify-open]');

  try {
    const response = await fetch('/api/spotify/now-playing', { headers: { accept: 'application/json' } });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Spotify unavailable');
    }

    if (!data.configured) {
      setText(status, 'Setup needed');
      setText(title, 'Spotify');
      setText(subtitle, 'Server keys missing');
      return;
    }

    if (!data.connected) {
      setText(status, 'Personal');
      return;
    }

    if (data.empty) {
      setText(status, 'Connected');
      setText(title, data.displayName || 'Spotify');
      setText(subtitle, 'Nothing playing');
      return;
    }

    setText(status, data.isPlaying ? 'Playing' : 'Paused');
    setText(title, data.title || 'Spotify');
    setText(subtitle, data.subtitle || data.type || '');

    if (openLink && data.externalUrl) {
      openLink.href = data.externalUrl;
    }

    if (art && data.image) {
      art.replaceChildren();
      const image = document.createElement('img');
      image.src = data.image;
      image.alt = '';
      art.append(image);
    }
  } catch (error) {
    setText(status, 'Offline');
    setText(subtitle, error.message);
  }
}

function gameTile(game) {
  const tile = document.createElement('a');
  tile.className = 'game-tile';
  tile.href = game.links?.gamecenter || 'https://www.mlb.com/cubs/schedule';
  tile.target = '_blank';
  tile.rel = 'noreferrer';

  const label = document.createElement('span');
  label.className = 'game-label';
  label.textContent = game.label;

  const matchup = document.createElement('strong');
  matchup.textContent = game.matchup;

  const detail = document.createElement('small');
  detail.textContent = `${formatDateTime(game.date, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })} · ${game.venue}`;

  const result = document.createElement('span');
  result.className = 'game-result';
  result.textContent = game.result;

  const starters = document.createElement('small');
  starters.textContent = `${game.starters?.away || 'TBD'} vs ${game.starters?.home || 'TBD'}`;

  tile.append(label, matchup, detail, result, starters);
  return tile;
}

async function loadCubs() {
  const strip = document.querySelector('[data-cubs-games]');
  const videoLink = document.querySelector('[data-cubs-video]');
  if (!strip && !videoLink) return;

  try {
    const response = await fetch('/api/cubs', { headers: { accept: 'application/json' } });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Cubs unavailable');
    }

    if (videoLink && data.latestVideo?.url) {
      videoLink.href = data.latestVideo.url;
      videoLink.textContent = 'Latest Locked On Cubs';
      videoLink.title = data.latestVideo.title || '';
    }

    if (strip) {
      strip.replaceChildren();
      for (const game of data.games || []) {
        strip.append(gameTile(game));
      }
    }
  } catch (error) {
    if (strip) {
      strip.replaceChildren();
      const fallback = document.createElement('div');
      fallback.className = 'game-tile placeholder';
      fallback.textContent = error.message;
      strip.append(fallback);
    }
  }
}

function newsItem(item) {
  const link = document.createElement('a');
  link.className = 'news-feed-item';
  link.href = item.url;
  link.target = '_blank';
  link.rel = 'noreferrer';

  const source = document.createElement('span');
  source.textContent = `${item.source || 'Feed'} · ${formatDateTime(item.published, {
    month: 'short',
    day: 'numeric'
  })}`;

  const title = document.createElement('strong');
  title.textContent = item.title;

  const summary = document.createElement('small');
  summary.textContent = item.summary || '';

  link.append(source, title, summary);
  return link;
}

async function loadNews() {
  const feed = document.querySelector('[data-news-feed]');
  const source = document.querySelector('[data-news-source]');
  if (!feed) return;

  try {
    const response = await fetch('/api/news', { headers: { accept: 'application/json' } });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'News unavailable');
    }

    setText(source, data.source || 'Feed');
    feed.replaceChildren();
    for (const item of data.items || []) {
      feed.append(newsItem(item));
    }
  } catch (error) {
    feed.replaceChildren();
    const fallback = document.createElement('div');
    fallback.className = 'news-feed-item placeholder';
    fallback.textContent = error.message;
    feed.append(fallback);
  }
}

loadWeather();
loadSpotify();
loadCubs();
loadNews();
