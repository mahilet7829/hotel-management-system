import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      login: (userData, token) => {
        localStorage.setItem('token', token);
        set({ user: userData, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, isAuthenticated: false });
      },
      updateUser: (userData) => set({ user: userData }),
      setIsHydrated: (val) => set({ isHydrated: val }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Hydration error:', error);
            // Force hydration on error
            useAuthStore.getState().setIsHydrated(true);
          } else if (state) {
            state.setIsHydrated(true);
          } else {
            // No stored state, hydrate anyway
            useAuthStore.getState().setIsHydrated(true);
          }
        };
      },
    }
  )
);

export default useAuthStore;