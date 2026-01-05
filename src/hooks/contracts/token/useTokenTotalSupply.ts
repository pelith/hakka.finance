import type { ChainId } from 'src/constants';
import { erc20Abi, formatUnits, isAddress, type Address } from 'viem';
import { useReadContract } from 'wagmi';
import { useTokenInfo } from './useTokenInfoAndBalance';

export default function useTokenTotalSupply(
  tokenAddress: Address,
  chainId: ChainId,
) {
  const { data: tokenInfo, isSuccess } = useTokenInfo(tokenAddress, chainId);
  return useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'totalSupply',
    args: [],
    chainId: chainId,
    query: {
      enabled: isAddress(tokenAddress) && isSuccess,
      select(data) {
        return formatUnits(data, tokenInfo!.decimals);
      },
    },
  });
}
