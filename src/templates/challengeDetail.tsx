import React from 'react';
import ChallengeDetailPage from '../components/ChallengePage/DetailPage';
import DappLayout from '../containers/DappLayout';

const ChallengeDetail = ({ oatId }: { oatId: string }) => {
  return (
    <DappLayout title='Hakka Finance | Mission'>
      <ChallengeDetailPage oatId={oatId} />
    </DappLayout>
  );
};

export default ChallengeDetail;
