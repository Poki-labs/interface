/* eslint-disable complexity */
import { CurrencyLogo } from 'poki/src/components/CurrencyLogo/CurrencyLogo'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { DeprecatedButton, Flex, Separator, Text, TouchableArea, isWeb, useSporeColors } from 'ui/src'
import { Arrow } from 'ui/src/components/arrow/Arrow'
import { BackArrow, X } from 'ui/src/components/icons'
import { useDeviceDimensions } from 'ui/src/hooks/useDeviceDimensions'
import { iconSizes } from 'ui/src/theme'
// import { WarningModal } from 'poki/src/components/modals/WarningModal/WarningModal'
import { AccountType } from 'poki/src/features/accounts/types'
import { useAvatar } from 'poki/src/features/address/avatar'
import { AuthTrigger } from 'poki/src/features/auth/types'
// import { UniverseChainId } from 'poki/src/features/chains/types'
import { useAppFiatCurrencyInfo } from 'poki/src/features/fiatCurrency/hooks'
import { useLocalizationContext } from 'poki/src/features/language/LocalizationContext'
import { pushNotification } from 'poki/src/features/notifications/slice'
import { AppNotificationType } from 'poki/src/features/notifications/types'
import Trace from 'poki/src/features/telemetry/Trace'
// import { ElementName, ModalName, SectionName } from 'poki/src/features/telemetry/constants'
import { ElementName, SectionName } from 'poki/src/features/telemetry/constants'
// import { TransactionDetails } from 'poki/src/features/transactions/TransactionDetails/TransactionDetails'
import { TransactionModalFooterContainer } from 'poki/src/features/transactions/TransactionModal/TransactionModal'
import {
  TransactionScreen,
  useTransactionModalContext,
} from 'poki/src/features/transactions/TransactionModal/TransactionModalContext'
import { useUSDCValue } from 'poki/src/features/transactions/swap/hooks/useUSDCPrice'
import { CurrencyField } from 'poki/src/types/currency'
// import { currencyAddress } from 'poki/src/utils/currencyId'
import { shortenAddress } from 'utilities/src/addresses'
import { NumberType } from 'utilities/src/format/types'
import { logger } from 'utilities/src/logger/logger'
import { AccountIcon } from 'wallet/src/components/accounts/AccountIcon'
import { AddressDisplay } from 'wallet/src/components/accounts/AddressDisplay'
import { useWalletNavigation } from 'wallet/src/contexts/WalletNavigationContext'
// import { useIsErc20Contract } from 'wallet/src/features/contracts/hooks'
import { useSendContext } from 'wallet/src/features/transactions/contexts/SendContext'
// import { useSendERC20Callback } from 'wallet/src/features/transactions/send/hooks/useSendCallback'
import { AssetType } from 'poki/src/entities/assets'
import { TransactionStatus, TransactionType } from 'poki/src/features/transactions/types/transactionDetails'
import { formatTokenAmount } from 'poki/src/utils/tokenAmount'
import { useSendIcrcCallback } from 'wallet/src/features/transactions/send/hooks/useSendIcrcCallback'
import { useActiveAccountIdentity, useActiveAccountWithThrow } from 'wallet/src/features/wallet/hooks'

