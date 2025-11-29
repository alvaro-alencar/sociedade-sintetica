'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * Provider para TanStack Query
 * Gerencia cache, refetch e estado global de queries
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache por 5 minutos
            staleTime: 5 * 60 * 1000,
            // Não refetch automático ao focar janela (evita requests desnecessários)
            refetchOnWindowFocus: false,
            // Retry uma vez em caso de erro
            retry: 1,
            // Tempo máximo de cache antes de considerar "stale"
            gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
