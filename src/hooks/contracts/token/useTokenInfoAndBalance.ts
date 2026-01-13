import { useReadContracts } from 'wagmi';
import { erc20Abi, formatUnits, isAddress, type Address } from 'viem';
import type { ChainId } from '@/constants';
export function useTokenInfoAndBalance(
  address: string,
  tokenAddress: string,
  chainId?: ChainId,
) {
  const { data: tokenInfo, isSuccess } = useTokenInfo(tokenAddress, chainId);
  return useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        address: tokenAddress as Address,
        functionName: 'balanceOf',
        args: [address as Address],
        chainId: chainId,
      },
    ] as const,
    query: {
      enabled: isAddress(address) && isSuccess,
      select(data) {
        const [balance] = data;
        const { decimals, symbol, name } = tokenInfo!;
        if (balance.status === 'failure') return undefined;
        return {
          balanceRaw: balance.result,
          decimals: decimals,
          symbol: symbol,
          name: name,
          balance: formatUnits(balance.result, decimals),
        };
      },
    },
  });
}

export function useTokenInfo(tokenAddress: string, chainId?: ChainId) {
  return useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        address: tokenAddress as Address,
        functionName: 'decimals',
        args: [],
        chainId: chainId,
      },
      {
        abi: erc20Abi,
        address: tokenAddress as Address,
        functionName: 'symbol',
        args: [],
        chainId: chainId,
      },
      {
        abi: erc20Abi,
        address: tokenAddress as Address,
        functionName: 'name',
        args: [],
        chainId: chainId,
      },
    ] as const,
    query: {
      enabled: isAddress(tokenAddress),
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      select(data) {
        const [decimals, symbol, name] = data;
        if (
          decimals.status === 'failure' ||
          symbol.status === 'failure' ||
          name.status === 'failure'
        )
          return undefined;
        return {
          decimals: decimals.result,
          symbol: symbol.result,
          name: name.result,
        };
      },
    },
  });
}
