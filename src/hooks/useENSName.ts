import useDebounce from './useDebounce';
import { useEnsName } from 'wagmi';
import type { Address } from 'viem';

/**
 * Does a reverse lookup for an address to find its ENS name.
 * Note this is not the same as looking up an ENS name to find an address.
 */
export default function useENSName(address?: string): {
  ENSName: string | null | undefined;
  loading: boolean;
} {
  const debouncedAddress = useDebounce(address, 200);

  const { data: ensName, isLoading } = useEnsName({
    address: debouncedAddress as Address,
    chainId: 1,
  });

  const changed = debouncedAddress !== address;
  return {
    ENSName: ensName,
    loading: isLoading || changed,
  };
}
