import { useQuery } from '@tanstack/react-query';
import { fromUnixTime, isAfter, isValid, parse } from 'date-fns';
import { useMemo } from 'react';

function getExpiredDate(
  date: string | Date | number,
  {
    isUnixTime,
    parsingTimeFormat,
  }: { isUnixTime?: boolean; parsingTimeFormat?: string },
) {
  if (date instanceof Date) return date;
  if (isUnixTime) {
    return new Date(fromUnixTime(date as number));
  }
  if (!parsingTimeFormat || typeof date === 'number') {
    return new Date(date);
  }
  return parse(date, parsingTimeFormat, new Date());
}

function isExpired(date: Date) {
  return isAfter(new Date(), date);
}

export function useCheckExpired(
  date: string | Date | number,
  {
    parsingTimeFormat,
    interval = 1000,
    enabled = true,
    isUnixTime = false,
  }: {
    parsingTimeFormat?: string;
    interval?: number;
    enabled?: boolean;
    isUnixTime?: boolean;
  } = {
    enabled: true,
  },
) {
  const expiredDate = useMemo(
    () => getExpiredDate(date, { parsingTimeFormat, isUnixTime }),
    [date, parsingTimeFormat, isUnixTime],
  );

  return useQuery({
    queryKey: ['check-expired', date],
    queryFn: () => isExpired(expiredDate),
    refetchInterval: interval,
    enabled: enabled || isValid(expiredDate),
    initialData: isExpired(expiredDate),
  });
}
