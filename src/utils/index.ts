import {
  Currency,
  CurrencyAmount,
  JSBI,
  Percent,
  Token,
  TokenAmount,
} from '@uniswap/sdk';
import {
  getAddress,
  hexToString,
  parseUnits,
  type Address,
  type PublicClient,
} from 'viem';
import { ChainId } from '../constants';
import ERC20_ABI from '../constants/abis/erc20';
import ERC20_BYTES32_ABI from '../constants/abis/erc20_bytes32';

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

const ETHERSCAN_PREFIXES: { [chainId in ChainId]: string } = {
  1: '',
  56: '',
  137: '',
  250: '',
};

export function getEtherscanLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address',
): string {
  const prefix =
    chainId === ChainId.BSC
      ? 'https://bscscan.com'
      : chainId === ChainId.POLYGON
        ? 'https://polygonscan.com'
        : chainId === ChainId.FANTOM
          ? 'https://ftmscan.com'
          : `https://${
              ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]
            }etherscan.io`;

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`;
    }
    case 'token': {
      return `${prefix}/token/${data}`;
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`;
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address);
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

export function shortenTxId(address: string, chars = 6): string {
  return `${address.substring(0, chars + 2)}...${address.substring(64 - chars)}`;
}

// add 10%
export function calculateGasMargin(value: bigint): bigint {
  return (value * 11000n) / 10000n;
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000));
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function getNetworkName(networkId: number) {
  switch (networkId) {
    case 1: {
      return 'Main Network';
    }
    case 3: {
      return 'Ropsten';
    }
    case 5: {
      return 'Görli';
    }
    default: {
      return 'correct network';
    }
  }
}

function bytes32ToString(bytes32: `0x${string}`): string {
  try {
    return hexToString(bytes32, { size: 32 }).replace(/\u0000/g, '');
  } catch {
    return '';
  }
}

export async function isERC20Contract(
  tokenAddress: string,
  client: PublicClient,
): Promise<boolean> {
  try {
    await getTokenName(tokenAddress, client);
    return true;
  } catch {
    return false;
  }
}

export const ERROR_CODES = [
  'TOKEN_NAME',
  'TOKEN_SYMBOL',
  'TOKEN_DECIMALS',
].reduce((accumulator: any, currentValue: string, currentIndex: number) => {
  accumulator[currentValue] = currentIndex;
  return accumulator;
}, {});

export async function getTokenName(tokenAddress: string, client: PublicClient) {
  if (!isAddress(tokenAddress)) {
    throw Error(`Invalid 'tokenAddress' parameter '${tokenAddress}'.`);
  }

  try {
    return (await client.readContract({
      address: tokenAddress as Address,
      abi: ERC20_ABI as any,
      functionName: 'name',
      args: [],
    })) as string;
  } catch (_e) {
    try {
      const bytes32 = (await client.readContract({
        address: tokenAddress as Address,
        abi: ERC20_BYTES32_ABI as any,
        functionName: 'name',
        args: [],
      })) as `0x${string}`;
      return bytes32ToString(bytes32);
    } catch (error: any) {
      error.code = ERROR_CODES.TOKEN_NAME;
      throw error;
    }
  }
}

export async function getTokenSymbol(
  tokenAddress: string,
  client: PublicClient,
) {
  if (!isAddress(tokenAddress)) {
    throw Error(`Invalid 'tokenAddress' parameter '${tokenAddress}'.`);
  }

  try {
    return (await client.readContract({
      address: tokenAddress as Address,
      abi: ERC20_ABI as any,
      functionName: 'symbol',
      args: [],
    })) as string;
  } catch (_e) {
    try {
      const bytes32 = (await client.readContract({
        address: tokenAddress as Address,
        abi: ERC20_BYTES32_ABI as any,
        functionName: 'symbol',
        args: [],
      })) as `0x${string}`;
      return bytes32ToString(bytes32);
    } catch (error: any) {
      error.code = ERROR_CODES.TOKEN_SYMBOL;
      throw error;
    }
  }
}

export async function getTokenDecimals(
  tokenAddress: string,
  client: PublicClient,
) {
  if (!isAddress(tokenAddress)) {
    throw Error(`Invalid 'tokenAddress' parameter '${tokenAddress}'.`);
  }

  try {
    return (await client.readContract({
      address: tokenAddress as Address,
      abi: ERC20_ABI as any,
      functionName: 'decimals',
      args: [],
    })) as number;
  } catch (error: any) {
    error.code = ERROR_CODES.TOKEN_DECIMALS;
    throw error;
  }
}

export function tryParseAmount(value?: string): CurrencyAmount | undefined {
  if (!value) {
    return CurrencyAmount.ether(JSBI.BigInt('0'));
  }
  try {
    const typedValueParsed = parseUnits(value, 18).toString();
    if (typedValueParsed !== '0') {
      return CurrencyAmount.ether(JSBI.BigInt(typedValueParsed));
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  // necessary for all paths to return a value
  return CurrencyAmount.ether(JSBI.BigInt('0'));
}

export function transferToYear(sec: number): string {
  // 365.25 days in a year
  // return BigNumber.from(sec)
  //   .div(BigNumber.from(31557600))
  //   .toString();

  // TODO: is this calculate correct or not
  const secOfYear = 31557600;
  return (sec / secOfYear).toString();
}
