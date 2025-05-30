import { WarningModal } from 'poki/src/components/modals/WarningModal/WarningModal'
import { WarningSeverity } from 'poki/src/components/modals/WarningModal/types'
import { Pill } from 'poki/src/components/pill/Pill'
import { ModalName } from 'poki/src/features/telemetry/constants'
import { UNITAG_SUFFIX, UNITAG_SUFFIX_NO_LEADING_DOT } from 'poki/src/features/unitags/constants'
import { ADDRESS_ZERO } from 'poki/src/v3-sdk'
import { useTranslation } from 'react-i18next'
import { Flex, Text, useSporeColors } from 'ui/src'
import { LinkHorizontalAlt } from 'ui/src/components/icons'
import { iconSizes } from 'ui/src/theme'
import { shortenAddress } from 'utilities/src/addresses'
import { getYourNameString } from 'wallet/src/features/unitags/utils'

const FIXED_INFO_PILL_WIDTH = 128

export const UnitagInfoModal = ({
  isOpen,
  unitagAddress,
  onClose,
}: {
  isOpen: boolean
  unitagAddress: string | undefined
  onClose: () => void
}): JSX.Element => {
  const colors = useSporeColors()
  const { t } = useTranslation()
  const usernamePlaceholder = getYourNameString(t('unitags.claim.username.default'))

  return (
    <WarningModal
      backgroundIconColor={colors.surface1.get()}
      caption={t('unitags.onboarding.info.description', {
        unitagDomain: UNITAG_SUFFIX_NO_LEADING_DOT,
      })}
      rejectText={t('common.button.close')}
      severity={WarningSeverity.None}
      icon={
        <Flex centered row gap="$spacing4">
          <Pill
            customBackgroundColor={colors.surface1.val}
            foregroundColor={colors.neutral2.val}
            label={shortenAddress(unitagAddress ?? ADDRESS_ZERO)}
            px="$spacing12"
            shadowColor="$neutral3"
            shadowOpacity={0.4}
            shadowRadius="$spacing4"
            textVariant="buttonLabel3"
            width={FIXED_INFO_PILL_WIDTH}
          />
          <Flex p="$spacing2" shadowColor="$accent1" shadowOpacity={1} shadowRadius="$spacing16">
            <LinkHorizontalAlt color={colors.neutral3.get()} size={iconSizes.icon24} />
          </Flex>
          <Pill
            customBackgroundColor={colors.surface1.val}
            foregroundColor={colors.accent1.val}
            px="$spacing12"
            shadowColor="$neutral3"
            shadowOpacity={0.4}
            shadowRadius="$spacing4"
          >
            <Text color="$accent1" variant="buttonLabel3">
              {usernamePlaceholder}
              <Text color="$neutral2" variant="buttonLabel3">
                {UNITAG_SUFFIX}
              </Text>
            </Text>
          </Pill>
        </Flex>
      }
      isOpen={isOpen}
      modalName={ModalName.TooltipContent}
      title={t('unitags.onboarding.info.title')}
      onClose={onClose}
    />
  )
}
