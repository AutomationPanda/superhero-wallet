<template>
  <div
    :class="['account-card-base', { selected }]"
    data-cy="account-card-base"
  >
    <div class="top">
      <slot
        name="top"
      />
    </div>

    <div class="middle">
      <slot name="middle" />
    </div>

    <div class="bottom">
      <slot name="bottom" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  props: {
    selected: Boolean,
  },
});
</script>

<style lang="scss" scoped>
@use '../../styles/variables';

.account-card-base {
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: 12px;
  text-decoration: none;

  &.selected {
    .account-info,
    .middle {
      opacity: 1;
    }
  }

  .account-info,
  .middle {
    opacity: 0.5;
  }

  .middle {
    margin-top: 5px;
    text-align: center;
  }

  .bottom {
    flex: 1;
    display: flex;
    align-items: flex-end;
  }
}
</style>
