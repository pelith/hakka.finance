import { createFileRoute } from '@tanstack/react-router';

import VestingPage from '../pages/vesting';

export const Route = createFileRoute('/vesting')({
  component: VestingPage,
});
