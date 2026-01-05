import React, { useCallback, useMemo, useReducer } from 'react';
import { createContext } from 'use-context-selector';
import { useAppKit } from '@reown/appkit/react';
import reducer, {
  initialApplicationState,
  type ApplicationState,
} from './reducer';
import {
  type AddPopupPayload,
  type RemovePopupPayload,
  toggleWalletModalAction,
  toggleInfoModalAction,
  toggleClaimModalAction,
  toggleRedeemModalAction,
  toggleRestakeModalAction,
  togglePlayToEarnLevelUpModalAction,
  toggleYearlyReviewScoreModalAction,
  addPopupAction,
  removePopupAction,
} from './actions';

interface ApplicationContextProps {
  state: ApplicationState;
  toggleWalletModal: () => void;
  toggleInfoModal: () => void;
  toggleClaimModal: () => void;
  toggleRedeemModal: () => void;
  toggleRestakeModal: () => void;
  togglePlayToEarnLevelUpModal: () => void;
  toggleYearlyReviewScoreModal: () => void;
  addPopup: (payload: AddPopupPayload) => void;
  removePopup: (payload: RemovePopupPayload) => void;
}

const ApplicationContext = createContext<ApplicationContextProps>(
  {} as ApplicationContextProps,
);

const ApplicationContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialApplicationState);
  const appkit = useAppKit();

  const toggleWalletModal = useCallback(() => {
    // dispatch(toggleWalletModalAction());
    appkit.open({
      namespace: 'eip155',
    });
  }, []);

  const toggleInfoModal = useCallback(() => {
    dispatch(toggleInfoModalAction());
  }, []);

  const toggleClaimModal = useCallback(() => {
    dispatch(toggleClaimModalAction());
  }, []);

  const toggleRedeemModal = useCallback(() => {
    dispatch(toggleRedeemModalAction());
  }, []);

  const toggleRestakeModal = useCallback(() => {
    dispatch(toggleRestakeModalAction());
  }, []);

  const togglePlayToEarnLevelUpModal = useCallback(() => {
    dispatch(togglePlayToEarnLevelUpModalAction());
  }, []);

  const toggleYearlyReviewScoreModal = useCallback(() => {
    dispatch(toggleYearlyReviewScoreModalAction());
  }, []);

  const addPopup = useCallback((payload: AddPopupPayload) => {
    dispatch(addPopupAction(payload));
  }, []);

  const removePopup = useCallback((payload: RemovePopupPayload) => {
    dispatch(removePopupAction(payload));
  }, []);

  return (
    <ApplicationContext.Provider
      value={useMemo(
        () => ({
          state,
          toggleWalletModal,
          toggleInfoModal,
          toggleClaimModal,
          toggleRedeemModal,
          toggleRestakeModal,
          togglePlayToEarnLevelUpModal,
          toggleYearlyReviewScoreModal,
          addPopup,
          removePopup,
        }),
        [
          state,
          toggleWalletModal,
          toggleInfoModal,
          toggleClaimModal,
          toggleRedeemModal,
          toggleRestakeModal,
          togglePlayToEarnLevelUpModal,
          toggleYearlyReviewScoreModal,
          addPopup,
          removePopup,
        ],
      )}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export { ApplicationContext };
export default ApplicationContextProvider;
