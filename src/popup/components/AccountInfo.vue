<template>
  <div
    class="account-info"
    :class="{ 'can-copy-address': canCopyAddress }"
  >
    <Avatar
      class="avatar"
      :address="address"
      :name="name"
      :borderless="avatarBorderless"
    />
    <div class="account-details">
      <div
        v-if="isMultisig"
        class="account-name"
      >
        {{ $t('multisig.multisigVault') }}
      </div>
      <div
        v-else-if="name"
        class="account-name-truncated"
      >
        <Truncate :str="name" />
      </div>
      <div
        v-else
        data-cy="account-name-number"
        class="account-name"
      >
        {{ $t('pages.account.heading') }} {{ idx + 1 }}
      </div>
      <div
        v-if="address && address.length"
        class="account-address"
      >
        <CopyText
          data-cy="copy"
          :value="address"
          :disabled="!canCopyAddress"
        >
          <AddressTruncated
            :address="address"
            class="ae-address"
          />
        </CopyText>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';
import Avatar from './Avatar.vue';
import CopyText from './CopyText.vue';
import Truncate from './Truncate.vue';
import AddressTruncated from './AddressTruncated.vue';
import { useGetter } from '../../composables/vuex';

export default defineComponent({
  components: {
    AddressTruncated,
    Avatar,
    Truncate,
    CopyText,
  },
  props: {
    address: { type: String, required: true },
    name: { type: String, default: '' },
    idx: { type: Number, default: 0 },
    canCopyAddress: Boolean,
    isMultisig: Boolean,
    avatarBorderless: Boolean,
  },
  setup(props) {
    const activeNetwork = useGetter('activeNetwork');

    const explorerUrl = computed(() => `${activeNetwork.value.explorerUrl}/account/transactions/${props.address}`);

    return {
      explorerUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
@use '../../styles/variables';
@use '../../styles/typography';

.account-info {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  color: variables.$color-white;

  .avatar {
    margin-right: 8px;
    width: 48px;
    height: 48px;
    background-color: variables.$color-black;
  }

  .account-details {
    max-width: 250px;
    font-weight: 500;

    .account-name-truncated,
    .account-name {
      @extend %face-sans-16-medium;

      margin: 4px 0;
    }

    .ae-address {
      color: rgba(variables.$color-white, 0.85);
      opacity: 0.85;

      .icon {
        width: 22px;
        height: 22px;
        margin-left: 2px;
      }
    }
  }

  &.can-copy-address {
    .ae-address {
      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
