import { useEffect, useContext, useMemo } from 'react';
import type { FunctionFragment, Interface } from 'ethers';
import { zeroAddress } from 'viem';
import { useActiveWeb3React } from '../../hooks/web3Manager';
import { useBlockNumber } from '../application/hooks';
import { MulticallContext } from './context';
import { parseCallKey, toCallKey } from './actions';
import type { Call, ListenerOptions } from './actions';
/**
 *
 * @@deprecated
 */
export function useMulticallContext() {
  return useContext(MulticallContext);
}

export interface Result extends ReadonlyArray<any> {
  readonly [key: string]: any;
}

type MethodArg = string | number | bigint;
type MethodArgs = Array<MethodArg | MethodArg[]>;

type OptionalMethodInputs =
  | Array<MethodArg | MethodArg[] | undefined>
  | undefined;

function isMethodArg(x: unknown): x is MethodArg {
  return ['string', 'number', 'bigint'].indexOf(typeof x) !== -1;
}

function isValidMethodArgs(x: unknown): x is MethodArgs | undefined {
  return (
    x === undefined ||
    (Array.isArray(x) &&
      x.every(
        (xi) => isMethodArg(xi) || (Array.isArray(xi) && xi.every(isMethodArg)),
      ))
  );
}

interface CallResult {
  readonly valid: boolean;
  readonly data: string | undefined;
  readonly blockNumber: number | undefined;
}

const INVALID_RESULT: CallResult = {
  valid: false,
  blockNumber: undefined,
  data: undefined,
};

// use this options object
export const NEVER_RELOAD: ListenerOptions = {
  blocksPerFetch: Number.POSITIVE_INFINITY,
};

type ContractLike = {
  interface: Interface;
  target: unknown;
};

function getContractAddress(
  contract: ContractLike | null | undefined,
): string | undefined {
  const address = contract?.target;
  return typeof address === 'string' ? address : undefined;
}

// the lowest level call for subscribing to contract data
/**
 * @deprecated
 */
function useCallsData(
  calls: (Call | undefined)[],
  options?: ListenerOptions,
): CallResult[] {
  const { chainId } = useActiveWeb3React();
  const { state, addMulticallListeners, removeMulticallListeners } =
    useMulticallContext();
  const { callResults } = state;

  const serializedCallKeys: string = useMemo(
    () =>
      JSON.stringify(
        calls
          ?.filter((c): c is Call => Boolean(c))
          ?.map(toCallKey)
          ?.sort() ?? [],
      ),
    [calls],
  );

  // update listeners when there is an actual change that persists for at least 100ms
  useEffect(() => {
    const callKeys: string[] = JSON.parse(serializedCallKeys);
    if (!chainId || callKeys.length === 0) return undefined;
    const calls = callKeys.map((key) => parseCallKey(key));
    addMulticallListeners({
      chainId,
      calls,
      options,
    });

    return () => {
      removeMulticallListeners({
        chainId,
        calls,
        options,
      });
    };
  }, [
    chainId,
    addMulticallListeners,
    removeMulticallListeners,
    options,
    serializedCallKeys,
  ]);

  return useMemo(
    () =>
      calls.map<CallResult>((call) => {
        if (!chainId || !call) return INVALID_RESULT;

        const result = callResults[chainId]?.[toCallKey(call)];
        let data: string | undefined;
        if (result?.data && result?.data !== '0x') {
          data = result.data;
        }

        return { valid: true, data, blockNumber: result?.blockNumber };
      }),
    [callResults, calls, chainId],
  );
}

interface CallState {
  readonly valid: boolean;
  // the result, or undefined if loading or errored/no data
  readonly result: Result | undefined;
  // true if the result has never been fetched
  readonly loading: boolean;
  // true if the result is not for the latest block
  readonly syncing: boolean;
  // true if the call was made and is synced, but the return data is invalid
  readonly error: boolean;
}

const INVALID_CALL_STATE: CallState = {
  valid: false,
  result: undefined,
  loading: false,
  syncing: false,
  error: false,
};
const LOADING_CALL_STATE: CallState = {
  valid: true,
  result: undefined,
  loading: true,
  syncing: true,
  error: false,
};

function toCallState(
  callResult: CallResult | undefined,
  contractInterface: Interface | undefined,
  fragment: FunctionFragment | null | undefined,
  latestBlockNumber: number | undefined,
): CallState {
  if (!callResult) return INVALID_CALL_STATE;
  const { valid, data, blockNumber } = callResult;
  if (!valid) return INVALID_CALL_STATE;
  if (valid && !blockNumber) return LOADING_CALL_STATE;
  if (!contractInterface || !fragment || !latestBlockNumber)
    return LOADING_CALL_STATE;
  const success = data && data.length > 2;
  const syncing = (blockNumber ?? 0) < latestBlockNumber;
  let result: Result | undefined;
  if (success && data) {
    try {
      result = contractInterface.decodeFunctionResult(fragment, data);
    } catch (_error) {
      console.debug('Result data parsing failed', fragment, data);
      return {
        valid: true,
        loading: false,
        error: true,
        syncing,
        result,
      };
    }
  }
  return {
    valid: true,
    loading: false,
    syncing,
    result,
    error: !success,
  };
}

