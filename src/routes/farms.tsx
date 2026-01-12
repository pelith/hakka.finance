import { createFileRoute, Outlet } from '@tanstack/react-router';
import DappLayout from '../containers/DappLayout';

export const Route = createFileRoute('/farms')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DappLayout title='Hakka Finance | Farms'>
      <Outlet />
    </DappLayout>
  );
}
