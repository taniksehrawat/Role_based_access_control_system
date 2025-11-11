import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
  const { hasPermission, user } = useAuth();

  const can = (permission) => {
    return hasPermission(permission);
  };

  const canAccess = (permission, fallback = null) => {
    return hasPermission(permission) ? fallback : 'none';
  };

  const isAdmin = user?.role === 'admin';
  const isEditor = user?.role === 'editor';
  const isViewer = user?.role === 'viewer';

  return {
    can,
    canAccess,
    isAdmin,
    isEditor,
    isViewer,
    userRole: user?.role
  };
};