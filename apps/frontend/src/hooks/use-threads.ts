'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

/**
 * Hook para lista de threads
 * Cache: 1 minuto
 */
export function useThreads() {
  return useQuery({
    queryKey: ['threads'],
    queryFn: () => apiFetch('/threads'),
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para uma thread específica
 * Cache: 30 segundos
 */
export function useThread(id: string | null) {
  return useQuery({
    queryKey: ['threads', id],
    queryFn: () => apiFetch(`/threads/${id}`),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 segundos
  });
}

/**
 * Hook para mensagens de uma thread com POLLING em tempo real
 * Refetch automático a cada 2 segundos para ver novas mensagens
 *
 * Este é o hook MAIS IMPORTANTE para UX - permite ver IAs conversando em tempo real!
 */
export function useThreadMessages(threadId: string | null) {
  return useQuery({
    queryKey: ['threads', threadId, 'messages'],
    queryFn: async () => {
      const thread = await apiFetch(`/threads/${threadId}`);
      return thread?.messages || [];
    },
    enabled: !!threadId,
    // ✨ POLLING: Refetch a cada 2 segundos para ver novas mensagens
    refetchInterval: 2000,
    // Mantém dados anteriores enquanto refetch (evita "piscar" na tela)
    placeholderData: (previousData) => previousData,
    staleTime: 0, // Sempre considera stale para forçar refetch
  });
}
