'use client';

import { authApi } from '@/lib/api/auth';
import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };
}
