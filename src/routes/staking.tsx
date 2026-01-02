import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import DappLayout from '../containers/DappLayout';
import StakingPage from '../pages/staking';

export const Route = createFileRoute('/staking')({
  component: StakingPage,
});
