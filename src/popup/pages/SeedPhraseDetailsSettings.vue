<template>
  <div class="seed-phrase-details">
    <div class="text-heading-1">
      {{ $t('pages.seed-phrase-settings.this-your-seed-phrase') }}
    </div>

    <div class="mnemonics">
      <p class="mnemonics-text">
        {{ mnemonic }}
      </p>
      <BtnMain
        variant="dark"
        class="copy-btn"
        big-icon
        :icon="copied ? CheckSuccessCircle : CopyOutlined"
        @click="copy(mnemonic)"
      >
        <template v-if="!copied">
          {{ $t('pages.seed-phrase-settings.copy') }}
        </template>

        <template v-else>
          {{ $t('common.addressCopied') }}
        </template>
      </BtnMain>
    </div>

    <i18n
      path="pages.seedPhrase.backUpYourSeedPhrase"
      tag="p"
      class="text-description"
    >
      <strong>{{ $t('pages.seedPhrase.inCorrectOrder') }}</strong>
    </i18n>
    <i18n
      path="pages.seedPhrase.toBeSureYouGotItRight"
      tag="p"
      class="text-description"
    >
      <strong>{{ $t('pages.seedPhrase.verifyYourSeedPhrase') }}</strong>
    </i18n>

    <div class="buttons">
      <BtnMain
        class="button"
        extend
        :to="{ name: 'settings-seed-phrase-verify' }"
      >
        {{ $t('pages.seedPhrase.verifySeed') }}
      </BtnMain>
      <BtnMain
        variant="muted"
        extend
        @click="setBackedUpSeed"
      >
        {{ $t('pages.seedPhrase.doneThis') }}
      </BtnMain>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';
import { useCopy } from '../../composables';
import { ROUTE_ACCOUNT } from '../router/routeNames';
import BtnMain from '../components/buttons/BtnMain.vue';
import CopyOutlined from '../../icons/copy-outlined.svg?vue-component';
import CheckSuccessCircle from '../../icons/check-success-circle.svg?vue-component';

export default defineComponent({
  name: 'SeedPhraseDetailsSettings',
  components: {
    BtnMain,
  },
  setup(props, { root }) {
    const { copy, copied } = useCopy();
    const mnemonic = computed(() => root.$store.state.mnemonic);

    function setBackedUpSeed() {
      root.$store.commit('setBackedUpSeed');
      root.$router.push({ name: ROUTE_ACCOUNT });
    }

    return {
      CopyOutlined,
      CheckSuccessCircle,
      copy,
      copied,
      mnemonic,
      setBackedUpSeed,
    };
  },
});
</script>

<style lang="scss" scoped>
@use '../../styles/variables';
@use '../../styles/typography';

.seed-phrase-details {
  padding: var(--screen-padding-x);

  .mnemonics {
    background: rgba(variables.$color-white, 0.15);
    border: 2px solid rgba(variables.$color-white, 0.1);
    border-radius: variables.$border-radius-modal;
    margin: 0 0 20px 0;
    padding: 12px;
    text-align: center;
    box-shadow: 0 4px 8px 2px rgb(60 60 60 / 10%);
    box-sizing: border-box;

    ::v-deep .content {
      padding: 12px;
    }

    .mnemonics-text {
      letter-spacing: 0.1em;
      line-height: 32px;
      color: variables.$color-white;
      text-align: left;
      margin-bottom: 12px;

      @extend %face-sans-18-regular;
    }

    .copy-btn {
      margin: 0 auto;
      min-width: 210px;
    }
  }

  .buttons {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
    margin-top: 20px;
  }
}
</style>
