<template>
    <div class="mm-account-picker">
        <div v-if="!$mm.isInstalled()" class="mm-not-installed">
            Metamask is not installed. <br /><br />
            <button class="btn large" :disabled="installMMInProgress" @click="onInstallMMClick">
                Install Metamask <pulse-loader v-if="installMMInProgress" color="#fff"></pulse-loader>
            </button>
        </div>
        <template v-else>
            <div v-if="!accountExists">
                Would you like to add account <b>{{ dMMAccount }}</b> ?
            </div>
            <div v-else>
                Account <b>{{ dMMAccount }}</b> is already in your wallet list. Please, select another one.
            </div>
        </template>

        <div v-if="$mm.isInstalled()" class="form-buttons">
            <button v-show="!accountExists" class="btn large" @click="onAddAccountClick">Add Account</button>
            <button v-show="accountExists" class="btn large" @click="onOkClick">Ok</button>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { ADD_METAMASK_ACCOUNT } from '@/store/actions.type.js';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import MetaMaskOnboarding from '@metamask/onboarding';

export default {
    name: 'MMAccountPicker',

    components: { PulseLoader },

    props: {
        mmAccount: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            dMMAccount: '',
            installMMInProgress: false,
        };
    },

    computed: {
        ...mapState('mm', ['account']),

        ...mapGetters(['getAccountByAddress']),

        accountExists() {
            return this.getAccountByAddress(this.dMMAccount) && !this._closing;
        },
    },

    watch: {
        account(_account) {
            if (!this._closing) {
                if (_account) {
                    this.dMMAccount = this.$fWallet.toChecksumAddress(_account);
                } else {
                    this.$emit('mm-account-picker-cancel');
                }
            }
        },
    },

    created() {
        /** Helper. */
        this._closing = false;
        /** @type {MetaMaskOnboarding} */
        this._onboarding = null;

        if (this.mmAccount) {
            this.dMMAccount = this.$fWallet.toChecksumAddress(this.mmAccount);
        }
    },

    methods: {
        async onAddAccountClick() {
            this._closing = true;

            await this.$store.dispatch(ADD_METAMASK_ACCOUNT, this.dMMAccount);
            this.$router.push({ name: 'account-history', params: { address: this.dMMAccount } });
            this.$emit('mm-account-added');
        },

        onOkClick() {
            this.$emit('mm-account-picker-cancel');
        },

        onInstallMMClick() {
            this.installMMInProgress = true;
            this._onboarding = new MetaMaskOnboarding();
            this._onboarding.startOnboarding();
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
