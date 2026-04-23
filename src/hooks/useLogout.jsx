import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const queryClient = useQueryClient();

  const logout = (options = {}) => {
    const {
      redirectTo = '/login',
      clearStorage = true,
      clearQueryCache = true,
    } = options;

    // Clear auth context
    if (authLogout) {
      authLogout();
    }

    // Clear all storage
    if (clearStorage) {
      localStorage.clear(); // Clears all localStorage
      sessionStorage.clear(); // Clears all sessionStorage
    }

    // Clear TanStack Query cache
    if (clearQueryCache) {
      queryClient.clear(); // Removes all queries from cache
    }

    // Redirect to login page
    navigate(redirectTo, { replace: true });
  };

  return logout;
};