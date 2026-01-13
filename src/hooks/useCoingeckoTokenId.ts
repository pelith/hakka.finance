import { useQuery } from '@tanstack/react-query';

export function useCoingeckoTokenId(address: string) {
  const { data } = useQuery({
    queryKey: ['coingecko-token-id', address],
    enabled: !!address,
    queryFn: async () => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}`,
      );
      return response.json();
    },
  });
  return data || '';
}
