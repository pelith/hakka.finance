 /** @jsxImportSource theme-ui */

import BigNumber from 'bignumber.js';
import images from '../../../images/index';
import styles from './styles';
import { formatCommonNumber } from '@/utils/formatCommonNumbers';

interface RewardItemProps {
  onDelete: () => void;
  onChange: () => void;
  checked: boolean;
  tokenName: string;
  isDefaultToken: boolean;
  receiveAmount: BigNumber;
  bankBalance: string;
}
const RewardItem = (props: RewardItemProps) => {
  const {
    onChange,
    checked,
    tokenName,
    isDefaultToken,
    receiveAmount,
    bankBalance,
    onDelete: handleTokenDeleteClick,
  } = props;

  return (
    <div sx={styles.rewardItemWrapper}>
      <div sx={styles.itemInfo}>
        <label sx={styles.checkBoxLabel}>
          <input
            sx={styles.checkBox}
            type='checkbox'
            // id={label}
            // name={label}
            // checked={checked}
            onChange={onChange}
          />
          {checked ? (
            <img alt='checked' src={images.iconChekBoxChecked} />
          ) : (
            <img src={images.iconChekBoxUnchecked} alt='unchecked' />
          )}
          <span sx={styles.tokenName}>{tokenName}</span>
        </label>
        {isDefaultToken || (
          <img
            sx={styles.iconTrash}
            src={images.iconTrash}
            onClick={() => handleTokenDeleteClick()}
            alt='delete this reward'
          />
        )}
      </div>
      {checked ? (
        <div>
          <span sx={styles.receiveAmount}>
            {receiveAmount?.isEqualTo(new BigNumber(0))
              ? '0'
              : receiveAmount?.toFixed(4)}
          </span>
          /<span sx={styles.bankBalance}>{formatCommonNumber(bankBalance)}</span>
        </div>
      ) : (
        <span sx={styles.unselectedReward}>Unselected Reward</span>
      )}
    </div>
  );
};

export default RewardItem;
