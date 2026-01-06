import PoolPage from '../components/RewardsPage/pool';
import type { Address } from 'viem';

const Pools = ({ pool }: { pool: Address }) => {
  return (
    <PoolPage pool={pool} />
  );
};

export default Pools;
