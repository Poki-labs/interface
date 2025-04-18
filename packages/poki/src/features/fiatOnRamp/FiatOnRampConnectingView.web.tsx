import { ServiceProviderLogoStyles } from 'poki/src/features/fiatOnRamp/constants'
import { useAppInsets } from 'poki/src/hooks/useAppInsets'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, Flex, Image, Text } from 'ui/src'
import { POKI_LOGO_LARGE } from 'ui/src/assets'
import { iconSizes } from 'ui/src/theme'

export function FiatOnRampConnectingView({
  isOffRamp,
  amount,
  quoteCurrencyCode,
  serviceProviderName,
  serviceProviderLogo,
}: {
  isOffRamp?: boolean
  amount?: string
  quoteCurrencyCode?: string
  serviceProviderName: string
  serviceProviderLogo?: JSX.Element
}): JSX.Element {
  const insets = useAppInsets()
  const { t } = useTranslation()

  return (
    <Flex justifyContent="center" position="relative">
      <AnimatePresence>
        <Flex centered grow style={{ marginBottom: insets.bottom }}>
          <Flex row gap="$spacing16" pb="$spacing16">
            <Flex alignItems="center" justifyContent="center" style={ServiceProviderLogoStyles.pokiLogoWrapper}>
              <Image height={iconSizes.icon64} source={POKI_LOGO_LARGE} width={iconSizes.icon64} />
            </Flex>
            {serviceProviderLogo}
          </Flex>
          <Flex centered gap="$spacing8">
            <Text variant="subheading1">
              {t('fiatOnRamp.connection.message', { serviceProvider: serviceProviderName })}
            </Text>
            {quoteCurrencyCode && amount && (
              <Text color="$neutral2" variant="body2">
                {isOffRamp
                  ? t('fiatOffRamp.connection.quote', {
                      amount,
                      currencySymbol: quoteCurrencyCode,
                    })
                  : t('fiatOnRamp.connection.quote', {
                      amount,
                      currencySymbol: quoteCurrencyCode,
                    })}
              </Text>
            )}
          </Flex>
        </Flex>
      </AnimatePresence>
    </Flex>
  )
}
