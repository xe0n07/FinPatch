import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import AddModal from '../AddModal';
import ConfirmDialog from '../ConfirmDialog';

const fmt = (n, sym = '$') =>
  `${sym} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function BudgetTab() {
  const { user } = useAuth();
  const sym = user?.currencySymbol || '$';
  const [budgets,       setBudgets]       = useState([]);
  const [showModal,     setShowModal]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading,       setLoading]       = useState(true);

  const load = useCallback(async () => {
    try { const r = await api.get('/budgets'); setBudgets(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try { await api.delete(`/budgets/${confirmDelete.id}`); setBudgets((p) => p.filter((b) => b.id !== confirmDelete.id)); }
    catch (e) { console.error(e); }
    finally { setConfirmDelete(null); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '2.5px solid #F4927A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const totalBudget = budgets.reduce((s, b) => s + b.budgetLimit, 0);
  const totalSpent  = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const overCount   = budgets.filter((b) => (b.spent || 0) > b.budgetLimit).length;

  return (
    <div style={{ padding: '24px 28px', width: '100%' }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#F5F0EB', fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>Budgets</h1>
          <p style={{ color: '#8C8578', fontSize: '0.82rem', marginTop: 4 }}>Monthly spending limits</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Budget
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Budgeted', value: fmt(totalBudget, sym), color: '#F4927A', bg: 'rgba(244,146,122,0.1)', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          { label: 'Total Spent',    value: fmt(totalSpent, sym),  color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   d: 'M19 14l-7 7m0 0l-7-7m7 7V3' },
          { label: 'Remaining',      value: fmt(Math.max(totalBudget - totalSpent, 0), sym), color: '#22C55E', bg: 'rgba(34,197,94,0.1)', d: 'M5 13l4 4L19 7' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg style={{ width: 17, height: 17, color: s.color }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={s.d} />
              </svg>
            </div>
            <div>
              <p style={{ color: '#8C8578', fontSize: '0.72rem', marginBottom: 3 }}>{s.label}</p>
              <p style={{ color: s.color, fontWeight: 700, fontSize: '1rem' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {overCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', fontSize: '0.82rem', marginBottom: 18 }}>
          <svg style={{ width: 15, height: 15, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span><strong>{overCount} budget{overCount > 1 ? 's' : ''}</strong> exceeded this month.</span>
        </div>
      )}

      {budgets.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#1C1814', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg style={{ width: 26, height: 26, color: '#5C5448' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p style={{ color: '#F5F0EB', fontWeight: 600, marginBottom: 6 }}>No budgets created</p>
          <p style={{ color: '#8C8578', fontSize: '0.82rem', marginBottom: 18 }}>Set monthly limits to keep your spending on track</p>
          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'inline-flex' }}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Create First Budget
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {budgets.map((b) => {
            const spent = b.spent || 0;
            const pct   = Math.min((spent / b.budgetLimit) * 100, 100);
            const over  = spent > b.budgetLimit;
            const barClr = over ? '#EF4444' : pct >= 80 ? '#F59E0B' : '#22C55E';
            return (
              <div key={b.id} className="card" style={{ padding: '18px 20px' }}
                onMouseEnter={(e) => e.currentTarget.querySelector('.del-btn').style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.querySelector('.del-btn').style.opacity = '0'}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: b.color || '#F4927A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>
                      {b.category?.[0]}
                    </div>
                    <div>
                      <p style={{ color: '#F5F0EB', fontWeight: 600, fontSize: '0.9rem' }}>{b.category}</p>
                      <p style={{ fontSize: '0.72rem', color: over ? '#EF4444' : '#8C8578', marginTop: 2 }}>
                        {over ? `Over by ${fmt(spent - b.budgetLimit, sym)}` : `${fmt(b.budgetLimit - spent, sym)} left`}
                      </p>
                    </div>
                  </div>
                  <button className="del-btn"
                    onClick={() => setConfirmDelete(b)}
                    style={{ opacity: 0, transition: 'opacity 0.15s', width: 28, height: 28, borderRadius: 7, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div style={{ width: '100%', height: 7, borderRadius: 4, background: '#1E1A14', overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: barClr, borderRadius: 4, transition: 'width 0.5s' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: '#5C5448', fontSize: '0.65rem' }}>Spent</p>
                    <p style={{ color: over ? '#EF4444' : '#F5F0EB', fontWeight: 600, fontSize: '0.85rem' }}>{fmt(spent, sym)}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#5C5448', fontSize: '0.65rem' }}>Used</p>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: over ? '#EF4444' : pct >= 80 ? '#F59E0B' : '#22C55E' }}>{Math.round(pct)}%</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#5C5448', fontSize: '0.65rem' }}>Limit</p>
                    <p style={{ color: '#F5F0EB', fontWeight: 600, fontSize: '0.85rem' }}>{fmt(b.budgetLimit, sym)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <AddModal type="budget" onClose={() => setShowModal(false)} onSave={load} />}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Budget"
          message={`Remove the "${confirmDelete.category}" budget? Transactions remain unaffected.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}