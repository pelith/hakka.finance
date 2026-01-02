
import DappLayout from '../containers/DappLayout';
import PoolPage from '../components/RewardsPage/pool';
import type { Address } from 'viem';

const Pools = ({ pool }: {pool: Address}) => {
  return (
    <DappLayout title='Hakka Finance | Farms'>
      <PoolPage pool={pool} />
    </DappLayout>
  )
}

export default Pools
