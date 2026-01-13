import { createFileRoute } from '@tanstack/react-router';

import Play2Earn from '../pages/play2earn';

export const Route = createFileRoute('/play2earn')({
  component: Play2EarnPage,
});

function Play2EarnPage() {
  return <Play2Earn />;
}
