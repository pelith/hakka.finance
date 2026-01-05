import { useQuery } from '@tanstack/react-query';

export default function useTokensPriceByAddress(tokensId: {
  [address: string]: string;
}) {
  const keys = Object.keys(tokensId).join(',');

  return useQuery({
    queryKey: ['tokens-price', keys],
    queryFn: async () => {
      const entries = Object.entries(tokensId);
      const ids = encodeURIComponent(
        entries.map(([, id]) => `${id}`).join(','),
      );
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
      return fetch(url).then((r) => r.json()) as Promise<
        Record<string, Record<'usd', number>>
      >;
    },
    select: (data) => {
      return Object.fromEntries(
        Object.entries(tokensId).map(([address, id]) => [
          address,
          data?.[id]?.usd ?? 0,
        ]),
      );
    },
    initialData: {},
  });
}
