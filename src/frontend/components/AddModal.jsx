import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CATEGORIES = ['Bills', 'Education', 'Entertainment', 'Food', 'Freelance', 'Groceries', 'Health', 'Rent', 'Shopping', 'Travel', 'Other'];
const BUDGET_COLORS = ['#EF4444', '#A855F7', '#22C55E', '#EC4899', '#06B6D4', '#6B7280', '#F59E0B', '#F4927A'];
const ACCOUNT_COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#A855F7', '#06B6D4', '#F4927A'];
const ACCOUNT_TYPES = ['Bank', 'Savings', 'Wallet', 'Investing', 'Other'];

const AddModal = ({ type, onClose, onSave }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  });
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [txType, setTxType] = useState('expense');
  const [loanType, setLoanType] = useState('lent');
  const [color, setColor] = useState(type === 'account' ? ACCOUNT_COLORS[0] : BUDGET_COLORS[0]);

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (type === 'transaction') {
        await api.post('/transactions', { title: data.title, amount: data.amount, type: txType, category: data.category, date: data.date });
      } else if (type === 'budget') {
        await api.post('/budgets', { category: data.category, budgetLimit: data.budgetLimit, color });
      } else if (type === 'account') {
        await api.post('/accounts', { name: data.name, type: data.accountType, balance: data.balance || 0, color });
      } else if (type === 'loan') {
        await api.post('/loans', { personName: data.personName, amount: data.amount, type: loanType, date: data.date, description: data.description });
      }
      onSave();
      onClose();
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const TITLES = { transaction: 'Add Transaction', budget: 'Add Budget', account: 'Add Account', loan: 'Add Loan / Debt' };
  const colors = type === 'account' ? ACCOUNT_COLORS : BUDGET_COLORS;

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-end justify-center z-50 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-card border border-border rounded-t-3xl p-6 pb-8 animate-scale-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-text-primary">{TITLES[type]}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg flex items-center justify-center text-muted hover:text-text-primary transition-colors text-lg leading-none"
          >✕</button>
        </div>

        {errorMsg && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-expense/10 border border-expense/20 text-expense text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {type === 'transaction' && (
            <>
              <div className="flex gap-2 p-1 bg-bg rounded-xl">
                {['expense', 'income'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTxType(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${txType === t ? (t === 'expense' ? 'bg-expense text-white' : 'bg-income text-white') : 'text-muted'}`}
                  >{t}</button>
                ))}
              </div>
              <div>
                <label className="label">Title</label>
                <input className="input-field" placeholder="e.g. Grocery shopping" {...register('title', { required: 'Title is required' })} />
                {errors.title && <p className="error-msg">{errors.title.message}</p>}
              </div>
              <div>
                <label className="label">Amount ({user?.currencySymbol})</label>
                <input type="number" step="0.01" className="input-field" placeholder="0.00" {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be greater than 0' } })} />
                {errors.amount && <p className="error-msg">{errors.amount.message}</p>}
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input-field" {...register('category', { required: 'Category is required' })}>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="error-msg">{errors.category.message}</p>}
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" className="input-field" {...register('date', { required: 'Date is required' })} />
                {errors.date && <p className="error-msg">{errors.date.message}</p>}
              </div>
            </>
          )}

          {type === 'budget' && (
            <>
              <div>
                <label className="label">Category</label>
                <select className="input-field" {...register('category', { required: 'Category is required' })}>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="error-msg">{errors.category.message}</p>}
              </div>
              <div>
                <label className="label">Monthly Limit ({user?.currencySymbol})</label>
                <input type="number" step="0.01" className="input-field" placeholder="0.00" {...register('budgetLimit', { required: 'Limit is required', min: { value: 1, message: 'Must be greater than 0' } })} />
                {errors.budgetLimit && <p className="error-msg">{errors.budgetLimit.message}</p>}
              </div>
              <div>
                <label className="label">Color</label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {colors.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-white/50 ring-offset-1 ring-offset-card' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </>
          )}

          {type === 'account' && (
            <>
              <div>
                <label className="label">Account Name</label>
                <input className="input-field" placeholder="e.g. Chase Bank" {...register('name', { required: 'Name is required' })} />
                {errors.name && <p className="error-msg">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input-field" {...register('accountType', { required: 'Type is required' })}>
                  <option value="">Select type</option>
                  {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.accountType && <p className="error-msg">{errors.accountType.message}</p>}
              </div>
              <div>
                <label className="label">Balance ({user?.currencySymbol})</label>
                <input type="number" step="0.01" className="input-field" placeholder="0.00" {...register('balance')} />
              </div>
              <div>
                <label className="label">Color</label>
                <div className="flex gap-2 mt-1">
                  {colors.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-white/50 ring-offset-1 ring-offset-card' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </>
          )}

          {type === 'loan' && (
            <>
              <div className="flex gap-2 p-1 bg-bg rounded-xl">
                {['lent', 'owed'].map((t) => (
                  <button key={t} type="button" onClick={() => setLoanType(t)} className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${loanType === t ? (t === 'lent' ? 'bg-income text-white' : 'bg-expense text-white') : 'text-muted'}`}>{t}</button>
                ))}
              </div>
              <div>
                <label className="label">Person Name</label>
                <input className="input-field" placeholder="Who did you lend to / borrow from?" {...register('personName', { required: 'Name is required' })} />
                {errors.personName && <p className="error-msg">{errors.personName.message}</p>}
              </div>
              <div>
                <label className="label">Amount ({user?.currencySymbol})</label>
                <input type="number" step="0.01" className="input-field" placeholder="0.00" {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be greater than 0' } })} />
                {errors.amount && <p className="error-msg">{errors.amount.message}</p>}
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" className="input-field" {...register('date', { required: 'Date is required' })} />
                {errors.date && <p className="error-msg">{errors.date.message}</p>}
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <input className="input-field" placeholder="Add a note..." {...register('description')} />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary mt-1" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-bg/40 border-t-bg rounded-full animate-spin" />
                Saving...
              </span>
            ) : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddModal;