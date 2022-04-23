<template>
    <span class="f-account-t-amount" :class="cClass">
        <template v-if="!cIsZero"><template v-if="cReceived">+</template><template v-else>-</template></template>
        <f-token-value :value="amount" :decimals="filtersOptions.fractionDigits" :use-placeholder="false" no-currency />
    </span>
</template>

<script>
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';
import { filtersOptions } from '@/filters.js';

/**
 * Formatter for account transaction amount
 */
export default {
    components: { FTokenValue },
    props: {
        // account address
        address: {
            type: String,
            default: '',
        },
        // transaction's 'from' address
        from: {
            type: String,
            default: '',
        },
        // transaction's 'to' address
        to: {
            type: String,
            default: '',
        },
        // transaction's amount
        amount: {
            type: [String, Number],
            default: '',
        },
        // zero amount
        zero: {
            type: String,
            default: '0.00',
        },
    },

    data() {
        return {
            filtersOptions,
        };
    },

    computed: {
        cReceived() {
            return this.address.toLocaleLowerCase() === this.to.toLocaleLowerCase();
        },

        cIsZero() {
            return this.amount === 0;
            // return this.amount === this.zero;
        },

        cClass() {
            let clas = '';

            if (!this.cIsZero) {
                clas = this.cReceived ? 'received' : 'sent';
            }

            return clas;
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
