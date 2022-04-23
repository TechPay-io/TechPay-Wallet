<template>
    <div class="delegation-lock-confirmation">
        <tx-confirmation
            :tx="tx"
            confirmation-comp-name="delegation-lock-confirmation"
            send-button-label="Lock"
            password-label="Please enter your wallet password to lock delegation"
            :on-send-transaction-success="onSendTransactionSuccess"
            card-off
            :show-cancel-button="true"
            :window-mode="true"
            class="min-h-100"
            @cancel-button-click="$emit('cancel-button-click', $event)"
        >
            <h2 class="not-visible" data-focus>Lock Delegation - Confirmation</h2>

            <div class="transaction-info">
                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Validator</div>
                    <div class="col break-word">{{ validatorName }}, {{ stakerId | formatHexToInt }}</div>
                </div>

                <div class="row no-collapse">
                    <div class="col-3 f-row-label">From</div>
                    <div class="col break-word">
                        {{ currentAccount.address }}
                        <!--<span class="f-row-label">( {{ toTPC(currentAccount.balance) }} TPC )</span>-->
                    </div>
                </div>

                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Lock Delegation Until</div>
                    <div class="col break-word">{{ lockedUntil }} ({{ lockedUntilDays }} days)</div>
                </div>
            </div>

            <template #window-content>
                <ledger-confirmation-content :to="tx.to" :amount="0" :max-fee="tx._fee" />
            </template>
        </tx-confirmation>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import sfcUtils from 'techpay-ledgerjs/src/sfc-utils.js';
import TxConfirmation from '@/components/TxConfirmation/TxConfirmation.vue';
import LedgerConfirmationContent from '@/components/LedgerConfirmationContent/LedgerConfirmationContent.vue';
import { toTPC } from '@/utils/transactions.js';
import { formatDate, timestampToDate } from '@/filters.js';
import { toBigNumber, toHex } from '@/utils/big-number.js';

/** Day in seconds. */
const dayS = 86400;

export default {
    name: 'DelegationLockConfirmation',

    components: { LedgerConfirmationContent, TxConfirmation },

    props: {
        /***/
        stakerId: {
            type: String,
            default: '',
        },
        /***/
        lockDuration: {
            type: Number,
            default: 0,
        },
        /** Delegation amount to be locked */
        amount: {
            type: Number,
            default: 0,
        },
        /** Total delegation amount (in hex) */
        amountHex: {
            type: String,
            default: '',
        },
        /** Lock maximal delegation amount */
        max: {
            type: Boolean,
            default: false,
        },
        extendLock: {
            type: Boolean,
            default: false,
        },
        delegationLockDuration: {
            type: Number,
            default: 0,
        },
    },

    data() {
        return {
            tx: {},
            validator: null,
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        /**
         * @return {string} Formatted date.
         */
        lockedUntil() {
            return formatDate(timestampToDate(this.now() + this.lockDuration));
        },

        lockedUntilDays() {
            return Math.round(this.lockDuration / dayS);
        },

        validatorName() {
            const { validator } = this;

            return validator && validator.stakerInfo && validator.stakerInfo.name
                ? validator.stakerInfo.name
                : 'Unknown';
        },
    },

    mounted() {
        this.init();
    },

    methods: {
        async init() {
            this.validator = await this.$fWallet.getStakerById(this.stakerId);

            this.setTx();
        },

        async setTx() {
            const stakerId = parseInt(this.stakerId, 16);

            if (this.extendLock) {
                let { lockDuration } = this;

                if (this.extendLock && lockDuration < this.delegationLockDuration) {
                    lockDuration = this.delegationLockDuration;
                }

                this.tx = await this.$fWallet.getSFCTransactionToSign(
                    sfcUtils.relockDelegationTx(stakerId, lockDuration, 0),
                    this.currentAccount.address
                );
            } else {
                let bAmount = toBigNumber(this.$fWallet.toWei(this.amount));
                let bDlgAmount = toBigNumber(this.amountHex);

                if (bAmount.comparedTo(bDlgAmount.times(0.9995)) === 1) {
                    bAmount = bDlgAmount;
                }

                this.tx = await this.$fWallet.getSFCTransactionToSign(
                    sfcUtils.lockupDelegationTx(stakerId, this.lockDuration, toHex(bAmount)),
                    this.currentAccount.address
                );
            }
        },

        /**
         * Get current timestamp in seconds.
         *
         * @return {number}
         */
        now() {
            return Math.floor(new Date().getTime() / 1000);
        },

        onSendTransactionSuccess(_data) {
            this.$emit('change-component', {
                to: 'staking-delegation-lock-confirmation-success-message',
                from: 'delegation-lock-confirmation',
                data: {
                    tx: _data.data.sendTransaction.hash,
                    successMessage: 'Delegation Lock Successful',
                    continueToParams: {
                        stakerId: this.stakerId,
                    },
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
