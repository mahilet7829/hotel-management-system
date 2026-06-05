import useAuthStore from '../store/authStore';

const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const logout = useAuthStore((state) => state.logout);

  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles) => {
    return roles.some(role => user?.roles?.includes(role)) || false;
  };

  const getDisplayName = () => {
    if (!user) return 'User';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  };

  const getRoleBadge = () => {
    const roles = user?.roles || [];
    if (roles.includes('ROLE_ADMIN')) return 'Admin';
    if (roles.includes('ROLE_MANAGER')) return 'Manager';
    if (roles.includes('ROLE_WAITER')) return 'Waiter';
    if (roles.includes('ROLE_CHEF')) return 'Chef';
    if (roles.includes('ROLE_CLEANER')) return 'Cleaner';
    return 'User';
  };

  return {
    user,
    token,
    isAuthenticated,
    isHydrated,
    isLoading: !isHydrated,
    hasRole,
    hasAnyRole,
    getDisplayName,
    getRoleBadge,
    logout,
  };
};

export default useAuth;