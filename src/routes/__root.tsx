import { createRootRoute, Outlet, } from '@tanstack/react-router';

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
