import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());
export function useCoingeckoTokenId(address: string) {
  const { data } = useSWR(
    `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}`,
    fetcher,
  );
  return data || '';
}
