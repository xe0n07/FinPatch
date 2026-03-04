import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CURRENCIES = [
  { code: 'USD', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', flag: '🇯🇵' },
  { code: 'INR', symbol: '₹', flag: '🇮🇳' },
  { code: 'NPR', symbol: 'Rs', flag: '🇳🇵' },
  { code: 'CAD', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'CNY', symbol: '¥', flag: '🇨🇳' },
  { code: 'SGD', symbol: 'S$', flag: '🇸🇬' },
  { code: 'AED', symbol: 'د.إ', flag: '🇦🇪' },
];

const Onboarding = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [nameVal, setNameVal] = useState('');
  const [currency, setCurrency] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStep1 = (data) => {
    setNameVal(data.customerName);
    setStep(2);
  };

  const handleFinish = async () => {
    if (!currency) return;
    setLoading(true);
    try {
      await completeOnboarding(nameVal, currency.code, currency.symbol);
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-[18px] bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-2xl font-bold" style={{ color: '#0A0805' }}>F</span>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-text-primary">Finpatch</h2>
            <p className="text-text-secondary text-sm">Your personal finance hub</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step > s ? 'bg-income text-white' : step === s ? 'bg-accent text-bg' : 'bg-card border border-border text-muted'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 2 && <div className={`w-10 h-0.5 transition-colors ${step > 1 ? 'bg-accent' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-1">What should we call you?</h2>
            <p className="text-text-secondary text-sm mb-6">This will be your display name inside Finpatch.</p>
            <form onSubmit={handleSubmit(handleStep1)} className="flex flex-col gap-4">
              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. alex_finance"
                  {...register('customerName', { required: 'Username is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                />
                {errors.customerName && <p className="error-msg">{errors.customerName.message}</p>}
              </div>
              <button type="submit" className="btn-primary mt-2">Continue →</button>
            </form>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-1">Pick your currency</h2>
            <p className="text-text-secondary text-sm mb-5">All transactions and analytics will use this currency.</p>
            <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1 mb-5">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-colors ${currency?.code === c.code ? 'border-accent bg-accent/10' : 'border-border bg-card hover:border-accent/40'}`}
                >
                  <span className="text-2xl">{c.flag}</span>
                  <span className="text-xs font-semibold text-text-primary">{c.code}</span>
                  <span className="text-xs text-muted">{c.symbol}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-2xl border border-border text-text-secondary text-sm font-medium hover:border-accent/40 transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={!currency || loading}
                className={`flex-[2] py-4 rounded-2xl font-semibold transition-colors ${currency ? 'bg-accent hover:bg-accent-dark' : 'bg-muted/30 text-muted cursor-not-allowed'}`}
                style={{ color: currency ? '#0A0805' : undefined }}
              >
                {loading ? 'Setting up...' : "Let's Go 🚀"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;