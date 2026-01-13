import { useAccount, useConnectorClient } from 'wagmi';
import { useMemo } from 'react';
import type { Account, Chain, Client, Transport } from 'viem';
import { useConnectors } from 'wagmi';
import { ChainId } from '@/constants';

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  return {
    account,
    chain,
    transport,
  };
}

/**
 * Compatibility hook that mimics @web3-react/core's useWeb3React
 * Returns wagmi equivalents for account, chainId, and provider
 */
export function useActiveWeb3React() {
  const {
    address: account,
    isConnected: isActive,
    connector,
    chainId,
  } = useAccount();
  const connectors = useConnectors();
  const { data: connectorClient } = useConnectorClient();

  const provider = useMemo(() => {
    if (!connectorClient) return undefined;
    return connectorClient;
  }, [connectorClient]);

  return {
    account: account ?? '',
    chainId: (chainId as ChainId) ?? ChainId.MAINNET,
    isActive,
    connector,
    connectors,
    provider,
    library: provider, // alias for compatibility
  };
}

// Alias for backwards compatibility
export const useWeb3ReactCore = useActiveWeb3React;
