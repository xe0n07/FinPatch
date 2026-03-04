import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

/* ─── tiny primitives ─── */
const Ico = ({ d, size = 20, sw = 1.8 }) => (
  <svg style={{ width: size, height: size, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth={sw} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const AccentBtn = ({ children, onClick, large }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: large ? '14px 34px' : '9px 20px',
        borderRadius: large ? 14 : 11, border: 'none', cursor: 'pointer',
        background: hov ? '#E07B62' : '#F4927A', color: '#0A0805',
        fontWeight: 700, fontSize: large ? '1rem' : '0.875rem',
        fontFamily: 'Outfit, sans-serif',
        transform: hov ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hov ? '0 10px 32px rgba(244,146,122,0.42)' : '0 4px 18px rgba(244,146,122,0.28)',
        transition: 'all 0.18s',
      }}>
      {children}
    </button>
  );
};

const GhostBtn = ({ children, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '9px 20px', borderRadius: 11, cursor: 'pointer',
        background: 'transparent', color: hov ? '#F5F0EB' : '#8C8578',
        border: `1px solid ${hov ? '#3E3028' : '#1E1A14'}`, fontWeight: 600,
        fontSize: '0.875rem', fontFamily: 'Outfit, sans-serif', transition: 'all 0.18s',
      }}>
      {children}
    </button>
  );
};

