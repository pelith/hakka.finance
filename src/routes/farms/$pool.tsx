import { createFileRoute, notFound } from '@tanstack/react-router';
import { REWARD_POOLS } from 'src/constants/rewards';
import PoolTemplate from 'src/templates/pool';
import { isAddress } from 'viem';

export const Route = createFileRoute('/farms/$pool')({
  component: PoolPage,
  loader: async ({ params }) => {
    if (!isAddress(params.pool)) {
      throw notFound()
    }
    if (!REWARD_POOLS[params.pool]) {
      throw notFound()
    }
    return { pool: params.pool }
  },
});

function PoolPage() {
  const { pool } = Route.useLoaderData()

  return (
    <PoolTemplate pool={pool} />
  )
}