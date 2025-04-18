import { SwapSettingConfig } from 'poki/src/features/transactions/swap/settings/configs/types'
import { PlatformSplitStubError } from 'utilities/src/errors'

export const SlippageUpdate: SwapSettingConfig = {
  renderTitle: (t) => t('swap.slippage.settings.title'),
  renderCloseButtonText: (t) => t('common.button.save'),
  Control() {
    throw new PlatformSplitStubError('Slippage')
  },
}
