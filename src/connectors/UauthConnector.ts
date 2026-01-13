import { UAuthConnector } from '@uauth/web3-react';
import { initializeConnector } from '@web3-react/core';
import { injected } from './Injected';
import { walletconnect } from './WalletConnect';
const UAUTH_CLIENT_ID = import.meta.env.APP_UAUTH_CLIENT_ID;
export const uauthOptions: any = {
  clientID: UAUTH_CLIENT_ID || 'client_id',
  redirectUri:
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:8000',
  postLogoutRedirectUri: 'https://hakka.finance',
  scope: 'openid wallet',
  connectors: { injected: injected, walletconnect: walletconnect },
};
export const [uauth, uauthhooks] = initializeConnector(
  (actions) => new UAuthConnector({ actions, options: uauthOptions }) as any,
);
