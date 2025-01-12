<template>
  <DetailsItem
    :label="label"
    class="pool-token-row"
  >
    <template #value>
      <div>
        <TokenAmount
          v-if="!hideAmount"
          :amount="amount"
          hide-fiat
          no-symbol
        />
        <div class="token-info">
          <Tokens
            v-if="token"
            :tokens="token.isPool ? [tokens[0], tokens[1]] : [token]"
          />
          <AddressTruncated
            v-if="token.contractId"
            show-explorer-link
            :address="token.contractId"
          />
        </div>
      </div>
    </template>
  </DetailsItem>
</template>

<script>
import { convertToken } from '../utils';
import DetailsItem from './DetailsItem.vue';
import TokenAmount from './TokenAmount.vue';
import Tokens from './Tokens.vue';
import AddressTruncated from './AddressTruncated.vue';

export default {
  components: {
    AddressTruncated,
    TokenAmount,
    DetailsItem,
    Tokens,
  },
  props: {
    label: {
      type: String,
      default: '',
    },
    token: {
      type: Object,
      required: true,
    },
    tokens: {
      type: Array,
      required: true,
    },
    hideAmount: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    amount() {
      return +(
        this.token.decimals
          ? this.convertToken(this.token.amount, -this.token.decimals)
          : this.token.amount
      );
    },
  },
  methods: {
    convertToken,
  },
};
</script>

<style lang="scss" scoped>
@use '../../styles/typography';
@use '../../styles/variables';
@use '../../styles/mixins';

.pool-token-row {
  .contract-id {
    @extend %face-mono-12-medium;

    color: variables.$color-grey-light;
    letter-spacing: 0.07em;
    cursor: pointer;

    .icon {
      width: 22px;
      height: 22px;
    }
  }

  .details-item.label::v-deep {
    margin-bottom: 4px;
  }

  .token-info {
    @include mixins.flex(flex-start, center);

    gap: 8px;
    padding-top: 4px;

    .symbol::v-deep,
    .address-shortening::v-deep {
      font-weight: 500;
    }
  }

  .tokens::v-deep {
    .symbol {
      @extend %face-sans-15-medium;

      color: variables.$color-white;
    }

    .separator {
      color: variables.$color-white;
    }
  }
}
</style>
