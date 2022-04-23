<template>
    <div class="dashboard-header">
        <h1 data-focus>Home</h1>
        <header>
            <dashboard-info-box />
        </header>
    </div>
</template>

<script>
import DashboardInfoBox from '../DashboardInfoBox/DashboardInfoBox.vue';
import { focusElem } from '@/utils/aria.js';

export default {
    name: 'DashboardHeader',

    components: { DashboardInfoBox },

    mounted() {
        focusElem(this.$el);
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
