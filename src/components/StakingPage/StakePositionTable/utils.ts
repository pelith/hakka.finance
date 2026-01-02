export function getExpiredLeftStrFromBigNumber(time: bigint) {
  const ms = Number(time) * 1000;
  const isExpired = ms < Date.now();

  const text = isExpired
    ? 'Expired'
    : `Left ${Math.floor((ms - Date.now()) / 86400000).toString()} days`;
  return text;
}

export function getDateFromBigNumber(time: bigint | number | string) {
  return new Date(Number(time) * 1000).toLocaleString('en-us', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
}
