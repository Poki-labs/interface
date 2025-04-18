import { POKI_WEB_URL } from 'poki/src/constants/urls'
import { FeatureFlags } from 'poki/src/features/gating/flags'
import { useFeatureFlag } from 'poki/src/features/gating/hooks'
import Trace from 'poki/src/features/telemetry/Trace'
import { ExtensionOnboardingFlow, ExtensionOnboardingScreens } from 'poki/src/types/screens/extension'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SelectWalletsSkeleton } from 'src/app/components/loading/SelectWalletSkeleton'
import { saveDappConnection } from 'src/app/features/dapp/actions'
import { OnboardingScreen } from 'src/app/features/onboarding/OnboardingScreen'
import { useOnboardingSteps } from 'src/app/features/onboarding/OnboardingSteps'
import { useSubmitOnEnter } from 'src/app/features/onboarding/utils'
import { Flex, ScrollView, SpinningLoader, Square } from 'ui/src'
import { WalletFilled } from 'ui/src/components/icons'
import { iconSizes } from 'ui/src/theme'
import { useAsyncData } from 'utilities/src/react/hooks'
import WalletPreviewCard from 'wallet/src/components/WalletPreviewCard/WalletPreviewCard'
import { useOnboardingContext } from 'wallet/src/features/onboarding/OnboardingContext'
import {
  AddressWithBalanceAndName,
  useImportableAccounts,
} from 'wallet/src/features/onboarding/hooks/useImportableAccounts'
import { useSelectAccounts } from 'wallet/src/features/onboarding/hooks/useSelectAccounts'

export function SelectWallets({ flow }: { flow: ExtensionOnboardingFlow }): JSX.Element {
  const { t } = useTranslation()
  const shouldAutoConnect = useFeatureFlag(FeatureFlags.ExtensionAutoConnect)
  const [buttonClicked, setButtonClicked] = useState(false)

  const { goToNextStep, goToPreviousStep } = useOnboardingSteps()
  const { generateAccountsAndImportAddresses, getGeneratedAddresses } = useOnboardingContext()

  const { data: generatedAddresses } = useAsyncData(getGeneratedAddresses)

  const { importableAccounts: __importableAccounts } = useImportableAccounts(generatedAddresses)

  // Only import one account
  const importableAccounts = useMemo(() => {
    if (!__importableAccounts) return undefined
    return [__importableAccounts[0]] as AddressWithBalanceAndName[]
  }, [__importableAccounts])

  const { selectedAddresses, toggleAddressSelection } = useSelectAccounts(importableAccounts)

  const onSubmit = useCallback(async () => {
    setButtonClicked(true)
    const importedAccounts = await generateAccountsAndImportAddresses(selectedAddresses)

    // TODO(EXT-1375): figure out how to better auto connect existing wallets that may have connected via WC or some other method.
    // Once that's solved the feature flag can be turned on/removed.
    if (shouldAutoConnect && importedAccounts?.[0]) {
      await saveDappConnection(POKI_WEB_URL, importedAccounts[0])
    }

    goToNextStep()
    setButtonClicked(false)
  }, [generateAccountsAndImportAddresses, selectedAddresses, goToNextStep, shouldAutoConnect])

  const title = t('onboarding.selectWallets.title.default')

  useSubmitOnEnter(onSubmit)

  return (
    <Trace logImpression properties={{ flow }} screen={ExtensionOnboardingScreens.SelectWallet}>
      <OnboardingScreen
        Icon={
          <Square backgroundColor="$surface2" borderRadius="$rounded12" size={iconSizes.icon48}>
            <WalletFilled color="$neutral1" size={iconSizes.icon24} />
          </Square>
        }
        nextButtonEnabled={true}
        nextButtonIcon={buttonClicked ? <SpinningLoader color="$accent1" size={iconSizes.icon20} /> : undefined}
        nextButtonText={buttonClicked ? t('onboarding.importMnemonic.button.importing') : t('common.button.continue')}
        nextButtonTheme={buttonClicked ? 'accentSecondary' : 'primary'}
        title={title}
        onBack={goToPreviousStep}
        onSubmit={onSubmit}
      >
        <ScrollView maxHeight="55vh" my="$spacing32" showsVerticalScrollIndicator={false} width="100%">
          <Flex gap="$spacing12" position="relative" py="$spacing4" width="100%">
            {!importableAccounts?.length ? (
              <Flex>
                <SelectWalletsSkeleton repeat={3} />
              </Flex>
            ) : (
              importableAccounts?.map((account) => {
                const { address, balance } = account
                return (
                  <WalletPreviewCard
                    key={address}
                    address={address}
                    balance={balance}
                    selected={selectedAddresses.includes(address)}
                    onSelect={toggleAddressSelection}
                  />
                )
              })
            )}
          </Flex>
        </ScrollView>
      </OnboardingScreen>
    </Trace>
  )
}
