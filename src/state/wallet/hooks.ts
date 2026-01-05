import { useMemo } from 'react';

import ERC20_ABI from '../../constants/abis/erc20';
import { formatUnits, getContract, type Address } from 'viem';
import type { ChainId } from 'src/constants';
import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  address: Address,
  tokens: {
    address: Address;
    decimals: number;
    symbol: string;
    name: string;
  }[],
  chainId: ChainId,
): [{ [tokenAddress: string]: string } | undefined, boolean] {
  const publicClient = usePublicClient({ chainId });
  const erc20ContractInstances = useMemo(() => {
    return tokens.map((tokenInfo) => {
      return getContract({
        abi: ERC20_ABI,
        address: tokenInfo.address,
        client: publicClient,
      });
    });
  }, [tokens, chainId]);

  const { data: tokenBalances, isLoading: isLoadingTokenBalances } = useQuery({
    queryKey: [
      'token-balances',
      chainId,
      address,
      tokens
        .map((tokenInfo) => tokenInfo.name)
        .sort()
        .join(),
    ],
    async queryFn() {
      const balances = await Promise.all(
        erc20ContractInstances.map((contract) =>
          contract.read.balanceOf([address]),
        ),
      );
      return Object.fromEntries(
        balances.map((balance, index) => {
          return [
            tokens[index].address,
            formatUnits(balance, tokens[index].decimals),
          ] as const;
        }),
      );
    },
  });

  return [tokenBalances, isLoadingTokenBalances];
}

export function useTokenBalances(
  address: Address,
  tokens: {
    address: Address;
    decimals: number;
    symbol: string;
    name: string;
  }[],
  chainId: ChainId,
): { [tokenAddress: string]: string } | undefined {
  return useTokenBalancesWithLoadingIndicator(address, tokens, chainId)[0];
}

// get the balance for a single token/account combo
export function useTokenBalance(
  account: Address,
  token: { address: Address; decimals: number; symbol: string; name: string },
  chainId: ChainId,
): string | undefined {
  const tokenBalances = useTokenBalances(account, [token], chainId);
  if (!tokenBalances) return undefined;
  return tokenBalances[token.address] ?? '0';
}
