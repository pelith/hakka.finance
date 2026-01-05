import { useCallback } from 'react';
import { erc20Abi, isAddress, type Address } from 'viem';
import { useReadContract, useWriteContract } from 'wagmi';
const MAX_UINT256 = 2n ** 256n - 1n;
export function useTokenAllowance(
  address: string,
  tokenAddress: string,
  spender: string,
) {
  return useReadContract({
    address: tokenAddress as Address,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address as Address, spender as Address],
    query: {
      enabled:
        isAddress(tokenAddress) && isAddress(address) && isAddress(spender),
    },
  });
}

export function useAddTokenAllowance(tokenAddress: Address, spender: Address) {
  const { writeContractAsync } = useWriteContract();
  return useCallback(async () => {
    return writeContractAsync({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender as Address, MAX_UINT256],
    });
  }, [writeContractAsync, tokenAddress, spender]);
}
