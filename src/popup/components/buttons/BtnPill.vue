<template>
  <BtnBase
    v-bind="$attrs"
    class="btn-pill"
    :class="{ dense, static }"
    :to="to"
  >
    <slot>{{ text }}</slot>
  </BtnBase>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import BtnBase from './BtnBase.vue';

export default defineComponent({
  components: {
    BtnBase,
  },
  props: {
    to: { type: [String, Object], default: null },
    text: { type: String, default: null },
    dense: Boolean,
    static: Boolean,
  },
});
</script>

<style lang="scss" scoped>
@use '../../../styles/variables';
@use '../../../styles/mixins';
@use '../../../styles/typography';

.btn-pill {
  @extend %face-sans-14-regular;

  @include mixins.flex(center, center, row);

  padding: 2px 10px;
  gap: 4px;
  border-radius: 20px;
  background-color: rgba(variables.$color-white, 0.08);
  color: rgba(variables.$color-white, 0.5);

  &.dense {
    padding-block: 0;
  }

  &.router-link-exact-active {
    background-color: rgba(variables.$color-white, 0.15);
    color: variables.$color-white;
  }

  &:not(.static) {
    color: rgba(variables.$color-white, 0.75);

    &:hover {
      color: rgba(variables.$color-white, 1);
    }

    &:active {
      color: rgba(variables.$color-white, 0.75);
    }
  }
}
</style>
