import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo1.png';

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await login(data.email, data.customerPassword);
      navigate(user.onboardingComplete ? '/dashboard' : '/onboarding');
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src={logo} alt="FinPatch logo" className="w-20 h-20 object-contain" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
            <p className="text-text-secondary text-sm mt-1">Sign in to continue</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-expense/10 border border-expense/20 text-expense text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              disabled={loading}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
              })}
            />
            {errors.email && <p className="error-msg">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input-field pr-11"
                placeholder="••••••••"
                disabled={loading}
                {...register('customerPassword', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Min 6 characters' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text-secondary transition-colors"
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.customerPassword && <p className="error-msg">{errors.customerPassword.message}</p>}
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-accent text-sm hover:underline">Forgot password?</Link>
          </div>

          <button type="submit" className="btn-primary mt-1" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-bg/40 border-t-bg rounded-full animate-spin" />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-text-secondary text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-semibold hover:underline">Sign up</Link>
        </p>
        <p className="text-center mt-3">
          <button onClick={() => navigate('/')} className="text-text-secondary text-sm hover:text-text-primary transition-colors">
            ← Back
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;