import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = () => setSubmitted(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex flex-col items-center gap-3 mb-8">
          <span className="text-5xl">🔑</span>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">Reset Password</h1>
            <p className="text-text-secondary text-sm mt-1">We'll send a reset link to your email</p>
          </div>
        </div>

        {submitted ? (
          <div className="flex flex-col gap-4">
            <div className="px-4 py-4 rounded-xl bg-income/10 border border-income/20 text-income text-sm text-center">
              If that email exists, a reset link has been sent.
            </div>
            <button onClick={() => navigate('/login')} className="btn-primary">← Back to Sign In</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                })}
              />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>
            <button type="submit" className="btn-primary">Send Reset Link</button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-text-secondary text-sm text-center hover:text-text-primary transition-colors"
            >
              ← Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;