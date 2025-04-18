import { useAccountMeta } from 'poki/src/contexts/PokiContext'
import { AccountType } from 'poki/src/features/accounts/types'
import { useEnabledChains } from 'poki/src/features/chains/hooks/useEnabledChains'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
// eslint-disable-next-line no-restricted-imports
import { usePortfolioValueModifiers } from 'poki/src/features/dataApi/balances'
import { MobileAppsFlyerEvents, PokiEventName } from 'poki/src/features/telemetry/constants'
import { sendAnalyticsEvent, sendAppsFlyerEvent } from 'poki/src/features/telemetry/send'
import { logger } from 'utilities/src/logger/logger'
import { areSameDays } from 'utilities/src/time/date'
import { ONE_SECOND_MS } from 'utilities/src/time/time'
import { useInterval } from 'utilities/src/time/timing'
import { useAccountBalances } from 'wallet/src/features/accounts/useAccountListData'
import {
  selectAllowAnalytics,
  selectLastBalancesReport,
  selectLastBalancesReportValue,
  selectLastHeartbeat,
  selectWalletIsFunded,
} from 'wallet/src/features/telemetry/selectors'
import {
  recordBalancesReport,
  recordHeartbeat,
  recordWalletFunded,
  shouldReportBalances,
} from 'wallet/src/features/telemetry/slice'
import { Account } from 'wallet/src/features/wallet/accounts/types'
import { useAccounts } from 'wallet/src/features/wallet/hooks'

export function useLastBalancesReporter(): void {
  const dispatch = useDispatch()

  const account = useAccountMeta()
  const accounts = useAccounts()
  const lastBalancesReport = useSelector(selectLastBalancesReport)
  const lastBalancesReportValue = useSelector(selectLastBalancesReportValue)
  const walletIsFunded = useSelector(selectWalletIsFunded)

  const signerAccountAddresses = useMemo(() => {
    return Object.values(accounts)
      .filter((a: Account) => a.type === AccountType.SignerMnemonic)
      .map((a) => a.address)
  }, [accounts])

  const { balances: signerAccountBalances, totalBalance: signerAccountsTotalBalance } = useAccountBalances({
    addresses: signerAccountAddresses,
    fetchPolicy: 'cache-first',
  })

  const { gqlChains } = useEnabledChains()
  const valueModifiers = usePortfolioValueModifiers(account?.address)

  const totalBalancesUsdPerChain = undefined

  useEffect(() => {
    if (!walletIsFunded && signerAccountsTotalBalance) {
      // Only trigger the first time a funded wallet is detected
      dispatch(recordWalletFunded())
      sendAppsFlyerEvent(MobileAppsFlyerEvents.WalletFunded, { sumOfFunds: signerAccountsTotalBalance }).catch(
        (error) => logger.debug('hooks', 'useLastBalancesReporter', error),
      )
    }
  }, [dispatch, signerAccountsTotalBalance, walletIsFunded])

  const reporter = (): void => {
    if (
      shouldReportBalances(
        lastBalancesReport,
        lastBalancesReportValue,
        signerAccountAddresses,
        signerAccountBalances,
        signerAccountsTotalBalance,
      )
    ) {
      sendAnalyticsEvent(PokiEventName.BalancesReport, {
        total_balances_usd: signerAccountsTotalBalance,
        wallets: signerAccountAddresses,
        balances: signerAccountBalances,
      })

      // Send a report per chain
      if (totalBalancesUsdPerChain && account?.address) {
        sendAnalyticsEvent(PokiEventName.BalancesReportPerChain, {
          total_balances_usd_per_chain: totalBalancesUsdPerChain,
          wallet: account.address,
        })
      }
      // record that a report has been sent
      dispatch(recordBalancesReport({ totalBalance: signerAccountsTotalBalance }))
    }
  }

  useInterval(reporter, ONE_SECOND_MS * 15, true)
}

// Returns a function that checks if the app needs to send a heartbeat action to record anonymous DAU
// Only logs when the user has allowing product analytics off and a heartbeat has not been sent for the user's local day
export function useHeartbeatReporter(): void {
  const dispatch = useDispatch()
  const allowAnalytics = useSelector(selectAllowAnalytics)
  const lastHeartbeat = useSelector(selectLastHeartbeat)

  const nowDate = new Date(Date.now())
  const lastHeartbeatDate = new Date(lastHeartbeat)

  const heartbeatDue = !areSameDays(nowDate, lastHeartbeatDate)

  const reporter = (): void => {
    if (!allowAnalytics && heartbeatDue) {
      dispatch(recordHeartbeat())
    }
  }

  useInterval(reporter, ONE_SECOND_MS * 15, true)
}
