import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());
export default function useTokenPrice(tokenSlug: string): number {
  const { data } = useSWR(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenSlug}&vs_currencies=usd`,
    fetcher,
  );

  return data ? data[tokenSlug].usd : 0;
}
