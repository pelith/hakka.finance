/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_ENV: string;
  readonly APP_CHAIN_ID: string;
  readonly APP_NETWORK_URL: string;
  readonly APP_BSC_NETWORK_URL: string;
  readonly APP_FANTOM_NETWORK_URL: string;
  readonly APP_POLYGON_NETWORK_URL: string;
  readonly APP_FORTMATIC_KEY: string;
  readonly APP_PORTIS_ID: string;
  readonly APP_UAUTH_CLIENT_ID: string;
  readonly APP_TAWK_ID: string;
  readonly APP_TAWK_KEY: string;
  readonly APP_PROJECT_GALAXY_ENDPOINT: string;
  readonly APP_WALLETCONNECT_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
