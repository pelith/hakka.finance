/** @jsxImportSource theme-ui */

import { useState, useMemo } from 'react';
import { parseUnits } from 'viem';
import BigNumber from 'bignumber.js';
import Countdown, { zeroPad } from 'react-countdown';
import images from '../../../images';
import styles from './styles';
import { MyButton } from '../../Common';
import NumericalInputField from '../../NumericalInputField';
import { useActiveWeb3React } from '../../../hooks/web3Manager';
import { useTokenApprove, ApprovalState } from '../../../hooks/useTokenApprove';
import {
  ChainId,
  HAKKA,
  STAKING_ADDRESSES,
  TransactionState,
} from '../../../constants';
import { useV1HakkaUnstake } from '../../../hooks/staking/useV1HakkaUnstake';
import withApproveTokenCheckWrapper from '../../../hoc/withApproveTokenCheckWrapper';
import { fromUnixTime } from 'date-fns';
import { formatCommonNumber } from 'src/utils/formatCommonNumbers';
const Zero = new BigNumber(0);

interface StakePositionProps {
  index: number;
  sHakkaBalance: string;
  stakedHakka: BigNumber;
  sHakkaReceived: BigNumber;
  until: BigNumber;
}

const StakePositionItem = (props: StakePositionProps) => {
  const { chainId, account } = useActiveWeb3React();
  const [inputAmount, setInputAmount] = useState('0');
  const { index, sHakkaBalance, stakedHakka, sHakkaReceived, until } = props;
  const stakingValue = useMemo(
    () =>
      BigNumber(inputAmount || '0')
        .multipliedBy(stakedHakka || 0)
        .div(
          !sHakkaReceived || BigNumber(sHakkaReceived).eq(0)
            ? 1
            : sHakkaReceived,
        ),
    [inputAmount, stakedHakka, sHakkaReceived],
  );

  const [approveState, approve] = useTokenApprove(
    HAKKA[chainId as ChainId].address,
    STAKING_ADDRESSES[chainId as ChainId],
    inputAmount,
  );

  const timeOption: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  const lockUntil = useMemo(
    () =>
      new Date(fromUnixTime(until.toNumber())).toLocaleString(
        'en-US',
        timeOption,
      ),
    [until],
  );

  const untilDate = useMemo(
    () => fromUnixTime(until.toNumber()),
    [until.toNumber()],
  );

  const [isShowRedeem, setIsShowRedeem] = useState<boolean>(false);
  const [isCorrectInput, setIsCorrectInput] = useState<boolean>(true);

  const [unstakeState, unstake] = useV1HakkaUnstake(
    STAKING_ADDRESSES[chainId as ChainId],
    account as string,
    index,
    parseUnits(inputAmount || '0', 18),
  );

  const countdownRenderer = ({
    days,
    hours,
    minutes,
  }: {
    days: number;
    hours: number;
    minutes: number;
  }) => (
    <div sx={styles.redeemToggleCountdown}>
      <span>
        {days
          ? zeroPad(days) + ' Days Left'
          : zeroPad(hours) + 'h ' + zeroPad(minutes) + 'm Left'}
      </span>
    </div>
  );

  const RedeemButton = withApproveTokenCheckWrapper(MyButton);

  const sHakkaBalanceForDisplay = sHakkaReceived.lte(sHakkaBalance)
    ? sHakkaReceived.toString()
    : sHakkaBalance;

  const isRedeemed = stakedHakka?.eq(Zero);
  const valueColor = isRedeemed ? '' : '#253e47';

  return (
    <div sx={styles.positionFormWrapper}>
      <div sx={styles.positionCard}>
        <div sx={styles.positionItem}>
          <div sx={styles.stackedHakkaWrapper}>
            <p>Staked HAKKA</p>
            <p sx={{ color: valueColor }}>{formatCommonNumber(stakedHakka)}</p>
          </div>
          <div sx={styles.stackedHakkaWrapper}>
            <p>Get sHAKKA</p>
            <p sx={{ color: valueColor }}>
              {formatCommonNumber(sHakkaReceived)}
            </p>
          </div>
          <div sx={styles.stackedHakkaWrapper}>
            <p>Until</p>
            <p sx={{ color: valueColor }}>{lockUntil}</p>
          </div>
          <div sx={styles.redeemBtnWrapper}>
            {Date.now() < untilDate.getTime() ? (
              <Countdown date={untilDate} renderer={countdownRenderer} />
            ) : isRedeemed ? (
              <div sx={styles.redeemed}>
                <span>Redeemed</span>
              </div>
            ) : (
              <div
                sx={styles.redeemToggleBtn}
                onClick={() => setIsShowRedeem(!isShowRedeem)}
              >
                <span>Redeem</span>
                <img src={isShowRedeem ? images.iconTop : images.iconDown} />
              </div>
            )}
          </div>
        </div>
        {isShowRedeem && (
          <div sx={styles.redeemContainer}>
            <div sx={styles.inputArea}>
              <div sx={styles.balance}>
                <span>Burn</span>
                <span>
                  {`sHAKKA Balance: ${formatCommonNumber(sHakkaBalanceForDisplay)}`}
                </span>
              </div>
              <NumericalInputField
                value={inputAmount}
                onUserInput={setInputAmount}
                tokenBalanceAmount={sHakkaBalance}
                approve={approve}
                approveState={approveState}
                setIsCorrectInput={setIsCorrectInput}
              />
            </div>
            <div sx={styles.receiveAmountWrapper}>
              <img src={images.iconBecome} sx={styles.iconBecome} />
              <div>
                <p sx={{ fontWeight: 'normal' }}>Receive HAKKA</p>
                <p>{formatCommonNumber(stakingValue)}</p>
              </div>
            </div>
            <div sx={styles.redeemBtn}>
              <RedeemButton
                styleKit={'green'}
                isDisabledWhenNotPrepared={false}
                onClick={unstake}
                isApproved={approveState === ApprovalState.APPROVED}
                approveToken={approve}
                disabled={
                  Date.now() < untilDate.getTime() ||
                  unstakeState === TransactionState.PENDING ||
                  sHakkaReceived.eq(0) ||
                  !isCorrectInput
                }
              >
                Redeem
              </RedeemButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StakePositionItem;
