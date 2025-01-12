<template>
  <div class="dashboard-header-multisig">
    <TotalWalletAmount
      v-if="addressList.length > 1"
      :total-balance="multisigBalancesTotal"
      is-multisig
    />

    <AccountSwiper
      :active-idx="multisigAccountIdx"
      :address-list="addressList"
      :to="{ name: ROUTE_MULTISIG_DETAILS }"
      is-multisig
      @selectAccount="(index) => selectAccount(index)"
    >
      <template #slide="{ index }">
        <AccountCardMultisig
          :account="multisigAccounts[index]"
          :selected="index === multisigAccountIdx"
        />
      </template>
    </AccountSwiper>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
} from '@vue/composition-api';
import BigNumber from 'bignumber.js';
import { useMultisigAccounts } from '../../composables';
import { ROUTE_MULTISIG_DETAILS } from '../router/routeNames';

import TotalWalletAmount from './TotalWalletAmount.vue';
import AccountSwiper from './AccountSwiper.vue';
import AccountCardMultisig from './AccountCardMultisig.vue';

export default defineComponent({
  components: {
    AccountCardMultisig,
    AccountSwiper,
    TotalWalletAmount,
  },
  setup(props, { root }) {
    const {
      multisigAccounts,
      activeMultisigAccountId,
      setActiveMultisigAccountId,
    } = useMultisigAccounts({ store: root.$store });

    const addressList = computed(() => multisigAccounts.value.map((acc) => acc.gaAccountId));

    const multisigAccountIdx = computed(
      () => multisigAccounts.value.findIndex(
        (acc) => acc.gaAccountId === activeMultisigAccountId.value,
      ),
    );

    const multisigBalancesTotal = computed(
      () => multisigAccounts.value
        .map((acc) => acc.balance)
        .reduce((total, balance) => total.plus(balance), new BigNumber(0))
        .toFixed(),
    );

    function selectAccount(index: number) {
      const selectedAccount = multisigAccounts.value[index];
      if (selectedAccount.gaAccountId) {
        setActiveMultisigAccountId(selectedAccount.gaAccountId);
      }
    }

    return {
      multisigAccounts,
      multisigAccountIdx,
      multisigBalancesTotal,
      addressList,
      ROUTE_MULTISIG_DETAILS,
      selectAccount,
    };
  },
});
</script>
