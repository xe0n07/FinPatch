import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm flex flex-col items-center gap-8 animate-fade-up">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-[22px] bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-4xl font-bold" style={{ color: '#0A0805' }}>F</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text-primary">Finpatch</h1>
            <p className="text-text-secondary mt-1 text-sm">Personal finance tracker</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm text-text-primary font-medium">{user.customerName}</span>
            <span className="text-muted">·</span>
            <span className="text-sm text-text-secondary">{user.currencySymbol} {user.currency}</span>
          </div>
        )}

        <div className="w-full flex flex-col gap-3">
          <button onClick={() => navigate('/login')} className="btn-primary">Sign In</button>
          <button onClick={() => navigate('/register')} className="btn-outline">Create Account</button>
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-text-secondary text-sm text-center hover:text-text-primary transition-colors mt-1"
          >
            Forgot your password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;