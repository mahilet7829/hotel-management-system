import useAuthStore from '../store/authStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout, updateUser } = useAuthStore();

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  const hasAnyRole = (roles) => {
    if (!user || !user.roles) return false;
    return roles.some((role) => user.roles.includes(role));
  };

  const isAdmin = () => hasRole('ROLE_ADMIN');
  const isManager = () => hasAnyRole(['ROLE_ADMIN', 'ROLE_MANAGER']);
  const isWaiter = () => hasRole('ROLE_WAITER');
  const isChef = () => hasRole('ROLE_CHEF');
  const isCleaner = () => hasRole('ROLE_CLEANER');

  const getDisplayName = () => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`.trim();
  };

  const getRoleBadge = () => {
    if (!user || !user.roles) return 'Staff';
    if (hasRole('ROLE_ADMIN')) return 'Admin';
    if (hasRole('ROLE_MANAGER')) return 'Manager';
    if (hasRole('ROLE_WAITER')) return 'Waiter';
    if (hasRole('ROLE_CHEF')) return 'Chef';
    if (hasRole('ROLE_CLEANER')) return 'Cleaner';
    return 'Staff';
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
    isAdmin,
    isManager,
    isWaiter,
    isChef,
    isCleaner,
    getDisplayName,
    getRoleBadge,
  };
};

export default useAuth;