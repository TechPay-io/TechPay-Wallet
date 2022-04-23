import { store } from '@/store';

export const SET_WALLETCONNECT_CHAIN_ID = 'setWalletConnectChainId';
export const SET_WALLETCONNECT_ACCOUNT = 'setWalletConnectAccount';

const walletConnectStore = {
    namespaced: true,

    state: {
        /** Currently selected chain id. */
        chainId: '0x0',
        /** Currently selected account. */
        account: '',
    },

    mutations: {
        /**
         * @param {Object} _state
         * @param {string} _chainId
         */
        [SET_WALLETCONNECT_CHAIN_ID](_state, _chainId) {
            _state.chainId = _chainId;
        },
        /**
         * @param {Object} _state
         * @param {string} _account
         */
        [SET_WALLETCONNECT_ACCOUNT](_state, _account) {
            _state.account = _account;
        },
    },
};

store.registerModule('walletConnect', walletConnectStore);
