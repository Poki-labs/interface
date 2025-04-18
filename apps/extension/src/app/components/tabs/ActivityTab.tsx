import { BaseCard } from 'poki/src/components/BaseCard/BaseCard'
import { useAddress1000Transactions } from 'poki/src/features/transactions/useAddressTransactions'
import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { AppRoutes } from 'src/app/navigation/constants'
import { navigate } from 'src/app/navigation/state'
import { Flex, Loader, ScrollView } from 'ui/src'
import { NoTransactions } from 'ui/src/components/icons'
import { TransactionSummaryLayout } from 'wallet/src/features/transactions/SummaryCards/SummaryItems/TransactionSummaryLayout'

function Empty() {
  const { t } = useTranslation()

  const onEmptyPress = useCallback(() => {
    navigate(AppRoutes.Receive)
  }, [])

  return (
    <Flex centered pt="$spacing48" px="$spacing36">
      <BaseCard.EmptyState
        buttonLabel={t('home.activity.empty.button')}
        description={t('home.activity.empty.description.default')}
        icon={<NoTransactions color="$neutral3" size="$icon.100" />}
        title={t('home.activity.empty.title')}
        onPress={onEmptyPress}
      />
    </Flex>
  )
}

export const ActivityTab = memo(function _ActivityTab({ address }: { address: Address }): JSX.Element {
  const { result: transactions, loading } = useAddress1000Transactions({ principal: address })

  return (
    <ScrollView showsVerticalScrollIndicator={false} width="100%">
      {loading ? (
        <Loader.Transaction />
      ) : transactions ? (
        transactions.length === 0 ? (
          <Empty />
        ) : (
          transactions.map((transaction) => <TransactionSummaryLayout transaction={transaction} address={address} />)
        )
      ) : null}
    </ScrollView>
  )
})
