<template>
  <Modal
    class="confirm"
    has-close-button
    from-bottom
    no-padding
    @close="closeModal"
  >
    <div class="content">
      <div class="icon-box">
        <StatusIcon
          :status="icon"
          class="icon"
          :class="[action]"
        />
      </div>

      <h2 class="text-heading-2 text-center">
        {{ confirmActionContent.title }}
      </h2>

      <FormSelect
        :options="eligibleAccounts"
        :default-text="confirmActionContent.formSelectText"
        class="account-selector"
        persistent-default-text
        unstyled
        @select="setActiveAccountByAddress($event)"
      />

      <div>
        <div class="active-account">
          <AccountItem :address="activeAccount.address" />
        </div>

        <div
          v-if="actionHasError"
          class="alert"
        >
          {{ actionHasError }}
        </div>
      </div>

      <div class="msg">
        {{ confirmActionContent.msg }}
      </div>
    </div>

    <template #footer>
      <BtnMain
        variant="muted"
        :text="$t('common.cancel')"
        @click="closeModal"
      />
      <BtnMain
        v-if="activeMultisigAccount"
        :variant="action === FUNCTION_TYPE_MULTISIG.revoke ? 'danger': 'primary'"
        data-cy="to-confirm"
        extra-padded
        :disabled="!!actionHasError"
        :text="confirmActionContent.btnText"
        @click="resolve"
      />
    </template>
  </Modal>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
} from '@vue/composition-api';
import type { TranslateResult } from 'vue-i18n';
import type { IFormSelectOption, IMultisigFunctionTypes } from '../../../types';
import { useAccounts, useMultisigAccounts, usePendingMultisigTransaction } from '../../../composables';
import { FUNCTION_TYPE_MULTISIG, getAccountNameToDisplay } from '../../utils';

import Modal from '../Modal.vue';
import FormSelect from '../form/FormSelect.vue';
import BtnMain from '../buttons/BtnMain.vue';
import AccountItem from '../AccountItem.vue';
import StatusIcon from '../StatusIcon.vue';

export default defineComponent({
  components: {
    Modal,
    FormSelect,
    BtnMain,
    AccountItem,
    StatusIcon,
  },
  props: {
    signers: { type: Array as PropType<string[]>, required: true },
    action: { type: String as PropType<IMultisigFunctionTypes>, required: true },
    resolve: { type: Function as PropType<() => void>, required: true },
    reject: { type: Function as PropType<() => void>, required: true },
  },
  setup(props, { root }) {
    const {
      activeMultisigAccount,
    } = useMultisigAccounts({ store: root.$store });
    const {
      activeAccount,
      setActiveAccountByAddress,
    } = useAccounts({ store: root.$store });
    const {
      pendingMultisigTxSigners,
      pendingMultisigTxConfirmedBy,
      pendingMultisigTxRefusedBy,
      pendingMultisigTxLocalSigners,
    } = usePendingMultisigTransaction({ store: root.$store });

    const eligibleAccounts = computed(
      (): IFormSelectOption[] => pendingMultisigTxLocalSigners.value
        .map((acc): IFormSelectOption => ({
          text: getAccountNameToDisplay(acc),
          value: acc.address,
          address: acc.address,
        })),
    );

    // StatusIcon
    const icon = computed(() => (
      props.action === FUNCTION_TYPE_MULTISIG.confirm ? 'success' : 'critical'
    ));

    const confirmActionContent = computed((): TranslateResult => {
      switch (props.action) {
        case FUNCTION_TYPE_MULTISIG.confirm:
          return root.$t('pages.proposalDetails.signDialog');
        case FUNCTION_TYPE_MULTISIG.revoke:
          return root.$t('pages.proposalDetails.revokeDialog');
        default:
          return root.$t('pages.proposalDetails.refuseDialog');
      }
    });

    const actionHasError = computed(() => {
      const confirmActionText = confirmActionContent.value as Record<string, TranslateResult>;
      if (!pendingMultisigTxSigners.value.includes(activeAccount.value.address)) {
        return confirmActionText.cannotDoActionWithSelectedAccount;
      }
      if (
        props.action === FUNCTION_TYPE_MULTISIG.revoke
        && activeMultisigAccount.value?.proposedBy !== activeAccount.value.address
      ) {
        return confirmActionText.cannotDoActionWithSelectedAccount;
      }
      if (
        props.action === FUNCTION_TYPE_MULTISIG.confirm
        && pendingMultisigTxConfirmedBy.value.includes(activeAccount.value.address)
      ) {
        return confirmActionText.selectedAccountAlreadyDoneThisAction;
      }
      if (
        props.action === FUNCTION_TYPE_MULTISIG.refuse
        && pendingMultisigTxRefusedBy.value.includes(activeAccount.value.address)
      ) {
        return confirmActionText.selectedAccountAlreadyDoneThisAction;
      }
      return null;
    });

    function closeModal() {
      props.reject();
    }

    return {
      icon,
      closeModal,
      eligibleAccounts,
      activeAccount,
      setActiveAccountByAddress,
      activeMultisigAccount,
      confirmActionContent,
      actionHasError,
      FUNCTION_TYPE_MULTISIG,
    };
  },
});
</script>

<style lang="scss" scoped>
@use '../../../styles/variables';
@use '../../../styles/typography';
@use '../../../styles/mixins';

.confirm {
  text-align: center;

  .content {
    padding: 8px 24px;
  }

  .text-heading-2 {
    margin-bottom: 16px;
  }

  .account-selector {
    margin: 0 auto;
    padding-bottom: 8px;
  }

  .active-account {
    @include mixins.flex(center, space-between, row);

    margin-bottom: 22px;
  }

  .alert {
    @extend %face-sans-14-regular;

    align-items: center;
    text-align: center;
    margin: 10px 0;
    padding: 8px 12px;
    border-radius: 4px;
    color: rgba(variables.$color-danger, 0.75);
    line-height: 19px;
  }

  .msg {
    @extend %face-sans-15-regular;

    color: rgba(variables.$color-white, 0.85);
    padding: 0 18px;
  }

  .icon-box {
    @include mixins.flex(center, center, column);

    gap: 20px;

    .icon {
      padding: 8px;
      border: 4px solid variables.$color-disabled;
      border-radius: 200%;
      height: 56px;
      width: 56px;
      margin-bottom: 20px;
      background-color: variables.$color-bg-1;

      &.refuse {
        color: variables.$color-warning;
      }
    }
  }
}
</style>
