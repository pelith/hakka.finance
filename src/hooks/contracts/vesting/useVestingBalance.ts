import { useReadContract } from 'wagmi';
import { formatUnits, isAddress, type Address } from 'viem';
import VESTING_ABI from '@/constants/abis/vesting';
import { VESTING_ADDRESSES } from '@/constants';
import type { ChainId } from '@/constants';

export function useVestingBalance(address: string, chainId: ChainId) {
  return useReadContract({
    address: VESTING_ADDRESSES[chainId] as Address,
    abi: VESTING_ABI,
    functionName: 'balanceOf',
    args: [address as Address],
    chainId: chainId,
    query: {
      select(data) {
        return formatUnits(data, 18);
      },
      initialData: 0n,
      enabled: isAddress(address),
    },
  });
}
