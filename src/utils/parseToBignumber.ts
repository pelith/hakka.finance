import { Decimal } from 'decimal.js';

export function parseToBignumber(value: Decimal.Value) {
  return new Decimal(value);
}
