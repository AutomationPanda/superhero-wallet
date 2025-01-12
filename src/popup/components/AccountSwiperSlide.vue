<template>
  <swiper-slide class="account-swiper-slide">
    <Component
      :is="to ? 'BtnBase' : 'div'"
      :to="to"
      :class="['account-swiper-slide-card', { selected }]"
      :disabled="!selected"
      :bg-color="color"
    >
      <slot />

      <template v-if="!IS_CORDOVA">
        <BtnPlain
          v-if="idx !== 0"
          class="swiper-button prev"
          @click="$emit('slide', idx - 1)"
        >
          <ChevronIcon />
        </BtnPlain>

        <BtnPlain
          v-if="!hideNext"
          class="swiper-button next"
          @click="$emit('slide', idx + 1)"
        >
          <ChevronIcon />
        </BtnPlain>
      </template>
    </Component>
  </swiper-slide>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@vue/composition-api';
import { Location } from 'vue-router';
import { SwiperSlide } from 'vue-awesome-swiper';
import { getAddressColor } from '../utils/avatar';

import BtnPlain from './buttons/BtnPlain.vue';
import BtnBase from './buttons/BtnBase.vue';
import ChevronIcon from '../../icons/chevron.svg?vue-component';

export default defineComponent({
  components: {
    BtnBase,
    SwiperSlide,
    BtnPlain,
    ChevronIcon,
  },
  props: {
    idx: { type: Number, default: -1 },
    address: { type: String, default: '' },
    to: { type: Object as PropType<Location>, default: null },
    selected: Boolean,
    hideNext: Boolean,
  },
  setup(props) {
    const color = computed(() => getAddressColor(props.address));

    return {
      color,
      IS_CORDOVA: process.env.IS_CORDOVA,
    };
  },
});
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as *;

.account-swiper-slide {
  &-card {
    display: flex;
    border-radius: $border-radius-card;
    color: inherit;
    width: 100%;
    height: 192px;

    .swiper-button {
      position: absolute;
      z-index: 1;
      top: 50%;
      height: 60px;
      width: 30px;
      color: $color-white;
      opacity: 0.5;
      transition: $transition-interactive;

      .icon {
        width: 14px;
        height: 22px;
      }

      &.prev {
        left: 2px;
        transform: translateY(-50%) scaleX(-1);
      }

      &.next {
        right: 2px;
        transform: translateY(-50%);
      }

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
