import { TFunction } from 'i18next'
import { WarningInfo } from 'poki/src/components/modals/WarningModal/WarningInfo'
import { ProtocolItems } from 'poki/src/data/tradingApi/__generated__'
import { getChainInfo } from 'poki/src/features/chains/chainInfo'
import { FeatureFlags } from 'poki/src/features/gating/flags'
import { useFeatureFlag } from 'poki/src/features/gating/hooks'
import Trace from 'poki/src/features/telemetry/Trace'
import { ElementName, ElementNameType, ModalName } from 'poki/src/features/telemetry/constants'
import { useTransactionSettingsContext } from 'poki/src/features/transactions/settings/contexts/TransactionSettingsContext'
import { useSwapFormContext } from 'poki/src/features/transactions/swap/contexts/SwapFormContext'
import { PokiXInfo } from 'poki/src/features/transactions/swap/modals/PokiXInfo'
import { SwapSettingConfig } from 'poki/src/features/transactions/swap/settings/configs/types'
import {
  DEFAULT_PROTOCOL_OPTIONS,
  FrontendSupportedProtocol,
} from 'poki/src/features/transactions/swap/utils/protocols'
import { ReactNode, useCallback, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Flex, PokiXText, Switch, Text } from 'ui/src'
import { InfoCircleFilled } from 'ui/src/components/icons/InfoCircleFilled'
import { PokiX } from 'ui/src/components/icons/PokiX'
import { isMobileApp } from 'utilities/src/platform'

function isDefaultOptions(selectedProtocols: FrontendSupportedProtocol[]): boolean {
  return new Set(selectedProtocols).size === new Set([...selectedProtocols, ...DEFAULT_PROTOCOL_OPTIONS]).size
}

export const ProtocolPreference: SwapSettingConfig = {
  renderTitle: (t) => t('swap.settings.routingPreference.title'),
  renderCloseButtonText: (t) => t('common.button.save'),
  Control() {
    const { t } = useTranslation()
    const { selectedProtocols } = useTransactionSettingsContext()
    const { isOnlyV2Allowed } = useTransactionSettingsContext()

    const getTradeProtocolPreferenceTitle = (): string => {
      if (isDefaultOptions(selectedProtocols)) {
        return t('common.default')
      }

      if (isOnlyV2Allowed) {
        return t('swap.settings.routingPreference.option.v2.title')
      }

      return t('common.custom')
    }

    return (
      <Text color="$neutral2" flexWrap="wrap" variant="subheading2">
        {getTradeProtocolPreferenceTitle()}
      </Text>
    )
  },
  Screen() {
    const { t } = useTranslation()
    const { selectedProtocols, updateTransactionSettings, isOnlyV2Allowed } = useTransactionSettingsContext()
    const [isDefault, setIsDefault] = useState(isDefaultOptions(selectedProtocols))
    const pokiXEnabled = useFeatureFlag(FeatureFlags.PokiX)
    const v4Enabled = useFeatureFlag(FeatureFlags.V4Swap)

    const { chainId } = useSwapFormContext().derivedSwapInfo
    const chainName = getChainInfo(chainId).name
    const v2RestrictionDescription = isOnlyV2Allowed
      ? t('swap.settings.protection.subtitle.unavailable', { chainName })
      : null

    // We prevent the user from deselecting all options
    const onlyOneProtocolSelected = selectedProtocols.length === 1

    // We prevent the user from deselecting all on-chain protocols (AKA only selecting PokiX)
    const onlyOneClassicProtocolSelected =
      selectedProtocols.filter((p) => {
        if (!v4Enabled && p === ProtocolItems.V4) {
          return false
        }
        return p !== ProtocolItems.POKIX_V2
      }).length === 1

    const toggleProtocol = useCallback(
      (protocol: FrontendSupportedProtocol) => {
        if (selectedProtocols.includes(protocol)) {
          updateTransactionSettings({ selectedProtocols: selectedProtocols.filter((p) => p !== protocol) })
        } else {
          updateTransactionSettings({ selectedProtocols: [...selectedProtocols, protocol] })
        }
      },
      [updateTransactionSettings, selectedProtocols],
    )

    const toggleDefault = useCallback(() => {
      setIsDefault(!isDefault)
      if (!isDefault) {
        updateTransactionSettings({ selectedProtocols: DEFAULT_PROTOCOL_OPTIONS })
      }
    }, [updateTransactionSettings, isDefault])

    return (
      <Flex gap="$spacing16" my="$spacing16">
        <OptionRow
          active={isDefault}
          description={<DefaultOptionDescription isDefault={isDefault} />}
          elementName={ElementName.SwapRoutingPreferenceDefault}
          title={<DefaultOptionTitle />}
          cantDisable={false}
          disabled={isOnlyV2Allowed}
          onSelect={toggleDefault}
        />
        {!isDefault && (
          <>
            {pokiXEnabled && (
              <OptionRow
                active={selectedProtocols.includes(ProtocolItems.POKIX_V2)}
                elementName={ElementName.SwapRoutingPreferencePokiX}
                title={getProtocolTitle(ProtocolItems.POKIX_V2, t)}
                cantDisable={onlyOneProtocolSelected}
                disabled={isOnlyV2Allowed}
                description={v2RestrictionDescription}
                onSelect={() => toggleProtocol(ProtocolItems.POKIX_V2)}
              />
            )}
            {v4Enabled && (
              <OptionRow
                active={selectedProtocols.includes(ProtocolItems.V4)}
                elementName={ElementName.SwapRoutingPreferenceV4}
                title={getProtocolTitle(ProtocolItems.V4, t)}
                cantDisable={onlyOneClassicProtocolSelected}
                disabled={isOnlyV2Allowed}
                description={v2RestrictionDescription}
                onSelect={() => toggleProtocol(ProtocolItems.V4)}
              />
            )}
            <OptionRow
              active={selectedProtocols.includes(ProtocolItems.V3)}
              elementName={ElementName.SwapRoutingPreferenceV3}
              title={getProtocolTitle(ProtocolItems.V3, t)}
              cantDisable={onlyOneClassicProtocolSelected}
              disabled={isOnlyV2Allowed}
              description={v2RestrictionDescription}
              onSelect={() => toggleProtocol(ProtocolItems.V3)}
            />
            <OptionRow
              active={selectedProtocols.includes(ProtocolItems.V2)}
              elementName={ElementName.SwapRoutingPreferenceV3}
              title={getProtocolTitle(ProtocolItems.V2, t)}
              cantDisable={onlyOneClassicProtocolSelected || isOnlyV2Allowed}
              onSelect={() => toggleProtocol(ProtocolItems.V2)}
            />
          </>
        )}
      </Flex>
    )
  },
}

