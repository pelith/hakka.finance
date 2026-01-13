import type React from 'react';
import type { Context } from 'react';
import { useContextSelector } from 'use-context-selector';

import ApplicationContextProvider from './application/context';

export function useContextStateSelector<
  S,
  T extends { state: S },
  K extends keyof S,
>(context: Context<T>, selector: K): S[K] {
  return useContextSelector(context, (v) => v.state[selector]);
}

export const ContextProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ApplicationContextProvider>
    {children}
  </ApplicationContextProvider>
);
