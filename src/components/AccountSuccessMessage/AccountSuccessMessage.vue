<template>
    <div class="account-success-message">
        <h2 class="align-center" data-focus>You're all set!</h2>
        <p>{{ cMsgT }}</p>
        <router-link
            :to="{
                name: 'account-history',
                params: { address },
            }"
            class="btn large secondary"
        >
            Access your wallet
        </router-link>
    </div>
</template>

<script>
import { focusElem } from '@/utils/aria.js';

export default {
    components: {},

    props: {
        // created from restore account view
        restoreAccount: {
            type: Boolean,
            default: false,
        },
        // account address
        address: {
            type: String,
            default: '',
        },
    },

    computed: {
        cMsgT() {
            return this.restoreAccount
                ? 'You have successfully restored your wallet.'
                : 'You have successfully created your wallet.';
        },
    },

    mounted() {
        focusElem(this.$el);
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
