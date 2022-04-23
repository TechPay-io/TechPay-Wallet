<template>
    <div class="mmcustomtokenwindow">
        <f-window
            ref="win"
            modal
            style="max-width: 600px;"
            title="Add Custom Token"
            class="double-body-padding c-footer_"
            animation-in="scale-center-enter-active"
            animation-out="scale-center-leave-active"
            @window-hide="$emit('window-hide', $event)"
        >
            <m-m-custom-token-form @custom-token-form-data="onCustomTokenFormData" />
        </f-window>
    </div>
</template>

<script>
import FWindow from '@/components/core/FWindow/FWindow.vue';
import MMCustomTokenForm from '@/components/mm/MMCustomTokenForm/MMCustomTokenForm.vue';

export default {
    name: 'MMCustomTokenWindow',

    components: { MMCustomTokenForm, FWindow },

    methods: {
        show() {
            this.$refs.win.show();
        },

        /**
         * Called when `AccountSettingsForm` is submited.
         */
        onCustomTokenFormData(_data) {
            this.$emit('custom-token-form-data', _data);
            this.$refs.win.hide('fade-leave-active');
        },
    },
};
</script>
