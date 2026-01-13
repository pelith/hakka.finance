import type React from 'react';
import { AtomStoreProvider } from './application/atomStore';

export const ContextProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <AtomStoreProvider>
    {children}
  </AtomStoreProvider>
);
