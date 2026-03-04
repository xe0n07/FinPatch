import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ConfirmDialog from '../ConfirmDialog';

export default function ProfileTab() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const INFO = [
    { label: 'Username / Display Name', value: user?.customerName, d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Email Address', value: user?.email, d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { label: 'Default Currency', value: `${user?.currency} (${user?.currencySymbol})`, d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Account Status', value: 'Active · Onboarding Complete', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div style={{ padding: '24px 28px', width: '100%', maxWidth: 760 }} className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#F5F0EB', fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>Profile</h1>
        <p style={{ color: '#8C8578', fontSize: '0.82rem', marginTop: 4 }}>Your account information</p>
      </div>

      {/* Profile hero */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18, flexShrink: 0,
          background: 'rgba(244,146,122,0.14)', border: '2px solid rgba(244,146,122,0.32)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#F4927A', fontWeight: 700, fontSize: '1.8rem' }}>{user?.customerName?.[0]?.toUpperCase()}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ color: '#F5F0EB', fontWeight: 700, fontSize: '1.35rem', marginBottom: 4 }}>{user?.customerName}</h2>
          <p style={{ color: '#8C8578', fontSize: '0.85rem', marginBottom: 10 }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: 'rgba(34,197,94,0.12)', color: '#22C55E', fontSize: '0.72rem', fontWeight: 600 }}>
              <svg style={{ width: 11, height: 11 }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Active Account
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 8, background: 'rgba(244,146,122,0.1)', color: '#F4927A', fontSize: '0.72rem', fontWeight: 600 }}>
              {user?.currency} · {user?.currencySymbol}
            </span>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 20 }}>
        {INFO.map((item) => (
          <div key={item.label} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#1C1814', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg style={{ width: 18, height: 18, color: '#F4927A' }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.d} />
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: '#5C5448', fontSize: '0.68rem', marginBottom: 4 }}>{item.label}</p>
              <p style={{ color: '#F5F0EB', fontWeight: 500, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="card" style={{ padding: '20px 24px', borderColor: 'rgba(239,68,68,0.2)' }}>
        <h3 style={{ color: '#F5F0EB', fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>Account Actions</h3>
        <p style={{ color: '#8C8578', fontSize: '0.8rem', marginBottom: 16 }}>Manage your session and preferences.</p>
        <button onClick={() => setConfirmLogout(true)} className="btn-danger">
          <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>

      {confirmLogout && (
        <ConfirmDialog
          title="Sign Out"
          message="Are you sure you want to sign out of Finpatch? You'll need to log in again."
          confirmLabel="Sign Out"
          onConfirm={() => { logout(); navigate('/'); }}
          onCancel={() => setConfirmLogout(false)}
        />
      )}
    </div>
  );
}