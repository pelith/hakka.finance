import { useAppKit } from '@reown/appkit/react';
import { useCallback } from 'react';
import {
  infoModalOpenAtom,
  claimModalOpenAtom,
  redeemModalOpenAtom,
  restakeModalOpenAtom,
  playToEarnLevelUpModalOpenAtom,
} from './appAtom';
import { useAtomValue, useSetAtom } from 'jotai';

export function useWalletModalToggle(): () => void {
  const appkit = useAppKit();
  return useCallback(() => {
    appkit.open({
      namespace: 'eip155',
    });
  }, []);
}

export function useInfoModalOpen(): boolean {
  const infoModalOpen = useAtomValue(infoModalOpenAtom);
  return infoModalOpen;
}

export function useInfoModalToggle(): () => void {
  const toggleInfoModalOpen = useSetAtom(infoModalOpenAtom);
  return useCallback(() => {
    toggleInfoModalOpen();
  }, []);
}

export function useClaimModalOpen(): boolean {
  const claimModalOpen = useAtomValue(claimModalOpenAtom);
  return claimModalOpen;
}

export function useClaimModalToggle(): () => void {
  const toggleClaimModalOpen = useSetAtom(claimModalOpenAtom);
  return useCallback(() => {
    toggleClaimModalOpen();
  }, []);
}

export function useRedeemModalOpen(): boolean {
  const redeemModalOpen = useAtomValue(redeemModalOpenAtom);
  return redeemModalOpen;
}

export function useRedeemModalToggle(): () => void {
  const toggleRedeemModalOpen = useSetAtom(redeemModalOpenAtom);
  return useCallback(() => {
    toggleRedeemModalOpen();
  }, []);
}

export function useRestakeModalOpen(): boolean {
  const restakeModalOpen = useAtomValue(restakeModalOpenAtom);
  return restakeModalOpen;
}

export function useRestakeModalToggle(): () => void {
  const toggleRestakeModalOpen = useSetAtom(restakeModalOpenAtom);
  return useCallback(() => {
    toggleRestakeModalOpen();
  }, []);
}

export function usePlayToEarnLevelUpModalOpen(): boolean {
  return useAtomValue(playToEarnLevelUpModalOpenAtom);
}

export function usePlayToEarnLevelUpModalToggle(): () => void {
  const togglePlayToEarnLevelUpModalOpen = useSetAtom(playToEarnLevelUpModalOpenAtom);
  return useCallback(() => {
    togglePlayToEarnLevelUpModalOpen();
  }, []);
}
