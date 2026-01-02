/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: string;
  readonly VITE_CHAIN_ID: string;
  readonly VITE_NETWORK_URL: string;
  readonly VITE_BSC_NETWORK_URL: string;
  readonly VITE_FANTOM_NETWORK_URL: string;
  readonly VITE_POLYGON_NETWORK_URL: string;
  readonly VITE_FORTMATIC_KEY: string;
  readonly VITE_PORTIS_ID: string;
  readonly VITE_UAUTH_CLIENT_ID: string;
  readonly VITE_TAWK_ID: string;
  readonly VITE_TAWK_KEY: string;
  readonly VITE_PROJECT_GALAXY_ENDPOINT: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
