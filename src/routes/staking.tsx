import { createFileRoute } from '@tanstack/react-router';

import StakingPage from '../pages/staking';

export const Route = createFileRoute('/staking')({
  component: StakingPage,
});