/* ─── Feature data ─── */
const FEATURES = [
  { color: '#F4927A', bg: 'rgba(244,146,122,0.1)', title: 'Smart Analytics', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', desc: 'Beautiful income vs expense charts over 6 months. Pie-chart breakdowns by category so you always know where your money goes.' },
  { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   title: 'Budget Control',   d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', desc: 'Set monthly limits per category with real-time progress bars. Color-coded alerts when you approach or exceed your limit.' },
  { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  title: 'Multi-Account',    d: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',        desc: 'Track Bank, Savings, Wallet, and Investment accounts in one view. See your true net worth updated in real time.' },
  { color: '#A855F7', bg: 'rgba(168,85,247,0.1)',  title: 'Loan Tracker',     d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',        desc: 'Log money you\'ve lent or owe. Track balances by person and never forget an outstanding debt again.' },
  { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  title: 'Multi-Currency',   d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', desc: 'Pick from 12+ currencies — NPR, USD, EUR, GBP, INR and more. Every number shows in your chosen currency symbol.' },
  { color: '#06B6D4', bg: 'rgba(6,182,212,0.1)',   title: 'Secure Sessions',  d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', desc: 'JWT authentication with hashed passwords. 7-day token expiry keeps your financial data private and protected.' },
];

const STEPS = [
  { n: '01', color: '#F4927A', title: 'Create Account',  desc: 'Sign up in seconds — just name, email and password. No credit card required.' },
  { n: '02', color: '#22C55E', title: 'Choose Currency', desc: 'Pick from 12+ global currencies to personalize your dashboard.' },
  { n: '03', color: '#3B82F6', title: 'Add Transactions', desc: 'Log income and expenses with categories, dates, and amounts.' },
  { n: '04', color: '#A855F7', title: 'Track & Grow',     desc: 'Watch your analytics evolve, stay on budget, and grow your net worth.' },
];

const STATS = [
  { val: '12+',  lbl: 'Currencies' },
  { val: '20+',  lbl: 'Categories' },
  { val: '100%', lbl: 'Free to Use' },
  { val: '∞',    lbl: 'Transactions' },
];

/* ─── Mock dashboard preview ─── */
function DashPreview() {
  return (
    <div style={{ background: '#0f0d0a', border: '1px solid #1E1A14', borderRadius: 18, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', maxWidth: 860, width: '100%' }}>
      {/* Browser chrome */}
      <div style={{ background: '#141210', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #1E1A14' }}>
        {['#EF4444','#F59E0B','#22C55E'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.8 }} />)}
        <div style={{ flex: 1, background: '#0A0805', borderRadius: 6, height: 20, display: 'flex', alignItems: 'center', padding: '0 10px' }}>
          <span style={{ color: '#5C5448', fontSize: '0.67rem' }}>localhost:3000/dashboard/home</span>
        </div>
      </div>
      {/* App shell preview */}
      <div style={{ display: 'flex', height: 300 }}>
        {/* Mini sidebar */}
        <div style={{ width: 130, background: '#0f0d0a', borderRight: '1px solid #1E1A14', padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: '#F4927A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontWeight: 900, fontSize: '0.6rem', color: '#0A0805' }}>F</span>
            </div>
            <span style={{ color: '#F5F0EB', fontWeight: 700, fontSize: '0.72rem' }}>Finpatch</span>
          </div>
          {[{ l: 'Home', active: true }, { l: 'Analysis' }, { l: 'Budget' }, { l: 'Accounts' }].map(i => (
            <div key={i.l} style={{ padding: '6px 8px', borderRadius: 7, background: i.active ? 'rgba(244,146,122,0.14)' : 'transparent', color: i.active ? '#F4927A' : '#5C5448', fontSize: '0.7rem', fontWeight: 500 }}>{i.l}</div>
          ))}
        </div>
        {/* Main area */}
        <div style={{ flex: 1, background: '#0A0805', padding: '16px', overflowY: 'hidden' }}>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
            {[
              { l: 'Balance', v: 'Rs 5,45,500', c: '#F5F0EB' },
              { l: 'Income',  v: 'Rs 1,50,000', c: '#22C55E' },
              { l: 'Expense', v: 'Rs 4,500',    c: '#EF4444' },
              { l: 'Loans',   v: 'Rs 0',        c: '#8C8578' },
            ].map(s => (
              <div key={s.l} style={{ background: '#141210', border: '1px solid #1E1A14', borderRadius: 10, padding: '10px 12px' }}>
                <p style={{ color: '#5C5448', fontSize: '0.55rem', marginBottom: 5 }}>{s.l}</p>
                <p style={{ color: s.c, fontWeight: 700, fontSize: '0.78rem' }}>{s.v}</p>
              </div>
            ))}
          </div>
          {/* Transaction table mock */}
          <div style={{ background: '#141210', border: '1px solid #1E1A14', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #1E1A14', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#F5F0EB', fontWeight: 600, fontSize: '0.75rem' }}>All Transactions</span>
              <div style={{ background: '#F4927A', borderRadius: 6, padding: '3px 10px', fontSize: '0.62rem', fontWeight: 700, color: '#0A0805' }}>+ New</div>
            </div>
            {[
              { d: '2026-03-04', name: 'Grocery', cat: 'Groceries', amt: '−Rs 4,500', c: '#EF4444', bg: '#16A34A' },
              { d: '2026-03-01', name: 'SALARY',  cat: 'Salary',    amt: '+Rs 1,50,000', c: '#22C55E', bg: '#8C8578' },
            ].map(r => (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid #1E1A14' }}>
                <span style={{ color: '#5C5448', fontSize: '0.6rem', minWidth: 70 }}>{r.d}</span>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: '0.55rem', fontWeight: 700 }}>{r.name[0]}</span>
                </div>
                <span style={{ color: '#F5F0EB', fontSize: '0.68rem', fontWeight: 500, flex: 1 }}>{r.name}</span>
                <span style={{ color: '#5C5448', fontSize: '0.62rem' }}>{r.cat}</span>
                <span style={{ color: r.c, fontWeight: 700, fontSize: '0.7rem', minWidth: 80, textAlign: 'right' }}>{r.amt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature card ─── */
function FeatCard({ color, bg, d, title, desc }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: '#141210', border: `1px solid ${hov ? color + '45' : '#1E1A14'}`, borderRadius: 20, padding: '26px 24px', cursor: 'default', transition: 'all 0.22s', transform: hov ? 'translateY(-5px)' : 'translateY(0)', boxShadow: hov ? `0 18px 48px ${color}18` : '0 2px 8px rgba(0,0,0,0.18)' }}>
      <div style={{ width: 46, height: 46, borderRadius: 13, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color }}>
        <Ico d={d} size={22} />
      </div>
      <h3 style={{ color: '#F5F0EB', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>{title}</h3>
      <p style={{ color: '#8C8578', fontSize: '0.84rem', lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}

/* ─── Step card ─── */
function StepCard({ n, color, title, desc }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 50, height: 50, borderRadius: 15, background: color + '18', border: `1px solid ${color}38`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <span style={{ color, fontWeight: 800, fontSize: '1rem' }}>{n}</span>
      </div>
      <h4 style={{ color: '#F5F0EB', fontWeight: 700, fontSize: '0.95rem', marginBottom: 7 }}>{title}</h4>
      <p style={{ color: '#8C8578', fontSize: '0.82rem', lineHeight: 1.6, maxWidth: 200, margin: '0 auto' }}>{desc}</p>
    </div>
  );
}

/* ─── Landing page ─── */
export default function LandingPage() {
  const navigate    = useNavigate();
  const { user }   = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const cta = () => navigate(user ? '/dashboard/home' : '/register');

  return (
    <div style={{ background: '#0A0805', color: '#F5F0EB', fontFamily: 'Outfit, sans-serif', minHeight: '100vh' }}>

      {/* ── NAVBAR ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 99,
        background: scrolled ? 'rgba(10,8,5,0.94)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid #1E1A14' : '1px solid transparent',
        transition: 'all 0.25s',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#F4927A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(244,146,122,0.35)', flexShrink: 0 }}>
              <span style={{ fontWeight: 900, fontSize: '0.88rem', color: '#0A0805' }}>F</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#F5F0EB' }}>Finpatch</span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <>
                <span style={{ color: '#5C5448', fontSize: '0.82rem', marginRight: 4 }}>Hi, {user.customerName}</span>
                <AccentBtn onClick={cta}>Dashboard →</AccentBtn>
              </>
            ) : (
              <>
                <GhostBtn onClick={() => navigate('/login')}>Sign In</GhostBtn>
                <AccentBtn onClick={cta}>Get Started</AccentBtn>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: 'clamp(52px,8vw,88px) 24px clamp(40px,6vw,72px)', textAlign: 'center' }}>
        {/* Pill badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 100, background: 'rgba(244,146,122,0.1)', border: '1px solid rgba(244,146,122,0.22)', marginBottom: 28 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F4927A', display: 'inline-block' }} />
          <span style={{ color: '#F4927A', fontSize: '0.76rem', fontWeight: 600 }}>Personal Finance — Simplified</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.2rem,6vw,3.8rem)', fontWeight: 900, lineHeight: 1.1, color: '#F5F0EB', marginBottom: 20 }}>
          Take Control of<br />
          <span style={{ color: '#F4927A' }}>Your Finances</span>
        </h1>

        <p style={{ color: '#8C8578', fontSize: 'clamp(0.95rem,2vw,1.15rem)', maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.72 }}>
          Track every rupee, set smart budgets, and understand your spending with beautiful analytics — all in one clean, fast dashboard.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <AccentBtn onClick={cta} large>{user ? 'Open Dashboard →' : 'Start for Free →'}</AccentBtn>
          {!user && <GhostBtn onClick={() => navigate('/login')}>Sign In</GhostBtn>}
        </div>

        {/* Dashboard preview */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DashPreview />
        </div>
      </section>

      {/* ── STATS ── */}
      <div style={{ borderTop: '1px solid #1E1A14', borderBottom: '1px solid #1E1A14', background: '#0f0d0a' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '36px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 16, textAlign: 'center' }}>
          {STATS.map(s => (
            <div key={s.lbl}>
              <p style={{ color: '#F4927A', fontWeight: 800, fontSize: 'clamp(1.6rem,3vw,2.2rem)', lineHeight: 1 }}>{s.val}</p>
              <p style={{ color: '#8C8578', fontSize: '0.78rem', marginTop: 6 }}>{s.lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: 'clamp(56px,8vw,88px) 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ color: '#F4927A', fontSize: '0.73rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Everything You Need</p>
          <h2 style={{ color: '#F5F0EB', fontWeight: 800, fontSize: 'clamp(1.7rem,4vw,2.5rem)', marginBottom: 12 }}>All the tools, one dashboard</h2>
          <p style={{ color: '#8C8578', fontSize: '0.95rem', maxWidth: 460, margin: '0 auto' }}>From daily expense tracking to long-term financial goals — Finpatch covers everything.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
          {FEATURES.map(f => <FeatCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: '#0f0d0a', borderTop: '1px solid #1E1A14', borderBottom: '1px solid #1E1A14' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: 'clamp(56px,8vw,80px) 24px', textAlign: 'center' }}>
          <p style={{ color: '#F4927A', fontSize: '0.73rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Simple Onboarding</p>
          <h2 style={{ color: '#F5F0EB', fontWeight: 800, fontSize: 'clamp(1.7rem,4vw,2.4rem)', marginBottom: 48 }}>Up and running in minutes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 36 }}>
            {STEPS.map(s => <StepCard key={s.n} {...s} />)}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: 'clamp(56px,8vw,88px) 24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #1C1814 0%, #141210 100%)', border: '1px solid #2A2218', borderRadius: 26, padding: 'clamp(44px,6vw,72px) 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Glow blobs */}
          <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(244,146,122,0.07)', filter: 'blur(70px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(34,197,94,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ color: '#F5F0EB', fontWeight: 800, fontSize: 'clamp(1.7rem,4vw,2.6rem)', marginBottom: 14 }}>Ready to take control?</h2>
            <p style={{ color: '#8C8578', fontSize: '1rem', maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.7 }}>
              Join Finpatch and start understanding your money — completely free, no strings attached.
            </p>
            <AccentBtn onClick={cta} large>
              {user ? 'Open Dashboard →' : 'Create Free Account →'}
            </AccentBtn>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #1E1A14', background: '#0f0d0a' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: '#F4927A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 900, fontSize: '0.7rem', color: '#0A0805' }}>F</span>
            </div>
            <span style={{ color: '#F5F0EB', fontWeight: 700, fontSize: '0.88rem' }}>Finpatch</span>
          </div>
          <p style={{ color: '#5C5448', fontSize: '0.75rem' }}>© {new Date().getFullYear()} Finpatch. Personal Finance Tracker.</p>
          <div style={{ display: 'flex', gap: 18 }}>
            {!user
              ? [['Sign In', '/login'], ['Sign Up', '/register']].map(([l, p]) => (
                  <button key={l} onClick={() => navigate(p)} style={{ background: 'none', border: 'none', color: '#5C5448', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#F4927A'}
                    onMouseLeave={e => e.currentTarget.style.color = '#5C5448'}>{l}</button>
                ))
              : <button onClick={() => navigate('/dashboard/home')} style={{ background: 'none', border: 'none', color: '#5C5448', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#F4927A'} onMouseLeave={e => e.currentTarget.style.color = '#5C5448'}>Dashboard</button>
            }
          </div>
        </div>
      </footer>
    </div>
  );
}