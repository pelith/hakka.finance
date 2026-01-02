import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

// Re-export for backwards compatibility
export { useActiveWeb3React } from './useActiveWeb3React';

/**
 * wagmi handles eager connection automatically via autoConnect
 * This hook is kept for backwards compatibility
 */
export function useEagerConnect() {
  const { isConnected } = useAccount();
  const [tried, setTried] = useState(false);

  useEffect(() => {
    // wagmi handles reconnection automatically
    setTried(true);
  }, []);

  useEffect(() => {
    if (isConnected) {
      setTried(true);
    }
  }, [isConnected]);

  return tried;
}

/**
 * wagmi handles wallet events automatically
 * This hook is kept for backwards compatibility but is mostly a no-op
 */
export function useInactiveListener(suppress = false) {
  // wagmi handles chainChanged and accountsChanged events automatically
  // This hook is kept for backwards compatibility
  return;
}
