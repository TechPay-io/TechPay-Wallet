<template>
    <div class="stake-confirmation">
        <tx-confirmation
            :tx="tx"
            confirmation-comp-name="stake-confirmation"
            password-label="Please enter your wallet password to delegate your TPC"
            send-button-label="Delegate"
            :on-send-transaction-success="onSendTransactionSuccess"
            card-off
            :show-cancel-button="true"
            :window-mode="true"
            class="min-h-100"
            @cancel-button-click="$emit('cancel-button-click', $event)"
        >
            <h2 class="not-visible" data-focus>Delegate TPC</h2>

            <div class="transaction-info">
                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Validator</div>
                    <div class="col break-word">{{ stakeData.name }}, {{ parseInt(stakeData.id) }}</div>
                </div>

                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Send From</div>
                    <div class="col break-word">
                        {{ currentAccount.address }}
                        <span class="f-row-label">
                            ( {{ toTPC(currentAccount.balance) }} TPC
                            <template v-if="currentAccount.name">, {{ currentAccount.name }}</template> )
                        </span>
                    </div>
                </div>

                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Amount</div>
                    <div class="col break-word">{{ stakeData.amount }}</div>
                </div>
            </div>

            <template #window-content>
                <ledger-confirmation-content :to="stakeData.tx.to" :amount="stakeData.amount" :max-fee="tx._fee" />
            </template>
        </tx-confirmation>
    </div>
</template>

<script>
import { toTPC } from '../../utils/transactions.js';
import { mapGetters } from 'vuex';
import TxConfirmation from '../TxConfirmation/TxConfirmation.vue';
import LedgerConfirmationContent from '../LedgerConfirmationContent/LedgerConfirmationContent.vue';

export default {
    name: 'StakeConfirmation',

    components: { LedgerConfirmationContent, TxConfirmation },

    props: {
        /** Data sent from StakeForm component. Info about transaction, validator and amount of TPC. */
        stakeData: {
            type: Object,
            default() {
                return {};
            },
        },
        /** Increase delegation mode. */
        increaseDelegation: {
            type: Boolean,
            default: false,
        },
        /** Validator info. */
        stakerInfo: {
            type: Object,
            default() {
                return {};
            },
        },
        /** Name of previous component. */
        previousComponent: {
            type: String,
            default: 'staking-info',
        },
        /***/
        stakerId: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            tx: {},
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),
    },

    // activated() {
    mounted() {
        this.setTx();
    },

    methods: {
        setTx() {
            this.tx = this.stakeData.tx;
        },

        onSendTransactionSuccess(_data) {
            const stakerId = this.stakerId || this.stakeData.id;

            this.$emit('change-component', {
                to: 'staking-stake-form-success-message',
                from: 'stake-confirmation',
                data: {
                    tx: _data.data.sendTransaction.hash,
                    successMessage: 'Delegation Successful',
                    continueToParams: { stakerId },
                    continueTo: 'hide-window',
                    continueButtonLabel: 'Close',
                    cardOff: true,
                    windowMode: true,
                },
            });
        },

        toTPC,
    },
};
</script>
