const path = require('path');
const fs = require('fs');
const api = require('@actual-app/api');

const DATA_DIR = process.env.ACTUAL_DATA_DIR || path.join(__dirname, '..', 'data', 'actual-cache');

let ready = null;
let queue = Promise.resolve();

// Actual's local budget cache isn't safe for overlapping calls, so every
// request against it is chained onto this queue to force serial access.
function withActual(fn) {
  const run = queue.then(async () => {
    await ensureReady();
    return fn(api);
  });
  queue = run.catch(() => {});
  return run;
}

async function ensureReady() {
  if (ready) return ready;

  const { ACTUAL_SERVER_URL, ACTUAL_PASSWORD, ACTUAL_SYNC_ID } = process.env;
  if (!ACTUAL_SERVER_URL || !ACTUAL_PASSWORD || !ACTUAL_SYNC_ID) {
    throw new Error('Actual Budget is not configured (ACTUAL_SERVER_URL / ACTUAL_PASSWORD / ACTUAL_SYNC_ID)');
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });

  ready = api
    .init({
      dataDir: DATA_DIR,
      serverURL: ACTUAL_SERVER_URL,
      password: ACTUAL_PASSWORD,
    })
    .then(() => api.downloadBudget(ACTUAL_SYNC_ID))
    .catch(err => {
      ready = null;
      throw err;
    });

  return ready;
}

function toDollars(cents) {
  return Math.round(cents || 0) / 100;
}

function currentMonthStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// Merges category groups with this month's budget data into a flat,
// dollar-denominated list — Actual stores amounts as integer cents and
// keeps categories/budget-months as separate calls.
async function getCategoriesWithBudget(month = currentMonthStr()) {
  return withActual(async actual => {
    await actual.sync();
    const groups = await actual.getCategoryGroups();
    const budgetMonth = await actual.getBudgetMonth(month);

    const budgetByCategoryId = new Map();
    for (const group of budgetMonth.categoryGroups || []) {
      for (const cat of group.categories || []) {
        budgetByCategoryId.set(cat.id, cat);
      }
    }

    const categories = [];
    for (const group of groups) {
      if (group.is_income) continue;
      for (const cat of group.categories || []) {
        if (cat.is_income || cat.hidden || group.hidden) continue;
        const budgetData = budgetByCategoryId.get(cat.id) || {};
        categories.push({
          id: cat.id,
          name: cat.name,
          groupName: group.name,
          monthlyBudget: toDollars(budgetData.budgeted),
          spent: toDollars(Math.abs(budgetData.spent || 0)),
          balance: toDollars(budgetData.balance),
        });
      }
    }
    return categories;
  });
}

module.exports = { getCategoriesWithBudget, currentMonthStr };
