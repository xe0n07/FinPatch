import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import AddModal from '../AddModal';

const fmt = (n, sym = '$') =>
  `${sym} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TYPE_ICON_PATH = {
  Bank: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
  Savings: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  Wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  Investing: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  Other: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

const AccountsTab = () => {
  const { user } = useAuth();
  const sym = user?.currencySymbol || '$';
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [a, t] = await Promise.all([api.get('/accounts'), api.get('/accounts/total')]);
      setAccounts(a.data);
      setTotal(t.data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteAccount = async (id) => {
    try {
      await api.delete(`/accounts/${id}`);
      load();
    } catch (e) {
      console.error(e);
    }
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
      <h1 className="text-2xl font-bold text-text-primary mb-4 animate-fade-up">Accounts</h1>

      <div className="card p-5 mb-5 animate-fade-up stagger-1">
        <p className="text-text-secondary text-sm mb-1">Total Net Worth</p>
        <h2 className="text-3xl font-bold text-text-primary mb-1">{fmt(total, sym)}</h2>
        <p className="text-muted text-xs">across {accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-col gap-3 animate-fade-up stagger-2">
        {accounts.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-text-secondary text-sm mb-4">No accounts yet. Add one to get started!</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Account</button>
          </div>
        ) : accounts.map((a) => (
          <div key={a.id} className="card p-4 flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: (a.color || '#22C55E') + '22' }}
            >
              <svg className="w-5 h-5" style={{ color: a.color || '#22C55E' }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={TYPE_ICON_PATH[a.type] || TYPE_ICON_PATH.Other} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text-primary font-semibold uppercase truncate">{a.name}</p>
              <p className="text-xs font-medium" style={{ color: a.color || '#22C55E' }}>{a.type}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-text-primary font-semibold text-sm">{fmt(a.balance, sym)}</span>
              <button onClick={() => deleteAccount(a.id)} className="text-muted hover:text-expense transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-accent hover:bg-accent-dark shadow-lg shadow-accent/30 flex items-center justify-center text-2xl font-light transition-colors z-40"
        style={{ color: '#0A0805' }}
      >+</button>

      {showModal && <AddModal type="account" onClose={() => setShowModal(false)} onSave={load} />}
    </div>
  );
};

export default AccountsTab;