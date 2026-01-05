import { getContract, parseEther, parseUnits } from 'viem';
import ERC20_ABI from '../constants/abis/erc20';
import {
  HAKKA,
  ChainId,
  BHS_ADDRESS,
  DAI_ADDRESS,
  USDC_ADDRESS,
  BHS_USDC_DAI_HAKKA_BPT,
  BHS_USDC_DAI_HAKKA_POOL,
  BHS_HAKKA_BPT,
  BHS_HAKKA_POOL,
  JSON_RPC_PROVIDER,
} from '../constants';

import REWARD_ABI from '../constants/abis/staking_rewards';
import IGAIN_ABI from '../constants/abis/iGainV1';
import { REWARD_POOLS } from '../constants/rewards';

const WEI_PER_ETHER = 10n ** 18n;

function getTokenPrice(source: any, tokenSlug: string): bigint {
  return parseEther(source[tokenSlug] ? source[tokenSlug].usd.toString() : '0');
}

export async function balancer4tokenTvl(tokenPrice: any): Promise<bigint> {
  const client = JSON_RPC_PROVIDER[ChainId.MAINNET];
  const [
    hakkaBalance,
    daiBalance,
    usdcBalance,
    bhsBalance,
    bptSupply,
    poolBpt,
  ] = await client.multicall({
    contracts: [
      {
        address: HAKKA[ChainId.MAINNET].address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [BHS_USDC_DAI_HAKKA_BPT],
      },
      {
        address: DAI_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [BHS_USDC_DAI_HAKKA_BPT],
      },
      {
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [BHS_USDC_DAI_HAKKA_BPT],
      },
      {
        address: BHS_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [BHS_USDC_DAI_HAKKA_BPT],
      },
      {
        address: BHS_USDC_DAI_HAKKA_BPT,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
        args: [],
      },
      {
        address: BHS_USDC_DAI_HAKKA_BPT,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [BHS_USDC_DAI_HAKKA_POOL],
      },
    ] as const,
    allowFailure: false,
  });

  const hakkaPrice = getTokenPrice(tokenPrice, 'hakka-finance');
  const daiPrice = getTokenPrice(tokenPrice, 'dai');
  const usdcPrice = getTokenPrice(tokenPrice, 'usd-coin');
  const bhsPrice = getTokenPrice(tokenPrice, 'blackholeswap-compound-dai-usdc');
  const hakkaValue = hakkaBalance * hakkaPrice;
  const daiValue = daiBalance * daiPrice;
  const usdcValue = usdcBalance * usdcPrice;
  const bhsValue = bhsBalance * bhsPrice;
  const pricePerBpt =
    (hakkaValue + daiValue + usdcValue + bhsValue) / bptSupply;

  // console.log(formatUnits(pricePerBpt.mul(poolBpt).div(WeiPerEther)))
  return (pricePerBpt * poolBpt) / WEI_PER_ETHER;
}

export async function balancer2tokenTvl(tokenPrice: any): Promise<bigint> {
  const client = JSON_RPC_PROVIDER[ChainId.MAINNET];
  const [hakkaBalance, bhsBalance, bptSupply, poolBpt] = await client.multicall(
    {
      contracts: [
        {
          address: HAKKA[ChainId.MAINNET].address,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [BHS_HAKKA_BPT],
        },
        {
          address: BHS_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [BHS_HAKKA_BPT],
        },
        {
          address: BHS_HAKKA_BPT,
          abi: ERC20_ABI,
          functionName: 'totalSupply',
          args: [],
        },
        {
          address: BHS_HAKKA_BPT,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [BHS_HAKKA_POOL],
        },
      ] as const,
      allowFailure: false,
    },
  );

  const hakkaPrice = getTokenPrice(tokenPrice, 'hakka-finance');
  const bhsPrice = getTokenPrice(tokenPrice, 'blackholeswap-compound-dai-usdc');
  const hakkaValue = hakkaBalance * hakkaPrice;
  const bhsValue = bhsBalance * bhsPrice;
  const pricePerBpt = (hakkaValue + bhsValue) / bptSupply;

  // console.log(formatUnits(pricePerBpt.mul(poolBpt).div(WeiPerEther)))
  return (pricePerBpt * poolBpt) / WEI_PER_ETHER;
}

export function getGainTvlFunc(
  iGainAddress: string,
  chainId: ChainId,
  tokenPriceKey?: string,
): (tokenPrice: any) => Promise<bigint> {
  return async function (tokenPrice: any): Promise<bigint> {
    const client = JSON_RPC_PROVIDER[chainId];
    const rewardsAddress = REWARD_POOLS[iGainAddress].rewardsAddress; // farm address
    const tokenAddress = REWARD_POOLS[iGainAddress].tokenAddress; // igain lp address
    const [stakedTotalSupply, poolA, poolB, totalSupply, decimals] =
      await client.multicall({
        contracts: [
          {
            address: rewardsAddress,
            abi: REWARD_ABI,
            functionName: 'totalSupply',
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
    const baseTokenTvl = (perLpPrice * stakedTotalSupply) / decimalBNUnit;
    if (!tokenPriceKey) {
      return baseTokenTvl;
    }
    return (
      (baseTokenTvl *
        parseUnits(
          (tokenPrice?.[tokenPriceKey]?.usd || 1).toString(),
          decimals,
        )) /
      decimalBNUnit
    );
  };
}
