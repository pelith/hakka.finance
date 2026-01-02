import { http, createConfig } from 'wagmi';
import { mainnet, bsc, polygon, fantom } from 'wagmi/chains';
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not defined');
}

export const config = createConfig({
  chains: [mainnet, bsc, polygon, fantom],
  connectors: [
    injected(),
    walletConnect({
      projectId,
      metadata: {
        name: 'Hakka Finance',
        description: 'Hakka Finance DeFi Platform',
        url: 'https://hakka.finance',
        icons: ['https://hakka.finance/icon.png'],
      },
      showQrModal: true,
    }),
    coinbaseWallet({
      appName: 'Hakka Finance',
      appLogoUrl:
        'https://raw.githubusercontent.com/hakka-finance/token-profile/e84d84e3345a9ef52c863a84867e9460a0ed1a40/images/0x0E29e5AbbB5FD88e28b2d355774e73BD47dE3bcd.png',
    }),
  ],
  transports: {
    [mainnet.id]: http(import.meta.env.VITE_NETWORK_URL),
    [bsc.id]: http(import.meta.env.VITE_BSC_NETWORK_URL),
    [polygon.id]: http(import.meta.env.VITE_POLYGON_NETWORK_URL),
    [fantom.id]: http(import.meta.env.VITE_FANTOM_NETWORK_URL),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
