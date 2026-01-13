import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import { useState, useMemo, } from 'react';
import { formatUnits, parseUnits } from 'viem';
import styles from './styles';
import useTokenPrice from '../../../hooks/useTokenPrice';
import useTokensPrice from '../../../hooks/useTokensPrice';
import images from '../../../images/index';
import { MyButton } from '../../Common';
import NumericalInputField from '../../NumericalInputField/index';
import { ChainId } from '../../../constants';
import { REWARD_POOLS } from '../../../constants/rewards';
import { POOL_ASSETES } from '../../../constants/rewards/assets';
import { useTokenApprove, ApprovalState } from '../../../hooks/useTokenApprove';
import { shortenAddress, getEtherscanLink } from '../../../utils';
import { useRewardsData } from '../../../data/RewardsData';
import {
  useRewardsClaim,
  ClaimState,
} from '../../../hooks/farm/useRewardsClaim';
import { useRewardsExit, ExitState } from '../../../hooks/farm/useRewardsExit';
import {
  useRewardsDeposit,
  DepositState,
} from '../../../hooks/farm/useRewardsDeposit';
import {
  useRewardsWithdraw,
  WithdrawState,
} from '../../../hooks/farm/useRewardsWithdraw';
import ClaimModal from '../../ClaimModal';
import {
  useClaimModalToggle,
  useWalletModalToggle,
} from '../../../state/application/hooks';
import withConnectWalletCheckWrapper from '../../../hoc/withConnectWalletCheckWrapper';
import withApproveTokenCheckWrapper from '../../../hoc/withApproveTokenCheckWrapper';
import withWrongNetworkCheckWrapper from '../../../hoc/withWrongNetworkCheckWrapper';
import { useVestingBalance } from '@/hooks/contracts/vesting/useVestingBalance';
import { useTokenInfoAndBalance } from '@/hooks/contracts/token/useTokenInfoAndBalance';
import BigNumber from 'bignumber.js';
import { formatCommonNumber } from '@/utils/formatCommonNumbers';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

