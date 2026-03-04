import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import AddModal from '../AddModal';

const fmt = (n, sym = '$') =>
  `${sym} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CAT_COLORS = {
  Rent: '#6B7280', Freelance: '#22C55E', Bills: '#EF4444', Health: '#06B6D4',
  Groceries: '#16A34A', Shopping: '#EC4899', Education: '#A855F7', Food: '#F59E0B',
  Travel: '#3B82F6', Entertainment: '#8B5CF6', Other: '#6B7280',
};

const HomeTab = () => {
  const { user } = useAuth();
  const sym = user?.currencySymbol || '$';
  const [summary, setSummary] = useState({ income: 0, expense: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState({ lent: 0, owed: 0 });
  const [budgets, setBudgets] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning,';
    if (h < 18) return 'Good afternoon,';
    return 'Good evening,';
  };

  const load = useCallback(async () => {
    try {
      const [s, t, l, b, acc] = await Promise.all([
        api.get('/transactions/summary'),
        api.get('/transactions'),
        api.get('/loans/summary'),
        api.get('/budgets'),
        api.get('/accounts/total'),
      ]);
      setSummary(s.data);
      setTransactions(t.data.slice(0, 5));
      setLoans(l.data);
      setBudgets(b.data);
      setTotalBalance(acc.data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeBudgets = budgets.filter((b) => b.budgetLimit > 0);
  const totalBudget = activeBudgets.reduce((s, b) => s + b.budgetLimit, 0);

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <div>
          <p className="text-text-secondary text-sm">{greeting()}</p>
          <h1 className="text-2xl font-bold text-text-primary uppercase">{user?.customerName}</h1>
        </div>
        <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
          <span className="font-bold text-lg" style={{ color: '#0A0805' }}>{user?.customerName?.[0]?.toUpperCase()}</span>
        </div>
      </div>

      <div className="card p-5 mb-4 animate-fade-up stagger-1">
        <p className="text-text-secondary text-sm mb-1">Total Balance</p>
        <h2 className="text-3xl font-bold text-text-primary mb-4">{fmt(totalBalance, sym)}</h2>
        <p className="text-text-secondary text-xs mb-3">This month</p>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-income flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <div>
              <p className="text-xs text-text-secondary">Income</p>
              <p className="text-income font-semibold text-sm">{fmt(summary.income, sym)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-expense flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <div>
              <p className="text-xs text-text-secondary">Expense</p>
              <p className="text-expense font-semibold text-sm">{fmt(summary.expense, sym)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5 animate-fade-up stagger-2">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-text-secondary text-xs">Budgets</span>
          </div>
          <p className="text-text-primary font-bold text-lg">{activeBudgets.length} active</p>
          <p className="text-muted text-xs">of {fmt(totalBudget, sym)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-text-secondary text-xs">Loans</span>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-muted text-xs">Lent</p>
              <p className="text-income font-semibold text-xs">{fmt(loans.lent, sym)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted text-xs">Owed</p>
              <p className="text-expense font-semibold text-xs">{fmt(loans.owed, sym)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 animate-fade-up stagger-3">
        <h3 className="text-text-primary font-semibold">Recent Transactions</h3>
        <button onClick={() => setModal('transaction')} className="text-accent text-sm font-medium hover:underline">+ Add</button>
      </div>

      <div className="flex flex-col gap-2 animate-fade-up stagger-4">
        {transactions.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-text-secondary text-sm mb-3">No transactions yet.</p>
            <button onClick={() => setModal('transaction')} className="text-accent text-sm font-medium hover:underline">Add your first one</button>
          </div>
        ) : transactions.map((t) => (
          <div key={t.id} className="card p-3.5 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ backgroundColor: CAT_COLORS[t.category] || '#6B7280' }}
            >
              {t.category?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-semibold truncate uppercase">{t.title}</p>
              <p className="text-muted text-xs">{t.category} · {t.date}</p>
            </div>
            <span className={`text-sm font-bold flex-shrink-0 ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
              {t.type === 'income' ? '+' : '-'}{fmt(t.amount, sym)}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => setModal('transaction')}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-accent hover:bg-accent-dark shadow-lg shadow-accent/30 flex items-center justify-center text-2xl font-light transition-colors z-40"
        style={{ color: '#0A0805' }}
      >+</button>

      {modal && <AddModal type={modal} onClose={() => setModal(null)} onSave={load} />}
    </div>
  );
};

export default HomeTab;