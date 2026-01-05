/** @jsxImportSource theme-ui */
import { useEffect, useMemo, useState } from 'react';

import { useNavigate } from '@tanstack/react-router';
import { formatUnits, parseUnits } from 'viem';
import BigNumber from 'bignumber.js';
import {
  useRedeemModalOpen,
  useRedeemModalToggle,
} from '../../state/application/hooks';
import images from '../../images';
import Modal from '../Modal';
import styles from './styles';
import { MyButton } from '../Common';
import NumericalInputField from '../NumericalInputField';
import { ApprovalState } from '../../hooks/useTokenApprove';
import {
  ChainId,
  NEW_SHAKKA_ADDRESSES,
  TransactionState,
} from '../../constants';
import { useHakkaUnstake } from '../../hooks/staking/useHakkaUnstake';
import { unstakeReceivedAmount } from '../../utils/unstakeReceivedAmount';
import type { VaultType } from '../../hooks/staking/useStakingVault';
import withWrongNetworkCheckWrapper from '../../hoc/withWrongNetworkCheckWrapper';
import withConnectWalletCheckWrapper from '../../hoc/withConnectWalletCheckWrapper';
import useSHakkaBalance from '../../hooks/useSHakkaBalance';
import { formatCommonNumber } from 'src/utils/formatCommonNumbers';
const Zero = BigNumber(0);
interface RedeemModalInterface {
  vaults?: VaultType[];
  chainId: ChainId;
  account: string;
  index: number;
  sHakkaBalance?: string;
  sHakkaBalanceInFarming?: string;
  isCorrectNetwork: boolean;
  toggleWalletModal(): void;
}

const RedeemButton = withWrongNetworkCheckWrapper(
  withConnectWalletCheckWrapper(MyButton),
);

const RedeemModal = ({
  vaults,
  chainId,
  account,
  index,
  sHakkaBalance,
  sHakkaBalanceInFarming,
  isCorrectNetwork,
  toggleWalletModal,
}: RedeemModalInterface) => {
  const redeemModalOpen = useRedeemModalOpen();
  const toggleRedeemModal = useRedeemModalToggle();
  const [inputAmount, setInputAmount] = useState('');
  const [isCorrectInput, setIsCorrectInput] = useState<boolean>(true);
  const vault = vaults?.[index];
  const receiveHakkaAmount = unstakeReceivedAmount(inputAmount, vault);
  const navigate = useNavigate();
  const [unstakeState, unstake] = useHakkaUnstake(
    NEW_SHAKKA_ADDRESSES[chainId as ChainId],
    account,
    index,
    parseUnits(inputAmount || '0', 18),
  );

  useEffect(() => {
    if (unstakeState === TransactionState.SUCCESS && redeemModalOpen) {
      toggleRedeemModal();
      setInputAmount('');
    }
    // redeemModalOpen should not be used here, because it will be reset to false after toggleRedeemModal
  }, [unstakeState]);

  const btnContent =
    unstakeState === TransactionState.PENDING ? 'Pending' : 'Confirm';

  const { sHakkaBalanceInfo } = useSHakkaBalance();
  const sHakkaBalanceForDisplay = sHakkaBalanceInfo?.[chainId]
    ? parseFloat(formatUnits(sHakkaBalanceInfo[chainId], 18)).toFixed(4)
    : '-';

  const sHakkaPositionLimit = useMemo(() => {
    const userShakkaBalance = BigNumber(
      formatUnits(sHakkaBalanceInfo?.[chainId] || 0n, 18),
    );
    const vaultShakkaAmount = vault ? vault.wAmount : BigNumber(0);

    if (userShakkaBalance.lt(vaultShakkaAmount)) {
      return userShakkaBalance.toString();
    } else {
      return vaultShakkaAmount.toString();
    }
  }, [vault, sHakkaBalanceInfo?.[chainId]]);

  return (
    <Modal isOpen={redeemModalOpen} onDismiss={toggleRedeemModal}>
      <div sx={styles.container}>
        <div sx={styles.heading}>
          <h2>Redeem</h2>
          <img src={images.iconDeleteRound} onClick={toggleRedeemModal} />
        </div>
        <p sx={styles.positionShakka}>
          <span>
            {(vault && formatCommonNumber(vault.wAmount)) || '-'} sHAKKA
          </span>
          &nbsp;got from this position
        </p>
        <div sx={styles.hakkaBalanceContainer}>
          <span>Burn</span>
          <span>sHAKKA Balance: {sHakkaBalanceForDisplay}</span>
        </div>
        <div sx={styles.numericalInputWrapper}>
          <NumericalInputField
            value={inputAmount}
            onUserInput={setInputAmount}
            tokenBalanceAmount={sHakkaPositionLimit}
            approve={() => {}} // TODO: check this
            approveState={ApprovalState.APPROVED} // TODO: check this
            setIsCorrectInput={setIsCorrectInput}
          />
        </div>
        <p sx={styles.sHakkaBalanceTitle}>
          Your&nbsp;<span>sHAKKA</span>&nbsp;balance in farming pool
        </p>
        <div sx={styles.sHakkaInFarmContainer}>
          <p>{sHakkaBalanceInFarming || '-'}</p>
          <div
            sx={styles.sHakkaPoolLink}
            onClick={() => navigate({ to: '/farms' })}
          >
            <p>sHAKKA Pool</p>
            <img sx={{ opacity: '0.5' }} src={images.iconArrowRight} />
          </div>
        </div>
        <hr sx={styles.hr} />
        <div>
          <h4 sx={styles.receiveHakkaTitle}>Receive HAKKA</h4>
          <div sx={styles.receiveHakkaWrapper}>
            <img src={images.iconHakkaCoin} />
            <span>{receiveHakkaAmount || '-'}</span>
          </div>
        </div>
        <RedeemButton
          onClick={unstake}
          styleKit='green'
          disabled={
            !isCorrectInput || unstakeState === TransactionState.PENDING
          }
          isDisabledWhenNotPrepared={false}
          isConnected={!!account}
          connectWallet={toggleWalletModal}
          isCorrectNetwork={isCorrectNetwork}
          targetNetwork={chainId}
        >
          {btnContent}
        </RedeemButton>
      </div>
    </Modal>
  );
};

export default RedeemModal;
