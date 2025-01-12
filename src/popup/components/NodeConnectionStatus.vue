<template>
  <transition name="fade-transition">
    <div
      v-if="statusText"
      data-cy="connect-node"
      class="node-connection-status"
      :class="{
        'is-error': isError,
      }"
    >
      {{ statusText }}
    </div>
  </transition>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  watch,
} from '@vue/composition-api';
import { TranslateResult } from 'vue-i18n';
import { useAccounts, useConnection, useSdk } from '../../composables';

const CONNECTED_DISPLAY_TIME = 2000;

export default defineComponent({
  setup(props, { root }) {
    const { isOnline } = useConnection();
    const { isNodeConnecting, isNodeReady, isNodeError } = useSdk({ store: root.$store });
    const { isLoggedIn } = useAccounts({ store: root.$store });

    const justBeenConnected = ref(false);

    const isError = computed(() => !isOnline.value || isNodeError.value);

    // Display "Connected" message for a while after connecting to node.
    watch(isNodeReady, (val) => {
      justBeenConnected.value = val;
      if (val) {
        setTimeout(() => {
          justBeenConnected.value = false;
        }, CONNECTED_DISPLAY_TIME);
      }
    });

    const statusText = computed((): TranslateResult | null => {
      switch (true) {
        case !isOnline.value:
          return root.$t('connectionStatus.offline');
        case !isLoggedIn.value:
          return null;
        case isNodeConnecting.value:
          return root.$t('connectionStatus.node.connecting');
        case justBeenConnected.value:
          return root.$t('connectionStatus.node.connected');
        case isNodeError.value:
          return root.$t('connectionStatus.node.error');
        default:
          return null;
      }
    });

    return {
      isError,
      statusText,
    };
  },
});
</script>

<style lang="scss" scoped>
@use '../../styles/variables';
@use '../../styles/typography';
@use '../../styles/mixins';

.node-connection-status {
  @extend %face-sans-15-medium;

  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 4px 10px;
  color: variables.$color-white;
  backdrop-filter: blur(variables.$bg-blur-radius);
  text-align: center;

  &::before {
    content: '';
    position: absolute;
    z-index: -1;
    inset: 0;
    background: variables.$color-bg-3;
    opacity: 0.8;
  }

  &.is-error {
    color: variables.$color-warning;
  }
}
</style>