export function SendReviewDetails({
  authTrigger,
  ButtonAuthIcon,
  onCloseModal,
  onSubmitSend,
}: {
  authTrigger?: AuthTrigger
  ButtonAuthIcon?: JSX.Element | null
  onCloseModal?: () => void
  onSubmitSend?: () => void
}): JSX.Element | null {
  const { t } = useTranslation()
  const colors = useSporeColors()
  const dispatch = useDispatch()
  const { fullHeight } = useDeviceDimensions()
  const account = useActiveAccountWithThrow()

  const { formatCurrencyAmount, formatNumberOrString, convertFiatAmountFormatted } = useLocalizationContext()
  const { navigateToAccountActivityList } = useWalletNavigation()
  const accountCredentials = useActiveAccountIdentity()

  const { setScreen } = useTransactionModalContext()
  // const { derivedSendInfo, warnings, txRequest, gasFee, isFiatInput, fiatOffRampMetaData } = useSendContext()
  // const { txId, chainId, recipient, currencyInInfo, currencyAmounts, nftIn, exactAmountFiat } = derivedSendInfo
  const { derivedSendInfo, isFiatInput, fiatOffRampMetaData } = useSendContext()
  const { txId, recipient, currencyInInfo, currencyAmounts, exactAmountFiat } = derivedSendInfo

  const { avatar } = useAvatar(recipient)

  const currency = useAppFiatCurrencyInfo()
  const inputCurrencyUSDValue = useUSDCValue(currencyAmounts[CurrencyField.INPUT])
  const currencyAmountUSD = useUSDCValue(currencyAmounts[CurrencyField.INPUT])

  const triggerTransferPendingNotification = useCallback(() => {
    if (!currencyInInfo) {
      // This should never happen. Just keeping TS happy.
      logger.error(new Error('Missing `currencyInInfo` when triggering transfer pending notification'), {
        tags: { file: 'SendReviewDetails.tsx', function: 'triggerTransferPendingNotification' },
      })
    } else {
      dispatch(
        pushNotification({
          type: AppNotificationType.TransferCurrencyPending,
          currencyInfo: currencyInInfo,
        }),
      )
    }
  }, [currencyInInfo, dispatch])

  const onNext = useCallback((): void => {
    onCloseModal?.()
    triggerTransferPendingNotification()
    navigateToAccountActivityList()
    fiatOffRampMetaData?.onSubmitCallback(Number(inputCurrencyUSDValue?.toExact()))
  }, [
    navigateToAccountActivityList,
    onCloseModal,
    triggerTransferPendingNotification,
    fiatOffRampMetaData,
    inputCurrencyUSDValue,
  ])

  const transferAmount = useMemo(() => {
    const currencyAmount = currencyAmounts[CurrencyField.INPUT]
    if (!currencyAmount) return undefined
    return formatTokenAmount(currencyAmount.toExact(), currencyAmount.currency.decimals).toString()
  }, [currencyAmounts])

  const transferIcrcCallback = useSendIcrcCallback(currencyInInfo?.ledger_id.toString(), recipient, transferAmount)

  const onSubmitButtonPress = useCallback(async () => {
    if (transferIcrcCallback && currencyInInfo && recipient && transferAmount) {
      onNext()

      const transferResult = await transferIcrcCallback()

      dispatch(
        pushNotification({
          type: AppNotificationType.Transaction,
          txType: TransactionType.Send,
          tokenAddress: currencyInInfo.ledger_id.toString(),
          currencyAmountRaw: transferAmount,
          recipient,
          chainId: 1,
          txId: '1234',
          txStatus: transferResult.status === 'ok' ? TransactionStatus.Success : TransactionStatus.Failed,
          assetType: AssetType.Currency,
        }),
      )

      await onSubmitSend?.()
    }
  }, [
    authTrigger,
    currencyInInfo,
    recipient,
    transferAmount,
    transferIcrcCallback,
    setScreen,
    onSubmitSend,
    accountCredentials,
  ])

  // const { blockingWarning } = warnings
  // const transferWarning = warnings.warnings.find((warning) => warning.severity >= WarningSeverity.Medium)

  const [showWarningModal, setShowWarningModal] = useState(false)
  const onShowWarning = (): void => {
    setShowWarningModal(true)
  }
  const onCloseWarning = (): void => {
    setShowWarningModal(false)
  }

  // const [isErc20ContractAddressWarningChecked, setIsErc20ContractAddressWarningChecked] = useState(false)
  // const { isERC20ContractAddress, loading: erc20ContractLoading } = useIsErc20Contract(recipient, chainId)
  // const shouldBlockERC20Send = !isErc20ContractAddressWarningChecked && isERC20ContractAddress && !erc20ContractLoading

  // const actionButtonDisabled = !!blockingWarning || account.type === AccountType.Readonly || shouldBlockERC20Send
  const actionButtonDisabled = account.type === AccountType.Readonly

  const actionButtonProps = {
    disabled: actionButtonDisabled,
    label: t('send.review.summary.button.title'),
    name: ElementName.Send,
    onPress: onSubmitButtonPress,
  }

  const formattedCurrencyAmount = formatCurrencyAmount({
    value: currencyAmounts[CurrencyField.INPUT],
    type: NumberType.TokenTx,
  })

  const formattedAmountIn = isFiatInput
    ? formatNumberOrString({
        value: exactAmountFiat,
        type: NumberType.FiatTokenQuantity,
        currencyCode: currency.code,
      })
    : formattedCurrencyAmount

  const formattedInputFiatValue = convertFiatAmountFormatted(
    inputCurrencyUSDValue?.toExact(),
    NumberType.FiatTokenQuantity,
  )

  const { navigateToFiatOnRamp } = useWalletNavigation()

  const onPrev = (): void => {
    if (fiatOffRampMetaData) {
      onCloseModal?.()
      navigateToFiatOnRamp({
        prefilledCurrency: {
          currencyInfo: currencyInInfo,
          moonpayCurrencyCode: fiatOffRampMetaData.moonpayCurrencyCode,
          meldCurrencyCode: fiatOffRampMetaData.meldCurrencyCode,
        },
        isOfframp: true,
      })
    }
    setScreen(TransactionScreen.Form)
  }

  if (!recipient) {
    throw new Error('Invalid render of SendDetails with no recipient')
  }

  return (
    <Trace logImpression section={SectionName.SendReview}>
      {/* {transferWarning?.title && (
        <WarningModal
          caption={transferWarning.message}
          rejectText={blockingWarning ? undefined : t('send.warning.modal.button.cta.cancel')}
          acknowledgeText={
            blockingWarning ? t('send.warning.modal.button.cta.blocking') : t('send.warning.modal.button.cta.confirm')
          }
          isOpen={showWarningModal}
          modalName={ModalName.SendWarning}
          severity={transferWarning.severity}
          title={transferWarning.title}
          onReject={onCloseWarning}
          onClose={onCloseWarning}
          onAcknowledge={onCloseWarning}
        />
      )} */}
      <Flex gap="$spacing16" px="$spacing8">
        <Flex centered row justifyContent="space-between">
          <Text color="$neutral2" variant="body2">
            {t('send.review.modal.title')}
          </Text>

          {isWeb && (
            <TouchableArea onPress={onPrev}>
              <X color="$neutral2" size="$icon.20" />
            </TouchableArea>
          )}
        </Flex>
        {currencyInInfo ? (
          <Flex row alignItems="center">
            <Flex fill>
              <Flex centered row justifyContent="space-between">
                <Text color="$neutral1" variant="heading3">
                  {formattedAmountIn} {!isFiatInput ? currencyInInfo.symbol : ''}
                </Text>
              </Flex>
              {isFiatInput ? (
                <Text color="$neutral2" variant="body3">
                  {formattedCurrencyAmount} {currencyInInfo.symbol}
                </Text>
              ) : (
                inputCurrencyUSDValue && (
                  <Text color="$neutral2" variant="body3">
                    {formattedInputFiatValue}
                  </Text>
                )
              )}
            </Flex>
            <CurrencyLogo currencyInfo={currencyInInfo} size={iconSizes.icon40} />
          </Flex>
        ) : null}
        <Flex alignItems="flex-start">
          <Arrow color={colors.neutral3.val} direction="s" />
        </Flex>
        {recipient && (
          <Flex centered row justifyContent="space-between">
            {fiatOffRampMetaData ? (
              <Flex>
                <Text color="$neutral1" variant="heading3">
                  {fiatOffRampMetaData.name}
                </Text>
                <Text color="$neutral2" variant="body4">
                  {shortenAddress(recipient)}
                </Text>
              </Flex>
            ) : (
              <AddressDisplay
                address={recipient}
                captionVariant="body3"
                showAccountIcon={false}
                textAlign="flex-start"
                variant="heading3"
              />
            )}
            <AccountIcon
              address={recipient}
              avatarUri={fiatOffRampMetaData?.logoUrl || avatar}
              size={iconSizes.icon40}
            />
          </Flex>
        )}
      </Flex>
      <Separator backgroundColor="$surface3" mx="$spacing8" my="$spacing16" />
      {/* <TransactionDetails
        AccountDetails={
          <Flex row alignItems="center" justifyContent="space-between">
            <Text color="$neutral2" variant="body3">
              {t('common.wallet.label')}
            </Text>
            <AddressDisplay
              disableForcedWidth
              address={account.address}
              hideAddressInSubtitle={true}
              horizontalGap="$spacing4"
              size={iconSizes.icon16}
              variant="body3"
            />
          </Flex>
        }
        chainId={chainId as UniverseChainId}
        gasFee={gasFee}
        showWarning={Boolean(transferWarning)}
        warning={transferWarning}
        onShowWarning={onShowWarning}
      /> */}

      {/* {isERC20ContractAddress && (
        <Flex pt="$spacing8">
          <InlineWarningCard
            hideCtaIcon
            severity={WarningSeverity.High}
            heading={t('send.warning.erc20.checkbox.heading')}
            description={t('send.warning.erc20.checkbox.description')}
            checkboxLabel={t('common.button.understand')}
            checked={isErc20ContractAddressWarningChecked}
            setChecked={setIsErc20ContractAddressWarningChecked}
            Icon={AlertTriangleFilled}
          />
        </Flex>
      )} */}

      <TransactionModalFooterContainer>
        <Flex row gap="$spacing8">
          {!isWeb && <DeprecatedButton icon={<BackArrow />} size="large" theme="tertiary" onPress={onPrev} />}
          <DeprecatedButton
            fill
            isDisabled={actionButtonProps.disabled}
            icon={ButtonAuthIcon}
            size="medium"
            testID={actionButtonProps.name}
            onPress={actionButtonProps.onPress}
          >
            {actionButtonProps.label}
          </DeprecatedButton>
        </Flex>
      </TransactionModalFooterContainer>
    </Trace>
  )
}
