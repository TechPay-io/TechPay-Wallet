<template>
    <section class="f-uniswap-pools" :aria-labelledby="labelId">
        <h2 :id="labelId" class="not-visible" data-focus>Pools</h2>

        <pairs-list />
    </section>
</template>

<script>
import PairsList from '@/components/data-tables/funi/PairsList/PairsList.vue';
import { getUniqueId } from '@/utils';
import { focusElem } from '@/utils/aria.js';

export default {
    name: 'FUniswapPools',

    components: { PairsList },

    data() {
        return {
            labelId: getUniqueId(),
        };
    },

    mounted() {
        focusElem(this.$el);
    },
};
</script>
