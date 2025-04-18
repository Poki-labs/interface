import { useGlobalContext } from 'poki/src/components/GlobalProvider'
import { IcExplorerTokenDetail } from 'poki/src/types/ic-explorer'
import { PropsWithChildren, memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInterfaceBuyNavigator } from 'src/app/features/for/utils'
import { AppRoutes } from 'src/app/navigation/constants'
import { navigate } from 'src/app/navigation/state'
import { Flex, Loader } from 'ui/src'
// import { BaseCard } from 'poki/src/components/BaseCard/BaseCard'
import { PortfolioBalance } from 'poki/src/features/dataApi/types'
import { ElementName } from 'poki/src/features/telemetry/constants'
import { ContextMenu } from 'wallet/src/components/menu/ContextMenu'
// import { isNonPollingRequestInFlight } from 'wallet/src/data/utils'
import { DEFAULT_TAG_TOKENS } from 'poki/src/constants/tokens'
import { useAllTagTokens } from 'poki/src/features/tokens/slice/hooks'
import { PortfolioEmptyState } from 'wallet/src/features/portfolio/PortfolioEmptyState'
import { TokenBalanceItemV2 } from 'wallet/src/features/portfolio/TokenBalanceItem'
import {
  HIDDEN_TOKEN_BALANCES_ROW,
  TokenBalanceListContextProvider,
  useTokenBalanceListContext,
} from 'wallet/src/features/portfolio/TokenBalanceListContext'
import { useTokenContextMenu } from 'wallet/src/features/portfolio/useTokenContextMenu'

const MIN_CONTEXT_MENU_WIDTH = 200

type TokenBalanceListProps = {
  owner: Address
}

export const TokenBalanceList = memo(function _TokenBalanceList({ owner }: TokenBalanceListProps): JSX.Element {
  return (
    <Flex grow>
      <TokenBalanceListContextProvider isExternalProfile={false} owner={owner} onPressToken={() => {}}>
        <TokenBalanceListInner />
      </TokenBalanceListContextProvider>
    </Flex>
  )
})

export function TokenBalanceListInner(): JSX.Element {
  const { t } = useTranslation()

  const { loadingTokens, tokens } = useGlobalContext()

  const allTagTokens = useAllTagTokens()

  const { rows, balancesById, refetch, hiddenTokensExpanded } = useTokenBalanceListContext()
  const onPressBuy = useInterfaceBuyNavigator(ElementName.EmptyStateBuy)

  const visible: string[] = []
  const hidden: string[] = []

  let isHidden = false
  for (const row of rows) {
    const target = isHidden ? hidden : visible
    target.push(row)
    // do this after pushing so we keep our Hidden header row in the visible section
    // so users can see it when closed and re-open it
    if (row === HIDDEN_TOKEN_BALANCES_ROW) {
      isHidden = true
    }
  }

  const onPressReceive = (): void => {
    navigate(AppRoutes.Receive)
  }

  const filteredTokens = useMemo(() => {
    return tokens.filter(
      (token) => DEFAULT_TAG_TOKENS.includes(token.ledgerId) || allTagTokens.includes(token.ledgerId),
    )
  }, [DEFAULT_TAG_TOKENS, allTagTokens, tokens])

  return (
    <Flex>
      {/* {!balancesById ? (
        isNonPollingRequestInFlight(networkStatus) ? (
          <Flex>
            <Loader.Token withPrice repeat={6} />
          </Flex>
        ) : (
          <Flex fill grow justifyContent="center" pt="$spacing48" px="$spacing36">
            <BaseCard.ErrorState
              retryButtonLabel={t('common.button.retry')}
              title={t('home.tokens.error.load')}
              onRetry={(): void | undefined => refetch?.()}
            />
          </Flex>
        )
      ) */}
      {loadingTokens ? (
        <Flex>
          <Loader.Token withPrice repeat={6} />
        </Flex>
      ) : tokens.length === 0 ? (
        <PortfolioEmptyState disableCexTransfers onPressBuy={onPressBuy} onPressReceive={onPressReceive} />
      ) : (
        <>
          <TokenBalanceItems rows={filteredTokens} />
          {/* <AnimatePresence initial={false}>
            {hiddenTokensExpanded && <TokenBalanceItems animated rows={hidden} />}
          </AnimatePresence> */}
        </>
      )}
    </Flex>
  )
}

const TokenBalanceItems = ({ animated, rows }: { animated?: boolean; rows: IcExplorerTokenDetail[] }): JSX.Element => {
  return (
    <Flex
      {...(animated && {
        animation: 'quick',
        enterStyle: { opacity: 0, y: -10 },
        exitStyle: { opacity: 0, y: -10 },
      })}
    >
      {rows?.map((token: IcExplorerTokenDetail) => {
        return <TokenBalanceItemRow key={token.ledgerId} token={token} />
      })}
    </Flex>
  )
}

