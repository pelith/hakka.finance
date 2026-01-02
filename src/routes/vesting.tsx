import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import DappLayout from '../containers/DappLayout';
import VestingPage from '../pages/vesting';

export const Route = createFileRoute('/vesting')({
  component: VestingPage,
});
