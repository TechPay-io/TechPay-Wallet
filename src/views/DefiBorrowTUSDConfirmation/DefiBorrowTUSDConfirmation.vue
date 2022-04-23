<template>
    <div class="view-defi-borrow-tusd-confirmation">
        <defi-borrow-confirmation :params="params" :token="params.token" />
    </div>
</template>

<script>
import DefiBorrowConfirmation from '../../components/DefiBorrowConfirmation/DefiBorrowConfirmation.vue';

export default {
    name: 'DefiBorrowTUSDConfirmation',

    components: { DefiBorrowConfirmation },

    computed: {
        /**
         * @return {{debt: number, currDebt: number, address: string, steps: number, step: number}}
         */
        params() {
            const { $route } = this;

            return $route && $route.params ? $route.params : {};
        },
    },
};
</script>