/**
 * @deprecated
 */
export function useSingleContractMultipleData(
  contract: ContractLike | null | undefined,
  methodName: string,
  callInputs: OptionalMethodInputs[],
  options?: ListenerOptions,
): CallState[] {
  const fragment = useMemo(
    () => contract?.interface?.getFunction(methodName),
    [contract, methodName],
  );

  const calls = useMemo(() => {
    const address = getContractAddress(contract);
    if (!address || address === zeroAddress) return [];
    if (!contract || !fragment || !callInputs || callInputs.length === 0)
      return [];
    return callInputs.map<Call>((inputs) => ({
      address,
      callData: contract.interface.encodeFunctionData(fragment, inputs),
    }));
  }, [callInputs, contract, fragment]);

  const results = useCallsData(calls, options);

  const latestBlockNumber = useBlockNumber();

  return useMemo(
    () =>
      results.map((result) =>
        toCallState(result, contract?.interface, fragment, latestBlockNumber),
      ),
    [fragment, contract, results, latestBlockNumber],
  );
}

/**
 * @deprecated
 */
export function useMultipleContractSingleData(
  addresses: (string | undefined)[],
  contractInterface: Interface,
  methodName: string,
  callInputs?: OptionalMethodInputs,
  options?: ListenerOptions,
): CallState[] {
  const fragment = useMemo(
    () => contractInterface.getFunction(methodName),
    [contractInterface, methodName],
  );
  const callData: string | undefined = useMemo(
    () =>
      fragment && isValidMethodArgs(callInputs)
        ? contractInterface.encodeFunctionData(fragment, callInputs)
        : undefined,
    [callInputs, contractInterface, fragment],
  );

  const calls = useMemo(
    () =>
      fragment && addresses && addresses.length > 0 && callData
        ? addresses.map<Call | undefined>((address) =>
            address && address !== zeroAddress && callData
              ? {
                  address,
                  callData,
                }
              : undefined,
          )
        : [],
    [addresses, callData, fragment],
  );

  const results = useCallsData(calls, options);

  const latestBlockNumber = useBlockNumber();

  return useMemo(
    () =>
      results.map((result) =>
        toCallState(result, contractInterface, fragment, latestBlockNumber),
      ),
    [fragment, results, contractInterface, latestBlockNumber],
  );
}

/**
 * @deprecated
 */
export function useMultipleContractMultipleData({
  addresses,
  contractInterface,
  methodName,
  callInputs,
  options,
  enabled = true,
}: {
  addresses: (string | undefined)[];
  contractInterface: Interface;
  methodName: string;
  callInputs?: OptionalMethodInputs[];
  options?: ListenerOptions;
  enabled?: boolean;
}): CallState[] {
  const fragment = useMemo(
    () => contractInterface.getFunction(methodName),
    [contractInterface, methodName],
  );

  const calls = useMemo(
    () =>
      fragment &&
      enabled &&
      addresses &&
      addresses.length > 0 &&
      addresses.indexOf(zeroAddress) === -1 &&
      callInputs &&
      callInputs.length > 0 &&
      addresses.length === callInputs.length
        ? addresses.map<Call | undefined>((address, index) =>
            address && callInputs[index]
              ? {
                  address,
                  callData: contractInterface.encodeFunctionData(
                    fragment,
                    callInputs[index],
                  ),
                }
              : undefined,
          )
        : [],
    [addresses, callInputs, contractInterface, fragment],
  );

  const results = useCallsData(calls, options);

  const latestBlockNumber = useBlockNumber();

  return useMemo(
    () =>
      results.map((result) =>
        toCallState(result, contractInterface, fragment, latestBlockNumber),
      ),
    [fragment, results, contractInterface, latestBlockNumber],
  );
}
/**
 *
 * @deprecated
 */
export function useSingleCallResult(
  contract: ContractLike | null | undefined,
  methodName: string,
  inputs?: OptionalMethodInputs,
  options?: ListenerOptions,
): CallState {
  const fragment = useMemo(
    () => contract?.interface?.getFunction(methodName),
    [contract, methodName],
  );

  const calls = useMemo<Call[]>(() => {
    const address = getContractAddress(contract);
    if (!address || address === zeroAddress) return [];
    if (!contract || !fragment || !isValidMethodArgs(inputs)) return [];
    return [
      {
        address,
        callData: contract.interface.encodeFunctionData(fragment, inputs),
      },
    ];
  }, [contract, fragment, inputs]);

  const result = useCallsData(calls, options)[0];
  const latestBlockNumber = useBlockNumber();

  return useMemo(
    () => toCallState(result, contract?.interface, fragment, latestBlockNumber),
    [result, contract, fragment, latestBlockNumber],
  );
}
