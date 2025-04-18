import { PropsWithChildren, ReactNode } from 'react'
import { ONBOARDING_CONTENT_WIDTH } from 'src/app/features/onboarding/utils'
// import { LandingBackground } from 'wallet/src/components/landing/LandingBackground'
import { Flex, Image } from 'ui/src'
import { EXTENSION_LOADING_BACKGROUND } from 'ui/src/assets'

// Fixed padding value to align content with a certain point on the background
const CONTAINER_PADDING_TOP = 340
const LANDING_BACKGROUND_SIZE = 400
const LANDING_BACKGROUND_SIZE_WIDTH = 458

export function MainIntroWrapper({
  children,
  belowFrameContent,
}: PropsWithChildren<{ belowFrameContent?: ReactNode }>): JSX.Element {
  return (
    <Flex width={ONBOARDING_CONTENT_WIDTH}>
      <Flex
        backgroundColor="$surface1"
        borderColor="$surface3"
        borderRadius="$rounded32"
        borderWidth="$spacing1"
        overflow="hidden"
        shadowColor="$shadowColor"
        shadowOpacity={0.1}
        shadowRadius={16}
      >
        <Flex alignItems="center" position="absolute" width="100%">
          <Flex height={LANDING_BACKGROUND_SIZE} width={LANDING_BACKGROUND_SIZE_WIDTH}>
            <Image height={400} resizeMode="contain" source={EXTENSION_LOADING_BACKGROUND} width={458} />
          </Flex>
        </Flex>
        <Flex fill pb="$spacing24" pt={CONTAINER_PADDING_TOP} px="$spacing24">
          {children}
        </Flex>
      </Flex>
      {belowFrameContent && (
        <Flex fill pt="$spacing32">
          {belowFrameContent}
        </Flex>
      )}
    </Flex>
  )
}
