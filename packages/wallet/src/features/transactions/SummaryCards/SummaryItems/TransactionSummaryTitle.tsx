import React from 'react'
import { Flex, Text, UniversalImage, useIsDarkMode } from 'ui/src'
import { TransactionType } from 'poki/src/features/transactions/types/transactionDetails'
import { IcExplorerAddressTransaction } from 'poki/src/types/ic-explorer'

interface TransactionSummaryTitleProps {
  transaction: IcExplorerAddressTransaction
  title: string
}

const ICON_SIZE = 14

export const TransactionSummaryTitle: React.FC<TransactionSummaryTitleProps> = ({ transaction, title }) => {
  const isDarkMode = useIsDarkMode()
  const onRampLogo =
    transaction.op === TransactionType.OffRampSale ||
    transaction.op === TransactionType.OnRampPurchase ||
    transaction.op === TransactionType.OnRampTransfer ? (
      <UniversalImage
        size={{ height: ICON_SIZE, width: ICON_SIZE }}
        style={{
          image: {
            borderRadius: 4,
          },
        }}
        // uri={
        //   isDarkMode
        //     ? transaction.typeInfo.serviceProvider.logoDarkUrl
        //     : transaction.typeInfo.serviceProvider.logoLightUrl
        // }
      />
    ) : null

  return (
    <Flex row alignItems="center">
      <Text color="$neutral2" mr={onRampLogo ? 4 : 0} variant="body2">
        {title}
      </Text>
      {onRampLogo}
    </Flex>
  )
}
