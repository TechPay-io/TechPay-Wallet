<template>
    <div class="blockchain-picker-form">
        <h2 class="with-back-btn align-center" data-focus>
            Send Photon TPC
        </h2>

        <f-card class="f-card-double-padding">
            <h3 :id="labelId" class="align-center">Which blockchain are you sending TPC to?</h3>

            <div class="bc-picker">
                <f-form ref="form" :aria-labelledby="labelId" center-form @f-form-submit="onFormSubmit">
                    <blockchain-picker />

                    <div class="align-center form-buttons">
                        <button type="submit" class="btn large break-word" style="max-width: 100%;">
                            Continue
                        </button>
                    </div>
                </f-form>
            </div>
        </f-card>
    </div>
</template>

<script>
import FCard from '../core/FCard/FCard.vue';
// import { SET_SEND_DIRECTION } from '../../store/mutations.type.js';
import FForm from '../core/FForm/FForm.vue';
import BlockchainPicker from '../BlockchainPicker/BlockchainPicker.vue';
import { focusElem } from '@/utils/aria.js';
import { getUniqueId } from '@/utils';
import { viewHelpersMixin } from '@/mixins/view-helpers.js';

export default {
    name: 'BlockchainPickerForm',

    components: { BlockchainPicker, FForm, FCard },

    mixins: [viewHelpersMixin],

    data() {
        return {
            labelId: getUniqueId(),
        };
    },

    mounted() {
        focusElem(this.$el);
    },

    methods: {
        onFormSubmit(_event) {
            const { data } = _event.detail;
            let direction = '';

            if (data.blockchain) {
                switch (data.blockchain) {
                    case 'photon':
                        direction = 'PhotonToPhoton';
                        break;
                    case 'binance':
                        direction = 'PhotonToBinance';
                        break;
                    case 'ethereum':
                        direction = 'PhotonToEthereum';
                        break;
                }

                this.$router.push({
                    name: 'account-send-transaction-form',
                    params: {
                        sendDirection: direction,
                    },
                });
            }
        },
    },
};
</script>

<style scoped></style>
