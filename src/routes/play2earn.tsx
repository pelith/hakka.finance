import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import DappLayout from '../containers/DappLayout';
import Play2Earn from '../pages/play2earn';

export const Route = createFileRoute('/play2earn')({
  component: Play2EarnPage,
});

function Play2EarnPage() {
  return (
    <DappLayout title='Hakka Finance | Play to Earn'>
      <Play2Earn />
    </DappLayout>
  );
}
