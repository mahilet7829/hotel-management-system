import { create } from 'zustand';

const useAuthStore = create((set) => ({
  // State
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  // Actions
  login: (userData, token) => {
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);

    // Update state
    set({
      user: userData,
      token: token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Reset state
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  updateUser: (userData) => {
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(userData));

    // Update state
    set({
      user: userData,
    });
  },
}));

export default useAuthStore;