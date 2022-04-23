import appConfig from '../../../app.config.js';
// import Web3 from 'web3';
import WC from '@walletconnect/client';
import { store } from '@/store';
import { SET_WALLETCONNECT_ACCOUNT, SET_WALLETCONNECT_CHAIN_ID } from '@/plugins/walletconnect/store.js';
const PHOTON_CHAIN_ID = appConfig.chainId;
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal';

/** @type {WalletConnect} */
export let walletConnect = null;

/**
 * Plugin for communication with WalletConnect.
 */
export class WalletConnect {
    /**
     * @param {Vue} _Vue
     */
    static install(_Vue) {
        if (!walletConnect) {
            walletConnect = new WalletConnect();
            _Vue.prototype.$walletConnect = walletConnect;
        }
    }

    constructor() {
        this.selectedAddress = '';
        this.chainId = '';

        /**
         * WalletConnect provider.
         *
         * @type {null}
         * @private
         */
        this._provider = null;
        this._walletConnect = null;
        this._initialized = false;
        this._web3 = null;

        this.init();
    }

    async init() {
        if (!this._initialized && !appConfig.isChromeExtension) {
            this._walletConnect = new WC({
                bridge: 'https://bridge.walletconnect.org',
                qrcodeModal: WalletConnectQRCodeModal,
            });

            console.log(this._walletConnect);

            /*if (!this._walletConnect.connected) {
                await this._walletConnect.createSession({
                    chainId: 250,
                });
            }*/

            this._walletConnect.on('session_update', (error, payload) => {
                if (error) {
                    throw error;
                }

                // Get updated accounts and chainId
                const { accounts, chainId } = payload.params[0];

                console.log('session_update', accounts, chainId);

                this.onSessionUpdate(accounts, chainId);
            });

            this._walletConnect.on('disconnect', (error, payload) => {
                if (error) {
                    throw error;
                }

                console.log('disconnect', payload);

                this._setChainId(0);
                this._setAccount('');
                window.location.reload();
            });

            if (this._walletConnect.connected) {
                const { chainId, accounts } = this._walletConnect;
                this.onSessionUpdate(accounts, chainId);
            }
        }

        this._initialized = true;
    }

    onSessionUpdate(accounts, chainId) {
        this._setAccount(accounts[0] || '');
        this._setChainId(chainId);

        console.log('onSessionUpdate', this.selectedAddress, chainId);
    }

    async connect() {
        const { accounts, chainId } = await this._walletConnect.connect({
            chainId: 250,
            rpcUrl: appConfig.mainnet.rpc,
        });

        this._setAccount(accounts[0]);
        this._setChainId(chainId);

        console.log('connectint WalletConnect', accounts, chainId);

        return accounts;
    }

    disconnect() {
        console.log('disconnect walletconnect');

        if (this._walletConnect) {
            this._walletConnect.killSession();
        }
    }

    /**
     * @return {boolean}
     */
    isCorrectChainId(chainId) {
        return this.chainId === (chainId || parseInt(PHOTON_CHAIN_ID, 16));
    }

    /**
     * @return {Promise<[]>}
     */
    /*async getAccounts() {
        let accounts = [];

        if (this._provider) {
            try {
                accounts = await this._provider.request({ method: 'eth_accounts' });
            } catch (_error) {
                console.error(_error);
            }
        }

        return accounts;
    }*/

    async signTransaction(_tx, _address) {
        _tx.from = _address;

        if (!this.selectedAddress) {
            await this.connect();
        }

        // return await this._walletConnect.signTransaction(tmpTx);
        return await this._walletConnect.sendTransaction(_tx);
    }

    /**
     * @param {string} _chainId Hex number.
     * @private
     */
    _setChainId(_chainId) {
        this.chainId = _chainId;
        console.log('_setChainId', _chainId);
        store.commit(`walletConnect/${SET_WALLETCONNECT_CHAIN_ID}`, _chainId);
    }

    _setAccount(account) {
        this.selectedAddress = account;
        console.log('_setAccount', this.selectedAddress);
        store.commit(`walletConnect/${SET_WALLETCONNECT_ACCOUNT}`, this.selectedAddress);
    }
}
