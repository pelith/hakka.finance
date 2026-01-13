import { atom, type WritableAtom } from 'jotai';

export function atomWithToggle(
  initialValue?: boolean,
): WritableAtom<boolean, [boolean?], void> {
  const anAtom = atom(initialValue, (get, set, nextValue?: boolean) => {
    const update = nextValue ?? !get(anAtom)
    set(anAtom, update)
  })

  return anAtom as WritableAtom<boolean, [boolean?], void>
}

export const walletModalOpenAtom = atomWithToggle(false);
export const infoModalOpenAtom = atomWithToggle(false);
export const claimModalOpenAtom = atomWithToggle(false);
export const redeemModalOpenAtom = atomWithToggle(false);
export const restakeModalOpenAtom = atomWithToggle(false);
export const playToEarnLevelUpModalOpenAtom = atomWithToggle(false);