const TokenBalanceItemRow = memo(function TokenBalanceItemRow({ token }: { token: IcExplorerTokenDetail }) {
  const { isWarmLoading, onPressToken, setHiddenTokensExpanded } = useTokenBalanceListContext()

  const { t } = useTranslation()
  const [isModalVisible, setModalVisible] = useState(false)

  const handlePressToken = (): void => {
    setModalVisible(true)
  }

  const closeModal = (): void => {
    setModalVisible(false)
  }

  // if (item === HIDDEN_TOKEN_BALANCES_ROW) {
  //   return (
  //     <>
  //       <HiddenTokensRow
  //         isExpanded={hiddenTokensExpanded}
  //         numHidden={hiddenTokensCount}
  //         onPress={(): void => {
  //           setHiddenTokensExpanded(!hiddenTokensExpanded)
  //         }}
  //       />
  //       {hiddenTokensExpanded && (
  //         <Flex>
  //           <InformationBanner infoText={t('hidden.tokens.info.banner.text')} onPress={handlePressToken} />
  //         </Flex>
  //       )}

  //       <InfoLinkModal
  //         showCloseButton
  //         buttonText={t('common.button.close')}
  //         buttonTheme="tertiary"
  //         description={t('hidden.tokens.info.text.info')}
  //         icon={
  //           <Flex centered backgroundColor="$surface3" borderRadius="$rounded12" p="$spacing12">
  //             <ShieldCheck color="$neutral1" size="$icon.24" />
  //           </Flex>
  //         }
  //         isOpen={isModalVisible}
  //         linkText={t('common.button.learn')}
  //         linkUrl={pokiWalletUrls.helpArticleUrls.hiddenTokenInfo}
  //         name={ModalName.HiddenTokenInfoModal}
  //         title={t('hidden.tokens.info.text.title')}
  //         onAnalyticsEvent={handleAnalytics}
  //         onButtonPress={closeModal}
  //         onDismiss={closeModal}
  //       />
  //     </>
  //   )
  // }

  // const portfolioBalance = balancesById?.[item]

  // if (!portfolioBalance) {
  //   // This can happen when the view is out of focus and the user sells/sends 100% of a token's balance.
  //   // In that case, the token is removed from the `balancesById` object, but the FlatList is still using the cached array of IDs until the view comes back into focus.
  //   // As soon as the view comes back into focus, the FlatList will re-render with the latest data, so users won't really see this Skeleton for more than a few milliseconds when this happens.
  //   return (
  //     <Flex px="$spacing8">
  //       <Loader.Token />
  //     </Flex>
  //   )
  // }

  // return (
  //   <TokenContextMenu portfolioBalance={portfolioBalance}>
  //     <TokenBalanceItem
  //       isLoading={isWarmLoading}
  //       portfolioBalanceId={portfolioBalance.id}
  //       currencyInfo={portfolioBalance.currencyInfo}
  //       onPressToken={onPressToken}
  //     />
  //   </TokenContextMenu>
  // )

  return (
    <TokenContextMenu
      portfolioBalance={{
        id: token.ledgerId,
        cacheId: token.ledgerId,
        quantity: 100,
        balanceUSD: 10,
        relativeChange24: 20,
        isHidden: false,
        currencyInfo: token,
      }}
    >
      <TokenBalanceItemV2 isLoading={isWarmLoading} tokenInfo={token} onPressToken={onPressToken} />
    </TokenContextMenu>
  )
})

function TokenContextMenu({
  children,
  portfolioBalance,
}: PropsWithChildren<{
  portfolioBalance: PortfolioBalance
}>): JSX.Element {
  const contextMenu = useTokenContextMenu({
    currencyId: portfolioBalance.currencyInfo.ledgerId,
    isBlocked: false,
    tokenSymbolForNotification: portfolioBalance?.currencyInfo?.symbol,
    portfolioBalance,
  })

  const menuOptions = contextMenu.menuActions.map((action) => ({
    label: action.title,
    onPress: action.onPress,
    Icon: action.Icon,
    destructive: action.destructive,
    disabled: action.disabled,
  }))

  const itemId = `${portfolioBalance.currencyInfo.ledgerId}-${portfolioBalance.isHidden}`

  return (
    <ContextMenu
      closeOnClick
      itemId={itemId}
      menuOptions={menuOptions}
      menuStyleProps={{ minWidth: MIN_CONTEXT_MENU_WIDTH }}
      onLeftClick
    >
      {children}
    </ContextMenu>
  )
}
