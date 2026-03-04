import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomeTab from './tabs/HomeTab';
import AnalysisTab from './tabs/AnalysisTab';
import BudgetTab from './tabs/BudgetTab';
import AccountsTab from './tabs/AccountsTab';
import ProfileTab from './tabs/ProfileTab';

const NAV_ITEMS = [
  {
    path: 'home', label: 'Home',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: 'analysis', label: 'Analysis',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    path: 'budget', label: 'Budget',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    path: 'accounts', label: 'Accounts',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
  {
    path: 'profile', label: 'Profile',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.pathname.split('/').pop() || 'home';

  return (
    <div className="flex flex-col min-h-screen bg-bg max-w-lg mx-auto relative">
      <div className="flex-1 overflow-y-auto pb-24">
        <Routes>
          <Route path="home" element={<HomeTab />} />
          <Route path="analysis" element={<AnalysisTab />} />
          <Route path="budget" element={<BudgetTab />} />
          <Route path="accounts" element={<AccountsTab />} />
          <Route path="profile" element={<ProfileTab />} />
          <Route path="*" element={<HomeTab />} />
        </Routes>
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-card border-t border-border z-50">
        <div className="flex justify-around items-center px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const active = currentTab === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(`/dashboard/${item.path}`)}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-200"
              >
                <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-accent/20 text-accent' : 'text-muted'}`}>
                  {item.icon(active)}
                </div>
                <span className={`text-xs font-medium transition-colors ${active ? 'text-accent' : 'text-muted'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;