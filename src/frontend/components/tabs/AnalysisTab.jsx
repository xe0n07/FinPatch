import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const COLORS = ['#EF4444', '#06B6D4', '#22C55E', '#6B7280', '#A855F7', '#F59E0B', '#EC4899', '#F4927A'];

const fmt = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-text-secondary mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  );
};

const AnalysisTab = () => {
  const { user } = useAuth();
  const sym = user?.currencySymbol || '$';
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0 });
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, m, c] = await Promise.all([
          api.get('/transactions/summary'),
          api.get('/transactions/monthly'),
          api.get('/transactions/categories'),
        ]);
        setSummary(s.data);
        setMonthly(m.data);
        setCategories(c.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const noMonthlyData = monthly.every((m) => m.income === 0 && m.expense === 0);

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-text-primary mb-5 animate-fade-up">Analysis</h1>

      <div className="grid grid-cols-3 gap-2 mb-5 animate-fade-up stagger-1">
        {[
          { label: 'Income', val: summary.income, cls: 'text-income', bg: 'bg-income/10 border-income/20' },
          { label: 'Expense', val: summary.expense, cls: 'text-expense', bg: 'bg-expense/10 border-expense/20' },
          { label: 'Net', val: summary.net, cls: summary.net >= 0 ? 'text-income' : 'text-expense', bg: 'bg-card border-border' },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl border p-3 ${item.bg}`}>
            <p className="text-text-secondary text-xs mb-1">{item.label}</p>
            <p className={`font-bold text-sm ${item.cls}`}>{sym} {fmt(item.val)}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-4 animate-fade-up stagger-2">
        <h3 className="text-text-primary font-semibold text-sm mb-4">Income vs Expense — Last 6 Months</h3>
        {noMonthlyData ? (
          <div className="h-40 flex items-center justify-center text-text-secondary text-sm">No transaction data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthly} barGap={4} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fill: '#6B6558', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" fill="#22C55E" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-income" />
            <span className="text-text-secondary text-xs">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-expense" />
            <span className="text-text-secondary text-xs">Expense</span>
          </div>
        </div>
      </div>

      <div className="card p-4 animate-fade-up stagger-3">
        <h3 className="text-text-primary font-semibold text-sm mb-4">Expenses by Category</h3>
        {categories.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-text-secondary text-sm">No expenses this month</div>
        ) : (
          <div className="flex items-center gap-4">
            <PieChart width={130} height={130}>
              <Pie data={categories} cx={60} cy={60} innerRadius={35} outerRadius={60} dataKey="value" strokeWidth={0}>
                {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
            </PieChart>
            <div className="flex flex-col gap-2 flex-1">
              {categories.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-text-secondary text-xs">{c.name}</span>
                  </div>
                  <span className="text-text-primary text-xs font-semibold">{c.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisTab;