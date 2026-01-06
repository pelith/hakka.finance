import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());
export function useCoingeckoTokenId(address: string) {
  const { data } = useSWR(
    address ? `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}` : null,
    fetcher,
  );
  return data || '';
}
