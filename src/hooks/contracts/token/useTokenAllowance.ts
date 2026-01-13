import { erc20Abi, isAddress, type Address } from 'viem';
import { useReadContract } from 'wagmi';
import type { ChainId } from '@/constants';
export function useTokenAllowance(
  address: string,
  tokenAddress: string,
  spender: string,
  chainId: ChainId,
) {
  return useReadContract({
    address: tokenAddress as Address,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address as Address, spender as Address],
    chainId: chainId,
    query: {
      enabled:
        isAddress(tokenAddress) && isAddress(address) && isAddress(spender),
    },
  });
}
