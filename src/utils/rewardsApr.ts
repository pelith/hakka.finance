import REWARD_ABI from '../constants/abis/staking_rewards';
import IGAIN_ABI from '../constants/abis/iGainV1';
import {
  SHAKKA_POOL,
  ChainId,
  NEW_SHAKKA_ADDRESSES,
  STAKING_RATE_MODEL_RELEASE_TIME,
  SHAKKA_POOLS,
  JSON_RPC_PROVIDER,
} from '../constants';
import { REWARD_POOLS } from '../constants/rewards';
import { parseUnits } from 'viem';
import {
  getFinalStakingRate,
  getStartStakingRate,
} from './stakeReceivedAmount';
import { transferToYear } from '.';
import { getUnixTime } from 'date-fns';
import BigNumber from 'bignumber.js';
import Decimal from 'decimal.js';

const ZERO = 0n;
const WEI_PER_ETHER = 10n ** 18n;
const SECONDS_IN_YEAR = 31557600n; // 365.25 * 24 * 60 * 60

export async function bhsApr(_hakkaPrice: bigint): Promise<bigint> {
  return Promise.resolve(ZERO);
}

export async function balancer4tokenApr(_hakkaPrice: bigint): Promise<bigint> {
  // BHS/USDC/DAI/HAKKA
  return Promise.resolve(ZERO);
}

export async function balancer2tokenApr(_hakkaPrice: bigint): Promise<bigint> {
  // BHS/HAKKA
  return Promise.resolve(ZERO);
}

export async function mkrHakkaApr(_hakkaPrice: bigint): Promise<bigint> {
  // Uniswap MKR-HAKKA
  return Promise.resolve(ZERO);
}

export async function tftApr(_hakkaPrice: bigint): Promise<bigint> {
  // 3fmutual
  return Promise.resolve(ZERO);
}

export async function sHakkaApr(_hakkaPrice: bigint): Promise<bigint> {
  const now = getUnixTime(Date.now());
  const client = JSON_RPC_PROVIDER[ChainId.MAINNET];
  const rewardsAddress = REWARD_POOLS[SHAKKA_POOL].rewardsAddress;
  const stakingRate = 2218000000000000000n;
  const [stakedTotalSupply, rewardRate, periodFinish] = await client.multicall({
    contracts: [
      {
        address: rewardsAddress,
        abi: REWARD_ABI,
        functionName: 'totalSupply',
      },
      {
        address: rewardsAddress,
        abi: REWARD_ABI,
        functionName: 'rewardRate',
      },
      {
        address: rewardsAddress,
        abi: REWARD_ABI,
        functionName: 'periodFinish',
      },
    ],
    allowFailure: false,
  });

  if (periodFinish < BigInt(now) || stakedTotalSupply === 0n) return ZERO;
  const yearlyRewards = rewardRate * SECONDS_IN_YEAR;
  return BigInt(
    BigNumber(yearlyRewards)
      .multipliedBy(WEI_PER_ETHER)
      .div(stakedTotalSupply)
      .multipliedBy(stakingRate)
      .div(WEI_PER_ETHER)
      .toString(),
  );
}

export function sHakkaV2Apr(chainId: ChainId): () => Promise<bigint> {
  const now = Math.round(Date.now() / 1000);
  return async function (): Promise<bigint> {
    const client = JSON_RPC_PROVIDER[chainId];
    const rewardsAddress = REWARD_POOLS[SHAKKA_POOLS[chainId]!].rewardsAddress;
    const initStakingRate = getStartStakingRate(
      STAKING_RATE_MODEL_RELEASE_TIME[NEW_SHAKKA_ADDRESSES[chainId]],
    );
    const finalStakingRate = getFinalStakingRate(
      transferToYear(126230400),
      initStakingRate,
    ); // 126230400 = 365.25 * 60 * 60 * 24 * 4
    const finalStakingBN = parseUnits(finalStakingRate.toString(), 18);
    const stakedTotalSupply = (await client.readContract({
      address: rewardsAddress as any,
      abi: REWARD_ABI as any,
      functionName: 'totalSupply',
      args: [],
    })) as bigint;
    const rewardRate = (await client.readContract({
      address: rewardsAddress as any,
      abi: REWARD_ABI as any,
      functionName: 'rewardRate',
      args: [],
    })) as bigint;
    const periodFinish = (await client.readContract({
      address: rewardsAddress as any,
      abi: REWARD_ABI as any,
      functionName: 'periodFinish',
      args: [],
    })) as bigint;

    if (periodFinish < BigInt(now) || stakedTotalSupply === 0n) return ZERO;
    const yearlyRewards = rewardRate * SECONDS_IN_YEAR;
    return BigInt(
      Decimal(yearlyRewards)
        .mul(WEI_PER_ETHER)
        .div(stakedTotalSupply)
        .mul(finalStakingBN)
        .div(WEI_PER_ETHER)
        .toString(),
    );
  };
}

export function getGainAprFunc(
  iGainAddress: string,
  chainId: ChainId,
): (hakkaPrice: bigint, tokenPrice: number) => Promise<bigint> {
  const now = Math.round(Date.now() / 1000);
  return async function (
    hakkaPrice: bigint,
    tokenPrice: number,
  ): Promise<bigint> {
    const client = JSON_RPC_PROVIDER[chainId];
    const rewardsAddress = REWARD_POOLS[iGainAddress].rewardsAddress; // farm address
    const tokenAddress = REWARD_POOLS[iGainAddress].tokenAddress; // igain lp address
    const [
      stakedTotalSupply,
      rewardRate,
      periodFinish,
      poolA,
      poolB,
      totalSupply,
      decimals,
    ] = await client.multicall({
      contracts: [
        {
          address: rewardsAddress,
          abi: REWARD_ABI,
          functionName: 'totalSupply',
        },
        {
          address: rewardsAddress,
          abi: REWARD_ABI,
          functionName: 'rewardRate',
        },
        {
          address: rewardsAddress,
          abi: REWARD_ABI,
          functionName: 'periodFinish',
        },
        {
          address: tokenAddress,
          abi: IGAIN_ABI,
          functionName: 'poolA',
        },
        {
          address: tokenAddress,
          abi: IGAIN_ABI,
          functionName: 'poolB',
        },
        {
          address: tokenAddress,
          abi: IGAIN_ABI,
          functionName: 'totalSupply',
        },
        {
          address: tokenAddress,
          abi: IGAIN_ABI,
          functionName: 'decimals',
        },
      ],
      allowFailure: false,
    });

    const decimalBNUnit = parseUnits('1', decimals);
    const perLpPrice =
      (((poolA * poolB * 2n) / (poolA + poolB)) * decimalBNUnit) / totalSupply;

    const stakedTotalValue =
      (perLpPrice *
        (stakedTotalSupply === 0n ? perLpPrice : stakedTotalSupply)) /
      decimalBNUnit;

    if (periodFinish < BigInt(now) || stakedTotalValue === 0n) return ZERO;

    const tokenPriceMultiplier = parseUnits(tokenPrice.toFixed(4), decimals);
    const yearlyUsdRewards =
      (rewardRate * SECONDS_IN_YEAR * hakkaPrice) / WEI_PER_ETHER;

    const denominator =
      (stakedTotalValue * tokenPriceMultiplier) / decimalBNUnit;
    if (denominator === 0n) return ZERO;

    return (yearlyUsdRewards * decimalBNUnit) / denominator;
  };
}

export async function bscBhsApr(_hakkaPrice: bigint): Promise<bigint> {
  return Promise.resolve(ZERO);
}
