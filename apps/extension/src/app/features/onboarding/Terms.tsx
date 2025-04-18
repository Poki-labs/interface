import { pokiWalletUrls } from 'poki/src/constants/urls'
import { PropsWithChildren } from 'react'
import { Trans } from 'react-i18next'
import { Link, LinkProps } from 'react-router-dom'
import { Text } from 'ui/src'

export function Terms(): JSX.Element {
  return (
    <Text color="$neutral3" textAlign="center" variant="body4">
      <Trans
        components={{
          highlightTerms: <LinkWrapper to={pokiWalletUrls.termsOfServiceUrl} />,
          highlightPrivacy: <LinkWrapper to={pokiWalletUrls.privacyPolicyUrl} />,
        }}
        i18nKey="onboarding.termsOfService"
      />
    </Text>
  )
}

function LinkWrapper(props: PropsWithChildren<LinkProps>): JSX.Element {
  const { children, ...rest } = props
  return (
    <Link {...rest} style={{ textDecoration: 'none' }} target="_blank">
      <Text color="$neutral2" variant="body4">
        {children}
      </Text>
    </Link>
  )
}
