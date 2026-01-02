import { Contract } from 'ethers';
import { getContract } from 'viem'
import { ChainId } from '@uniswap/sdk';
import { useMemo } from 'react';
import { useConnectorClient, usePublicClient } from 'wagmi';
import ENS_ABI from '../constants/abis/ens-registrar';
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver';
import ERC20_BYTES32_ABI from '../constants/abis/erc20';
import ERC20_ABI from '../constants/abis/erc20';
import VESTING_ABI from '../constants/abis/vesting';
import BURNER_ABI from '../constants/abis/burner';
import STAKE_V1_ABI from '../constants/abis/shakka_v1';
import STAKE_ABI from '../constants/abis/shakka';
import REWARDS_ABI from '../constants/abis/staking_rewards';
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall';
import { useActiveWeb3React } from './web3Manager';
import { clientToProvider, clientToSigner } from '../utils/viemToEthers';
import isZero from '../utils/isZero';

// returns null on errors
/**
 * @deprecated
 */
export function useContract(
  address: string | undefined,
  ABI: any,
  withSignerIfPossible = true,
): Contract | null {
  const { account } = useActiveWeb3React();
  const publicClient = usePublicClient();
  const { data: walletClient } = useConnectorClient();

  return useMemo(() => {
    if (!address || isZero(address) || !ABI) return null;
    try {
      if (withSignerIfPossible && account && walletClient) {
        const signer = clientToSigner(walletClient as any);
        return new Contract(address, ABI, signer);
      }
      if (publicClient) {
        const provider = clientToProvider(publicClient as any);
        return new Contract(address, ABI, provider);
      }
      return null;
    } catch (error) {
      console.error('Failed to get contract', error);
      return null;
    }
  }, [address, ABI, publicClient, walletClient, withSignerIfPossible, account]);
}

export function useTokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean,
): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible);
}

export function useBurnContract(
  burnAddress?: string,
  withSignerIfPossible?: boolean,
): Contract | null {
  return useContract(burnAddress, BURNER_ABI, withSignerIfPossible);
}

export function useRewardsContract(
  claimAddress?: string,
  withSignerIfPossible?: boolean,
): Contract | null {
  return useContract(claimAddress, REWARDS_ABI, withSignerIfPossible);
}

export function useStakeV1Contract(
  stakeAddress?: string,
  withSignerIfPossible?: boolean,
): Contract | null {
  return useContract(stakeAddress, STAKE_V1_ABI, withSignerIfPossible);
}

export function useStakeContract(
  stakeAddress?: string,
  withSignerIfPossible?: boolean,
): Contract | null {
  return useContract(stakeAddress, STAKE_ABI, withSignerIfPossible);
}

export function useVestingContract(
  vestingAddress?: string,
  withSignerIfPossible?: boolean,
): Contract | null {
  return useContract(vestingAddress, VESTING_ABI, withSignerIfPossible);
}

export function useENSRegistrarContract(
  withSignerIfPossible?: boolean,
): Contract | null {
  const { chainId } = useActiveWeb3React();
  let address: string | undefined;
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
        break;
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible);
}

export function useENSResolverContract(
  address: string | undefined,
  withSignerIfPossible?: boolean,
): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible);
}

export function useBytes32TokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean,
): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible);
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React();
  return useContract(
    chainId && MULTICALL_NETWORKS[chainId],
    MULTICALL_ABI,
    false,
  );
}
