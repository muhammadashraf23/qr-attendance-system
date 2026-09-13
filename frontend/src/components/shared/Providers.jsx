'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export default function Providers({ children }) {
  // Register Service Worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          success: {
            style: { background: '#2E7D32', color: '#fff' },
            iconTheme: { primary: '#fff', secondary: '#2E7D32' },
          },
          error: {
            style: { background: '#E53935', color: '#fff' },
          },
          duration: 4000,
        }}
      />
    </QueryClientProvider>
  );
}
