import { getCountryFlagSvgUrl } from 'poki/src/features/fiatOnRamp/utils'
import Trace from 'poki/src/features/telemetry/Trace'
import { ElementName } from 'poki/src/features/telemetry/constants'
import { Flex, TouchableArea, UniversalImage } from 'ui/src'
import { RotatableChevron } from 'ui/src/components/icons/RotatableChevron'
import { iconSizes } from 'ui/src/theme'
import { isWeb } from 'utilities/src/platform'

const ICON_SIZE = iconSizes.icon16

export function FiatOnRampCountryPicker({
  onPress,
  countryCode = 'US',
}: {
  onPress: () => void
  countryCode: Maybe<string>
}): JSX.Element | null {
  if (!countryCode) {
    return null
  }

  const countryFlagUrl = getCountryFlagSvgUrl(countryCode)

  return (
    <Trace logPress element={ElementName.FiatOnRampCountryPicker}>
      <TouchableArea
        backgroundColor="$surface3"
        borderRadius="$roundedFull"
        hoverStyle={{
          opacity: 0.5,
        }}
        overflow="hidden"
        pl="$spacing8"
        pr="$spacing4"
        py="$spacing2"
        onPress={onPress}
      >
        <Flex row shrink alignItems="center" data-testid="FiatOnRampCountryPicker" flex={0} gap="$spacing2">
          <Flex borderRadius="$roundedFull" overflow="hidden">
            {isWeb ? (
              <img alt={countryCode} height={ICON_SIZE} src={countryFlagUrl} width={ICON_SIZE} />
            ) : (
              <UniversalImage
                size={{
                  height: ICON_SIZE,
                  width: ICON_SIZE,
                }}
                uri={countryFlagUrl}
              />
            )}
          </Flex>
          <RotatableChevron color="$neutral2" direction="down" width={iconSizes.icon20} />
        </Flex>
      </TouchableArea>
    </Trace>
  )
}
