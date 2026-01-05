import { http, createConfig } from 'wagmi';
import { mainnet, bsc, polygon, fantom } from 'wagmi/chains';
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors';
import { WagmiAdapter} from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
const projectId = import.meta.env.APP_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error('APP_WALLETCONNECT_PROJECT_ID is not defined');
}

export const config = new WagmiAdapter({
  networks: [mainnet, bsc, polygon, fantom],
  projectId,
  ssr: false,
  connectors: [
    coinbaseWallet({
      appName: 'Hakka Finance',
      appLogoUrl: 'https://hakka.finance/icon.png',
    }),
  ],
  transports: {
    [mainnet.id]: http(import.meta.env.APP_NETWORK_URL),
    [bsc.id]: http(import.meta.env.APP_BSC_NETWORK_URL),
    [polygon.id]: http(import.meta.env.APP_POLYGON_NETWORK_URL),
    [fantom.id]: http(import.meta.env.APP_FANTOM_NETWORK_URL),
  }
})

createAppKit({
  adapters: [config],
  networks: [mainnet, bsc, polygon, fantom],
  projectId,
  metadata: {
    name: 'Hakka Finance',
    description: 'Hakka Finance DeFi Platform',
    url: 'https://hakka.finance',
    icons: ['https://hakka.finance/icon.png'],
  },
  features: {
    email: false,
    socials: false
  }
})
declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
