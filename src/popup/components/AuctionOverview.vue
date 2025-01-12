<template>
  <div class="auction-overview">
    <DetailsItem :label="$t('pages.auctionBid.current-highest-bid')">
      <template #value>
        <TokenAmount :amount="amount" />
      </template>
    </DetailsItem>
    <DetailsItem
      class="end-height"
      :label="$t('pages.auctionBid.ending-height')"
      :value="auction.expiration"
      :secondary="`(≈${endHeight})`"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';
import { IAuction, IAuctionBid } from '../../types';
import { useTopHeaderData } from '../../composables';
import { useGetter } from '../../composables/vuex';
import { blocksToRelativeTime } from '../utils';

import DetailsItem from './DetailsItem.vue';
import TokenAmount from './TokenAmount.vue';

export default defineComponent({
  components: {
    DetailsItem,
    TokenAmount,
  },
  props: {
    name: { type: String, required: true },
  },
  setup(props, { root }) {
    const { topBlockHeight } = useTopHeaderData({ store: root.$store });

    // eslint-disable-next-line no-unused-vars
    const getHighestBid = useGetter<(n: string) => IAuctionBid>('names/getHighestBid');

    const getAuction = useGetter('names/getAuction');
    const auction = computed<IAuction>(() => getAuction.value(props.name));
    const blocksToExpiry = computed<number>(() => auction.value.expiration - topBlockHeight.value);
    const amount = computed(() => +getHighestBid.value(props.name).nameFee);
    const endHeight = computed(() => blocksToRelativeTime(blocksToExpiry.value));

    return {
      blocksToRelativeTime,
      auction,
      amount,
      endHeight,
    };
  },
});
</script>

<style lang="scss" scoped>
@use '../../styles/variables';

.auction-overview {
  display: flex;
  justify-content: space-between;

  .details-item {
    ::v-deep .label {
      margin-bottom: 4px;
    }

    ::v-deep .value {
      text-align: left;
    }

    &:first-of-type {
      padding-right: 24px;
    }

    &.end-height {
      ::v-deep .value {
        color: variables.$color-grey-light;
      }

      ::v-deep .secondary {
        color: variables.$color-grey-dark;
      }
    }
  }
}
</style>
