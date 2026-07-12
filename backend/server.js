require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoute = require('./routes/auth');
const weatherRoute = require('./routes/weather');
const cubsRoute = require('./routes/cubs');
const sportsRoute = require('./routes/sports');
const newsRoute = require('./routes/news');
const financeRoute = require('./routes/finance');
const { verifyToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)) }));
app.use(express.json());
app.use((req, _res, next) => { console.log(`${req.method} ${req.path} origin=${req.headers.origin || '-'}`); next(); });

app.use('/auth', authRoute);
app.use('/api/weather', verifyToken, weatherRoute);
app.use('/api/cubs', verifyToken, cubsRoute);
app.use('/api/sports', verifyToken, sportsRoute);
app.use('/api/news', verifyToken, newsRoute);
app.use('/api/finance', verifyToken, financeRoute);

app.listen(PORT, () => console.log(`NixonHouse backend running on port ${PORT}`));
