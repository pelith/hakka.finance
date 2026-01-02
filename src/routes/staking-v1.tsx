import { createFileRoute } from '@tanstack/react-router';
import StakingV1Page from '../pages/staking-v1';

export const Route = createFileRoute('/staking-v1')({
  component: StakingV1Page,
});
