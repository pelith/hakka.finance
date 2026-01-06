import { createFileRoute } from '@tanstack/react-router';

import RewardsPage from '../../components/RewardsPage/index';

export const Route = createFileRoute('/farms/')({
  component: FarmsPage,
});

function FarmsPage() {
  return (
      <RewardsPage />
  );
}
