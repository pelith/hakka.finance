import { useEffect, useState, useMemo } from 'react';
import { isAddressEqual, parseUnits, zeroAddress, type Address } from 'viem';
import type BigNumber from 'bignumber.js';
import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import images from '../../images/index';
import styles from './styles';
import { MyButton } from '../Common';
import NumericalInputField from '../NumericalInputField/index';
import NewTokenAddressInput from './NewTokenAddressInput';
import Web3Status from '../Web3Status';
import RewardValue from './RewardValue';
import { useTokenApprove, ApprovalState } from '../../hooks/useTokenApprove';
import { useHakkaBurn, BurnState } from '../../hooks/guildbank/useHakkaBurn';
import { shortenAddress, getEtherscanLink } from '../../utils';
import { useWalletModalToggle } from '../../state/application/hooks';
import withConnectWalletCheckWrapper from '../../hoc/withConnectWalletCheckWrapper';
import withApproveTokenCheckWrapper from '../../hoc/withApproveTokenCheckWrapper';
import withWrongNetworkCheckWrapper from '../../hoc/withWrongNetworkCheckWrapper';

import {
  ChainId,
  HAKKA,
  BURNER_ADDRESS,
  VAULT_TOKENS,
  GUILDBANK,
} from '../../constants';
import { useTokenInfoAndBalance } from '@/hooks/contracts/token/useTokenInfoAndBalance';
import useTokenTotalSupply from '@/hooks/contracts/token/useTokenTotalSupply';
import RewardListItemContainer from '@/containers/Vault/RewardListItemContainer';
import { createBigNumberSort } from '@/utils/sort';

const getRewardTokenById = (chainId: ChainId | undefined) => {
  return VAULT_TOKENS[chainId || 1] || VAULT_TOKENS[1];
};

