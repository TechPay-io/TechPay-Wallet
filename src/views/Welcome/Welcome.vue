<template>
    <div class="welcome-view">
        <div class="intro">
            <h1>Welcome to TechPay Wallet</h1>
            <h2>Send, receive and stake your Photon TPC</h2>
        </div>

        <div class="view-account-main">
            <section :aria-labelledby="createId" class="main-buttons v2 collapse-md">
                <h2 :id="createId" class="not-visible">Connect, create or restore wallet</h2>

                <button class="btn ledger-accounts-btn large w100p" @click="onConnectWalletClick">
                    <icon data="@/assets/svg/connect.svg" width="32" height="32" aria-hidden="true" />
                    Connect Wallet
                </button>
                <button class="btn create-account-btn large w100p" @click="onCreateWalletClick">
                    <icon data="@/assets/svg/wallet.svg" width="32" height="32" :fill="false" aria-hidden="true" />
                    Create Wallet
                </button>
                <button class="btn restore-account-btn large w100p" @click="onRestoreWalletClick">
                    <icon data="@/assets/svg/key.svg" width="32" height="32" aria-hidden="true" />
                    Restore Wallet
                </button>
                <!--                <router-link :to="{ name: 'create-account' }" class="btn create-account-btn large w100p">
                    <icon data="@/assets/svg/wallet.svg" width="32" height="32" :fill="false" aria-hidden="true" />
                    Create Wallet
                </router-link>
                <router-link :to="{ name: 'restore-account' }" class="btn restore-account-btn large w100p">
                    <icon data="@/assets/svg/key.svg" width="32" height="32" aria-hidden="true" />
                    Restore Wallet
                </router-link>-->
                <!--                <router-link :to="{ name: 'ledger-accounts' }" class="btn ledger-accounts-btn large w100p">
                    Ledger
                </router-link>-->
            </section>

            <installation-info />
            <section :aria-labelledby="walletsId">
                <h2 :id="walletsId" class="not-visible">Wallet list</h2>
                <account-list />
            </section>

            <connect-wallet-window ref="connectWalletWindow" />
            <create-account-window ref="createAccountWindow" />
            <restore-account-window ref="restoreAccountWindow" />
        </div>
    </div>
</template>

<script>
import AccountList from '../../components/AccountList/AccountList.vue';
import InstallationInfo from '../../components/InstallationInfo/InstallationInfo.vue';
import ConnectWalletWindow from '@/components/windows/ConnectWalletWindow/ConnectWalletWindow.vue';
import { getUniqueId } from '@/utils';
import CreateAccountWindow from '@/components/windows/CreateAccountWindow/CreateAccountWindow.vue';
import RestoreAccountWindow from '@/components/windows/RestoreAccountWindow/RestoreAccountWindow.vue';

// import {WEIToTPC} from "../utils/transactions.js";
export default {
    name: 'Welcome',

    components: {
        RestoreAccountWindow,
        CreateAccountWindow,
        ConnectWalletWindow,
        InstallationInfo,
        AccountList,
    },

    data() {
        return {
            walletsId: getUniqueId(),
            createId: getUniqueId(),
        };
    },

    methods: {
        onConnectWalletClick() {
            this.$refs.connectWalletWindow.show();
        },

        onCreateWalletClick() {
            this.$refs.createAccountWindow.show();
        },

        onRestoreWalletClick() {
            this.$refs.restoreAccountWindow.show();
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
