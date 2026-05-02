import { randomInt } from 'node:crypto'

/** Fisher–Yates shuffle with crypto RNG so round order is not correlated with BSON/storage order. */
export function shuffleArrayInPlace<T>(items: T[]): void {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1)
    ;[items[i], items[j]] = [items[j], items[i]]
  }
}
