<template>
    <div class="connect-wallet-window">
        <f-window
            ref="win"
            modal
            title="Connect Wallet"
            class="connect-wallet-f-window"
            animation-in="scale-center-enter-active"
            animation-out="scale-center-leave-active"
            @window-hide="$emit('window-hide', $event)"
        >
            <wallet-list @wallet-picked="onWalletPicked" />
        </f-window>

        <ledger-accounts-window ref="ledgerAccountsWindow" />
        <coinbase-wallet-notice-window v-if="showCBWindow" ref="coinbaseNoticeWindow" />
    </div>
</template>

<script>
import FWindow from '@/components/core/FWindow/FWindow.vue';
import LedgerAccountsWindow from '@/components/windows/LedgerAccountsWindow/LedgerAccountsWindow.vue';
import WalletList from '@/components/WalletList/WalletList.vue';
import { ADD_COINBASE_ACCOUNT, ADD_WALLETCONNECT_ACCOUNT } from '@/store/actions.type.js';
import CoinbaseWalletNoticeWindow from '@/components/windows/CoinbaseWalletNoticeWindow/CoinbaseWalletNoticeWindow.vue';
import { mapGetters, mapState } from 'vuex';

export default {
    name: 'ConnectWalletWindow',

    components: { CoinbaseWalletNoticeWindow, WalletList, LedgerAccountsWindow, FWindow },

    data() {
        return {
            showCBWindow: false,
        };
    },

    computed: {
        ...mapState('walletConnect', {
            walletConnectAccount: 'account',
        }),

        ...mapGetters(['currentAccount']),
    },

    methods: {
        show() {
            this.$refs.win.show();
        },

        async onWalletPicked(_wallet) {
            // this.$walletlink.disconnect();

            if (_wallet.code === 'mm') {
                // root node (App.vue)
                const appNode = this.$root.$children[0];

                if (!this.$mm.isInstalled()) {
                    appNode.showMMAccountPickerWindow('');
                    this.$refs.win.hide('fade-leave-active');
                    return;
                }

                try {
                    const accounts = await this.$mm.requestAccounts();

                    if (accounts && appNode) {
                        appNode.showMMAccountPickerWindow(accounts[0]);
                    }

                    this.$refs.win.hide('fade-leave-active');
                } catch (_error) {
                    console.log('!!', _error);
                }
            } else if (_wallet.code === 'ledger') {
                this.$refs.win.hide('fade-leave-active');
                this.$refs.ledgerAccountsWindow.show();
            } else if (_wallet.code === 'coinbase') {
                try {
                    const accounts = await this.$walletlink.connect();
                    await this.$store.dispatch(ADD_COINBASE_ACCOUNT, accounts[0]);

                    if (!this.$walletlink.isCorrectChainId()) {
                        this.$refs.win.hide('fade-leave-active');
                        this.showCBWindow = true;
                        this.$nextTick(() => {
                            this.$refs.coinbaseNoticeWindow.show();
                        });
                    } else {
                        this.$router.push({ name: 'account-history', params: { address: accounts[0] } });
                    }
                } catch (err) {
                    console.error(err);
                }
            } else if (_wallet.code === 'walletConnect') {
                try {
                    if (
                        this.currentAccount &&
                        this.currentAccount.address.toLowerCase() === this.walletConnectAccount.toLowerCase()
                    ) {
                        this.$walletConnect.disconnect();
                    } else {
                        const accounts = await this.$walletConnect.connect();
                        await this.$store.dispatch(ADD_WALLETCONNECT_ACCOUNT, accounts[0]);

                        this.$router.push({ name: 'account-history', params: { address: accounts[0] } });
                    }

                    /*if (!this.$walletConnect.isCorrectChainId()) {
                        this.$refs.win.hide('fade-leave-active');
                        this.showCBWindow = true;
                        this.$nextTick(() => {
                            this.$refs.coinbaseNoticeWindow.show();
                        });
                    } else {
                        this.$router.push({ name: 'account-history', params: { address: accounts[0] } });
                    }*/
                } catch (err) {
                    console.error(err);
                }
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
