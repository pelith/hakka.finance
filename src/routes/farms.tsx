import { createFileRoute } from '@tanstack/react-router';

import DappLayout from '../containers/DappLayout';
import RewardsPage from '../components/RewardsPage/index';

export const Route = createFileRoute('/farms')({
  component: FarmsPage,
});

function FarmsPage() {
  return (
    <DappLayout title='Hakka Finance | Farms'>
      <RewardsPage />
    </DappLayout>
  );
}
