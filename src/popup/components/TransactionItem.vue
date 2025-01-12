<template>
  <ListItemWrapper
    class="transaction-item"
    :to="redirectRoute"
  >
    <div class="body">
      <TransactionTokens
        :ext-tokens="tokens"
        :error="isErrorTransaction"
        icon-size="md"
      />
      <div class="footer">
        <div
          v-if="!!multisigTransaction && !hasConsensus"
          class="consensus"
        >
          <PendingIcon class="icon" />
          <span class="pending">
            {{ $t('multisig.consensusPending') }}
            <ConsensusLabel
              :confirmations-required="multisigTransaction.confirmationsRequired"
              :has-pending-transaction="multisigTransaction.hasPendingTransaction"
              :confirmed-by="multisigTransaction.confirmedBy"
              :signers="multisigTransaction.signers"
            />
          </span>
        </div>

        <TransactionLabel
          v-else
          :transaction="currentTransaction"
          :transaction-date="transactionDate"
          :show-transaction-owner="showTransactionOwner"
          dense
        />

        <template v-if="!multisigTransaction">
          <span v-if="fiatAmount && !showTransactionOwner">
            {{ fiatAmount }}
          </span>
          <span
            v-else-if="showTransactionOwner"
            class="date"
          >
            {{ transactionDate }}
          </span>
        </template>
      </div>
    </div>
  </ListItemWrapper>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
} from '@vue/composition-api';
import dayjs from 'dayjs';
import {
  FUNCTION_TYPE_DEX,
  amountRounded,
  convertToken,
  formatDate,
  formatTime,
  relativeTimeTo,
  executeAndSetInterval,
} from '../utils';
import {
  ROUTE_MULTISIG_TX_DETAILS,
  ROUTE_TX_DETAILS,
  ROUTE_MULTISIG_DETAILS_PROPOSAL_DETAILS,
} from '../router/routeNames';
import {
  IActiveMultisigTx,
  ITransaction,
  TxFunctionRaw,
} from '../../types';
import {
  useCurrencies,
  useTransactionTokens,
  useTransactionTx,
} from '../../composables';

import TransactionTokens from './TransactionTokenRows.vue';
import TransactionLabel from './TransactionLabel.vue';
import PendingIcon from '../../icons/animated-pending.svg?vue-component';
import ListItemWrapper from './ListItemWrapper.vue';
import ConsensusLabel from './ConsensusLabel.vue';

export default defineComponent({
  components: {
    ConsensusLabel,
    PendingIcon,
    TransactionLabel,
    TransactionTokens,
    ListItemWrapper,
  },
  props: {
    transaction: { type: Object as PropType<ITransaction>, default: null },
    multisigTransaction: { type: Object as PropType<IActiveMultisigTx>, default: null },
    isMultisig: Boolean,
    showTransactionOwner: Boolean,
    hasConsensus: Boolean,
  },
  setup(props, { root }) {
    const { getFormattedAndRoundedFiat } = useCurrencies();

    let timerInterval: NodeJS.Timer;
    const transactionDate = ref();

    const currentTransaction = computed(
      () => (props.multisigTransaction || props.transaction),
    );

    const transactionOwner = computed((): string | undefined => (
      props.transaction?.transactionOwner || undefined
    ));

    const {
      isDex,
      direction,
      isAllowance,
      isErrorTransaction,
    } = useTransactionTx({
      store: root.$store,
      tx: currentTransaction.value.tx,
      externalAddress: transactionOwner.value,
    });

    const { tokens } = useTransactionTokens({
      store: root.$store,
      direction: direction.value,
      isAllowance: isAllowance.value,
      // TODO - refactor useTransactionTokens to use only tx
      transaction: (props.multisigTransaction || props.transaction) as unknown as ITransaction,
    });

    const redirectRoute = computed<any>(() => {
      if (props.multisigTransaction) {
        return { name: ROUTE_MULTISIG_DETAILS_PROPOSAL_DETAILS };
      }

      return {
        name: props.isMultisig
          ? ROUTE_MULTISIG_TX_DETAILS
          : ROUTE_TX_DETAILS,
        params: {
          hash: props.transaction.hash,
          transactionOwner: props.transaction.transactionOwner,
        },
      };
    });

    const fiatAmount = computed(() => {
      const aeToken = tokens.value?.find((t) => t?.isAe);
      if (
        !aeToken
        || isErrorTransaction.value
        || (
          isDex.value
          && FUNCTION_TYPE_DEX.pool.includes(currentTransaction.value.tx?.function as TxFunctionRaw)
        )
      ) return 0;
      return getFormattedAndRoundedFiat(
        +amountRounded((aeToken.decimals
          ? convertToken(aeToken.amount || 0, -aeToken.decimals)
          : aeToken.amount)!),
      );
    });

    onMounted(() => {
      timerInterval = executeAndSetInterval(() => {
        transactionDate.value = (props.transaction)
          ? relativeTimeTo(dayjs(props.transaction.microTime).toISOString())
          : undefined;
      }, 5000);
    });

    onBeforeUnmount(() => {
      clearInterval(timerInterval);
    });

    return {
      redirectRoute,
      fiatAmount,
      transactionDate,
      isErrorTransaction,
      tokens,
      currentTransaction,
      transactionOwner,
      direction,
      formatDate,
      formatTime,
    };
  },
});
</script>

<style lang="scss" scoped>
@use '../../styles/variables';
@use '../../styles/typography';
@use '../../styles/mixins';

.transaction-item {
  @include mixins.flex(center, center, column);

  padding: 10px var(--screen-padding-x);
  margin: 0 calc(-1 * var(--screen-padding-x));

  .body {
    width: 100%;

    .footer {
      @include mixins.flex(space-between, center, row);

      @extend %face-sans-12-regular;

      width: 100%;
      color: rgba(variables.$color-white, 0.75);
      gap: 3px;

      .date {
        white-space: nowrap;
      }
    }
  }

  .consensus {
    @extend %face-sans-12-medium;

    display: flex;
    align-items: center;
    gap: 6px;

    .icon {
      width: 16px;
      height: 16px;
    }
  }
}
</style>
