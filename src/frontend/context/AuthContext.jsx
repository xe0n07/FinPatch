import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (token && stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, customerPassword) => {
    const res = await api.post('/users/login', { email, customerPassword });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (customerName, email, customerPassword, confirmPassword) => {
    const res = await api.post('/users/register', { customerName, email, customerPassword, confirmPassword });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const completeOnboarding = async (customerName, currency, currencySymbol) => {
    const res = await api.put('/users/onboarding', { customerName, currency, currencySymbol });
    const updated = res.data.user;
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, completeOnboarding, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);