const VaultPage = () => {
  const { account } = useWeb3React();
  const chainId = ChainId.MAINNET;

  const hakkaBalanceAmount = useTokenInfoAndBalance(
    account as Address,
    HAKKA[chainId as ChainId].address as Address,
    chainId as ChainId,
  );

  // burn amount
  const [inputAmount, setInputAmount] = useState('0');
  const [rewardTokens, setRewardTokens] = useState<{
    [x: string]: { name: string; symbol: string; decimals: number };
  }>(() => getRewardTokenById(chainId));
  const [isShowNewTokenArea, setIsShowNewTokenArea] = useState(false);
  const [newRewardAddressInput, setNewRewardAddressInput] =
    useState<string>('');

  const [approveState, approve] = useTokenApprove(
    HAKKA[chainId as ChainId].address,
    BURNER_ADDRESS[chainId as ChainId],
    inputAmount,
  );

  // when chainId change, update rewardTokens value
  useEffect(() => {
    if (!chainId) return;
    setRewardTokens(getRewardTokenById(chainId));
  }, [chainId]);

  // sort the reward tokens address
  const [pickedRewardTokensAddress, setPickedRewardTokensAddress] = useState(
    () => [...Object.keys(rewardTokens).sort(createBigNumberSort('asc'))],
  );

  // when new token added sort again.
  useEffect(() => {
    const newSortedTokens = Object.keys(rewardTokens).sort();
    setPickedRewardTokensAddress(newSortedTokens);
  }, [rewardTokens]);

  // haddle checklist click
  const toggleToken = (tokenAddress: string) => {
    const selectedTokenList = pickedRewardTokensAddress.includes(tokenAddress)
      ? pickedRewardTokensAddress.filter(
          (sortedAddress) => sortedAddress !== tokenAddress,
        )
      : [...pickedRewardTokensAddress, tokenAddress];
    const sortedAddress = selectedTokenList.sort();
    setPickedRewardTokensAddress(sortedAddress);
  };

  // get HAKKA totalSupply
  const hakkaTotalSupplyAmount = useTokenTotalSupply(
    HAKKA[chainId as ChainId].address as Address,
    chainId as ChainId,
  );

  const amountParsed = useMemo(() => {
    if (inputAmount) {
      return parseUnits(inputAmount.toString(), 18);
    }
    return null;
  }, [inputAmount]);

  const [burnState, burn] = useHakkaBurn(
    BURNER_ADDRESS[chainId as ChainId],
    account,
    amountParsed || 0n,
    pickedRewardTokensAddress,
  );

  const toggleWalletModal = useWalletModalToggle();

  const BurnButton = withApproveTokenCheckWrapper(
    withWrongNetworkCheckWrapper(withConnectWalletCheckWrapper(MyButton)),
  );

  const isCorrectNetwork = useMemo<boolean>(() => {
    if (!chainId || !BURNER_ADDRESS[chainId as ChainId]) {
      return false;
    }
    return BURNER_ADDRESS[chainId as ChainId] !== zeroAddress;
  }, [chainId]);

  const isConnected = !!account;

  // error message
  const noTokenError = useMemo(
    () => !pickedRewardTokensAddress.length,
    [pickedRewardTokensAddress],
  );
  const [isCorrectInput, setIsCorrectInput] = useState<boolean>(true);

  const errorStatus = noTokenError || !isCorrectInput;

  function addRewardToken(input: {
    address: Address;
    name: string;
    symbol: string;
    decimals: number;
  }) {
    for (const [rewardTokenAddress, _rewardTokenInfo] of Object.entries(
      rewardTokens,
    )) {
      if (isAddressEqual(rewardTokenAddress as Address, input.address)) {
        return;
      }
    }
    setRewardTokens((prevState) => ({
      ...prevState,
      [input.address]: input,
    }));
  }

  function onRewardListItemDelete(tokenAddress: Address) {
    setRewardTokens((prevState) => {
      const newState = { ...prevState };
      delete newState[tokenAddress];
      return newState;
    });
  }

  const [localRewardAmount, setLocalRewardAmount] = useState<{
    [x: string]: BigNumber;
  }>({});
  function onRewardCalculated(tokenAddress: Address, receiveAmount: BigNumber) {
    const _address = tokenAddress.toLowerCase();
    setLocalRewardAmount((prevState: { [x: string]: BigNumber }) => ({
      ...prevState,
      [_address]: receiveAmount,
    }));
  }

  return (
    <div sx={styles.container}>
      <div sx={styles.vaultPageWrapper}>
        <div sx={styles.header}>
          <h1 sx={styles.title}>Guild Bank</h1>
          <Web3Status unsupported={!isCorrectNetwork} />
        </div>
        <div sx={styles.body}>
          <div sx={styles.infomationContainer}>
            <h3 sx={styles.subTitle}>Burn to get value</h3>
            <div sx={styles.contract}>
              <span>Guild Bank Contract</span>
              <a
                sx={
                  !isCorrectNetwork
                    ? styles.contractAddressDisabled
                    : styles.contractAddress
                }
                href={getEtherscanLink(chainId, GUILDBANK[chainId], 'address')}
                target={'_blank'}
                rel='noreferrer noopener'
              >
                {!chainId || !isCorrectNetwork
                  ? '-'
                  : shortenAddress(GUILDBANK[chainId])}
              </a>
            </div>
            <p>
              An interface for Hakka holders to call ragequit() function to burn
              their HAKKA and draw funds from Guild Bank proportionally.
            </p>
            <div sx={styles.hakkaBalance}>
              <span>Burn</span>
              <span>
                HAKKA Balance:{' '}
                {isCorrectNetwork
                  ? (hakkaBalanceAmount.data?.balance ?? '0')
                  : '-'}
              </span>
            </div>
            <NumericalInputField
              value={inputAmount}
              onUserInput={setInputAmount}
              tokenBalanceAmount={hakkaBalanceAmount.data?.balance ?? '0'}
              approve={approve}
              approveState={approveState}
              setIsCorrectInput={setIsCorrectInput}
            />
          </div>
          <div sx={styles.formContainer}>
            <div sx={styles.formTitleArea}>
              <span sx={styles.formTitle}>You wish to receive</span>
              <div
                sx={styles.addTokenButton}
                onClick={() => setIsShowNewTokenArea(!isShowNewTokenArea)}
              >
                {isShowNewTokenArea ? (
                  <img
                    src={images.iconDeleteRound}
                    alt='Close the address input window'
                  />
                ) : (
                  <div sx={styles.addTokenButton}>
                    <span sx={{ paddingBottom: '2px' }}>Add token</span>
                    <img
                      style={styles.addIcon}
                      src={images.iconAdd}
                      alt='add new token'
                    />
                  </div>
                )}
              </div>
            </div>
            {/* add new token input area */}
            {isShowNewTokenArea ? (
              <NewTokenAddressInput
                rewardTokens={rewardTokens}
                addressInputValue={newRewardAddressInput}
                setAddressInputValue={setNewRewardAddressInput}
                setIsShowNewTokenArea={setIsShowNewTokenArea}
                addRewardToken={addRewardToken}
              />
            ) : (
              ''
            )}
            <div sx={styles.rewardListContainer}>
              {Object.keys(rewardTokens).map((tokenAddress) => (
                <RewardListItemContainer
                  key={tokenAddress}
                  guildBankAddress={GUILDBANK[chainId as ChainId]}
                  tokenAddress={tokenAddress as Address}
                  inputAmount={inputAmount}
                  chainId={chainId as ChainId}
                  hakkaTotalSupply={hakkaTotalSupplyAmount.data ?? '0'}
                  tokenName={rewardTokens[tokenAddress as Address]?.name}
                  tokenSymbol={rewardTokens[tokenAddress as Address]?.symbol}
                  tokenDecimals={
                    rewardTokens[tokenAddress as Address]?.decimals
                  }
                  onDelete={() =>
                    onRewardListItemDelete(tokenAddress as Address)
                  }
                  onChange={() => toggleToken(tokenAddress as Address)}
                  checked={pickedRewardTokensAddress.includes(
                    tokenAddress as Address,
                  )}
                  onRewardCalculated={(receiveAmount: BigNumber) =>
                    onRewardCalculated(tokenAddress as Address, receiveAmount)
                  }
                />
              ))}
            </div>
            <hr sx={styles.hr2} />
            {/* total value */}
            <RewardValue
              localRewardAmount={localRewardAmount}
              pickedRewardTokensAddress={pickedRewardTokensAddress}
              inputAmount={inputAmount}
              newRewardAddressInput={newRewardAddressInput}
            />
            <div>
              <BurnButton
                styleKit={'green'}
                isDisabledWhenNotPrepared={false}
                onClick={burn}
                isConnected={isConnected}
                connectWallet={toggleWalletModal}
                isApproved={approveState === ApprovalState.APPROVED}
                approveToken={approve}
                disabled={errorStatus || burnState === BurnState.PENDING}
                isCorrectNetwork={isCorrectNetwork}
                targetNetwork={ChainId.MAINNET}
              >
                Burn
              </BurnButton>
            </div>
          </div>
        </div>
        <div sx={styles.knowMoreWrapper}>
          <hr sx={styles.hr} />
          <div sx={styles.knowMoreRow}>
            <span sx={styles.knowMoreTitle}>More Information</span>
            <div
              sx={styles.wikiLinkArea}
              onClick={() => {
                window.open(
                  'https://hakka-finance.gitbook.io/hakka-wiki',
                  '_blank',
                  'noopener, noreferrer',
                );
              }}
            >
              <span sx={styles.visitWikiLink}>Visit Wiki</span>
              <img src={images.iconForwardGreen} alt='link' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultPage;
