<template>
  <div class="list">
    <template v-if="namesForAccount.length">
      <NameItem
        v-for="({ name, owner, autoExtend }, index) in namesForAccount"
        :key="index"
        :name="name"
        :address="owner"
        :auto-extend="autoExtend"
      />
    </template>
    <AnimatedSpinner
      v-else-if="areNamesFetching"
      class="spinner"
    />
    <RegisterName
      v-else
      :msg="$t('pages.names.list.no-names')"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount } from '@vue/composition-api';
import type { IName } from '../../../types';
import { useState } from '../../../composables/vuex';
import { useAccounts } from '../../../composables';
import NameItem from '../../components/NameItem.vue';
import RegisterName from '../../components/RegisterName.vue';
import AnimatedSpinner from '../../../icons/animated-spinner.svg?skip-optimize';

export default defineComponent({
  components: {
    NameItem,
    AnimatedSpinner,
    RegisterName,
  },
  setup(props, { root }) {
    const { activeAccount } = useAccounts({ store: root.$store });
    const areNamesFetching = useState('names', 'areNamesFetching');
    const namesOwned = useState<IName[]>('names', 'owned');

    const namesForAccount = computed(
      () => namesOwned.value.filter(({ owner }) => owner === activeAccount.value.address),
    );

    const id = setInterval(() => root.$store.dispatch('names/fetchOwned'), 10000);

    onBeforeUnmount(() => {
      clearInterval(id);
    });

    return {
      activeAccount,
      areNamesFetching,
      namesForAccount,
    };
  },
});
</script>

<style lang="scss" scoped>
@use '../../../styles/variables';
@use '../../../styles/typography';

.list {
  padding-top: 4px;

  .name-item {
    margin-top: 1px;
  }

  .spinner {
    display: flex;
    width: 56px;
    height: 56px;
    margin: 72px auto 0 auto;
  }
}
</style>
