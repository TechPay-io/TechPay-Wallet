<template>
    <div>
        <h2 class="align-center" data-focus>Receive Photon TPC</h2>

        <f-card class="receive-coins f-card-double-padding">
            <h3 :id="labelId" class="align-center">Which blockchain are you receiving TPC from?</h3>

            <blockchain-picker
                disable-e-t-h
                disable-b-n-b
                :aria-labelledby="labelId"
                @blockchain-pick="onBlockchainPick"
            />

            <component
                :is="currentComponent"
                v-bind="currentComponentProperties"
                @change-component="onChangeComponent"
            ></component>
        </f-card>
    </div>
</template>

<script>
import FCard from '../core/FCard/FCard.vue';
import BlockchainPicker from '../BlockchainPicker/BlockchainPicker.vue';
import ReceiveTPC from './ReceiveTPC.vue';
import ReceiveBNB from './ReceiveBNB.vue';
import ReceiveETH from './ReceiveETH.vue';
import TransactionCompleting from '../TransactionCompleting/TransactionCompleting.vue';
import { eventBusMixin } from '../../mixins/event-bus.js';
import { focusElem } from '@/utils/aria.js';
import { getUniqueId } from '@/utils';

const DEFAULT_COMPONENT = 'receive-t-p-c';

export default {
    name: 'ReceiveCoins',

    components: { BlockchainPicker, FCard, ReceiveTPC, ReceiveBNB, ReceiveETH, TransactionCompleting },

    mixins: [eventBusMixin],

    props: {
        /** Start verify TPC account in ReceiveTPC component */
        verifyAccount: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            currentComponent: DEFAULT_COMPONENT,
            labelId: getUniqueId(),
            // keepAliveExclude: 'BlockchainPicker',
        };
    },

    computed: {
        currentComponentProperties() {
            switch (this.currentComponent) {
                case 'receive-t-p-c':
                    return {
                        verifyAccount: this.verifyAccount,
                    };
                case 'transaction-completing':
                    return {
                        receive: true,
                        tokenSwapData: this._data_,
                    };
                default:
                    return null;
            }
        },
    },

    created() {
        // temporary data
        this._data_ = null;

        this._eventBus.on('account-picked', this.onAccountPicked);
    },

    mounted() {
        focusElem(this.$el);
    },

    methods: {
        /**
         * @param {('photon'|'binance'|'ethereum')} _blockchain
         */
        onBlockchainPick(_blockchain) {
            switch (_blockchain) {
                case 'photon':
                    this.currentComponent = 'ReceiveTPC';
                    break;
                case 'binance':
                    this.currentComponent = 'ReceiveBNB';
                    break;
                case 'ethereum':
                    this.currentComponent = 'ReceiveETH';
                    break;
            }
        },

        /**
         * @param {Object} _data
         */
        onChangeComponent(_data) {
            this._data_ = _data.data;

            this.currentComponent = _data.to;

            this.$nextTick(() => {
                this._data_ = null;
            });
        },

        onAccountPicked() {
            const { currentComponent } = this;

            this.currentComponent = '';
            this.$nextTick(() => {
                this.currentComponent = currentComponent;
            });
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
