import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
} from '@vue/composition-api';
import BigNumber from 'bignumber.js';
import FUNGIBLE_TOKEN_CONTRACT from 'aeternity-fungible-token/FungibleTokenFullInterface.aes';
import { TxBuilder, SCHEMA } from '@aeternity/aepp-sdk';
import { MAGNITUDE, STUB_CONTRACT_ADDRESS, AETERNITY_CONTRACT_ID } from '../popup/utils/constants';
import { rxJsObservableToVueState } from '../popup/utils/utils';
import store from '../store';

import {
  executeAndSetInterval,
  calculateFee,
  validateTipUrl,
  checkAensName,
  handleUnknownError,
  watchUntilTruthy,
} from '../popup/utils';
import { IAccount } from '../types';
import { useGetter, useState } from './vuex';

export interface UseMaxAmountOptions {
  formModel: any,
}

export function useMaxAmount({ formModel }: UseMaxAmountOptions) {
  let updateTokenBalanceInterval: NodeJS.Timer;
  let updateNonceInterval: NodeJS.Timer;
  const fee = ref(new BigNumber(0));
  const selectedTokenBalance = ref(new BigNumber(0));
  const tokenInstance = ref<any>(null);
  const nonce = ref(0);
  const selectedAssetDecimals = ref(0);
  const sdk = useState('sdk');

  const balance = rxJsObservableToVueState((store.state as any).observables.balance);
  const balanceCurrency = rxJsObservableToVueState(
    (store.state as any).observables.balanceCurrency,
  );
  const account = useGetter<IAccount>('account');
  const max = computed(() => {
    if (balance.value && formModel.value?.selectedAsset?.contractId === AETERNITY_CONTRACT_ID) {
      const _max = balance.value.minus(fee.value);
      return (_max.isPositive() ? _max : 0).toString();
    }
    return selectedTokenBalance.value.toString();
  });

  watch(
    () => formModel.value,
    async (val) => {
      if (!val?.selectedAsset) return;
      await watchUntilTruthy(() => sdk.value);

      if (val.selectedAsset.contractId !== AETERNITY_CONTRACT_ID) {
        if (!tokenInstance.value
          || tokenInstance.value.deployInfo.address !== val.selectedAsset.contractId) {
          tokenInstance.value = await sdk.value.getContractInstance({
            source: FUNGIBLE_TOKEN_CONTRACT,
            contractAddress: val.selectedAsset.contractId,
          });
        }
        selectedAssetDecimals.value = val.selectedAsset.decimals;
      }

      if (
        val.selectedAsset.contractId !== AETERNITY_CONTRACT_ID
        || (
          val.address && !checkAensName(val.address) && validateTipUrl(val.address)
        )
      ) {
        fee.value = calculateFee(
          SCHEMA.TX_TYPE.contractCall, {
            ...sdk.value.Ae.defaults,
            ttl: 0,
            nonce: nonce.value + 1,
            amount: (new BigNumber(val.amount > 0 ? val.amount : 0)).shiftedBy(MAGNITUDE),
            callerId: account.value.address,
            contractId: validateTipUrl(val.address)
              ? STUB_CONTRACT_ADDRESS
              : val.selectedAsset.contractId,
          },
        );
        return;
      }
      const minFee: BigNumber = new BigNumber(TxBuilder.calculateMinFee('spendTx', {
        gas: sdk.value.Ae.defaults.gas,
        params: {
          ...sdk.value.Ae.defaults,
          senderId: account.value.address,
          recipientId: account.value.address,
          amount: new BigNumber(val.amount > 0 ? val.amount : 0).shiftedBy(MAGNITUDE),
          ttl: 0,
          nonce: nonce.value + 1,
          payload: '',
        },
      })).shiftedBy(-MAGNITUDE);
      if (!minFee.isEqualTo(fee.value)) fee.value = minFee;
    },
    { deep: true },
  );

  onMounted(() => {
    updateTokenBalanceInterval = executeAndSetInterval(async () => {
      if (!tokenInstance.value) return;
      await watchUntilTruthy(() => store.state.sdk);
      selectedTokenBalance.value = new BigNumber(
        (await tokenInstance.value.methods.balance(account.value.address)).decodedResult,
      ).shiftedBy(-selectedAssetDecimals.value);
    }, 1000);

    updateNonceInterval = executeAndSetInterval(async () => {
      await watchUntilTruthy(() => store.state.sdk);
      try {
        nonce.value = (await sdk.value.api
          .getAccountByPubkey(account.value.address))?.nonce;
      } catch (error: any) {
        if (!error.message.includes('Account not found')) handleUnknownError(error);
      }
    }, 5000);
  });

  onBeforeUnmount(() => {
    clearInterval(updateTokenBalanceInterval);
    clearInterval(updateNonceInterval);
  });

  return {
    fee,
    selectedTokenBalance,
    tokenInstance,
    nonce,
    selectedAssetDecimals,
    account,
    max,
    balance,
    balanceCurrency,
  };
}