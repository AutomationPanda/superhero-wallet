import { computed, ref } from '@vue/composition-api';
import type {
  IDexContracts,
  IAccount,
  IAccountLabeled,
  ITokenList,
  TxFunctionRaw,
  ITx,
  IDefaultComposableOptions,
} from '../types';
import { i18n } from '../store/plugins/languages';
import {
  FUNCTION_TYPE_DEX,
  FUNCTION_TYPE_MULTISIG,
  RETURN_TYPE_OK,
  TRANSACTION_OWNERSHIP_STATUS,
  TX_FUNCTIONS,
  getTxType,
} from '../popup/utils';

interface UseTransactionOptions extends IDefaultComposableOptions {
  tx?: ITx
}

export function useTransactionTx({
  store,
  tx,
}: UseTransactionOptions) {
  const innerTx = ref<ITx | undefined>(tx);

  function setTransactionTx(newTx: ITx) {
    innerTx.value = newTx;
  }

  const availableTokens = computed<ITokenList>(
    () => (store.state as any).fungibleTokens.availableTokens,
  );

  const account = computed<IAccount>(() => store.getters.account);
  const accounts = computed<IAccount[]>(() => store.getters.accounts);

  const getTxDirection = computed(() => store.getters.getTxDirection);
  const getDexContracts = computed<IDexContracts>(() => store.getters.getDexContracts);
  const getExplorerPath = computed(() => store.getters.getExplorerPath);
  const getPreferred = computed(() => store.getters['names/getPreferred']);

  const txType = computed(() => innerTx.value ? getTxType(innerTx.value) : null);

  const isAllowance = computed((): boolean => (
    !!innerTx.value
    && FUNCTION_TYPE_DEX.allowance.includes(innerTx.value.function as TxFunctionRaw)
    && !!availableTokens.value[innerTx.value.contractId]
  ));

  const isMultisig = computed((): boolean => (
    !!innerTx.value
    && (
      Object.values(FUNCTION_TYPE_MULTISIG).includes(innerTx.value.function as TxFunctionRaw)
      || !!innerTx.value.payerId
    )
  ));

  const isErrorTransaction = computed(
    (): boolean => {
      if (!innerTx.value) {
        return false;
      }
      const { returnType } = innerTx.value;
      return !!(returnType && returnType !== RETURN_TYPE_OK);
    },
  );

  const isDex = computed((): boolean => {
    const { wae, router } = getDexContracts.value;

    return !!(
      innerTx.value?.contractId
      && [...wae, ...router].includes(innerTx.value.contractId)
    );
  });

  const txOwnerAddress = computed(() => innerTx.value?.accountId || innerTx.value?.callerId);

  const ownershipStatus = computed(
    () => {
      if (account.value?.address === txOwnerAddress.value) {
        return TRANSACTION_OWNERSHIP_STATUS.current;
      }
      if (accounts.value?.find(({ address }) => address === txOwnerAddress.value)) {
        return TRANSACTION_OWNERSHIP_STATUS.subAccount;
      }
      return TRANSACTION_OWNERSHIP_STATUS.other;
    },
  );

  const direction = computed(() => (
    innerTx.value?.function === TX_FUNCTIONS.claim
      ? TX_FUNCTIONS.received
      : getTxDirection.value(
        innerTx.value,
        ownershipStatus.value !== TRANSACTION_OWNERSHIP_STATUS.current
        && txOwnerAddress.value,
      )
  ));

  function getOwnershipAccount(
    externalOwnerAddress: string | undefined,
  ): IAccountLabeled {
    switch (ownershipStatus.value) {
      case TRANSACTION_OWNERSHIP_STATUS.current:
        return {
          ...account.value,
          label: i18n.t('transaction.overview.accountAddress'),
          url: getExplorerPath.value(account.value.address),
        };
      case TRANSACTION_OWNERSHIP_STATUS.subAccount: {
        const { accountId, callerId } = innerTx.value || {};

        return accounts.value.find(({ address }) => [accountId, callerId].includes(address))!;
      }
      default: {
        const address = externalOwnerAddress || txOwnerAddress.value;

        return {
          name: getPreferred.value(address) || '',
          address,
        };
      }
    }
  }

  return {
    txType,
    isAllowance,
    isErrorTransaction,
    isDex,
    isMultisig,
    direction,
    getOwnershipAccount,
    setTransactionTx,
  };
}