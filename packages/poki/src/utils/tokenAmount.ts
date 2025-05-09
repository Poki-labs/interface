import BigNumber from 'bignumber.js'

BigNumber.set({ EXPONENTIAL_AT: 10 ** 9 })
BigNumber.config({
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
})

export function formatTokenAmount(
  amount: bigint | number | string | null | undefined,
  decimals: number | bigint = 8,
): BigNumber {
  let _amount = amount
  let _decimals = decimals

  if (_amount !== 0 && !_amount) return new BigNumber(0)
  if (typeof _amount === 'bigint') _amount = Number(_amount)
  if (typeof decimals === 'bigint') _decimals = Number(_decimals)
  if (Number.isNaN(Number(amount))) return new BigNumber(_amount)

  return new BigNumber(new BigNumber(_amount).multipliedBy(10 ** Number(_decimals)).toFixed(0))
}

export function parseTokenAmount(
  amount: bigint | number | string | null | undefined,
  decimals: number | bigint = 8,
): BigNumber {
  let _amount = amount
  let _decimals = decimals

  if (_amount !== 0 && !_amount) return new BigNumber(0)
  if (typeof _amount === 'bigint') _amount = Number(_amount)
  if (typeof _decimals === 'bigint') _decimals = Number(_decimals)
  if (Number.isNaN(Number(_amount))) return new BigNumber(String(_amount))

  return new BigNumber(String(_amount)).dividedBy(10 ** Number(_decimals))
}
