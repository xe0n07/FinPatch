import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const INCOME_CATS   = ['Salary', 'Freelance', 'Business', 'Investment', 'Bonus', 'Gift', 'Rental Income', 'Consulting', 'Commission', 'Other'];
const EXPENSE_CATS  = ['Bills', 'Education', 'Entertainment', 'Food & Dining', 'Groceries', 'Health', 'Housing / Rent', 'Shopping', 'Subscriptions', 'Transport', 'Travel', 'Utilities', 'Other'];
const BUDGET_COLORS = ['#EF4444', '#A855F7', '#22C55E', '#EC4899', '#06B6D4', '#6B7280', '#F59E0B', '#F4927A', '#3B82F6', '#10B981'];
const ACCOUNT_COLORS= ['#22C55E', '#3B82F6', '#F59E0B', '#A855F7', '#06B6D4', '#F4927A', '#EC4899'];
const ACCOUNT_TYPES = ['Bank', 'Savings', 'Wallet', 'Investing', 'Other'];

const TITLES = {
  transaction: 'New Transaction',
  budget:      'Create Budget',
  account:     'Add Account',
  loan:        'Record Loan / Debt',
};

function TypeToggle({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: '#0A0805' }}>
      {options.map((opt) => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
          className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: value === opt.value ? opt.color : 'transparent',
            color: value === opt.value ? '#fff' : '#5C5448',
          }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ColorPicker({ colors, value, onChange }) {
  return (
    <div className="flex gap-2 mt-2 flex-wrap">
      {colors.map((c) => (
        <button key={c} type="button" onClick={() => onChange(c)}
          className="transition-all"
          style={{
            width: 28, height: 28, borderRadius: '50%',
            background: c, border: 'none', cursor: 'pointer',
            transform: value === c ? 'scale(1.3)' : 'scale(1)',
            boxShadow: value === c ? `0 0 0 2px #141210, 0 0 0 4px ${c}55` : 'none',
            transition: 'all 0.15s',
          }} />
      ))}
    </div>
  );
}

export default function AddModal({ type, onClose, onSave }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  });
  const { user }   = useAuth();
  const sym        = user?.currencySymbol || '$';
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [txType,   setTxType]   = useState('expense');
  const [loanType, setLoanType] = useState('lent');
  const [color, setColor]       = useState(type === 'account' ? ACCOUNT_COLORS[0] : BUDGET_COLORS[0]);

  const categories = txType === 'income' ? INCOME_CATS : EXPENSE_CATS;

  const onSubmit = async (data) => {
    setLoading(true); setErrorMsg('');
    try {
      if (type === 'transaction')
        await api.post('/transactions', { title: data.title, amount: data.amount, type: txType, category: data.category, date: data.date });
      else if (type === 'budget')
        await api.post('/budgets', { category: data.category, budgetLimit: data.budgetLimit, color });
      else if (type === 'account')
        await api.post('/accounts', { name: data.name, type: data.accountType, balance: data.balance || 0, color });
      else if (type === 'loan')
        await api.post('/loans', { personName: data.personName, amount: data.amount, type: loanType, date: data.date, description: data.description });
      onSave(); onClose();
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Failed to save. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 60, padding: '16px', backdropFilter: 'blur(3px)',
      }}>
      <div className="animate-modal-in" style={{
        width: '100%', maxWidth: 500,
        background: '#141210', border: '1px solid #1E1A14',
        borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px 16px', borderBottom: '1px solid #1E1A14', flexShrink: 0,
        }}>
          <div>
            <h2 style={{ color: '#F5F0EB', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>{TITLES[type]}</h2>
            <p style={{ color: '#8C8578', fontSize: '0.75rem', marginTop: 3 }}>Fill in the details below</p>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: 'none',
            background: '#1C1814', color: '#5C5448', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#F5F0EB'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#5C5448'; }}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="scrollable" style={{ padding: '18px 22px', flex: 1 }}>
          {errorMsg && (
            <div style={{
              marginBottom: 14, padding: '10px 14px', borderRadius: 12,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#EF4444', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg style={{ width: 15, height: 15, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errorMsg}
            </div>
          )}

          <form id="modal-form" onSubmit={handleSubmit(onSubmit)}>
            {type === 'transaction' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <TypeToggle
                  options={[{ value: 'expense', label: 'Expense', color: '#EF4444' }, { value: 'income', label: 'Income', color: '#22C55E' }]}
                  value={txType} onChange={setTxType}
                />
                <div>
                  <label className="label">Title / Description</label>
                  <input className="input-field" placeholder="e.g. Monthly salary, Netflix subscription"
                    {...register('title', { required: 'Title is required' })} />
                  {errors.title && <p className="error-msg">{errors.title.message}</p>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Amount ({sym})</label>
                    <input type="number" step="0.01" min="0.01" className="input-field" placeholder="0.00"
                      {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be > 0' } })} />
                    {errors.amount && <p className="error-msg">{errors.amount.message}</p>}
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input type="date" className="input-field"
                      {...register('date', { required: 'Date is required' })} />
                    {errors.date && <p className="error-msg">{errors.date.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="label">
                    Category — <span style={{ color: txType === 'income' ? '#22C55E' : '#EF4444', textTransform: 'capitalize' }}>{txType}</span>
                  </label>
                  <select className="input-field" {...register('category', { required: 'Category is required' })}>
                    <option value="">Select a category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="error-msg">{errors.category.message}</p>}
                </div>
              </div>
            )}

            {type === 'budget' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Category</label>
                  <select className="input-field" {...register('category', { required: 'Category is required' })}>
                    <option value="">Select a category</option>
                    {EXPENSE_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="error-msg">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="label">Monthly Limit ({sym})</label>
                  <input type="number" step="0.01" min="1" className="input-field" placeholder="0.00"
                    {...register('budgetLimit', { required: 'Limit is required', min: { value: 1, message: 'Must be > 0' } })} />
                  {errors.budgetLimit && <p className="error-msg">{errors.budgetLimit.message}</p>}
                </div>
                <div>
                  <label className="label">Label Color</label>
                  <ColorPicker colors={BUDGET_COLORS} value={color} onChange={setColor} />
                </div>
              </div>
            )}

            {type === 'account' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Account Name</label>
                  <input className="input-field" placeholder="e.g. Chase Checking, PayPal"
                    {...register('name', { required: 'Name is required' })} />
                  {errors.name && <p className="error-msg">{errors.name.message}</p>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Type</label>
                    <select className="input-field" {...register('accountType', { required: 'Type is required' })}>
                      <option value="">Select type</option>
                      {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.accountType && <p className="error-msg">{errors.accountType.message}</p>}
                  </div>
                  <div>
                    <label className="label">Starting Balance ({sym})</label>
                    <input type="number" step="0.01" className="input-field" placeholder="0.00"
                      {...register('balance')} />
                  </div>
                </div>
                <div>
                  <label className="label">Account Color</label>
                  <ColorPicker colors={ACCOUNT_COLORS} value={color} onChange={setColor} />
                </div>
              </div>
            )}

            {type === 'loan' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <TypeToggle
                  options={[{ value: 'lent', label: 'I Lent Money', color: '#22C55E' }, { value: 'owed', label: 'I Owe Money', color: '#EF4444' }]}
                  value={loanType} onChange={setLoanType}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Person / Entity</label>
                    <input className="input-field" placeholder="Name of person or company"
                      {...register('personName', { required: 'Name is required' })} />
                    {errors.personName && <p className="error-msg">{errors.personName.message}</p>}
                  </div>
                  <div>
                    <label className="label">Amount ({sym})</label>
                    <input type="number" step="0.01" min="0.01" className="input-field" placeholder="0.00"
                      {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be > 0' } })} />
                    {errors.amount && <p className="error-msg">{errors.amount.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="label">Date</label>
                  <input type="date" className="input-field"
                    {...register('date', { required: 'Date is required' })} />
                  {errors.date && <p className="error-msg">{errors.date.message}</p>}
                </div>
                <div>
                  <label className="label">Note (optional)</label>
                  <input className="input-field" placeholder="What was this for?"
                    {...register('description')} />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer buttons */}
        <div style={{
          display: 'flex', gap: 10, padding: '14px 22px 18px',
          borderTop: '1px solid #1E1A14', flexShrink: 0,
        }}>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button type="submit" form="modal-form" disabled={loading}
            className="btn-primary" style={{ flex: 2, justifyContent: 'center', opacity: loading ? 0.65 : 1 }}>
            {loading
              ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(10,8,5,0.3)', borderTopColor: '#0A0805', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Saving...</>
              : 'Save'}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}