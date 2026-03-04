import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileTab = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const INFO_ITEMS = [
    {
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      label: 'Default Currency',
      value: `${user?.currencySymbol} ${user?.currency}`,
    },
    {
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      label: 'Email Address',
      value: user?.email,
    },
    {
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      label: 'Username',
      value: user?.customerName?.toUpperCase(),
    },
  ];

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-text-primary mb-6 animate-fade-up">Profile</h1>

      <div className="flex flex-col items-center gap-3 mb-8 animate-fade-up stagger-1">
        <div className="w-20 h-20 rounded-full border-2 border-accent bg-accent/10 flex items-center justify-center">
          <span className="text-accent font-bold text-3xl">{user?.customerName?.[0]?.toUpperCase()}</span>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary uppercase">{user?.customerName}</h2>
          <p className="text-text-secondary text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-6 animate-fade-up stagger-2">
        {INFO_ITEMS.map((item) => (
          <div key={item.label} className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-bg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
            </div>
            <div>
              <p className="text-text-secondary text-xs">{item.label}</p>
              <p className="text-text-primary font-semibold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="animate-fade-up stagger-3">
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl border border-expense/30 bg-expense/10 text-expense font-semibold flex items-center justify-center gap-2 hover:bg-expense/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;