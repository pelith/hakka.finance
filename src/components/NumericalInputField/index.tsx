 /** @jsxImportSource theme-ui */
import { useState, useEffect } from 'react';

import BigNumber from 'bignumber.js';
import styles from './styles';
import NumercialInput from '../NumericalInput';
import images from '../../images/index';
import { ApprovalState } from '../../hooks/useTokenApprove';
import { useActiveWeb3React } from '../../hooks/web3Manager';

interface NumericalInputFieldProps {
  value: string;
  onUserInput: (inputAmount: string) => void;
  tokenBalanceAmount: string;
  approve: () => void;
  approveState: ApprovalState;
  setIsCorrectInput: (isCorrect: boolean) => void;
}

const NumericalInputField = (props: NumericalInputFieldProps) => {
  const {
    value: inputAmount,
    onUserInput,
    tokenBalanceAmount,
    approve,
    approveState,
    setIsCorrectInput,
  } = props;

  // check amount, balance
  const { chainId } = useActiveWeb3React();
  const [amountError, setAmountError] = useState<string>('');

  useEffect(() => {
    if (inputAmount && tokenBalanceAmount) {
      const bigNumberInputAmount = new BigNumber(
        new BigNumber(inputAmount).isNaN() ? 0 : inputAmount,
      );
      const bigNumberHakkaBalance = new BigNumber(
        tokenBalanceAmount,
      )

      if (bigNumberInputAmount.isGreaterThan(bigNumberHakkaBalance)) {
        console.log(
          `the amount ${bigNumberInputAmount.toString()} is more than your balance ${bigNumberHakkaBalance.toString()}`,
        );
        setAmountError('Insufficient balance');
      } else {
        setAmountError('');
      }
    } else {
      setAmountError('');
    }
  }, [tokenBalanceAmount, inputAmount, approveState, chainId]);

  useEffect(() => {
    const isFalseInput = amountError || new BigNumber(inputAmount).isNaN() || new BigNumber(inputAmount).eq(0) || !inputAmount;
    setIsCorrectInput(!isFalseInput);
  }, [inputAmount, amountError]);

  return (
    <div
      sx={amountError ? styles.InputCardErrorWrapper : styles.InputCardWrapper}
    >
      <NumercialInput
        value={inputAmount}
        onUserInput={onUserInput}
        sx={styles.input}
      />
      <div sx={styles.activeArea}>
        {approveState !== ApprovalState.APPROVED ? (
          <img
            src={images.iconLock}
            alt='Unlock token to continue'
            sx={styles.iconLock}
            onClick={() => approve()}
          />
        ) : (
          ''
        )}
        <button
          type='button'
          sx={styles.maxButton}
          onClick={() => {
            onUserInput(tokenBalanceAmount || '0');
          }}
        >
          MAX
        </button>
      </div>
    </div>
  );
};

export default NumericalInputField;