export function getProtocolTitle(preference: FrontendSupportedProtocol, t: TFunction): JSX.Element | string {
  switch (preference) {
    case ProtocolItems.POKIX_V2:
      return (
        <PokiXInfo
          tooltipTrigger={
            <Text
              alignItems="center"
              color="$neutral2"
              variant="body3"
              flexDirection="row"
              flexShrink={0}
              display="inline-flex"
              gap="$gap4"
            >
              <Trans
                components={{
                  icon: <PokiX size="$icon.16" style={!isMobileApp && { transform: 'translateY(3px)' }} />,
                  gradient: <PokiXText height={18} variant="body3" />,
                  info: (
                    <InfoCircleFilled
                      color="$neutral3"
                      size="$icon.16"
                      style={!isMobileApp && { transform: 'translateY(3px)' }}
                    />
                  ),
                }}
                i18nKey="pokix.item"
              />
            </Text>
          }
        />
      )
    case ProtocolItems.V2:
      return t('swap.settings.routingPreference.option.v2.title')
    case ProtocolItems.V3:
      return t('swap.settings.routingPreference.option.v3.title')
    case ProtocolItems.V4:
      return t('swap.settings.routingPreference.option.v4.title')
    default:
      return <></>
  }
}

function OptionRow({
  title,
  description,
  active,
  elementName,
  cantDisable,
  onSelect,
  disabled,
}: {
  title: JSX.Element | string
  active: boolean
  elementName: ElementNameType
  cantDisable: boolean
  onSelect: () => void
  description?: ReactNode
  disabled?: boolean
}): JSX.Element {
  return (
    <Flex row gap="$spacing16" justifyContent="space-between">
      <Flex shrink gap="$spacing4">
        <Text color="$neutral1" variant="subheading2">
          {title}
        </Text>
        {typeof description === 'string' ? (
          <Text color="$neutral2" variant="body3">
            {description}
          </Text>
        ) : (
          description
        )}
      </Flex>
      {/* Only log this event if toggle value is off, and then turned on */}
      <Trace element={elementName} logPress={!active}>
        <Switch
          disabled={(active && cantDisable) || disabled}
          checked={active}
          variant="branded"
          onCheckedChange={onSelect}
        />
      </Trace>
    </Flex>
  )
}

function DefaultOptionDescription({ isDefault }: { isDefault: boolean }): JSX.Element {
  const v4Enabled = useFeatureFlag(FeatureFlags.V4Swap)
  const pokiXEnabled = useFeatureFlag(FeatureFlags.PokiX)
  const { t } = useTranslation()

  const showIncludesPokiX = pokiXEnabled && isDefault

  const cheapestRouteText = t('swap.settings.routingPreference.option.default.description.preV4')
  const cheapestRouteTextV4 = t('swap.settings.routingPreference.option.default.description')

  return (
    <Flex gap="$spacing4">
      <Text color="$neutral2" variant="body3" textWrap="pretty">
        {v4Enabled ? cheapestRouteTextV4 : cheapestRouteText}
      </Text>
      {showIncludesPokiX && (
        <PokiXInfo
          tooltipTrigger={
            <Text
              alignItems="center"
              color="$neutral2"
              variant="body3"
              flexDirection="row"
              gap="$gap4"
              display="inline-flex"
            >
              <Trans
                components={{
                  icon: <PokiX size="$icon.16" style={!isMobileApp && { transform: 'translateY(3px)' }} />,
                  gradient: <PokiXText height={18} variant="body3" />,
                }}
                i18nKey="pokix.included"
              />
            </Text>
          }
        />
      )}
    </Flex>
  )
}

function DefaultOptionTitle(): JSX.Element {
  const v4Enabled = useFeatureFlag(FeatureFlags.V4Swap)
  const { t } = useTranslation()

  if (!v4Enabled) {
    return (
      <Text color="$neutral1" variant="subheading2">
        {t('common.default')}
      </Text>
    )
  }

  return (
    <Flex row gap="$spacing4" alignItems="center">
      <Text color="$neutral1" variant="subheading2">
        {t('common.default')}
      </Text>
      <WarningInfo
        modalProps={{
          caption: t('swap.settings.routingPreference.option.default.tooltip'),
          rejectText: t('common.button.close'),
          modalName: ModalName.SwapSettingsDefaultRoutingInfo,
        }}
        tooltipProps={{
          text: t('swap.settings.routingPreference.option.default.tooltip'),
          placement: 'bottom',
        }}
      />
    </Flex>
  )
}
