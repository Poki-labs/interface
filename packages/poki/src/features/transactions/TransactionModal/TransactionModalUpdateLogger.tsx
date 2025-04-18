import { FeatureFlags } from 'poki/src/features/gating/flags'
import { useFeatureFlag } from 'poki/src/features/gating/hooks'
import { ModalName, ModalNameType } from 'poki/src/features/telemetry/constants'
import { useTransactionModalContext } from 'poki/src/features/transactions/TransactionModal/TransactionModalContext'
import { useEffect } from 'react'
import { logContextUpdate } from 'utilities/src/logger/contextEnhancer'

export function TransactionModalUpdateLogger({ modalName }: { modalName: ModalNameType }): null {
  const { screen } = useTransactionModalContext()
  const datadogEnabled = useFeatureFlag(FeatureFlags.Datadog)

  useEffect(() => {
    if (modalName === ModalName.Swap) {
      logContextUpdate('TransactionModal', { screen, modalName }, datadogEnabled)
    }
  }, [modalName, screen, datadogEnabled])

  return null
}
