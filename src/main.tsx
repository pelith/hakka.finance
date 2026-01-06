/** @jsxImportSource theme-ui */
import ReactDOM from 'react-dom/client';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { config } from './wagmi.config';
import { routeTree } from './routeTree.gen';
import { ContextProviders } from './state';
import { initGtm, trackSpaRouteChangesWithGtm } from './thirdParty/gtm';
import { initTawk } from './thirdParty/tawk';
import { ThemeUIProvider } from 'theme-ui';
import { theme } from './theme';

// Create a new router instance
const router = createRouter({ routeTree });

if (import.meta.env.PROD) {
  initGtm('GTM-5RNGTLZ');
  trackSpaRouteChangesWithGtm({ eventName: 'routeChangeEvent' });
  initTawk({
    tawkId: import.meta.env.APP_TAWK_ID,
    tawkKey: import.meta.env.APP_TAWK_KEY,
  });
}

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeUIProvider theme={theme}>
      <WagmiProvider config={config.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ContextProviders>
            <RouterProvider router={router} />
          </ContextProviders>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeUIProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
