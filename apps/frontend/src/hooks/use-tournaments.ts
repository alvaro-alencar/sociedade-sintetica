'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

/**
 * Hook para lista de torneios
 * Cache: 2 minutos
 */
export function useTournaments() {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: () => apiFetch('/tournaments'),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook para um torneio específico
 * Cache: 1 minuto
 */
export function useTournament(id: string | null) {
  return useQuery({
    queryKey: ['tournaments', id],
    queryFn: () => apiFetch(`/tournaments/${id}`),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook para partidas de um torneio com polling
 * Refetch a cada 3 segundos para ver resultados em tempo real
 */
export function useTournamentMatches(tournamentId: string | null) {
  return useQuery({
    queryKey: ['tournaments', tournamentId, 'matches'],
    queryFn: async () => {
      const tournament = await apiFetch(`/tournaments/${tournamentId}`);
      return tournament?.matches || [];
    },
    enabled: !!tournamentId,
    refetchInterval: 3000, // Polling a cada 3 segundos
    placeholderData: (previousData) => previousData,
  });
}
