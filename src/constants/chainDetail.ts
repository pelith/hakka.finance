export enum ChainId {
  MAINNET = 1,
  BSC = 56,
  POLYGON = 137,
  FANTOM = 250,
}

const NETWORK_URL = import.meta.env.APP_NETWORK_URL;
const BSC_NETWORK_URL = import.meta.env.APP_BSC_NETWORK_URL;
const POLYGON_NETWORK_URL = import.meta.env.APP_POLYGON_NETWORK_URL;
const FANTOM_NETWORK_URL = import.meta.env.APP_FANTOM_NETWORK_URL;
if (
  typeof NETWORK_URL === 'undefined' ||
  typeof BSC_NETWORK_URL === 'undefined' ||
  typeof POLYGON_NETWORK_URL === 'undefined' ||
  typeof FANTOM_NETWORK_URL === 'undefined'
) {
  throw new Error(
    'VITE_NETWORK_URL and VITE_BSC_NETWORK_URL and VITE_POLYGON_NETWORK_URL must be a defined environment variable',
  );
}

export const NETWORK_CHAIN_ID: number = Number.parseInt(
  import.meta.env.APP_CHAIN_ID ?? '1', 10
);

const chainUrlList = [
  [ChainId.MAINNET, NETWORK_URL],
  [ChainId.BSC, BSC_NETWORK_URL],
  [ChainId.POLYGON, POLYGON_NETWORK_URL],
  [ChainId.FANTOM, FANTOM_NETWORK_URL],
  [NETWORK_CHAIN_ID, NETWORK_URL],
] as const;

export const CHAIN_URL_DICT: Record<number, string> =
  Object.fromEntries(chainUrlList);

export const CHAIN_URL_MAP = new Map(chainUrlList);
