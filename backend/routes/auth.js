const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

  const validUser = username === process.env.ADMIN_USER;
  const validPass = validUser && await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

  if (!validUser || !validPass) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ user: username }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

module.exports = router;
