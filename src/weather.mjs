const TEN_MINUTES = 10 * 60 * 1000;

let cachedWeather = null;

function numberOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function compactHourly(openMeteo) {
  const hourly = openMeteo.hourly || {};
  const times = hourly.time || [];
  const currentTime = openMeteo.current?.time;
  const startIndex = currentTime ? Math.max(0, times.findIndex((time) => time >= currentTime)) : 0;

  return times.slice(startIndex, startIndex + 12).map((time, offset) => {
    const index = startIndex + offset;

    return {
    time,
    temperature: numberOrNull(hourly.temperature_2m?.[index]),
    apparentTemperature: numberOrNull(hourly.apparent_temperature?.[index]),
    precipitationProbability: numberOrNull(hourly.precipitation_probability?.[index]),
    precipitation: numberOrNull(hourly.precipitation?.[index]),
    weatherCode: numberOrNull(hourly.weather_code?.[index]),
    windSpeed: numberOrNull(hourly.wind_speed_10m?.[index])
    };
  });
}

async function getNationalWeatherServiceForecast(config) {
  const headers = {
    accept: 'application/geo+json',
    'user-agent': `NixonHouse/0.1 (${config.publicUrl})`
  };

  const pointUrl = `https://api.weather.gov/points/${config.weather.lat},${config.weather.lon}`;
  const pointResponse = await fetch(pointUrl, { headers });

  if (!pointResponse.ok) {
    throw new Error(`Weather point lookup failed: ${pointResponse.status}`);
  }

  const point = await pointResponse.json();
  const forecastUrl = point.properties?.forecast;

  if (!forecastUrl) {
    throw new Error('Weather forecast URL was not returned.');
  }

  const forecastResponse = await fetch(forecastUrl, { headers });

  if (!forecastResponse.ok) {
    throw new Error(`Weather forecast lookup failed: ${forecastResponse.status}`);
  }

  const forecast = await forecastResponse.json();
  return forecast.properties?.periods || [];
}

async function getOpenMeteoHourly(config) {
  const params = new URLSearchParams({
    latitude: String(config.weather.lat),
    longitude: String(config.weather.lon),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'wind_speed_10m'
    ].join(','),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation',
      'rain',
      'showers',
      'weather_code',
      'wind_speed_10m',
      'wind_gusts_10m'
    ].join(','),
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
    forecast_days: '2',
    timezone: 'auto'
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
    headers: { accept: 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Hourly weather lookup failed: ${response.status}`);
  }

  return response.json();
}

export async function getWeather(config) {
  if (cachedWeather && cachedWeather.expiresAt > Date.now()) {
    return cachedWeather.payload;
  }

  const [periods, openMeteo] = await Promise.all([
    getNationalWeatherServiceForecast(config),
    getOpenMeteoHourly(config)
  ]);

  const nwsCurrent = periods[0] || null;
  const hourly = compactHourly(openMeteo);
  const openCurrent = openMeteo.current || {};
  const currentPrecipChance = hourly[0]?.precipitationProbability ?? null;

  const payload = {
    label: config.weather.label,
    updatedAt: new Date().toISOString(),
    radar: {
      station: config.weather.radarStation,
      imageUrl: config.weather.radarUrl,
      pageUrl: `https://radar.weather.gov/station/${config.weather.radarStation}/standard`
    },
    current: {
      name: nwsCurrent?.name || 'Now',
      temperature: numberOrNull(openCurrent.temperature_2m) ?? nwsCurrent?.temperature ?? null,
      temperatureUnit: 'F',
      apparentTemperature: numberOrNull(openCurrent.apparent_temperature),
      precipitation: numberOrNull(openCurrent.precipitation),
      precipitationProbability: currentPrecipChance,
      windSpeed: numberOrNull(openCurrent.wind_speed_10m) ?? nwsCurrent?.windSpeed ?? null,
      windGusts: numberOrNull(openCurrent.wind_gusts_10m),
      shortForecast: nwsCurrent?.shortForecast || '',
      detailedForecast: nwsCurrent?.detailedForecast || ''
    },
    hourly,
    upcoming: periods.slice(1, 4).map((period) => ({
      name: period.name,
      temperature: period.temperature,
      temperatureUnit: period.temperatureUnit,
      precipitationProbability: period.probabilityOfPrecipitation?.value ?? null,
      shortForecast: period.shortForecast
    }))
  };

  cachedWeather = {
    expiresAt: Date.now() + TEN_MINUTES,
    payload
  };

  return payload;
}
