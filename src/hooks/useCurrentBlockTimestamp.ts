import { getUnixTime } from 'date-fns';
// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(): bigint {
  return BigInt(getUnixTime(Date.now()));
}
