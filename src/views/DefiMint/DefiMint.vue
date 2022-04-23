<template>
    <div class="view-defi-mint">
        <h1 class="with-back-btn" data-focus="">
            Mint Synths
            <f-back-button :route-name="backButtonRoute" />
        </h1>

        <h2 class="perex">
            Mint synths with your locked collateral.
        </h2>

        <defi-borrow
            :token="params.token"
            :token-symbol="params.tokenSymbol || query.tokenSymbol"
            :token-address="params.tokenAddress || query.tokenAddress"
            borrow
            mint-repay-mode
            on-submit-route="defi-mint-confirmation"
        />
    </div>
</template>

<script>
import FBackButton from '@/components/core/FBackButton/FBackButton.vue';
import { getAppParentNode } from '@/app-structure.js';
import DefiBorrow from '@/components/DefiBorrow/DefiBorrow.vue';
import { focusElem } from '@/utils/aria.js';

export default {
    name: 'DefiMint',

    components: { DefiBorrow, FBackButton },

    computed: {
        /**
         * @return {{token: DefiToken}|{}}
         */
        params() {
            const { $route } = this;

            return $route && $route.params ? $route.params : {};
        },

        /**
         * @return {{token: DefiToken}|{}}
         */
        query() {
            const { $route } = this;

            return $route && $route.query ? $route.query : {};
        },

        backButtonRoute() {
            const parentNode = getAppParentNode('defi-mint');

            return parentNode ? parentNode.id : '';
        },
    },

    mounted() {
        focusElem(this.$el);
    },
};
</script>
