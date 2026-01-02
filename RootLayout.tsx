import { type ReactNode } from 'react';
import { ContextProviders } from './src/state/';

export default function RootLayout ({ children }: { children?: ReactNode }) {
  return (
      <ContextProviders>  
        {children}
      </ContextProviders>
  );
}
