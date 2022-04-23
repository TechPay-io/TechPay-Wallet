<template>
    <f-window
        ref="win"
        modal
        title="Add Metamask Account"
        style="max-width: 560px;"
        animation-in="scale-center-enter-active"
        animation-out="scale-center-leave-active"
        @window-hide="$emit('window-hide', $event)"
    >
        <m-m-account-picker
            :mm-account="mmAccount"
            @mm-account-picker-cancel="onMMAccountPickerCancel"
            @mm-account-added="onMMAccountAdded"
        />
    </f-window>
</template>

<script>
import FWindow from '@/components/core/FWindow/FWindow.vue';
import MMAccountPicker from '@/components/mm/MMAccountPicker/MMAccountPicker.vue';

export default {
    name: 'MMAccountPickerWindow',

    components: { MMAccountPicker, FWindow },

    props: {
        mmAccount: {
            type: String,
            default: '',
        },
    },

    methods: {
        show() {
            this.$refs.win.show();
        },

        onMMAccountPickerCancel() {
            this.$refs.win.hide();
        },

        onMMAccountAdded() {
            this.$refs.win.hide();
        },
    },
};
</script>
