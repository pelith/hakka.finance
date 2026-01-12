import { useQuery } from '@tanstack/react-query';

export default function useTokenPrice(tokenSlug: string): number {
  const { data } = useQuery({
    queryKey: ['token-price', tokenSlug],
    queryFn: async () => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenSlug}&vs_currencies=usd`,
      );
      return response.json();
    },
    select: (data) => data[tokenSlug].usd,
    enabled: !!tokenSlug,
    staleTime: 15_000,
  });
  return data ?? 0;
}
