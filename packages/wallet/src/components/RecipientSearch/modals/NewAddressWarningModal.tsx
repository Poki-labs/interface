import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { DeprecatedButton, Flex, GetProps, ScrollView, Text } from 'ui/src'
import { UserSquare } from 'ui/src/components/icons'
import { fonts, imageSizes } from 'ui/src/theme'
import { GenericHeader } from 'poki/src/components/misc/GenericHeader'
import { Modal } from 'poki/src/components/modals/Modal'
import { useENSAvatar, useENSName } from 'poki/src/features/ens/api'
import { ModalName } from 'poki/src/features/telemetry/constants'
import { getValidAddress } from 'poki/src/utils/addresses'
import { shortenAddress } from 'utilities/src/addresses'
import { isMobileApp } from 'utilities/src/platform'
import { AccountIcon } from 'wallet/src/components/accounts/AccountIcon'
import { AddressDisplay } from 'wallet/src/components/accounts/AddressDisplay'
import { useDisplayName } from 'wallet/src/features/wallet/hooks'
import { DisplayNameType } from 'wallet/src/features/wallet/types'

type NewAddressWarningModalProps = {
  address: string
  onAcknowledge: () => void
  onClose: () => void
}

/**
 * Helper component to render a left label column and a right child. The label + text
 * will wrap if the content is too long.
 *
 * @param leftText Label text on left
 * @param rightChild Dynamic child on the right side
 */
const LeftRightText = ({ leftText, rightChild }: { leftText: string; rightChild: ReactNode }): JSX.Element => {
  return (
    <Flex row flexGrow={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" px="$spacing16">
      <Text color="$neutral2" fontWeight="bold" variant="body3" pr="$spacing8">
        {leftText}
      </Text>
      <Flex flexShrink={1}>{rightChild}</Flex>
    </Flex>
  )
}

/**
 * Modal shown when trying to do a transaction with a that the user has not done a transaction
 * with before. The user can then confirm that they want to proceed or cancel the transaction.
 *
 * @param address Target address the user has not transacted with
 * @param onAcknowledge Callback when the user has confirmed they want to proceed
 * @param onConfirm Callback when the user does not want to proceed with the transaction for new address
 */
export function NewAddressWarningModal({ address, onAcknowledge, onClose }: NewAddressWarningModalProps): JSX.Element {
  const { t } = useTranslation()

  const validated = getValidAddress(address)
  const displayName = useDisplayName(address, { includeUnitagSuffix: true })
  const ensDisplayName = useENSName(validated ?? undefined)
  const { data: ensAvatar } = useENSAvatar(validated)

  return (
    <Modal name={ModalName.NewAddressWarning} onClose={onClose}>
      <Flex px={isMobileApp ? '$spacing24' : undefined} py={isMobileApp ? '$spacing12' : undefined}>
        <GenericHeader
          Icon={UserSquare}
          iconSize="$icon.24"
          title={t('send.warning.newAddress.title')}
          subtitle={t('send.warning.newAddress.message')}
          subtitleVariant="body3"
          flexProps={{ pb: '$spacing16' }}
        />
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
          borderColor="$surface3"
          borderRadius="$rounded16"
          borderWidth="$spacing1"
          flexDirection="column"
        >
          {displayName?.type === DisplayNameType.Unitag && (
            <LeftRightText
              leftText={t('send.warning.newAddress.details.username')}
              rightChild={
                <AddressDisplay
                  hideAddressInSubtitle
                  includeUnitagSuffix
                  horizontalGap="$spacing4"
                  address={address}
                  lineHeight={fonts.body3.lineHeight}
                  size={16}
                  variant="body3"
                />
              }
            />
          )}
          {ensDisplayName.data && (
            <LeftRightText
              leftText={t('send.warning.newAddress.details.ENS')}
              rightChild={
                <Flex row alignItems="center" gap="$spacing4">
                  <AccountIcon address={address} avatarUri={ensAvatar} size={imageSizes.image16} />
                  <Text numberOfLines={0} loading={ensDisplayName.isLoading} variant="body3">
                    {ensDisplayName.data}
                  </Text>
                </Flex>
              }
            />
          )}
          <LeftRightText
            leftText={t('send.warning.newAddress.details.walletAddress')}
            rightChild={
              <Text numberOfLines={0} variant="body3">
                {shortenAddress(address, 6)}
              </Text>
            }
          />
        </ScrollView>

        <Flex row gap="$spacing12" pt="$spacing24">
          <DeprecatedButton flex={1} flexBasis={1} theme="secondary" onPress={onClose}>
            {t('common.button.back')}
          </DeprecatedButton>
          <DeprecatedButton flex={1} flexBasis={1} theme="primary" onPress={onAcknowledge}>
            {t('common.button.confirm')}
          </DeprecatedButton>
        </Flex>
      </Flex>
    </Modal>
  )
}

const styles = {
  scrollViewContent: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    py: '$spacing16',
    flexGrow: 1,
  } satisfies GetProps<typeof ScrollView>['contentContainerStyle'],
}
