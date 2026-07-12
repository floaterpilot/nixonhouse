const express = require('express');
const router = express.Router();

const { getCategoriesWithBudget, currentMonthStr } = require('../services/actual');
const { calculatePace, currentDateParts, daysInMonth } = require('../services/pace');
const plannedExpenses = require('../services/plannedExpenses');

function isPlannedThisMonth(item, year, month) {
  if (item.status !== 'planned') return false;
  const d = new Date(item.plannedDate);
  return d.getFullYear() === year && d.getMonth() + 1 === month;
}

router.get('/categories', async (req, res) => {
  try {
    const categories = await getCategoriesWithBudget();
    res.json(categories.map(({ id, name, groupName }) => ({ id, name, groupName })));
  } catch (err) {
    res.status(502).json({ error: 'Failed to load categories from Actual', detail: err.message });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const { year, month, day } = currentDateParts();
    const [categories, planned] = await Promise.all([
      getCategoriesWithBudget(currentMonthStr()),
      plannedExpenses.list(req.user.user),
    ]);

    const summary = categories.map(cat => {
      const remaining = cat.monthlyBudget - cat.spent;
      const pace = calculatePace(cat.monthlyBudget, cat.spent, { year, month, day });

      const plannedForCategory = planned.filter(p => p.categoryId === cat.id && isPlannedThisMonth(p, year, month));
      const plannedTotal = plannedForCategory.reduce((sum, p) => sum + p.amount, 0);
      const projectedRemaining = remaining - plannedTotal;

      return {
        categoryId: cat.id,
        name: cat.name,
        groupName: cat.groupName,
        monthlyBudget: cat.monthlyBudget,
        spent: cat.spent,
        remaining,
        pace,
        plannedTotal,
        projectedRemaining,
        overBudgetIfPlannedHappen: projectedRemaining < 0 ? Math.abs(projectedRemaining) : 0,
      };
    });

    res.json({ month: currentMonthStr(), daysInMonth: daysInMonth(year, month), currentDay: day, categories: summary });
  } catch (err) {
    res.status(502).json({ error: 'Failed to build finance summary', detail: err.message });
  }
});

router.get('/planned-expenses', async (req, res) => {
  const items = await plannedExpenses.list(req.user.user);
  res.json(items);
});

router.post('/planned-expenses', async (req, res) => {
  const { description, amount, categoryId, plannedDate } = req.body;
  if (!description || typeof amount !== 'number' || !categoryId || !plannedDate) {
    return res.status(400).json({ error: 'description, amount, categoryId, and plannedDate are required' });
  }
  const item = await plannedExpenses.create(req.user.user, { description, amount, categoryId, plannedDate });
  res.status(201).json(item);
});

router.patch('/planned-expenses/:id', async (req, res) => {
  const { status } = req.body;
  if (!['planned', 'paid', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'status must be planned, paid, or cancelled' });
  }
  const item = await plannedExpenses.updateStatus(req.user.user, req.params.id, status);
  if (!item) return res.status(404).json({ error: 'Planned expense not found' });
  res.json(item);
});

module.exports = router;
