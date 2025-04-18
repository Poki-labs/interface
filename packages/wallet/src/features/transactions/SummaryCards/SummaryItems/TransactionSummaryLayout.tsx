import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, Text, TouchableArea, isWeb } from 'ui/src'
// import { PokiX } from 'ui/src/components/icons'
// import { useTransactionActions } from 'wallet/src/features/transactions/SummaryCards/DetailsModal/useTransactionActions'
import { TransactionSummaryTitle } from 'wallet/src/features/transactions/SummaryCards/SummaryItems/TransactionSummaryTitle'
import { TransactionSummaryLayoutProps } from 'wallet/src/features/transactions/SummaryCards/types'
import { getTransactionSummaryTitle, useFormattedTime } from 'wallet/src/features/transactions/SummaryCards/utils'
// import { useIsQueuedTransaction } from 'wallet/src/features/transactions/hooks'
import { SplitLogos } from 'poki/src/components/CurrencyLogo/SplitLogos'
import { TokenLogo } from 'poki/src/components/CurrencyLogo/TokenLogo'
import { getIcExplorerTokenLogo } from 'poki/src/utils/token-logo'
import { shortenAddress } from 'utilities/src/addresses'
import { useActiveAccountWithThrow, useDisplayName } from 'wallet/src/features/wallet/hooks'

export const TransactionSummaryLayout = memo(function _TransactionSummaryLayout(
  props: TransactionSummaryLayoutProps,
): JSX.Element {
  // Monitor latest nonce to identify queued transactions.
  // We moved this outside of `TransactionSummaryLayoutContent` to avoid re-rendering the entire component when the nonce changes,
  // given that we do not care about the nonce itself but just about the `isQueued` boolean.
  // const isQueued = useIsQueuedTransaction(props.transaction)

  return <TransactionSummaryLayoutContent {...props} />
})

/**
 * IMPORTANT: If you add any new hooks to this component, make sure to profile the app using `react-devtools` to verify
 *            that the component is not re-rendering unnecessarily.
 */
const TransactionSummaryLayoutContent = memo(function _TransactionSummaryLayoutContent({
  transaction,
  address,
}: TransactionSummaryLayoutProps): JSX.Element {
  const { t } = useTranslation()

  const { type } = useActiveAccountWithThrow()

  const walletDisplayName = useDisplayName(address)

  const title = getTransactionSummaryTitle(transaction, t, address) ?? ''

  const formattedAddedTime = useFormattedTime(transaction.token0TxTime)

  const rightBlock = (
    <Text color="$neutral3" variant="body3">
      {formattedAddedTime}
    </Text>
  )

  return (
    <>
      <TouchableArea mb="$spacing4" overflow="hidden" testID={`activity-list-item-${transaction.id ?? 0}`}>
        <Flex
          grow
          row
          backgroundColor="$surface1"
          borderRadius="$rounded16"
          gap="$spacing12"
          hoverStyle={{ backgroundColor: '$surface2' }}
          px={isWeb ? '$spacing8' : '$none'}
          py="$spacing8"
        >
          <Flex centered width={40}>
            {transaction.token0LedgerId && transaction.token1LedgerId ? (
              <SplitLogos
                inputLogoUrl={getIcExplorerTokenLogo(transaction.token0LedgerId)}
                outputLogoUrl={getIcExplorerTokenLogo(transaction.token1LedgerId)}
                size={40}
              />
            ) : (
              <TokenLogo
                name={transaction.token0Symbol}
                size={40}
                symbol={transaction.token0Symbol}
                url={getIcExplorerTokenLogo(transaction.token0LedgerId)}
              />
            )}
          </Flex>

          <Flex grow shrink>
            <Flex grow gap="$spacing2">
              <Flex grow row alignItems="center" gap="$spacing4" justifyContent="space-between">
                <Flex row shrink alignItems="center" gap="$spacing4">
                  {/* {walletDisplayName ? (
                    <DisplayNameText
                      displayName={walletDisplayName}
                      textProps={{ color: '$accent1', variant: 'body1' }}
                    />
                  ) : null} */}
                  <TransactionSummaryTitle title={title} transaction={transaction} />
                </Flex>
                {rightBlock}
              </Flex>
              <Flex grow row gap="$spacing16">
                {transaction.op === 'swap'
                  ? `${transaction.token0Amount} ${transaction.token0Symbol} -> ${transaction.token1Amount} ${
                      transaction.token1Symbol
                    }`
                  : transaction.op === 'transfer'
                    ? transaction.toOwner === address
                      ? `${transaction.token0Amount} ${transaction.token0Symbol} from ${shortenAddress(
                          transaction.fromOwner,
                        )}`
                      : `${transaction.token0Amount} ${transaction.token0Symbol} to ${shortenAddress(transaction.toOwner)}`
                    : transaction.op === 'approve'
                      ? `${transaction.token0Amount} ${transaction.token0Symbol}`
                      : transaction.op === 'addLiquidity'
                        ? `${
                            transaction.token0Amount
                          } ${transaction.token0Symbol} and ${transaction.token1Amount} ${transaction.token1Symbol}`
                        : transaction.op === 'removeLiquidity'
                          ? `${transaction.token0Amount} ${transaction.token0Symbol} ans ${transaction.token1Amount} ${transaction.token1Symbol}`
                          : null}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </TouchableArea>
    </>
  )
})
