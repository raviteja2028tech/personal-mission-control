import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('pmc_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await API.get('/users/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('pmc_token');
      localStorage.removeItem('pmc_user');
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('pmc_token', data.token);
    localStorage.setItem('pmc_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await API.post('/auth/signup', { name, email, password });
    localStorage.setItem('pmc_token', data.token);
    localStorage.setItem('pmc_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('pmc_token');
    localStorage.removeItem('pmc_user');
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    const { data } = await API.put('/auth/change-password', { currentPassword, newPassword });
    return data;
  };

  const updateUser = (userData) => {
    setUser(prev => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('pmc_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, changePassword, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
