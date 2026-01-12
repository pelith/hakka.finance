import { useQuery } from '@tanstack/react-query';
import { TOKEN_PRICE_SLUGS } from '../constants';

export default function useTokensPrice() {
  const { data } = useQuery({
    queryKey: ['tokens-price'],
    queryFn: async () => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${TOKEN_PRICE_SLUGS.toString()}`,
      );
      return response.json();
    },
    enabled: TOKEN_PRICE_SLUGS.length > 0,
    initialData: {},
    staleTime: 15_000,
  });

  return data ? data : null;
}
