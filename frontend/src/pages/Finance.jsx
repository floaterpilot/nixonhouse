import { useEffect, useState } from 'react';
import { apiFetch, apiPost, apiPatch } from '../api';

const money = n => `$${Number(n).toFixed(2)}`;

const PACE_STYLES = {
  behind: { label: 'Behind', className: 'text-red-400 bg-red-500/10 border-red-500/30' },
  ahead: { label: 'Ahead', className: 'text-green-400 bg-green-500/10 border-green-500/30' },
  'on pace': { label: 'On Pace', className: 'text-slate-400 bg-slate-500/10 border-slate-500/30' }
};

function PaceBadge({ pace }) {
  const style = PACE_STYLES[pace.status] || PACE_STYLES['on pace'];
  return (
    <span className={`inline-flex items-center gap-1 border rounded-full px-3 py-1 text-xs font-mono uppercase tracking-wide ${style.className}`}>
      {style.label}{pace.amount > 0 ? ` · ${money(pace.amount)}` : ''}
    </span>
  );
}

function CategoryCard({ cat }) {
  return (
    <div className="bg-navy-card border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-condensed text-lg text-white leading-tight">{cat.name}</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">{cat.groupName}</div>
        </div>
        <PaceBadge pace={cat.pace} />
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-sm mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Budget</div>
          <div className="text-white">{money(cat.monthlyBudget)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Spent</div>
          <div className="text-white">{money(cat.spent)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Remaining</div>
          <div className={cat.remaining < 0 ? 'text-red-400' : 'text-white'}>{money(cat.remaining)}</div>
        </div>
      </div>

      {cat.plannedTotal > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5 font-mono text-xs text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>After planned expenses this month</span>
            <span className={cat.projectedRemaining < 0 ? 'text-red-400' : 'text-slate-200'}>
              {money(cat.projectedRemaining)}
            </span>
          </div>
          {cat.overBudgetIfPlannedHappen > 0 && (
            <div className="text-red-400">
              This will put you over budget by {money(cat.overBudgetIfPlannedHappen)} if planned expenses happen as planned.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddPlannedExpenseForm({ categories, onAdded }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const form = e.target;
    const payload = {
      description: form.description.value.trim(),
      amount: parseFloat(form.amount.value),
      categoryId: form.categoryId.value,
      plannedDate: form.plannedDate.value
    };
    if (!payload.description || !payload.amount || !payload.categoryId || !payload.plannedDate) return;

    setSaving(true);
    try {
      await apiPost('/api/finance/planned-expenses', payload);
      form.reset();
      onAdded();
    } catch {
      setError('Could not save planned expense.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-navy-card border border-white/10 rounded-xl p-4 mb-6">
      <h2 className="font-condensed text-xs uppercase tracking-widest text-slate-500 mb-3">Add Planned Expense</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          name="description"
          type="text"
          placeholder="Description"
          required
          className="bg-navy border border-white/10 focus:border-amber-400/60 rounded-lg px-3 py-3 font-mono text-sm text-white placeholder-slate-600 outline-none"
        />
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="Amount"
          required
          className="bg-navy border border-white/10 focus:border-amber-400/60 rounded-lg px-3 py-3 font-mono text-sm text-white placeholder-slate-600 outline-none"
        />
        <select
          name="categoryId"
          required
          defaultValue=""
          className="bg-navy border border-white/10 focus:border-amber-400/60 rounded-lg px-3 py-3 font-mono text-sm text-white outline-none"
        >
          <option value="" disabled>Category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          name="plannedDate"
          type="date"
          required
          className="bg-navy border border-white/10 focus:border-amber-400/60 rounded-lg px-3 py-3 font-mono text-sm text-white outline-none"
        />
      </div>
      {error && <p className="text-red-400 text-xs font-mono mt-2">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="mt-3 w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-navy font-display text-lg tracking-widest py-3 rounded-lg transition-colors"
      >
        {saving ? 'SAVING…' : 'ADD'}
      </button>
    </form>
  );
}

function PlannedExpensesList({ items, categories, onChange }) {
  const [busyId, setBusyId] = useState(null);
  const categoryName = id => categories.find(c => c.id === id)?.name || 'Unknown';
  const planned = items.filter(i => i.status === 'planned');

  async function markPaid(id) {
    setBusyId(id);
    try {
      await apiPatch(`/api/finance/planned-expenses/${id}`, { status: 'paid' });
      onChange();
    } finally {
      setBusyId(null);
    }
  }

  if (planned.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="font-condensed text-xs uppercase tracking-widest text-slate-500 mb-3">Planned Expenses</h2>
      <div className="flex flex-col gap-2">
        {planned.map(item => (
          <div key={item.id} className="flex items-center justify-between bg-navy-card border border-white/10 rounded-lg px-4 py-3">
            <div>
              <div className="text-white font-condensed">{item.description}</div>
              <div className="text-[11px] font-mono text-slate-500">
                {categoryName(item.categoryId)} · {new Date(item.plannedDate).toLocaleDateString()} · {money(item.amount)}
              </div>
            </div>
            <button
              onClick={() => markPaid(item.id)}
              disabled={busyId === item.id}
              className="text-xs font-mono uppercase tracking-widest text-amber-400 hover:text-amber-300 disabled:opacity-50 border border-amber-500/30 rounded-full px-3 py-2"
            >
              {busyId === item.id ? '…' : 'Mark Paid'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Finance() {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [planned, setPlanned] = useState([]);
  const [err, setErr] = useState(false);

  async function loadAll() {
    try {
      const [summaryData, categoriesData, plannedData] = await Promise.all([
        apiFetch('/api/finance/summary'),
        apiFetch('/api/finance/categories'),
        apiFetch('/api/finance/planned-expenses')
      ]);
      setSummary(summaryData);
      setCategories(categoriesData);
      setPlanned(plannedData);
      setErr(false);
    } catch {
      setErr(true);
    }
  }

  useEffect(() => { loadAll(); }, []);

  if (err) return (
    <div className="max-w-2xl mx-auto px-4 pt-8">
      <h1 className="font-display text-4xl tracking-widest text-white mb-4">FINANCE</h1>
      <p className="text-slate-500 font-mono">Could not load finance data. Is Actual Budget reachable?</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
      <h1 className="font-display text-4xl tracking-widest text-white mb-6">FINANCE</h1>

      {!summary ? (
        <p className="text-slate-500 font-mono text-center animate-pulse">Loading budget…</p>
      ) : (
        <>
          <AddPlannedExpenseForm categories={categories} onAdded={loadAll} />
          <PlannedExpensesList items={planned} categories={categories} onChange={loadAll} />

          <h2 className="font-condensed text-xs uppercase tracking-widest text-slate-500 mb-3">
            Categories · {summary.month}
          </h2>
          <div className="flex flex-col gap-3">
            {summary.categories.map(cat => (
              <CategoryCard key={cat.categoryId} cat={cat} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
