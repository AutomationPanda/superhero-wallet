<template>
  <div
    data-cy="networks"
    class="networks"
  >
    <p class="text-description">
      {{ $t('pages.network.listLabel') }}
    </p>

    <div class="networks-list">
      <NetworkRow
        v-for="network in networks"
        :key="network.name"
        :network="network"
        @selectNetwork="selectNetwork"
      />
    </div>

    <BtnMain
      extend
      variant="muted"
      class="add-custom-network"
      data-cy="to-add"
      :text="$t('pages.network.addCustomNetwork')"
      :icon="PlusCircleIcon"
      :to="{ name: 'network-add' }"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { useDispatch, useGetter } from '../../composables/vuex';

import NetworkRow from '../components/NetworkRow.vue';
import BtnMain from '../components/buttons/BtnMain.vue';
import PlusCircleIcon from '../../icons/plus-circle.svg?vue-component';

export default defineComponent({
  components: {
    BtnMain,
    NetworkRow,
  },
  setup() {
    const networks = useGetter('networks');
    const selectNetwork = useDispatch('selectNetwork');

    return {
      networks,
      selectNetwork,
      PlusCircleIcon,
    };
  },
});
</script>

<style lang="scss" scoped>
@use '../../styles/mixins';
@use '../../styles/variables';
@use '../../styles/typography';

.networks {
  padding: var(--screen-padding-x);

  .networks-list {
    margin-top: 20px;
  }

  .add-custom-network {
    margin-top: 20px;
  }
}
</style>
