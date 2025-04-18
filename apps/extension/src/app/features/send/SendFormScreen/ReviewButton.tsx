import BigNumber from 'bignumber.js'
import Trace from 'poki/src/features/telemetry/Trace'
import { ElementName } from 'poki/src/features/telemetry/constants'
import { TestID } from 'poki/src/test/fixtures/testIDs'
import { CurrencyField } from 'poki/src/types/currency'
import { parseTokenAmount } from 'poki/src/utils/tokenAmount'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DeprecatedButton, Flex, Text, isWeb } from 'ui/src'
import { isValidPrincipal } from 'utilities/src/addresses'
import { useSendContext } from 'wallet/src/features/transactions/contexts/SendContext'

type ReviewButtonProps = {
  onPress: () => void
  disabled?: boolean
}

export function ReviewButton({ onPress, disabled }: ReviewButtonProps): JSX.Element {
  const { t } = useTranslation()

  const {
    derivedSendInfo: { recipient, currencyAmounts, currencyBalances, currencyInInfo },
  } = useSendContext()

  const inputAmount = useMemo(() => {
    return currencyAmounts[CurrencyField.INPUT]
  }, [currencyAmounts])

  const insufficientFunds = useMemo(() => {
    if (!currencyBalances || !inputAmount || !currencyBalances[CurrencyField.INPUT]) return false

    const currency = currencyBalances[CurrencyField.INPUT].currency

    return new BigNumber(inputAmount.toExact()).isGreaterThan(
      new BigNumber(currencyBalances[CurrencyField.INPUT].toExact()).plus(
        parseTokenAmount(currency.fee, currency.decimals),
      ),
    )
  }, [currencyBalances, inputAmount])

  const invalidRecipient = useMemo(() => {
    if (recipient) {
      return !isValidPrincipal(recipient)
    }

    return false
  }, [recipient])

  const disableReviewButton =
    disabled ||
    !recipient ||
    !inputAmount ||
    new BigNumber(inputAmount.toExact()).isEqualTo(0) ||
    insufficientFunds ||
    invalidRecipient

  const buttonText = insufficientFunds
    ? t('send.warning.insufficientFunds.title', {
        currencySymbol: currencyInInfo?.symbol,
      })
    : !recipient
      ? t('send.no.recipient')
      : invalidRecipient
        ? t('send.invalid.recipient')
        : t('common.button.review')

  return (
    <Flex gap="$spacing16">
      <Trace logPress element={ElementName.SendReview}>
        <DeprecatedButton
          backgroundColor="$accent1"
          isDisabled={disableReviewButton}
          size={isWeb ? 'medium' : 'large'}
          testID={TestID.SendReview}
          onPress={onPress}
        >
          <Text color="white" variant="buttonLabel1">
            {buttonText}
          </Text>
        </DeprecatedButton>
      </Trace>
    </Flex>
  )
}
