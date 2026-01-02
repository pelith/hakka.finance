import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import Layout from '../containers/Layout';
import HomeScreen from '../components/HomeScreen';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  return (
    <Layout title='Hakka Finance'>
      <HomeScreen />
    </Layout>
  );
}
