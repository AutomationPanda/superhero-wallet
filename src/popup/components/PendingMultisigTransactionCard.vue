<template>
  <div
    v-if="pendingMultisigTransaction && pendingMultisigTransaction.tx"
    class="pending-multisig-transaction-card"
  >
    <div class="title">
      {{ $t('dashboard.pendingMultisigCard.title') }}
    </div>
    <TransactionItem
      :multisig-transaction="pendingMultisigTransaction"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { usePendingMultisigTransaction } from '../../composables';

import TransactionItem from './TransactionItem.vue';

export default defineComponent({
  components: { TransactionItem },
  setup(props, { root }) {
    const { pendingMultisigTransaction } = usePendingMultisigTransaction({ store: root.$store });

    return {
      pendingMultisigTransaction,
    };
  },
});
</script>

<style lang="scss" scoped>
@use '../../styles/variables';
@use '../../styles/typography';
@use '../../styles/mixins';

.pending-multisig-transaction-card {
  width: 100%;
  background-color: variables.$color-bg-6;
  border-radius: variables.$border-radius-interactive;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;

  .title {
    @extend %face-sans-15-bold;

    margin-bottom: 4px;
  }
}
</style>
