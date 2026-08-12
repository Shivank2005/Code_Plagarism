import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8082';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      if (username) localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
  }, [token, username]);

  const login = async (user, password) => {
    const response = await axios.post(`${API_BASE}/api/auth/login`, { username: user, password });
    setToken(response.data.token);
    setUsername(response.data.username);
  };

  const register = async (user, password) => {
    const response = await axios.post(`${API_BASE}/api/auth/register`, { username: user, password });
    setToken(response.data.token);
    setUsername(response.data.username);
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
