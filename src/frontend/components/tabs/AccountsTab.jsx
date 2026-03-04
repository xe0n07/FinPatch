import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import AddModal from '../AddModal';
import ConfirmDialog from '../ConfirmDialog';

const fmt = (n, sym = '$') =>
  `${sym} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TYPE_PATHS = {
  Bank:      'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
  Savings:   'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  Wallet:    'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  Investing: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  Other:     'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

export default function AccountsTab() {
  const { user } = useAuth();
  const sym = user?.currencySymbol || '$';
  const [accounts,      setAccounts]      = useState([]);
  const [total,         setTotal]         = useState(0);
  const [showModal,     setShowModal]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading,       setLoading]       = useState(true);

  const load = useCallback(async () => {
    try {
      const [a, t] = await Promise.all([api.get('/accounts'), api.get('/accounts/total')]);
      setAccounts(a.data); setTotal(t.data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/accounts/${confirmDelete.id}`);
      setAccounts((p) => p.filter((a) => a.id !== confirmDelete.id));
      setTotal((p) => p - (confirmDelete.balance || 0));
    } catch (e) { console.error(e); }
    finally { setConfirmDelete(null); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '2.5px solid #F4927A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const byType = accounts.reduce((map, a) => { (map[a.type] = map[a.type] || []).push(a); return map; }, {});

  return (
    <div style={{ padding: '24px 28px', width: '100%' }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#F5F0EB', fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>Accounts</h1>
          <p style={{ color: '#8C8578', fontSize: '0.82rem', marginTop: 4 }}>All your financial accounts</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Account
        </button>
      </div>

      {/* Net worth hero */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: 24, background: 'linear-gradient(135deg, #141210 0%, #1c1814 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ color: '#8C8578', fontSize: '0.82rem', marginBottom: 6 }}>Total Net Worth</p>
            <p style={{ color: '#F5F0EB', fontWeight: 700, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>{fmt(total, sym)}</p>
            <p style={{ color: '#5C5448', fontSize: '0.72rem', marginTop: 6 }}>{accounts.length} account{accounts.length !== 1 ? 's' : ''} connected</p>
          </div>
          {Object.keys(byType).length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Object.entries(byType).map(([type, accs]) => (
                <div key={type} style={{ background: '#0A0805', borderRadius: 12, padding: '10px 16px', textAlign: 'center', border: '1px solid #1E1A14' }}>
                  <p style={{ color: '#5C5448', fontSize: '0.65rem', marginBottom: 4 }}>{type}</p>
                  <p style={{ color: '#F5F0EB', fontWeight: 600, fontSize: '0.85rem' }}>{fmt(accs.reduce((s, a) => s + a.balance, 0), sym)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#1C1814', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg style={{ width: 26, height: 26, color: '#5C5448' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </div>
          <p style={{ color: '#F5F0EB', fontWeight: 600, marginBottom: 6 }}>No accounts yet</p>
          <p style={{ color: '#8C8578', fontSize: '0.82rem', marginBottom: 18 }}>Add your bank accounts, wallets and investments</p>
          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'inline-flex' }}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add First Account
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {accounts.map((a) => (
            <div key={a.id} className="card" style={{ padding: '20px 22px' }}
              onMouseEnter={(e) => e.currentTarget.querySelector('.del-btn').style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.querySelector('.del-btn').style.opacity = '0'}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: (a.color || '#22C55E') + '22' }}>
                  <svg style={{ width: 22, height: 22, color: a.color || '#22C55E' }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={TYPE_PATHS[a.type] || TYPE_PATHS.Other} />
                  </svg>
                </div>
                <button className="del-btn"
                  onClick={() => setConfirmDelete(a)}
                  style={{ opacity: 0, transition: 'opacity 0.15s', width: 28, height: 28, borderRadius: 7, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p style={{ color: '#8C8578', fontSize: '0.7rem', marginBottom: 4 }}>{a.type}</p>
              <p style={{ color: '#F5F0EB', fontWeight: 600, fontSize: '0.95rem', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</p>
              <p style={{ color: '#F5F0EB', fontWeight: 700, fontSize: '1.3rem' }}>{fmt(a.balance, sym)}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color || '#22C55E' }} />
                <span style={{ color: a.color || '#22C55E', fontSize: '0.7rem', fontWeight: 500 }}>{a.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <AddModal type="account" onClose={() => setShowModal(false)} onSave={load} />}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Account"
          message={`Remove "${confirmDelete.name}"? This will not delete your transaction history.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}