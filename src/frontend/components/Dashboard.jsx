import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomeTab     from './tabs/HomeTab';
import AnalysisTab from './tabs/AnalysisTab';
import BudgetTab   from './tabs/BudgetTab';
import AccountsTab from './tabs/AccountsTab';
import ProfileTab  from './tabs/ProfileTab';

const SIDEBAR_W = 230;

const NAV = [
  { path: 'home',     label: 'Home',
    d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: 'analysis', label: 'Analysis',
    d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { path: 'budget',   label: 'Budget',
    d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { path: 'accounts', label: 'Accounts',
    d: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z' },
  { path: 'profile',  label: 'Profile',
    d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

/* ── Sidebar component ── */
function Sidebar({ onClose, tab, onNav, user, onLogout }) {
  const S = {
    root: { width: SIDEBAR_W, height: '100%', display: 'flex', flexDirection: 'column', background: '#0f0d0a', borderRight: '1px solid #1E1A14', flexShrink: 0 },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', borderBottom: '1px solid #1E1A14', flexShrink: 0 },
    logoWrap: { display: 'flex', alignItems: 'center', gap: 9 },
    logoBox: { width: 32, height: 32, borderRadius: 9, background: '#F4927A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(244,146,122,0.32)', flexShrink: 0 },
    nav: { flex: 1, padding: '12px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 },
    footer: { padding: '8px 8px', borderTop: '1px solid #1E1A14', flexShrink: 0 },
  };

  return (
    <div style={S.root}>
      {/* Logo + close */}
      <div style={S.header}>
        <div style={S.logoWrap}>
          <div style={S.logoBox}>
            <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#0A0805' }}>F</span>
          </div>
          <div>
            <p style={{ color: '#F5F0EB', fontWeight: 700, fontSize: '0.84rem', lineHeight: 1 }}>Finpatch</p>
            <p style={{ color: '#5C5448', fontSize: '0.63rem', marginTop: 3 }}>Finance hub</p>
          </div>
        </div>
        <Btn icon="M6 18L18 6M6 6l12 12" onClick={onClose} title="Close" />
      </div>

      {/* Nav */}
      <nav style={S.nav}>
        <Label text="Navigation" />
        {NAV.map(({ path, label, d }) => {
          const active = tab === path;
          return (
            <NavBtn key={path} label={label} d={d} active={active} onClick={() => onNav(path)} />
          );
        })}
      </nav>

      {/* User */}
      <div style={S.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 8px', borderRadius: 10 }}>
          <Avatar letter={user?.customerName?.[0]} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#F5F0EB', fontWeight: 600, fontSize: '0.71rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.customerName}</p>
            <p style={{ color: '#5C5448', fontSize: '0.62rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.currencySymbol} {user?.currency}</p>
          </div>
          <Btn icon="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" onClick={onLogout} title="Sign out" danger />
        </div>
      </div>
    </div>
  );
}

/* ── Small helpers ── */
function NavBtn({ label, d, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
        borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
        background: active ? 'rgba(244,146,122,0.14)' : hov ? '#1C1814' : 'transparent',
        color: active ? '#F4927A' : hov ? '#8C8578' : '#5C5448',
        fontSize: '0.84rem', fontWeight: 500, transition: 'all 0.12s',
      }}>
      <svg style={{ width: 17, height: 17, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
      <span style={{ flex: 1 }}>{label}</span>
      {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F4927A', flexShrink: 0 }} />}
    </button>
  );
}

function Btn({ icon, onClick, title, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.12s',
        background: hov ? (danger ? 'rgba(239,68,68,0.12)' : '#1C1814') : 'transparent',
        color: hov ? (danger ? '#EF4444' : '#F5F0EB') : '#5C5448',
      }}>
      <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
    </button>
  );
}

function Label({ text }) {
  return <p style={{ color: '#5C5448', fontSize: '0.57rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', padding: '4px 10px 10px' }}>{text}</p>;
}

function Avatar({ letter }) {
  return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'rgba(244,146,122,0.15)', border: '1px solid rgba(244,146,122,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#F4927A', fontWeight: 700, fontSize: '0.67rem' }}>{letter?.toUpperCase()}</span>
    </div>
  );
}

/* ── Main dashboard ── */
export default function Dashboard() {
  const navigate         = useNavigate();
  const location         = useLocation();
  const { user, logout } = useAuth();

  const seg = location.pathname.split('/');
  const tab = seg[seg.length - 1] || 'home';

  const isMob = () => window.innerWidth < 768;
  const [mobile,      setMobile]      = useState(isMob);
  const [sidebarOpen, setSidebarOpen] = useState(!isMob());

  useEffect(() => {
    const handle = () => {
      const m = isMob();
      setMobile(m);
      if (!m) setSidebarOpen(true); // always open on desktop after resize
    };
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const goTo = useCallback((path) => {
    navigate(`/dashboard/${path}`);
    if (isMob()) setSidebarOpen(false);
  }, [navigate]);

  const handleLogout = () => { logout(); navigate('/'); };

  /* ─────────────────────────────────────────────────
     CRITICAL: use a fixed inset-0 shell so the layout
     is always 100 vw × 100 vh regardless of sidebar.
     The sidebar clips via overflow:hidden on its wrapper;
     the main panel uses flex:1 + minWidth:0.
  ───────────────────────────────────────────────── */
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'row', background: '#0A0805', overflow: 'hidden' }}>

      {/* Mobile backdrop */}
      {mobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(3px)' }} />
      )}

      {/* ── Desktop sidebar — shrinks to 0 when closed ── */}
      {!mobile && (
        <div style={{
          width: sidebarOpen ? SIDEBAR_W : 0,
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <Sidebar onClose={() => setSidebarOpen(false)} tab={tab} onNav={goTo} user={user} onLogout={handleLogout} />
        </div>
      )}

      {/* ── Mobile sidebar — fixed overlay, zero layout impact ── */}
      {mobile && sidebarOpen && (
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, zIndex: 50, animation: 'slideInLeft 0.22s ease forwards' }}>
          <Sidebar onClose={() => setSidebarOpen(false)} tab={tab} onNav={goTo} user={user} onLogout={handleLogout} />
        </div>
      )}

      {/* ── Main — always exactly fills remaining width ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, padding: '7px 14px', minHeight: 46, background: '#0f0d0a', borderBottom: '1px solid #1E1A14' }}>
          {/* Hamburger */}
          <HamburgerBtn onClick={() => setSidebarOpen(v => !v)} />

          {/* Current page label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {mobile && (
              <div style={{ width: 22, height: 22, borderRadius: 6, background: '#F4927A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontWeight: 900, fontSize: '0.58rem', color: '#0A0805' }}>F</span>
              </div>
            )}
            <span style={{ color: '#F5F0EB', fontWeight: 600, fontSize: '0.87rem' }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </span>
          </div>

          {/* Mobile quick-nav */}
          {mobile && (
            <div style={{ display: 'flex', gap: 3, marginLeft: 'auto' }}>
              {NAV.map(({ path, d }) => {
                const active = tab === path;
                return (
                  <QuickNavBtn key={path} d={d} active={active} onClick={() => goTo(path)} title={path} />
                );
              })}
            </div>
          )}
        </div>

        {/* ── Tab content — true full remaining width ── */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minWidth: 0, width: '100%' }}>
          <Routes>
            <Route path="home"     element={<HomeTab />} />
            <Route path="analysis" element={<AnalysisTab />} />
            <Route path="budget"   element={<BudgetTab />} />
            <Route path="accounts" element={<AccountsTab />} />
            <Route path="profile"  element={<ProfileTab />} />
            <Route path="*"        element={<Navigate to="home" replace />} />
          </Routes>
        </div>
      </div>

      <style>{`@keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
}

function HamburgerBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      title="Toggle sidebar"
      style={{ width: 34, height: 34, borderRadius: 9, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.12s', background: hov ? '#1C1814' : 'transparent', color: hov ? '#F5F0EB' : '#5C5448' }}>
      <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}

function QuickNavBtn({ d, active, onClick, title }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s', background: active ? 'rgba(244,146,122,0.15)' : hov ? '#1C1814' : 'transparent', color: active ? '#F4927A' : hov ? '#8C8578' : '#5C5448' }}>
      <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
    </button>
  );
}