import { createRootRoute, Outlet, HeadContent } from '@tanstack/react-router';
import React from 'react';
import RootLayout from '../../RootLayout';
import NotFoundPage from '../pages/404';
export const Route = createRootRoute({
  component: () => (
    <RootLayout>
      <Outlet />
    </RootLayout>
  ),
  notFoundComponent: NotFoundPage,
});
