import { type ReactNode } from 'react';
import { ContextProviders } from './src/state/';
import ApplicationUpdater from './src/state/application/updater';
import MulticallUpdater from './src/state/multicall/updater';

function Updaters () {
  return (
    <>
      <ApplicationUpdater />
      <MulticallUpdater />
    </>
  );
}

export default function RootLayout ({ children }: { children?: ReactNode }) {
  return (
      <ContextProviders>  
        <Updaters />
        {children}
      </ContextProviders>
  );
}
