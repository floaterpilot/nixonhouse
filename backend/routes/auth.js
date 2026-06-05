const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function getUsers() {
  const usersPath = path.join(__dirname, '..', 'users.json');
  if (!fs.existsSync(usersPath)) {
    throw new Error('users.json not found');
  }
  return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  let users;
  try {
    users = getUsers();
  } catch (err) {
    return res.status(500).json({ error: 'User registry unavailable' });
  }

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPass = await bcrypt.compare(password, user.passwordHash);
  if (!validPass) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { user: username, role: user.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ token });
});

module.exports = router;
