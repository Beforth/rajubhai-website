import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendOtp as apiSendOtp, verifyOtp as apiVerifyOtp } from '../services/api';

const AuthContext = createContext();

const AUTH_USER_KEY = 'rajubhai_auth_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const requestOtp = async (phone) => {
    return await apiSendOtp(phone);
  };

  const loginWithOtp = async (phone, otp, name) => {
    setLoading(true);
    try {
      const res = await apiVerifyOtp(phone, otp, name);
      setUser(res.user);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const updateProfile = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
  };

  const addSavedAddress = (newAddress) => {
    if (!user) return;
    const currentAddresses = user.addresses || [];
    const updated = {
      ...user,
      addresses: [...currentAddresses, { id: 'addr-' + Date.now(), ...newAddress }],
    };
    setUser(updated);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        requestOtp,
        loginWithOtp,
        logout,
        updateProfile,
        addSavedAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
