import { useMemo } from 'react';
import styles from './styles';
import { MyButton } from '../../Common';
import { useActiveWeb3React } from '../../../hooks/web3Manager';
import { useReadContracts } from 'wagmi';

import ERC20_ABI from '../../../constants/abis/erc20';
import { isAddress, isAddressEqual, type Address } from 'viem';
interface NewTokenAddressInputProps {
  addressInputValue: string;
  setAddressInputValue: (input: string) => void;
  rewardTokens: {
    [x: string]: { name: string; symbol: string; decimals: number };
  };
  addRewardToken: (input: {
    address: Address;
    name: string;
    symbol: string;
    decimals: number;
  }) => void;
  setIsShowNewTokenArea: (input: boolean) => void;
}

const NewTokenAddressInput = (props: NewTokenAddressInputProps) => {
  const {
    addressInputValue,
    setIsShowNewTokenArea,
    addRewardToken,
    setAddressInputValue,
    rewardTokens,
  } = props;
  useActiveWeb3React(); // keep for backwards compatibility (side effects / wallet state)
  // const [addTokenError, setAddTokenError] = useState<string>('');

  const { data: tokenInfo } = useReadContracts({
    contracts: [
      {
        address: addressInputValue as Address,
        abi: ERC20_ABI,
        functionName: 'name',
      },
      {
        address: addressInputValue as Address,
        abi: ERC20_ABI,
        functionName: 'symbol',
      },
      {
        address: addressInputValue as Address,
        abi: ERC20_ABI,
        functionName: 'decimals',
      },
    ] as const,
    query: {
      enabled: isAddress(addressInputValue),
    },
  });

  const isAddBtnDisabled = useMemo(() => {
    if (!tokenInfo?.every((item) => item.status === 'success')) return true;
    if (!isAddress(addressInputValue)) return true;
    const rewardTokensAddresses = Object.keys(rewardTokens);
    if (
      rewardTokensAddresses.some((address) =>
        isAddressEqual(address as Address, addressInputValue as Address),
      )
    )
      return true;
    return false;
  }, [Object.keys(rewardTokens).join()]);

  const handleAddBtnClick = () => {
    if (!tokenInfo) return;
    if (isAddress(addressInputValue)) {
      setIsShowNewTokenArea(false);

      const newTokenInfo = {
        name: tokenInfo[0].result!,
        symbol: tokenInfo[1].result!,
        decimals: tokenInfo[2].result!,
      };

      addRewardToken({
        address: addressInputValue as Address,
        ...newTokenInfo,
      });
    } else {
      console.log('It is not a address');
    }
    setAddressInputValue('');
  };

  return (
    <div sx={styles.container}>
      <div sx={styles.NewTokenAddressInputWrapper}>
        <input
          placeholder='Token Address'
          sx={styles.input}
          value={addressInputValue}
          onChange={(event) => setAddressInputValue(event.target.value)}
        />
      </div>
      <div sx={styles.addButton}>
        <MyButton
          styleKit='green'
          disabled={isAddBtnDisabled}
          onClick={handleAddBtnClick}
        >
          Add
        </MyButton>
      </div>
    </div>
  );
};

export default NewTokenAddressInput;
