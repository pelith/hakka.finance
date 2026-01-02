import { createFileRoute } from '@tanstack/react-router';

import DappLayout from '../containers/DappLayout';
import StakingPage from '../pages/staking';

export const Route = createFileRoute('/staking')({
  component: StakingPage,
});
