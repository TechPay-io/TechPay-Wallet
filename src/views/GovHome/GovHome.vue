<template>
    <div class="view-gov-home">
        <h1 data-focus>Governance</h1>

        <gov-proposal-list />
    </div>
</template>

<script>
import GovProposalList from '@/components/data-tables/GovProposalList/GovProposalList.vue';
import { focusElem } from '@/utils/aria.js';

export default {
    name: 'GovHome',

    components: { GovProposalList },

    mounted() {
        focusElem(this.$el);
    },
};
</script>
