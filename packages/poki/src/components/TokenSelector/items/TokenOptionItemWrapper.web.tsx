import { TokenItemWrapperProps } from 'poki/src/components/TokenSelector/types'
import { ContextMenu } from 'poki/src/components/menus/ContextMenuV2'
import { POKI_WEB_URL } from 'poki/src/constants/urls'
import { useEnabledChains } from 'poki/src/features/chains/hooks/useEnabledChains'
import { setClipboard } from 'poki/src/utils/clipboard'
import { openURL } from 'poki/src/utils/link'
import { getTokenDetailsURL } from 'poki/src/utils/linking'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { CheckCircleFilled } from 'ui/src/components/icons/CheckCircleFilled'
import { CopyAlt } from 'ui/src/components/icons/CopyAlt'
import { InfoCircleFilled } from 'ui/src/components/icons/InfoCircleFilled'
import { isExtension } from 'utilities/src/platform'

function _TokenOptionItemWrapper({ children, tokenInfo }: TokenItemWrapperProps): JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isTestnetModeEnabled } = useEnabledChains()

  const [copied, setCopied] = useState(false)

  const onNavigateToTokenDetails = useCallback(async () => {
    if (isTestnetModeEnabled) {
      return
    }

    const url = getTokenDetailsURL(tokenInfo)

    if (isExtension) {
      await openURL(`${POKI_WEB_URL}${url}`)
    } else {
      navigate(url)
    }
  }, [navigate, tokenInfo, isTestnetModeEnabled])

  const onCopyAddress = useCallback(async (): Promise<void> => {
    await setClipboard(tokenInfo.address)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 400)
  }, [tokenInfo.address])

  const dropdownOptions = useMemo(
    () => [
      {
        key: 'token-selector-copy-address',
        onPress: onCopyAddress,
        disabled: tokenInfo.isNative,
        label: copied ? t('notification.copied.address') : t('common.copy.address'),
        Icon: copied ? CheckCircleFilled : CopyAlt,
        closeDelay: 400,
        iconProps: {
          color: copied ? '$statusSuccess' : '$neutral2',
        },
      },
      {
        key: 'token-selector-token-info',
        onPress: onNavigateToTokenDetails,
        label: t('token.details'),
        Icon: InfoCircleFilled,
      },
    ],
    [onNavigateToTokenDetails, t, onCopyAddress, copied, tokenInfo.isNative],
  )

  return (
    <ContextMenu menuStyleProps={{ minWidth: 200 }} menuItems={dropdownOptions}>
      {children}
    </ContextMenu>
  )
}

export const TokenOptionItemWrapper = React.memo(_TokenOptionItemWrapper)
