import UAuth from '@uauth/js';
import { useEffect, useState } from 'react';
import { isAddress } from '../utils';
import useDebounce from './useDebounce';
export const uauthOptions = {
  clientID: import.meta.env.APP_UAUTH_CLIENT_ID || 'client_id',
  redirectUri:
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:8000',
  postLogoutRedirectUri: 'https://hakka.finance',
  scope: 'openid wallet',
};
export default function useUnstoppableDomains(address?: string): {
  unstoppableDomain: string | null;
  loading: boolean;
} {
  const debouncedAddress = useDebounce(address, 200);
  const username = window.localStorage.getItem('username');
  const changed = debouncedAddress !== address;
  const [domain, setDomain] = useState('');
  useEffect(() => {
    if (
      !debouncedAddress ||
      !isAddress(debouncedAddress) ||
      !username ||
      changed
    ) {
      setDomain('');
      return;
    }
    try {
      new UAuth(uauthOptions).user().then((user) => {
        setDomain(user.sub || '');
      });
    } catch (_error) {
      setDomain('');
    }
  }, [debouncedAddress, username, changed]);

  return {
    unstoppableDomain: changed || !domain ? null : domain,
    loading: changed || domain === null,
  };
}
