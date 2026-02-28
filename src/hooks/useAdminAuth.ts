import { useAuth } from '@/contexts/AuthContext';

export const useAdminAuth = () => {
  const { user, isAdmin, loading } = useAuth();
  return { user, isAdmin, loading };
};
