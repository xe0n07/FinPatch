import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import AddModal from '../AddModal';
import ConfirmDialog from '../ConfirmDialog';

const fmt = (n, sym = '$') =>
  `${sym} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function LoansTab() {
  const { user } = useAuth();
  const sym = user?.currencySymbol || '$';
  const [loans, setLoans] = useState([]);
  const [summary, setSummary] = useState({ lent: 0, owed: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [loansRes, summaryRes] = await Promise.all([
        api.get('/loans'),
        api.get('/loans/summary'),
      ]);
      setLoans(loansRes.data);
      setSummary(summaryRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSettle = async () => {
    if (!confirmAction) return;
    try {
      await api.put(`/loans/${confirmAction.id}/settle`);
      setLoans((prev) => prev.filter((l) => l.id !== confirmAction.id));
      setSummary((prev) => {
        const newSummary = { ...prev };
        if (confirmAction.type === 'lent') {
          newSummary.lent -= confirmAction.amount;
        } else {
          newSummary.owed -= confirmAction.amount;
        }
        return newSummary;
      });
    } catch (e) {
      console.error(e);
    } finally {
      setConfirmAction(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmAction) return;
    try {
      await api.delete(`/loans/${confirmAction.id}`);
      setLoans((prev) => prev.filter((l) => l.id !== confirmAction.id));
      setSummary((prev) => {
        const newSummary = { ...prev };
        if (confirmAction.type === 'lent') {
          newSummary.lent -= confirmAction.amount;
        } else {
          newSummary.owed -= confirmAction.amount;
        }
        return newSummary;
      });
    } catch (e) {
      console.error(e);
    } finally {
      setConfirmAction(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: 32, height: 32, border: '2.5px solid #F4927A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 28px', width: '100%' }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#F5F0EB', fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>Loans</h1>
          <p style={{ color: '#8C8578', fontSize: '0.82rem', marginTop: 4 }}>Manage your loans and debts</p>
        </div>
        <button onClick={() => { setEditingLoan(null); setShowModal(true); }} className="btn-primary">
          <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Loan
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Money Lent', value: fmt(summary.lent, sym), color: '#22C55E', bg: 'rgba(34,197,94,0.1)', d: 'M5 10l7-7m0 0l7 7m-7-7v18' },
          { label: 'Money Owed', value: fmt(summary.owed, sym), color: '#EF4444', bg: 'rgba(239,68,68,0.1)', d: 'M19 14l-7 7m0 0l-7-7m7 7V3' },
          { label: 'Net Position', value: fmt(summary.lent - summary.owed, sym), color: summary.lent >= summary.owed ? '#22C55E' : '#EF4444', bg: '#141210', border: '#1E1A14', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map((item) => (
          <div key={item.label} style={{ borderRadius: 16, padding: '18px 20px', background: item.bg, border: `1px solid ${item.border || (item.bg === '#141210' ? '#1E1A14' : 'transparent')}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <svg style={{ width: 15, height: 15, color: item.color }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.d} />
              </svg>
              <span style={{ color: '#8C8578', fontSize: '0.8rem' }}>{item.label}</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: '1.35rem', color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      {loans.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#1C1814', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg style={{ width: 26, height: 26, color: '#5C5448' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p style={{ color: '#F5F0EB', fontWeight: 600, marginBottom: 6 }}>No loans recorded</p>
          <p style={{ color: '#8C8578', fontSize: '0.82rem', marginBottom: 18 }}>Track money you've lent or owed</p>
          <button onClick={() => { setEditingLoan(null); setShowModal(true); }} className="btn-primary" style={{ display: 'inline-flex' }}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add First Loan
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {loans.map((loan) => (
            <div key={loan.id} className="card" style={{ padding: '18px 20px' }}
              onMouseEnter={(e) => {
                const btns = e.currentTarget.querySelectorAll('.loan-action-btn');
                btns.forEach(btn => btn.style.opacity = '1');
              }}
              onMouseLeave={(e) => {
                const btns = e.currentTarget.querySelectorAll('.loan-action-btn');
                btns.forEach(btn => btn.style.opacity = '0');
              }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: loan.type === 'lent' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'
                }}>
                  <svg style={{ width: 22, height: 22, color: loan.type === 'lent' ? '#22C55E' : '#EF4444' }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={loan.type === 'lent' ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
                  </svg>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="loan-action-btn"
                    onClick={() => { setEditingLoan(loan); setShowModal(true); }}
                    style={{
                      opacity: 0, transition: 'opacity 0.15s', width: 28, height: 28, borderRadius: 7,
                      border: 'none', background: 'rgba(244,146,122,0.1)', color: '#F4927A', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                    <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    className="loan-action-btn"
                    onClick={() => setConfirmAction({ ...loan, action: 'settle' })}
                    style={{
                      opacity: 0, transition: 'opacity 0.15s', width: 28, height: 28, borderRadius: 7,
                      border: 'none', background: 'rgba(34,197,94,0.1)', color: '#22C55E', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                    <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button
                    className="loan-action-btn"
                    onClick={() => setConfirmAction({ ...loan, action: 'delete' })}
                    style={{
                      opacity: 0, transition: 'opacity 0.15s', width: 28, height: 28, borderRadius: 7,
                      border: 'none', background: 'rgba(239,68,68,0.1)', color: '#EF4444', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                    <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <p style={{ color: '#8C8578', fontSize: '0.7rem', marginBottom: 4 }}>{loan.type === 'lent' ? 'I Lent Money' : 'I Owe Money'}</p>
              <p style={{ color: '#F5F0EB', fontWeight: 600, fontSize: '0.95rem', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loan.personName}</p>
              <p style={{ color: '#F5F0EB', fontWeight: 700, fontSize: '1.3rem', marginBottom: 8 }}>{fmt(loan.amount, sym)}</p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: '#5C5448' }}>
                <span>{loan.date}</span>
                {loan.description && (
                  <span title={loan.description} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginLeft: 8 }}>
                    {loan.description}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <AddModal type="loan" editingId={editingLoan?.id} editing={editingLoan} onClose={() => { setShowModal(false); setEditingLoan(null); }} onSave={load} />}

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.action === 'settle' ? 'Settle Loan' : 'Delete Loan'}
          message={confirmAction.action === 'settle'
            ? `Mark "${confirmAction.personName}"'s loan of ${fmt(confirmAction.amount, sym)} as settled?`
            : `Delete the loan record for "${confirmAction.personName}"? This cannot be undone.`}
          confirmLabel={confirmAction.action === 'settle' ? 'Settle' : 'Delete'}
          danger={confirmAction.action === 'delete'}
          onConfirm={confirmAction.action === 'settle' ? handleSettle : handleDelete}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
