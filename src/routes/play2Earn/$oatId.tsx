import { createFileRoute, notFound } from '@tanstack/react-router';
import { OAT_INFO } from 'src/constants/challenge';
import { isAddress } from 'viem';
import ChallengeDetailTemplate from 'src/templates/challengeDetail';
export const Route = createFileRoute('/play2Earn/$oatId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    if (!OAT_INFO[params.oatId]) {
      throw notFound();
    }
    return { oatId: params.oatId };
  },
});

function RouteComponent() {
  const { oatId } = Route.useLoaderData();
  return <ChallengeDetailTemplate oatId={oatId} />;
}
