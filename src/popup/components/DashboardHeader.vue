<template>
  <div class="dashboard-header">
    <TotalWalletAmount
      v-if="accounts.length > 1"
      :total-balance="balancesTotal"
    />

    <AccountSwiper
      :active-idx="activeIdx"
      :address-list="accountsAddressList"
      :to="{ name: ROUTE_ACCOUNT_DETAILS }"
      @selectAccount="(index) => setActiveAccountByIdx(index)"
    >
      <template #slide="{ index }">
        <AccountCard
          :account="accounts[index]"
          :selected="index === activeIdx"
        />
      </template>
    </AccountSwiper>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { ROUTE_ACCOUNT_DETAILS } from '../router/routeNames';
import { useAccounts, useBalances } from '../../composables';

import AccountCard from './AccountCard.vue';
import TotalWalletAmount from './TotalWalletAmount.vue';
import AccountSwiper from './AccountSwiper.vue';

export default defineComponent({
  components: {
    AccountSwiper,
    TotalWalletAmount,
    AccountCard,
  },
  setup(props, { root }) {
    const {
      accounts,
      accountsAddressList,
      activeIdx,
      setActiveAccountByIdx,
    } = useAccounts({ store: root.$store });

    const { balancesTotal } = useBalances({ store: root.$store });

    return {
      ROUTE_ACCOUNT_DETAILS,
      accounts,
      accountsAddressList,
      activeIdx,
      balancesTotal,
      setActiveAccountByIdx,
    };
  },
});
</script>
