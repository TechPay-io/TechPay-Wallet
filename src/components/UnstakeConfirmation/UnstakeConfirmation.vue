<template>
    <div class="unstake-confirmation">
        <tx-confirmation
            :tx="tx"
            confirmation-comp-name="unstake-confirmation"
            send-button-label="Undelegate"
            password-label="Please enter your wallet password to undelegate your TPC"
            :on-send-transaction-success="onSendTransactionSuccess"
            :tmp-pwd-code="tmpPwdCode"
            card-off
            :show-cancel-button="true"
            :window-mode="true"
            class="min-h-100"
            @cancel-button-click="$emit('cancel-button-click', $event)"
        >
            <h2 class="not-visible" data-focus>Undelegate TPC - Confirmation</h2>

            <div class="transaction-info">
                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Validator</div>
                    <div class="col break-word">
                        {{ accountInfo.stakerInfo.stakerInfo.name }}, {{ parseInt(accountInfo.stakerInfo.id) }}
                    </div>
                </div>

                <div class="row no-collapse">
                    <div class="col-3 f-row-label">From</div>
                    <div class="col break-word">
                        {{ currentAccount.address }}
                        <span class="f-row-label">
                            ( <t-p-c-token-value :value="currentAccount.balance" convert /> )
                        </span>
                    </div>
                </div>

                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Undelegate Amount</div>
                    <div class="col break-word">{{ dAmount }}</div>
                </div>

                <f-message v-if="amountDiff > 0" type="warning"> {{ amountDiff }} TPC slashing applied </f-message>
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
import TxConfirmation from '../TxConfirmation/TxConfirmation.vue';
import { getRandomInt } from '../../utils';
import LedgerConfirmationContent from '../LedgerConfirmationContent/LedgerConfirmationContent.vue';
import FMessage from '@/components/core/FMessage/FMessage.vue';
import TPCTokenValue from '@/components/core/TPCTokenValue/TPCTokenValue.vue';

export default {
    name: 'UnstakeConfirmation',

    components: { TPCTokenValue, FMessage, LedgerConfirmationContent, TxConfirmation },

    props: {
        /** `accountInfo` object from `UnstakeTPC` component. */
        accountInfo: {
            type: Object,
            default() {
                return {};
            },
        },
        /** Amount of TPC tokens to unstake */
        amount: {
            type: Number,
            default: 1,
        },
        /** Amount of TPC tokens to unlock. (hex number) */
        toUnlockAmount: {
            type: String,
            default: '',
        },
        /** Unstake maximal amount of TPC tokens */
        undelegateMax: {
            type: Boolean,
            default: false,
        },
        /***/
        stakerId: {
            type: String,
            default: '',
        },
        /** */
        tmpPwdCode: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            tx: {},
            dAmount: this.amount,
            amountDiff: 0,
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        /**
         * Returns `true` if delegetion is still locked.
         *
         * @return {boolean}
         */
        isLocked() {
            const { accountInfo } = this;

            return (accountInfo && accountInfo.delegation && accountInfo.delegation.isDelegationLocked) || false;
        },

        lockExist() {
            return this.isLocked && !!this.toUnlockAmount;
        },
    },

    // activated() {
    mounted() {
        this.$emit('step', this.tmpPwdCode ? 3 : 2);
        this.setTx();
    },

    methods: {
        async setTx() {
            const stakerId = parseInt(this.stakerId, 16);
            let amount = this.undelegateMax ? this.accountInfo.amountDelegated : this.$fWallet.toWei(this.dAmount);
            const unlockedAmount = await this.$fWallet.fetchUnlockedAmount(this.currentAccount.address, this.stakerId);

            // amount is bigger than unlocked amount
            if (unlockedAmount && this.$defi.compareBN(amount, unlockedAmount) === 1) {
                amount = unlockedAmount;
                this.dAmount = this.$fWallet.fromWei(unlockedAmount);
                this.amountDiff = this.amount - this.dAmount;
            }

            // console.log(amount, unlockedAmount, this.amount, this.dAmount, this.amountDiff);

            this.tx = await this.$fWallet.getSFCTransactionToSign(
                sfcUtils.prepareToWithdrawDelegationPartTx(getRandomInt(), stakerId, amount),
                this.currentAccount.address
            );
        },

        onSendTransactionSuccess(_data) {
            this.$emit('change-component', {
                to: 'staking-unstake-confirmation-success-message',
                from: 'unstake-confirmation',
                data: {
                    tx: _data.data.sendTransaction.hash,
                    successMessage: 'Undelegation Successful',
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
    },
};
</script>
