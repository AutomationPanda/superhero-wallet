<template>
  <div
    v-if="activeMultisigAccount"
    class="multisig-details"
  >
    <DetailsItem
      :label="$t('multisig.address')"
    >
      <template #value>
        <div class="address-row">
          <Avatar
            class="avatar"
            :address="activeMultisigAccount.gaAccountId"
          />
          <AddressFormatted
            :address="activeMultisigAccount.gaAccountId"
            :column-count="9"
            class="text-address"
          />
        </div>
      </template>
    </DetailsItem>

    <DetailsItem
      :label="$t('common.contractId')"
    >
      <template #value>
        <div class="address-row">
          <Avatar
            class="avatar"
            :address="activeMultisigAccount.contractId"
          />
          <AddressFormatted
            :address="activeMultisigAccount.contractId"
            :column-count="9"
            class="text-address"
          />
        </div>
      </template>
    </DetailsItem>

    <LinkButton
      class="explorer-link"
      :to="getExplorerPath(activeMultisigAccount.contractId)"
    >
      {{ $t('multisig.explorerLink') }}
      <ExternalLinkIcon class="external-icon" />
    </LinkButton>

    <div class="row">
      <DetailsItem
        class="details-item"
        :label="$t('multisig.version')"
        :value="activeMultisigAccount.version"
      />
      <DetailsItem
        class="details-item"
        :label="$t('multisig.currentNonce')"
        :value="activeMultisigAccount.nonce"
      />
    </div>

    <div class="row">
      <AuthorizedAccounts
        :address-list="activeMultisigAccount.signers"
      />
      <DetailsItem
        class="details-item"
        :label="$t('multisig.consensus')"
      >
        <template #value>
          <ConsensusLabel
            :confirmations-required="activeMultisigAccount.confirmationsRequired"
            :has-pending-transaction="activeMultisigAccount.hasPendingTransaction"
            :confirmed-by="activeMultisigAccount.confirmedBy"
            :signers="activeMultisigAccount.signers"
          />
        </template>
      </DetailsItem>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount } from '@vue/composition-api';
import { useGetter } from '../../composables/vuex';
import { useMultisigAccounts } from '../../composables';

import DetailsItem from '../components/DetailsItem.vue';
import AddressFormatted from '../components/AddressFormatted.vue';
import Avatar from '../components/Avatar.vue';
import AuthorizedAccounts from '../components/AuthorizedAccounts.vue';
import LinkButton from '../components/LinkButton.vue';
import ConsensusLabel from '../components/ConsensusLabel.vue';

import ExternalLinkIcon from '../../icons/external-link.svg?vue-component';

export default defineComponent({
  name: 'MultisigDetails',
  components: {
    ConsensusLabel,
    LinkButton,
    AuthorizedAccounts,
    Avatar,
    AddressFormatted,
    DetailsItem,
    ExternalLinkIcon,
  },
  setup(props, { root }) {
    const getExplorerPath = useGetter('getExplorerPath');

    const {
      activeMultisigAccount,
      fetchAdditionalInfo,
      stopFetchingAdditionalInfo,
    } = useMultisigAccounts({ store: root.$store });

    onMounted(fetchAdditionalInfo);

    onBeforeUnmount(stopFetchingAdditionalInfo);

    return {
      activeMultisigAccount,
      getExplorerPath,
    };
  },
});
</script>

<style scoped lang="scss">
@use '../../styles/variables';

.multisig-details {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .address-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .text-address {
    color: variables.$color-white;
  }

  .row {
    display: grid;
    grid-gap: 24px;
    grid-template-columns: 208px auto;
  }

  .details-item {
    width: 100%;
  }

  .explorer-link {
    color: rgba(variables.$color-white, 0.75);
    margin-block: 4px;

    .external-icon {
      opacity: 1;
      color: rgba(variables.$color-white, 0.75);
    }

    &:active,
    &:hover {
      color: variables.$color-white;
    }
  }
}
</style>
