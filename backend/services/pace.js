function daysInMonth(year, monthIndex1to12) {
  return new Date(year, monthIndex1to12, 0).getDate();
}

// Exact spec: daily_budget = monthly_budget / days_in_month;
// expected_spend_to_date = daily_budget * current_day_of_month;
// pace_delta = amount_spent_to_date - expected_spend_to_date.
// pace_delta > 0 means overspending relative to a linear daily pace ("behind").
function calculatePace(monthlyBudget, amountSpentToDate, { year, month, day } = currentDateParts()) {
  const totalDays = daysInMonth(year, month);
  const dailyBudget = monthlyBudget / totalDays;
  const expectedSpendToDate = dailyBudget * day;
  const paceDelta = amountSpentToDate - expectedSpendToDate;

  if (paceDelta > 0) return { status: 'behind', amount: paceDelta };
  if (paceDelta < 0) return { status: 'ahead', amount: Math.abs(paceDelta) };
  return { status: 'on pace', amount: 0 };
}

function currentDateParts(date = new Date()) {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

module.exports = { calculatePace, daysInMonth, currentDateParts };
