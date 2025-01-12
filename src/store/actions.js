import { flatten, orderBy } from 'lodash-es';
import TIPPING_V1_INTERFACE from 'tipping-contract/Tipping_v1_Interface.aes';
import TIPPING_V2_INTERFACE from 'tipping-contract/Tipping_v2_Interface.aes';
import { SCHEMA } from '@aeternity/aepp-sdk';
import camelcaseKeysDeep from 'camelcase-keys-deep';
import {
  fetchJson,
  postJson,
  handleUnknownError,
  isAccountNotFoundError,
  watchUntilTruthy,
  fetchRespondChallenge,
} from '../popup/utils';
import { i18n } from './plugins/languages';
import { useMiddleware, useModals } from '../composables';

export default {
  switchNetwork({ commit }, payload) {
    commit('switchNetwork', payload);
    commit('initTransactions');
  },

  async selectNetwork({ dispatch, getters }, network) {
    await dispatch('switchNetwork', network);
    if (!getters.tippingSupported) {
      const { openDefaultModal } = useModals();
      await openDefaultModal({
        title: i18n.t('modals.tip-mainnet-warning.title'),
        msg: i18n.t('modals.tip-mainnet-warning.msg'),
      });
    }
  },
  addPendingTransaction({ getters: { activeNetwork }, commit }, transaction) {
    commit('addPendingTransaction', {
      network: activeNetwork.networkId,
      transaction: { ...transaction, microTime: Date.now(), pending: true },
    });
  },
  async fetchPendingTransactions(
    { state: { transactions }, getters }, address,
  ) {
    const sdk = await watchUntilTruthy(() => getters['sdkPlugin/sdk']);
    return (
      await sdk.api.getPendingAccountTransactionsByPubkey(address).then(
        (r) => r.transactions,
        (error) => {
          if (!isAccountNotFoundError(error)) {
            handleUnknownError(error);
          }
          return [];
        },
      )
    )
      .filter((transaction) => !transactions.pending[getters.activeNetwork.networkId]
        ?.find((tx) => tx?.hash === transaction?.hash))
      .map((transaction) => ({ ...transaction, pending: true }));
  },
  async fetchTipWithdrawnTransactions(
    { state, getters, commit },
    {
      recent, limit = 5, address, multipleAccounts,
    },
  ) {
    if (state?.transactions?.tipWithdrawnTransactions?.length && !recent) {
      return state.transactions.tipWithdrawnTransactions;
    }
    const response = await fetchJson(
      `${getters.activeNetwork.backendUrl}/cache/events/?address=${address}&event=TipWithdrawn${recent ? `&limit=${limit}` : ''}`,
    );
    if (response.message) return [];
    const tipWithdrawnTransactions = response.map(({
      amount, contract, height, data: { tx }, ...t
    }) => ({
      tx: {
        ...tx,
        address,
        amount,
        contractId: contract,
        type: SCHEMA.TX_TYPE.contractCall,
      },
      ...t,
      microTime: new Date(t.createdAt).getTime(),
      blockHeight: height,
      claim: true,
    }));
    if (!multipleAccounts) {
      commit('setTipWithdrawnTransactions', tipWithdrawnTransactions);
    }
    return tipWithdrawnTransactions;
  },
  async fetchTransactions(context, { limit, recent, address }) {
    const {
      state, getters, dispatch, commit,
    } = context;
    if (state.transactions.nextPageUrl === null && !recent) {
      return;
    }

    const { getMiddleware, fetchFromMiddleware } = useMiddleware({ store: context });
    const middleware = await getMiddleware();

    let txs = await Promise.all([
      (recent || state.transactions.nextPageUrl === ''
        ? middleware.getTxByAccount(address, limit, 1)
        : fetchFromMiddleware(state.transactions.nextPageUrl))
        .then(({ data, next }) => {
          const result = recent || state.transactions.nextPageUrl === '' ? data : camelcaseKeysDeep(data);
          if (!recent) commit('setTransactionsNextPage', next);
          return result;
        })
        .catch(() => []),
      dispatch('fetchPendingTransactions', address),
    ]);

    const minMicroTime = Math.min.apply(null, flatten(txs).map((tx) => tx.microTime));
    const amountOfTx = flatten(txs).length;
    flatten(await Promise.all([dispatch('fungibleTokens/getTokensHistory', { recent, address }),
      dispatch('fetchTipWithdrawnTransactions', { recent, address })]))
      .forEach((f) => {
        if (minMicroTime < f.microTime || (amountOfTx === 0 && minMicroTime > f.microTime)) {
          txs[0].push(f);
        }
      });
    txs = orderBy(flatten(txs), ['microTime'], ['desc']);
    txs = txs.map((tx) => ({ ...tx, transactionOwner: address }));
    const network = getters.activeNetwork.networkId;
    if (state.transactions.pending[network]) {
      state.transactions.pending[network].forEach(({ hash }) => {
        if (txs.some((tx) => tx.hash === hash && !tx.pending)) {
          commit('removePendingTransactionByHash', { hash, network });
        }
      });
    }

    commit('addTransactions', recent ? txs.slice(0, limit) : txs);
  },
  async claimTips({ getters: { activeNetwork } }, { url, address }) {
    return postJson(`${activeNetwork.backendUrl}/claim/submit`, { body: { url, address } });
  },
  async cacheInvalidateOracle({ getters: { activeNetwork } }) {
    return fetchJson(`${activeNetwork.backendUrl}/cache/invalidate/oracle`);
  },
  async cacheInvalidateTips({ getters: { activeNetwork } }) {
    return fetchJson(`${activeNetwork.backendUrl}/cache/invalidate/tips`);
  },
  async cacheInvalidateFT({ getters: { activeNetwork } }, contract) {
    return fetchJson(`${activeNetwork.backendUrl}/cache/invalidate/token/${contract}`);
  },
  async donateError({ getters: { activeNetwork } }, error) {
    return postJson(`${activeNetwork.backendUrl}/errorreport`, { body: error });
  },
  async sendTipComment(
    { getters: { activeNetwork, 'sdkPlugin/sdk': sdk } },
    [tipId, text, author, parentId],
  ) {
    const sendComment = async (postParam) => postJson(`${activeNetwork.backendUrl}/comment/api/`, { body: postParam });

    const responseChallenge = await sendComment({
      tipId, text, author, parentId,
    });
    const respondChallenge = await fetchRespondChallenge(sdk, responseChallenge);

    return sendComment(respondChallenge);
  },
  async getCacheChainNames({ getters: { activeNetwork } }) {
    return fetchJson(`${activeNetwork.backendUrl}/cache/chainnames`);
  },
  async getCacheTip({ getters: { activeNetwork } }, id) {
    return fetchJson(`${activeNetwork.backendUrl}/tips/single/${id}`);
  },
  async initTippingContractInstances({
    getters: { 'sdkPlugin/sdk': sdk, activeNetwork, tippingSupported },
    commit,
  }) {
    if (!tippingSupported && !process.env.RUNNING_IN_TESTS) return;

    const [
      contractInstanceV1,
      contractInstanceV2,
    ] = await Promise.all([
      sdk.getContractInstance({
        source: TIPPING_V1_INTERFACE,
        contractAddress: activeNetwork.tipContractV1,
      }),
      activeNetwork.tipContractV2
        ? sdk.getContractInstance({
          source: TIPPING_V2_INTERFACE,
          contractAddress: activeNetwork.tipContractV2,
        })
        : null,
    ]);

    commit('setTipping', [contractInstanceV1, contractInstanceV2]);
  },
  async share(_, options) {
    await (process.env.IS_CORDOVA
      ? new Promise((resolve) => window.plugins.socialsharing.shareW3C(
        options,
        ({ app }) => app && resolve(),
      ))
      : navigator.share(options));
  },
};
