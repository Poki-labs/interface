import { toSupportedChainId } from 'poki/src/features/chains/utils'
import { ExplorerDataType, getExplorerLink } from 'poki/src/utils/linking'
import { Component, ErrorInfo, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { DappRequestContent } from 'src/app/features/dappRequests/DappRequestContent'
import { XSwapRequestContent } from 'src/app/features/dappRequests/requestContent/EthSend/Swap/SwapRequestContent'
import { DomainContent } from 'src/app/features/dappRequests/requestContent/SignTypeData/DomainContent'
import { MaybeExplorerLinkedAddress } from 'src/app/features/dappRequests/requestContent/SignTypeData/MaybeExplorerLinkedAddress'
import { NonStandardTypedDataRequestContent } from 'src/app/features/dappRequests/requestContent/SignTypeData/NonStandardTypedDataRequestContent'
import { Permit2RequestContent } from 'src/app/features/dappRequests/requestContent/SignTypeData/Permit2/Permit2RequestContent'
import { SignTypedDataRequest } from 'src/app/features/dappRequests/types/DappRequestTypes'
import { EIP712Message, isEIP712TypedData } from 'src/app/features/dappRequests/types/EIP712Types'
import { isPermit2, isPokiXSwapRequest } from 'src/app/features/dappRequests/types/Permit2Types'
import { Flex, Text } from 'ui/src'
import { isAddress } from 'utilities/src/addresses'
import { logger } from 'utilities/src/logger/logger'

interface SignTypedDataRequestProps {
  dappRequest: SignTypedDataRequest
}

interface ErrorFallbackProps {
  dappRequest: SignTypedDataRequest
}

function ErrorFallback({ dappRequest }: ErrorFallbackProps): JSX.Element {
  return <NonStandardTypedDataRequestContent dappRequest={dappRequest} />
}

class SignTypedDataErrorBoundary extends Component<
  { children: ReactNode; dappRequest: SignTypedDataRequest },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; dappRequest: SignTypedDataRequest }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { dappRequest } = this.props
    logger.error(error, {
      tags: { file: 'SignTypedDataRequestContent', function: 'ErrorBoundary' },
      extra: {
        errorInfo: JSON.stringify(errorInfo),
        typedData: dappRequest.typedData,
        address: dappRequest.address,
      },
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback dappRequest={this.props.dappRequest} />
    }

    return this.props.children
  }
}

export function SignTypedDataRequestContent({ dappRequest }: SignTypedDataRequestProps): JSX.Element | null {
  return (
    <SignTypedDataErrorBoundary dappRequest={dappRequest}>
      <SignTypedDataRequestContentInner dappRequest={dappRequest} />
    </SignTypedDataErrorBoundary>
  )
}

function SignTypedDataRequestContentInner({ dappRequest }: SignTypedDataRequestProps): JSX.Element | null {
  const { t } = useTranslation()

  const parsedTypedData = JSON.parse(dappRequest.typedData)

  if (!isEIP712TypedData(parsedTypedData)) {
    return <NonStandardTypedDataRequestContent dappRequest={dappRequest} />
  }

  const { name, version, chainId: domainChainId, verifyingContract, salt } = parsedTypedData?.domain || {}
  const chainId = toSupportedChainId(domainChainId)

  if (isPokiXSwapRequest(parsedTypedData)) {
    return <XSwapRequestContent typedData={parsedTypedData} />
  }

  if (isPermit2(parsedTypedData)) {
    return <Permit2RequestContent dappRequest={dappRequest} />
  }

  // todo(EXT-883): remove this when we start rejecting unsupported chain signTypedData requests
  const renderMessageContent = (
    message: EIP712Message | EIP712Message[keyof EIP712Message],
    i = 1,
  ): Maybe<JSX.Element | JSX.Element[]> => {
    if (message === null || message === undefined) {
      return (
        <Text color="$neutral1" variant="body4">
          {String(message)}
        </Text>
      )
    }
    if (typeof message === 'string' && isAddress(message) && chainId) {
      const href = getExplorerLink(chainId, message, ExplorerDataType.ADDRESS)
      return <MaybeExplorerLinkedAddress address={message} link={href} />
    }
    if (typeof message === 'string' || typeof message === 'number' || typeof message === 'boolean') {
      return (
        <Text $platform-web={{ overflowWrap: 'anywhere' }} color="$neutral1" variant="body4">
          {message.toString()}
        </Text>
      )
    } else if (Array.isArray(message)) {
      return (
        <Text $platform-web={{ overflowWrap: 'anywhere' }} color="$neutral1" variant="body4">
          {JSON.stringify(message)}
        </Text>
      )
    } else if (typeof message === 'object') {
      return Object.entries(message).map(([key, value], index) => (
        <Flex key={`${key}-${index}`} flexDirection="row" gap="$spacing8">
          <Text color="$neutral2" flexShrink={0} fontWeight="bold" variant="body4">
            {key}
          </Text>
          <Flex flexBasis="0%" flexDirection="column" flexGrow={1} flexWrap="wrap" gap="$spacing4">
            {renderMessageContent(value, i + 1)}
          </Flex>
        </Flex>
      ))
    }

    return undefined
  }

  return (
    <DappRequestContent
      showNetworkCost
      confirmText={t('common.button.sign')}
      title={t('dapp.request.signature.header')}
    >
      <Flex
        $platform-web={{ overflowY: 'auto' }}
        backgroundColor="$surface2"
        borderColor="$surface3"
        borderRadius="$rounded16"
        borderWidth="$spacing1"
        flexDirection="column"
        gap="$spacing4"
        maxHeight={200}
        p="$spacing16"
      >
        <DomainContent
          chainId={domainChainId}
          name={name}
          salt={salt}
          verifyingContract={verifyingContract}
          version={version}
        />
        {renderMessageContent(parsedTypedData.message)}
      </Flex>
    </DappRequestContent>
  )
}
