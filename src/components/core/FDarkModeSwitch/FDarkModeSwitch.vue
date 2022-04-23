<template>
    <div class="f-dark-mode-switch">
        <f-toggle-button
            v-model="darkModeOn"
            :title="title"
            :aria-label="title"
            label="Dark Mode"
            :disabled="disabled"
            v-bind="$attrs"
        />
    </div>
</template>

<script>
import FToggleButton from '@/components/core/FToggleButton/FToggleButton.vue';
export default {
    name: 'FDarkModeSwitch',

    components: { FToggleButton },

    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            darkModeOn: this.$store.state.darkMode,
        };
    },

    computed: {
        title() {
            return this.darkModeOn ? 'Switch to light mode' : 'Switch to dark mode';
        },
    },

    watch: {
        darkModeOn(_value) {
            this.setDarkMode(_value);
        },

        disabled(value) {
            if (!value) {
                this.setDarkMode(this.darkModeOn);
            }
        },
    },

    methods: {
        setDarkMode(on) {
            const appNode = this.$root.$children[0];

            if (appNode) {
                appNode.setDarkMode(on);
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
