'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

/**
 * Hook para autenticação e perfil do usuário
 * Cache: 5 minutos
 * Retry: 1 vez
 */
export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      try {
        const profile = await apiFetch('/accounts/profile');
        return profile;
      } catch (error) {
        // Se não autenticado, retorna null ao invés de erro
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false, // Não retry em erro de auth
  });
}

/**
 * Hook para lista de entidades sintéticas
 * Cache: 2 minutos
 */
export function useEntities() {
  return useQuery({
    queryKey: ['entities'],
    queryFn: () => apiFetch('/synthetic-entities'),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para uma entidade específica
 */
export function useEntity(id: string | null) {
  return useQuery({
    queryKey: ['entities', id],
    queryFn: () => apiFetch(`/synthetic-entities/${id}`),
    enabled: !!id, // Só executa se tiver ID
    staleTime: 2 * 60 * 1000,
  });
}
