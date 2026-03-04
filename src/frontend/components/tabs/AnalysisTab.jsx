import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const COLORS = ['#EF4444', '#06B6D4', '#22C55E', '#A855F7', '#F59E0B', '#EC4899', '#F4927A', '#3B82F6', '#10B981'];

const fmt = (n, sym = '$') =>
  `${sym} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtShort = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n));

const Tooltip1 = ({ active, payload, label, sym }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: '10px 14px', border: '1px solid #1E1A14', fontSize: '0.8rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <p style={{ color: '#8C8578', marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.fill }} />
          <span style={{ color: '#8C8578' }}>{p.name}:</span>
          <span style={{ color: '#F5F0EB', fontWeight: 600 }}>{fmt(p.value, sym)}</span>
        </div>
      ))}
    </div>
  );
};

const Tooltip2 = ({ active, payload, sym }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: '10px 14px', border: '1px solid #1E1A14', fontSize: '0.8rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <p style={{ color: '#F5F0EB', fontWeight: 600 }}>{payload[0].name}</p>
      <p style={{ color: '#8C8578' }}>{fmt(payload[0].value, sym)} · {payload[0].payload.percent}%</p>
    </div>
  );
};

export default function AnalysisTab() {
  const { user } = useAuth();
  const sym = user?.currencySymbol || '$';
  const [summary,    setSummary]    = useState({ income: 0, expense: 0, net: 0 });
  const [monthly,    setMonthly]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, m, c] = await Promise.all([
          api.get('/transactions/summary'),
          api.get('/transactions/monthly'),
          api.get('/transactions/categories'),
        ]);
        setSummary(s.data); setMonthly(m.data); setCategories(c.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '2.5px solid #F4927A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const noData = monthly.every((m) => m.income === 0 && m.expense === 0);

  return (
    <div style={{ padding: '24px 28px', width: '100%' }} className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#F5F0EB', fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>Analysis</h1>
        <p style={{ color: '#8C8578', fontSize: '0.82rem', marginTop: 4 }}>Your financial overview for this month</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Income', value: fmt(summary.income, sym), color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', d: 'M5 10l7-7m0 0l7 7m-7-7v18' },
          { label: 'Total Expenses', value: fmt(summary.expense, sym), color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', d: 'M19 14l-7 7m0 0l-7-7m7 7V3' },
          { label: 'Net Savings', value: fmt(summary.net, sym), color: summary.net >= 0 ? '#22C55E' : '#EF4444', bg: '#141210', border: '#1E1A14', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map((item) => (
          <div key={item.label} style={{ borderRadius: 16, padding: '18px 20px', background: item.bg, border: `1px solid ${item.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <svg style={{ width: 15, height: 15, color: item.color }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.d} />
              </svg>
              <span style={{ color: '#8C8578', fontSize: '0.8rem' }}>{item.label}</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: '1.35rem', color: item.color }}>{item.value}</p>
            <p style={{ color: '#5C5448', fontSize: '0.68rem', marginTop: 4 }}>This month</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(260px, 2fr)', gap: 16 }}>
        {/* Bar chart */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ color: '#F5F0EB', fontWeight: 600, fontSize: '0.95rem' }}>Income vs Expenses</h3>
              <p style={{ color: '#8C8578', fontSize: '0.72rem', marginTop: 2 }}>Last 6 months</p>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[{ label: 'Income', color: '#22C55E' }, { label: 'Expense', color: '#EF4444' }].map((l) => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                  <span style={{ color: '#8C8578', fontSize: '0.75rem' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          {noData ? (
            <div style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8C8578' }}>
              <svg style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.4 }} fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p style={{ fontSize: '0.85rem' }}>No transaction data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} barGap={4} barCategoryGap="32%">
                <XAxis dataKey="month" tick={{ fill: '#5C5448', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtShort} tick={{ fill: '#5C5448', fontSize: 10 }} axisLine={false} tickLine={false} width={38} />
                <Tooltip content={<Tooltip1 sym={sym} />} cursor={{ fill: 'rgba(255,255,255,0.025)' }} />
                <Bar dataKey="income"  fill="#22C55E" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ color: '#F5F0EB', fontWeight: 600, fontSize: '0.95rem' }}>Expenses by Category</h3>
            <p style={{ color: '#8C8578', fontSize: '0.72rem', marginTop: 2 }}>This month's breakdown</p>
          </div>
          {categories.length === 0 ? (
            <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8C8578' }}>
              <svg style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.4 }} fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p style={{ fontSize: '0.85rem' }}>No expense data yet</p>
            </div>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categories} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={0} paddingAngle={2}>
                    {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<Tooltip2 sym={sym} />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {categories.map((c, i) => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: '#8C8578', fontSize: '0.8rem' }}>{c.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ color: '#5C5448', fontSize: '0.72rem' }}>{fmt(c.value, sym)}</span>
                      <span style={{ color: '#F5F0EB', fontSize: '0.8rem', fontWeight: 600, minWidth: 32, textAlign: 'right' }}>{c.percent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}