enum SwitchOption {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

const CheckWrongNetworkConnectWalletApproveTokenButton =
  withApproveTokenCheckWrapper(
    withWrongNetworkCheckWrapper(withConnectWalletCheckWrapper(MyButton)),
  );

const CheckWrongNetworkAndConnectWalletButton = withWrongNetworkCheckWrapper(
  withConnectWalletCheckWrapper(withApproveTokenCheckWrapper(MyButton)),
);

const PoolDetail = ({ pool }: { pool: string }) => {
  const { account, chainId } = useWeb3React();
  const rewardData = useRewardsData(
    [pool],
    [POOL_ASSETES[pool]?.decimal || 18],
  );
  const toggleClaimModal = useClaimModalToggle();

  const { data: vestingValueAmount = '0' } = useVestingBalance(
    account as string,
    chainId as ChainId,
  );
  const formattedVestingValueAmount = useMemo(() => {
    return new BigNumber(vestingValueAmount).toFixed(4);
  }, [vestingValueAmount]);

  const hakkaPrice = useTokenPrice('hakka-finance');
  const tokenPrice = useTokensPrice();
  const { data: apr } = useQuery({
    queryKey: ['apr', pool],
    queryFn: async () => {
      if (!hakkaPrice || !tokenPrice) {
        return '0';
      }
      return POOL_ASSETES[pool].getApr(
        parseUnits(hakkaPrice.toString(), 18),
        POOL_ASSETES[pool].tokenPriceKey
          ? tokenPrice?.[POOL_ASSETES[pool].tokenPriceKey]?.usd || 1
          : 1,
      );
    },
    select: (data) => {
      return (
        new BigNumber(formatUnits(BigInt(data ?? 0), 18)).toFixed(2) ?? '-'
      );
    },
    refetchInterval: 1_000,
  });

  const { data: tvl } = useQuery({
    queryKey: ['tvl', pool],
    queryFn: async () => {
      if (!tokenPrice) {
        return '0';
      }
      return POOL_ASSETES[pool].getTvl(tokenPrice);
    },
    select: (data) => {
      return (
        new BigNumber(formatUnits(BigInt(data ?? 0), 18)).toFixed(2) ?? '-'
      );
    },
    refetchInterval: 1_000,
  });

  const [stakeInputAmount, setStakeInputAmount] = useState<string>('');
  const [withdrawInputAmount, setWithdrawInputAmount] = useState<string>('');

  const tokenBalance = useTokenInfoAndBalance(
    account as string,
    REWARD_POOLS[pool].tokenAddress,
  );
  const stakedTokenBalance = useTokenInfoAndBalance(account as string, pool);
  const [approveState, approve] = useTokenApprove(
    REWARD_POOLS[pool].tokenAddress,
    pool,
    stakeInputAmount > withdrawInputAmount
      ? stakeInputAmount
      : withdrawInputAmount,
  );

  const [switchPick, setSwitchPick] = useState<SwitchOption>(
    SwitchOption.DEPOSIT,
  );
  const [claimState, claim] = useRewardsClaim(pool, chainId as ChainId);
  const [exitState, exit] = useRewardsExit(pool, account);
  const [depositState, deposit] = useRewardsDeposit(
    pool,
    stakeInputAmount,
    POOL_ASSETES[pool]?.decimal || 18,
    account,
  );
  const [withdrawState, withdraw] = useRewardsWithdraw(
    pool,
    withdrawInputAmount,
    POOL_ASSETES[pool]?.decimal || 18,
    account,
  );
  const toggleWalletModal = useWalletModalToggle();

  const isWrongNetwork = REWARD_POOLS[pool].chain !== chainId;

  const [isCorrectInput, setIsCorrectInput] = useState<boolean>(true);

  const depositButtonRenderer = () => (
    <CheckWrongNetworkConnectWalletApproveTokenButton
      styleKit={'green'}
      isDisabledWhenNotPrepared={false}
      onClick={deposit}
      isConnected={!!account}
      connectWallet={toggleWalletModal}
      isApproved={approveState === ApprovalState.APPROVED}
      approveToken={approve}
      disabled={depositState === DepositState.PENDING || !isCorrectInput}
      isCorrectNetwork={!isWrongNetwork}
      targetNetwork={REWARD_POOLS[pool].chain}
    >
      Deposit
    </CheckWrongNetworkConnectWalletApproveTokenButton>
  );

  const withdrawButtonRenderer = () => (
    <div sx={styles.withdrawBtnContainer}>
      <div>
        <MyButton
          onClick={withdraw}
          styleKit='green'
          disabled={withdrawState === WithdrawState.PENDING || !isCorrectInput}
        >
          <p sx={styles.withdrawContent}>Withdraw</p>
        </MyButton>
      </div>
      <div>
        <MyButton
          onClick={exit}
          disabled={
            exitState === ExitState.PENDING ||
            !((stakedTokenBalance.data?.balanceRaw ?? 0n) > 0n)
          }
        >
          <div sx={styles.exitBtnContent}>
            <p>Exit</p>
            <p className='exitContent'>Withdraw all and claim</p>
          </div>
        </MyButton>
      </div>
    </div>
  );

  const withdrawButtonContainerRenderer = () =>
    !account || isWrongNetwork ? (
      <CheckWrongNetworkAndConnectWalletButton
        styleKit={'green'}
        isDisabledWhenNotPrepared={false}
        isConnected={!!account}
        onClick={deposit}
        isApproved={approveState === ApprovalState.APPROVED}
        approveToken={approve}
        disabled={depositState === DepositState.PENDING || !isCorrectInput}
        connectWallet={toggleWalletModal}
        isCorrectNetwork={!isWrongNetwork}
        targetNetwork={REWARD_POOLS[pool].chain}
      />
    ) : (
      withdrawButtonRenderer()
    );

  return (
    <>
      <div>
        <Link
          sx={{ display: 'inline-block', textDecoration: 'none' }}
          to='/farms'
        >
          <div sx={styles.btnBack}>
            <img src={images.iconBack} alt='icon-back' />
            <span>Back</span>
          </div>
        </Link>
        <div sx={styles.title}>
          <div sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <p>{REWARD_POOLS[pool].name}</p>
            {REWARD_POOLS[pool]?.subtitle && (
              <b sx={{ marginLeft: '16px', paddingBottom: '2px' }}>
                {REWARD_POOLS[pool]?.subtitle}
              </b>
            )}
          </div>

          <div sx={styles.infoWrapper}>
            <div sx={styles.infoItem}>
              {tvl &&
              parseUnits(tvl, REWARD_POOLS[pool]?.decimal || 18) > 0n ? (
                <>
                  <span>TVL</span>
                  <span sx={styles.infoValue}> ${tvl} </span>
                </>
              ) : (
                null
              )}
            </div>
            <div sx={styles.infoItem}>
              <span>Contract</span>
              <a
                sx={styles.contractAddress}
                target='_blank'
                rel='noreferrer noopener'
                href={getEtherscanLink(
                  REWARD_POOLS[pool]?.chain || ChainId.MAINNET,
                  pool,
                  'address',
                )}
              >
                {shortenAddress(pool)}
              </a>
            </div>
          </div>
          <img
            src={POOL_ASSETES[pool].icon}
            sx={styles.infoIcon}
            alt={`${REWARD_POOLS[pool].name} icon`}
          />
        </div>
        <div sx={styles.depositInfoContainer}>
          <div sx={styles.depositInfoItem}>
            <p>Deposit</p>
            <div sx={styles.lpTokenLinkContainer}>
              <span sx={styles.depositInfoValue}>
                {REWARD_POOLS[pool].name}
              </span>
              <a
                sx={styles.lpTokenLink}
                target='_blank'
                rel='noreferrer noopener'
                href={REWARD_POOLS[pool].url}
              >
                <span> Get Token </span>
                <img src={images.iconLinkNormal} alt='icon-link-normal' />
              </a>
            </div>
          </div>
          <div sx={styles.depositInfoItem}>
            <p>APR</p>
            <span sx={styles.depositInfoValue}>{apr}%</span>
          </div>
        </div>
        <div sx={styles.operateArea}>
          {/* reward */}
          <div sx={styles.operateCard}>
            <p>Reward</p>
            <span>You deposited</span>
            <div sx={styles.rewardAmountContainer}>
              {/* if amount === 0 sx={styles.amountIsZero} */}
              <span>
                {account
                  ? formatCommonNumber(rewardData.depositBalances?.[pool])
                  : '-'}
              </span>
              <span>{REWARD_POOLS[pool].tokenSymbol}</span>
            </div>
            <div sx={styles.rewardInfoContainer}>
              <div sx={styles.rewardInfoLabelWrapper}>
                <img
                  src={images.iconClaimableReward}
                  sx={styles.rewardIcon}
                  alt='icon-claimable-reward'
                />
                <div>
                  <p>Claimable reward</p>
                  {/* if amount !== 0 sx={styles.rewardAmount} */}
                  <p sx={styles.amountIsZero}>
                    {account
                      ? formatCommonNumber(rewardData.earnedBalances?.[pool])
                      : '-'}{' '}
                    HAKKA
                  </p>
                </div>
              </div>
              <div sx={styles.rewardBtn}>
                <CheckWrongNetworkAndConnectWalletButton
                  styleKit={'green'}
                  isDisabledWhenNotPrepared={true}
                  onClick={toggleClaimModal}
                  isConnected={!!account}
                  connectWallet={toggleWalletModal}
                  disabled={claimState === ClaimState.PENDING}
                  isCorrectNetwork={!isWrongNetwork}
                  targetNetwork={REWARD_POOLS[pool].chain}
                >
                  Claim
                </CheckWrongNetworkAndConnectWalletButton>
              </div>
            </div>
            <div sx={styles.rewardInfoContainer}>
              <div sx={styles.rewardInfoLabelWrapper}>
                <img
                  src={images.iconWaiting}
                  sx={styles.rewardIcon}
                  alt='icon-waiting'
                />
                <div>
                  <p>Vesting balance</p>
                  {/* if amount !== 0 remove the style */}
                  <p sx={styles.amountIsZero}>
                    {formattedVestingValueAmount} HAKKA
                  </p>
                </div>
              </div>
              <a sx={styles.viewBtn} href={'/vesting'}>
                <span>View</span>
                <img src={images.iconForward} alt='icon-forward' />
              </a>
            </div>
            <div sx={styles.learnMoreLinkWrapper}>
              <img src={images.iconInform} alt='icon-inform' />
              <span>
                Claim means your HAKKA rewards will be locked in vesting
                contract.
                <a
                  sx={styles.learnMoreLink}
                  target='_blank'
                  rel='noreferrer noopener'
                  href='https://medium.com/hakkafinance/vesting-contract-9ab2ff24bf76'
                >
                  learn more
                </a>
              </span>
            </div>
          </div>
          {/* stake */}
          <div sx={styles.operateCard}>
            <p>Stake</p>
            <div sx={styles.switch}>
              <div
                onClick={() => setSwitchPick(SwitchOption.DEPOSIT)}
                sx={
                  switchPick === SwitchOption.DEPOSIT
                    ? styles.switchFocus
                    : undefined
                }
              >
                Deposit
              </div>
              <div
                onClick={() => setSwitchPick(SwitchOption.WITHDRAW)}
                sx={
                  switchPick === SwitchOption.WITHDRAW
                    ? styles.switchFocus
                    : undefined
                }
              >
                Withdraw
              </div>
            </div>
            <div sx={styles.stakeBalanceContainer}>
              <span>Amount</span>
              <span>
                Balance:{' '}
                {switchPick === SwitchOption.DEPOSIT
                  ? tokenBalance?.data?.balance || '0.00'
                  : stakedTokenBalance?.data?.balance || '0.00'}
              </span>
            </div>
            <div sx={styles.numericalInputWrapper}>
              {switchPick === SwitchOption.DEPOSIT ? (
                <NumericalInputField
                  value={stakeInputAmount}
                  onUserInput={setStakeInputAmount}
                  tokenBalanceAmount={tokenBalance?.data?.balance || '0.00'}
                  approve={approve}
                  approveState={approveState}
                  setIsCorrectInput={setIsCorrectInput}
                />
              ) : (
                <NumericalInputField
                  value={withdrawInputAmount}
                  onUserInput={setWithdrawInputAmount}
                  tokenBalanceAmount={
                    stakedTokenBalance?.data?.balance || '0.00'
                  }
                  approve={approve}
                  approveState={approveState}
                  setIsCorrectInput={setIsCorrectInput}
                />
              )}
            </div>
            {switchPick === SwitchOption.DEPOSIT
              ? depositButtonRenderer()
              : withdrawButtonContainerRenderer()}
          </div>
        </div>
      </div>
      <ClaimModal
        claim={claim}
        claimState={claimState}
        claimableReward={
          account ? formatCommonNumber(rewardData.earnedBalances?.[pool]) : '-'
        }
      />
    </>
  );
};

export default PoolDetail;
