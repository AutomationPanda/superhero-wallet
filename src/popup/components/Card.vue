<template>
  <transition name="fade-transition">
    <div
      v-if="isVisible"
      class="card"
      :class="{
        dense,
        disabled,
      }"
      :style="styleComponent"
    >
      <IconWrapper
        v-if="icon"
        :icon="icon"
        class="card-icon"
        is-boxed
      />

      <div>
        <div class="text">
          {{ text }}
        </div>
        <div class="description">
          {{ description }}
        </div>
        <slot />
      </div>

      <div
        v-if="cardId"
        class="card-close"
      >
        <BtnIcon
          icon-variant="light"
          :icon="CloseIcon"
          @click="$store.commit('hideCard', cardId)"
        />
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex';
import BtnIcon from './buttons/BtnIcon.vue';
import CloseIcon from '../../icons/times-circle.svg?vue-component';
import IconWrapper from './IconWrapper.vue';

export default {
  name: 'Card',
  components: {
    BtnIcon,
    IconWrapper,
  },
  props: {
    text: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    background: {
      type: String,
      default: null,
    },
    dense: Boolean,
    disabled: Boolean,
    cardId: { type: String, default: null },
    icon: { type: Object, default: null },
  },
  data: () => ({
    CloseIcon,
  }),
  computed: {
    ...mapState(['hiddenCards']),
    styleComponent() {
      return {
        backgroundImage: (this.background)
          ? `url("${this.background}")`
          : null,
      };
    },
    isVisible() {
      return !this.cardId || !this.hiddenCards || !this.hiddenCards.includes(this.cardId);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as *;
@use '../../styles/typography';
@use '../../styles/mixins';

.card {
  position: relative;
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-height: 116px;
  border-radius: $border-radius-interactive;
  padding: 20px 16px;
  gap: 16px;
  background-color: $color-bg-6;
  background-repeat: no-repeat;
  background-size: cover;
  transition: $transition-interactive;

  .card-icon {
    color: $color-white;
  }

  .card-close {
    position: absolute;
    top: 4px;
    right: 4px;
  }

  .text {
    @extend %face-sans-16-bold;

    color: $color-white;
  }

  .description {
    @extend %face-sans-13-regular;

    opacity: 0.7;
    margin-top: 4px;
  }

  &.dense {
    .description {
      margin-top: 0;
    }
  }

  &.disabled {
    pointer-events: none;
    opacity: 0.4;
  }
}
</style>
