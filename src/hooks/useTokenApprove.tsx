 /** @jsxImportSource theme-ui */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import { useTokenAllowance } from './contracts/token/useTokenAllowance';
import { useActiveWeb3React } from './web3Manager';
import { getEtherscanLink, shortenTxId  } from '../utils';
import { toast } from 'react-toastify';
import { ExternalLink } from 'react-feather';
import isZero from '../utils/isZero';
import { erc20Abi, formatUnits, isAddress, type Address } from 'viem';
import { useTokenInfoAndBalance } from './contracts/token/useTokenInfoAndBalance';
import BigNumber from 'bignumber.js';
import type { ChainId, TokenInfo } from 'src/constants';
import { usePublicClient, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export function useTokenApprove(
  tokenToApprove: string,
  spender: string,
  requiredAllowance: string,
): [ApprovalState, () => Promise<void>] {
  const { account } = useActiveWeb3React();
  const { chainId } = useWeb3React();
  const {data: currentAllowance = 0n} = useTokenAllowance(
    tokenToApprove,
    account as string,
    spender,
  );
  const {data: tokenInfoAndBalance} = useTokenInfoAndBalance(account as string, tokenToApprove);
  const publicClient = usePublicClient({chainId: chainId as ChainId})


  const { writeContractAsync,reset: resetWriteContract, isSuccess: isWriteSuccess } = useWriteContract()

  const approvalState: ApprovalState = useMemo(() => {
    if (!tokenToApprove || !spender) return ApprovalState.UNKNOWN;
    if (!currentAllowance) return ApprovalState.UNKNOWN;

    const currentAllowanceAmount = new BigNumber(formatUnits(currentAllowance, tokenInfoAndBalance?.decimals ?? 18));

    return currentAllowanceAmount.lte(requiredAllowance) ||
      currentAllowanceAmount.eq(0)
      ? isWriteSuccess
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED;
  }, [isWriteSuccess, tokenToApprove, currentAllowance, spender]);


  const approve = useCallback(async (): Promise<void> => {
    const MAX_UINT256 = (2n ** 256n) - 1n;
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily');
      return;
    }
    if (!tokenToApprove) {
      console.error('no token');
      return;
    }

    if (!isAddress(tokenToApprove)) {
      console.error('invalid token address');
      return;
    }

    if (!spender || isZero(spender)) {
      console.error('no spender');
      return;
    }

    try {
      const txHash = await writeContractAsync({
        address: tokenToApprove as Address,
        abi:erc20Abi,
        functionName: 'approve',
        args: [spender as Address, MAX_UINT256],
      });
      toast(
        <a
          target='_blank'
          href={getEtherscanLink(chainId ?? 1, txHash, 'transaction')}
          rel='noreferrer noopener'
          sx={{ textDecoration: 'none', color: '#253e47' }}
        >
          {shortenTxId(txHash)} <ExternalLink size={16} />
        </a>,
        { containerId: 'tx' },
      );
      await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      resetWriteContract()
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        toast.error(
          <div>{err.message}</div>,
          { containerId: 'error' },
        );
      }
    }
  }, [approvalState, tokenToApprove, writeContractAsync, spender]);

  return [approvalState, approve];
}
