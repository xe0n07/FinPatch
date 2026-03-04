import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import AddModal from '../AddModal';
import ConfirmDialog from '../ConfirmDialog';

const fmt = (n, sym = '$') =>
  `${sym} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CAT_COLORS = {
  Salary: '#22C55E', Freelance: '#10B981', Business: '#06B6D4', Investment: '#3B82F6',
  Bonus: '#8B5CF6', Gift: '#EC4899', 'Rental Income': '#F59E0B', Consulting: '#14B8A6',
  Commission: '#84CC16', Bills: '#EF4444', Education: '#A855F7', Entertainment: '#F97316',
  'Food & Dining': '#F59E0B', Groceries: '#16A34A', Health: '#06B6D4',
  'Housing / Rent': '#6B7280', Shopping: '#EC4899', Subscriptions: '#8B5CF6',
  Transport: '#64748B', Travel: '#3B82F6', Utilities: '#78716C', Other: '#5C5448',
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

function StatCard({ label, value, sub, valueColor, iconPath, iconBg, iconColor, action }) {
  return (
    <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#8C8578', fontSize: '0.82rem', fontWeight: 500 }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg style={{ width: 17, height: 17, color: iconColor }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
      </div>
      <div>
        <p style={{ fontSize: '1.4rem', fontWeight: 700, color: valueColor || '#F5F0EB' }}>{value}</p>
        {sub && <p style={{ color: '#8C8578', fontSize: '0.72rem', marginTop: 2 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export default function HomeTab() {
  const { user } = useAuth();
  const sym = user?.currencySymbol || '$';
  const [summary,         setSummary]         = useState({ income: 0, expense: 0 });
  const [transactions,    setTransactions]    = useState([]);
  const [loans,           setLoans]           = useState({ lent: 0, owed: 0 });
  const [budgets,         setBudgets]         = useState([]);
  const [totalBalance,    setTotalBalance]    = useState(0);
  const [modal,           setModal]           = useState(null);
  const [editingTx,       setEditingTx]       = useState(null);
  const [confirmDelete,   setConfirmDelete]   = useState(null);
  const [loading,         setLoading]         = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, t, l, b, acc] = await Promise.all([
        api.get('/transactions/summary'),
        api.get('/transactions'),
        api.get('/loans/summary'),
        api.get('/budgets'),
        api.get('/accounts'),
      ]);
      setSummary(s.data);
      setTransactions(t.data);
      setLoans(l.data);
      setBudgets(b.data);
      const total = acc.data.reduce((sum, account) => sum + (account.balance || 0), 0);
      setTotalBalance(total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/transactions/${confirmDelete.id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== confirmDelete.id));
    } catch (e) { console.error(e); }
    finally { setConfirmDelete(null); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '2.5px solid #F4927A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const activeBudgets = budgets.filter((b) => b.budgetLimit > 0);

  return (
    <div style={{ padding: '24px 28px', width: '100%' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ color: '#8C8578', fontSize: '0.85rem' }}>{greeting()},</p>
          <h1 style={{ color: '#F5F0EB', fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 2rem)', lineHeight: 1.1 }}>
            {user?.customerName}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setModal('loan')} className="btn-primary">
            <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Loan
          </button>
          <button onClick={() => setModal('transaction')} className="btn-primary">
            <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Balance" value={fmt(totalBalance, sym)} sub="across all accounts"
          iconBg="rgba(244,146,122,0.15)" iconColor="#F4927A"
          iconPath="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        <StatCard label="Income" value={fmt(summary.income, sym)} sub="This month"
          valueColor="#22C55E" iconBg="rgba(34,197,94,0.15)" iconColor="#22C55E"
          iconPath="M5 10l7-7m0 0l7 7m-7-7v18" />
        <StatCard label="Expenses" value={fmt(summary.expense, sym)} sub="This month"
          valueColor="#EF4444" iconBg="rgba(239,68,68,0.15)" iconColor="#EF4444"
          iconPath="M19 14l-7 7m0 0l-7-7m7 7V3" />
        {/* Loans card */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ color: '#8C8578', fontSize: '0.82rem', fontWeight: 500 }}>Loans</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ borderRadius: 10, background: 'rgba(34,197,94,0.1)', padding: '10px 12px' }}>
              <p style={{ color: '#5C5448', fontSize: '0.65rem', marginBottom: 3 }}>Lent</p>
              <p style={{ color: '#22C55E', fontWeight: 700, fontSize: '0.9rem' }}>{fmt(loans.lent, sym)}</p>
            </div>
            <div style={{ borderRadius: 10, background: 'rgba(239,68,68,0.1)', padding: '10px 12px' }}>
              <p style={{ color: '#5C5448', fontSize: '0.65rem', marginBottom: 3 }}>Owed</p>
              <p style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.9rem' }}>{fmt(loans.owed, sym)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions + Budgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(240px,1fr)', gap: 16 }}>
        {/* Transactions table */}
        <div className="card" style={{ overflow: 'hidden', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #1E1A14' }}>
            <div>
              <h2 style={{ color: '#F5F0EB', fontWeight: 600, fontSize: '0.95rem' }}>All Transactions</h2>
              <p style={{ color: '#8C8578', fontSize: '0.72rem', marginTop: 2 }}>{transactions.length} total records</p>
            </div>
            <button onClick={() => setModal('transaction')} className="btn-primary" style={{ fontSize: '0.78rem', padding: '7px 14px' }}>
              <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '110px 1fr 110px 120px 70px',
            gap: 12, padding: '10px 20px', borderBottom: '1px solid #1E1A14',
          }}>
            {['Date', 'Description', 'Category', 'Amount', ''].map((h, i) => (
              <span key={i} style={{
                color: '#5C5448', fontSize: '0.65rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                textAlign: i === 3 ? 'right' : 'left',
              }}>{h}</span>
            ))}
          </div>

          <div className="scrollable" style={{ maxHeight: 420 }}>
            {transactions.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#1C1814', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg style={{ width: 22, height: 22, color: '#5C5448' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p style={{ color: '#8C8578', fontSize: '0.85rem', marginBottom: 8 }}>No transactions yet</p>
                <button onClick={() => setModal('transaction')} style={{ color: '#F4927A', fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Add your first one
                </button>
              </div>
            ) : transactions.map((t) => (
              <div key={t.id}
                style={{
                  display: 'grid', gridTemplateColumns: '110px 1fr 110px 120px 70px',
                  gap: 12, padding: '12px 20px', borderBottom: '1px solid #1E1A14',
                  alignItems: 'center', cursor: 'default',
                }}
                className="group"
                onMouseEnter={(e) => e.currentTarget.style.background = '#1C1814'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: '#8C8578', fontSize: '0.78rem' }}>{t.date}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: CAT_COLORS[t.category] || '#5C5448', color: '#fff', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                  }}>
                    {t.category?.[0]}
                  </div>
                  <span style={{ color: '#F5F0EB', fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                </div>
                <span style={{ color: '#8C8578', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.category}</span>
                <span style={{
                  fontSize: '0.85rem', fontWeight: 600, textAlign: 'right',
                  color: t.type === 'income' ? '#22C55E' : '#EF4444',
                }}>
                  {t.type === 'income' ? '+' : '−'}{fmt(t.amount, sym)}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => { setEditingTx(t); setModal('transaction'); }}
                    title="Edit"
                    style={{
                      width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: 'transparent', color: '#5C5448', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,146,122,0.12)'; e.currentTarget.style.color = '#F4927A'; e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5C5448'; e.currentTarget.style.opacity = '0'; }}
                    ref={(el) => {
                      if (el) {
                        const row = el.closest('[class*=group]') || el.parentElement;
                        if (row) {
                          row.addEventListener('mouseenter', () => { el.style.opacity = '1'; });
                          row.addEventListener('mouseleave', () => { el.style.opacity = '0'; });
                        }
                      }
                    }}
                  >
                    <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirmDelete(t)}
                    title="Delete"
                    style={{
                      width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: 'transparent', color: '#5C5448', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5C5448'; e.currentTarget.style.opacity = '0'; }}
                    ref={(el) => {
                      if (el) {
                        const row = el.closest('[class*=group]') || el.parentElement;
                        if (row) {
                          row.addEventListener('mouseenter', () => { el.style.opacity = '1'; });
                          row.addEventListener('mouseleave', () => { el.style.opacity = '0'; });
                        }
                      }
                    }}
                  >
                    <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budgets panel */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #1E1A14' }}>
            <div>
              <h2 style={{ color: '#F5F0EB', fontWeight: 600, fontSize: '0.95rem' }}>Budgets</h2>
              <p style={{ color: '#8C8578', fontSize: '0.72rem', marginTop: 2 }}>{activeBudgets.length} active this month</p>
            </div>
            <button onClick={() => setModal('budget')} className="btn-primary" style={{ fontSize: '0.78rem', padding: '7px 14px' }}>
              <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>
          <div className="scrollable" style={{ padding: '16px 20px', maxHeight: 460, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeBudgets.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <p style={{ color: '#8C8578', fontSize: '0.82rem', marginBottom: 8 }}>No budgets yet</p>
                <button onClick={() => setModal('budget')} style={{ color: '#F4927A', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}>Create one →</button>
              </div>
            ) : activeBudgets.map((b) => {
              const spent = b.spent || 0;
              const pct   = Math.min((spent / b.budgetLimit) * 100, 100);
              const over  = spent > b.budgetLimit;
              const barClr = over ? '#EF4444' : pct >= 80 ? '#F59E0B' : '#22C55E';
              return (
                <div key={b.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
                      <span style={{ color: '#F5F0EB', fontSize: '0.85rem', fontWeight: 500 }}>{b.category}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: over ? '#EF4444' : '#8C8578' }}>{Math.round(pct)}%</span>
                  </div>
                  <div style={{ width: '100%', height: 6, borderRadius: 3, background: '#1E1A14', overflow: 'hidden', marginBottom: 4 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: barClr, borderRadius: 3, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#5C5448', fontSize: '0.7rem' }}>{fmt(spent, sym)}</span>
                    <span style={{ color: '#5C5448', fontSize: '0.7rem' }}>{fmt(b.budgetLimit, sym)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {modal && <AddModal type={modal} onClose={() => { setModal(null); setEditingTx(null); }} onSave={load} editing={editingTx} />}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Transaction"
          message={`Delete "${confirmDelete.title}"? This cannot be undone.`}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}