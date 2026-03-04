import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import AddModal from '../AddModal';

const fmt = (n, sym = '$') =>
  `${sym} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const WarnIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const BudgetTab = () => {
  const { user } = useAuth();
  const sym = user?.currencySymbol || '$';
  const [budgets, setBudgets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/budgets');
      setBudgets(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteBudget = async (id) => {
    try {
      await api.delete(`/budgets/${id}`);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const barColor = (spent, limit) => {
    const p = spent / limit;
    if (p >= 1) return '#EF4444';
    if (p >= 0.8) return '#F59E0B';
    return '#22C55E';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-5 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Budgets</h1>
          <p className="text-text-secondary text-xs mt-0.5">This month</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 animate-fade-up stagger-1">
        {budgets.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-text-secondary text-sm mb-4">No budgets set yet. Create one to track spending!</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Budget</button>
          </div>
        ) : budgets.map((b) => {
          const spent = b.spent || 0;
          const pct = Math.min((spent / b.budgetLimit) * 100, 100);
          const over = spent > b.budgetLimit;
          return (
            <div key={b.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color || '#F4927A' }} />
                  <span className="text-text-primary font-semibold">{b.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${over ? 'text-expense' : 'text-text-primary'}`}>
                    {fmt(spent, sym)} / {fmt(b.budgetLimit, sym)}
                  </span>
                  <button onClick={() => deleteBudget(b.id)} className="text-muted hover:text-expense transition-colors"><TrashIcon /></button>
                </div>
              </div>
              <div className="w-full bg-bg rounded-full h-1.5 mb-2 overflow-hidden">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: barColor(spent, b.budgetLimit) }}
                />
              </div>
              <div className="flex items-center justify-between">
                {over ? (
                  <span className="text-expense text-xs flex items-center gap-1">
                    <WarnIcon /> Over budget by {fmt(spent - b.budgetLimit, sym)}
                  </span>
                ) : (
                  <span className="text-income text-xs">{fmt(b.budgetLimit - spent, sym)} remaining</span>
                )}
                <span className="text-muted text-xs">{Math.round(pct)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-accent hover:bg-accent-dark shadow-lg shadow-accent/30 flex items-center justify-center text-2xl font-light transition-colors z-40"
        style={{ color: '#0A0805' }}
      >+</button>

      {showModal && <AddModal type="budget" onClose={() => setShowModal(false)} onSave={load} />}
    </div>
  );
};

export default BudgetTab;