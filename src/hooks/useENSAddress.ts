import { useEnsAddress as useWagmiEnsAddress } from 'wagmi';

/**
 * Does a lookup for an ENS name to find its address.
 */
export default function useENSAddress(ensName?: string): {
  loading: boolean;
  address: string | null | undefined;
} {

  const { data: address, isLoading } = useWagmiEnsAddress({
    name: ensName,
  })
  return {
    address,
    loading: isLoading,
  }
}
