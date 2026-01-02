 /** @jsxImportSource theme-ui */
import { jsx } from 'theme-ui';
import { useState, useCallback, useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { toast } from 'react-toastify';
import useAppWriteContract from '../contracts/useAppWriteContract';
import type { ChainId } from 'src/constants';
import { useWaitForTransactionReceipt } from 'wagmi';
import BURNER_ABI from 'src/constants/abis/burner';
import { isAddress, type Address } from 'viem';

export enum BurnState {
  UNKNOWN,
  PENDING,
}

export function useHakkaBurn(
  burnAddress?: string,
  spender?: string,
  amountParsed?: BigNumber,
  pickedRewardTokensAddress?: string[],
): [BurnState, () => Promise<void>] {
  const { chainId } = useWeb3React();

  const {writeContractAsync, data, isPending} = useAppWriteContract(chainId as ChainId)
  const { isLoading: isWaitForLoading } = useWaitForTransactionReceipt({
    hash: data,
    chainId: chainId as ChainId,
    query: {
      enabled: !!data,
    },
  })

  const [currentTransaction, setCurrentTransaction] = useState(null);

  const burnState: BurnState = useMemo(() => {
    if (!spender) return BurnState.UNKNOWN;

    return isPending && isWaitForLoading ? BurnState.PENDING : BurnState.UNKNOWN;
  }, [currentTransaction, spender]);

  const burn = useCallback(async (): Promise<void> => {
    if (!spender) {
      console.error('no spender');
      return;
    }

    if (!burnAddress) return;

    if (!isAddress(burnAddress)) {
      toast.error(<div>Invalid burn address</div>, { containerId: 'error' });
      return;
    }

    await writeContractAsync({
    address: burnAddress,
    abi: BURNER_ABI,
    functionName: 'ragequit',
    args: [pickedRewardTokensAddress as Address[], BigInt(amountParsed!.toString())],
    });
  }, [spender, amountParsed, pickedRewardTokensAddress]);

  return [burnState, burn];
}
