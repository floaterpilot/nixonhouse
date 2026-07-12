const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Per-username queue so concurrent requests for the same user's file
// don't race on read-modify-write.
const queues = new Map();

function withUserFile(username, fn) {
  const prev = queues.get(username) || Promise.resolve();
  const run = prev.then(() => fn());
  queues.set(username, run.catch(() => {}));
  return run;
}

function filePath(username) {
  const safeName = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(DATA_DIR, `planned-expenses-${safeName}.json`);
}

function readAll(username) {
  const file = filePath(username);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeAll(username, items) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath(username), JSON.stringify(items, null, 2));
}

function list(username) {
  return withUserFile(username, () => readAll(username));
}

function create(username, { description, amount, categoryId, plannedDate }) {
  return withUserFile(username, () => {
    const items = readAll(username);
    const item = {
      id: crypto.randomUUID(),
      description,
      amount,
      categoryId,
      plannedDate,
      status: 'planned',
      createdAt: new Date().toISOString(),
    };
    items.push(item);
    writeAll(username, items);
    return item;
  });
}

function updateStatus(username, id, status) {
  return withUserFile(username, () => {
    const items = readAll(username);
    const item = items.find(i => i.id === id);
    if (!item) return null;
    item.status = status;
    item.updatedAt = new Date().toISOString();
    writeAll(username, items);
    return item;
  });
}

module.exports = { list, create, updateStatus };
