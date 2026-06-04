const express = require('express');
const axios = require('axios');
const router = express.Router();

const LAT = 27.4467;
const LON = -82.4543;

const WMO_CODES = {
  0: 'Clear', 1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Foggy', 51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
  61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain', 71: 'Light Snow', 73: 'Snow',
  75: 'Heavy Snow', 80: 'Showers', 81: 'Showers', 82: 'Heavy Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'
};

router.get('/', async (req, res) => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
      `&temperature_unit=fahrenheit&timezone=America/New_York&forecast_days=5`;

    const { data } = await axios.get(url);
    const c = data.current;
    const d = data.daily;

    res.json({
      current: {
        temp: Math.round(c.temperature_2m),
        humidity: c.relative_humidity_2m,
        condition: WMO_CODES[c.weather_code] || 'Unknown',
        code: c.weather_code
      },
      daily: d.time.map((date, i) => ({
        date,
        high: Math.round(d.temperature_2m_max[i]),
        low: Math.round(d.temperature_2m_min[i]),
        condition: WMO_CODES[d.weather_code[i]] || 'Unknown',
        code: d.weather_code[i]
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Weather fetch failed', detail: err.message });
  }
});

module.exports = router;
