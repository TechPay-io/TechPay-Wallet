<template>
    <div class="delegation-unlock-confirmation">
        <tx-confirmation
            :tx="tx"
            confirmation-comp-name="delegation-unlock-confirmation"
            send-button-label="Unlock"
            password-label="Please enter your wallet password to unlock your delegated TPC"
            set-tmp-pwd
            :tmp-pwd-code="tmpPwdCode"
            :on-send-transaction-success="onSendTransactionSuccess"
            card-off
            :show-cancel-button="true"
            :window-mode="true"
            class="min-h-100"
            @cancel-button-click="$emit('cancel-button-click', $event)"
        >
            <h2 class="not-visible" data-focus>Unlock TPC - Confirmation</h2>

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
                    <div class="col-3 f-row-label">Unlock Amount</div>
                    <div class="col break-word">{{ cToUnlockAmount }}</div>
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
import TxConfirmation from '../TxConfirmation/TxConfirmation.vue';
import LedgerConfirmationContent from '../LedgerConfirmationContent/LedgerConfirmationContent.vue';
import { getUniqueId } from '@/utils';
import TPCTokenValue from '@/components/core/TPCTokenValue/TPCTokenValue.vue';
import appConfig from '../../../app.config.js';

export default {
    name: 'DelegationUnlockConfirmation',

    components: { TPCTokenValue, LedgerConfirmationContent, TxConfirmation },

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
        /** Unlock maximal amount of TPC tokens */
        undelegateMax: {
            type: Boolean,
            default: false,
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
            tmpPwdCode: '',
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        cToUnlockAmount() {
            return (this.toUnlockAmount && this.$fWallet.fromWei(this.toUnlockAmount)) || 0;
        },
    },

    // activated() {
    mounted() {
        this.$emit('step', 2);
        this.setTx();
    },

    methods: {
        async setTx() {
            const stakerId = parseInt(this.stakerId, 16);
            // let amount = this.$fWallet.toWei(this.amount);
            let amount = this.toUnlockAmount;
            // console.log(this.amount, this.undelegateMax, amount, this.toUnlockAmount);

            this.tmpPwdCode = getUniqueId();

            if (this.$defi.compareBN(amount, this.accountInfo.amountDelegated) === 1) {
                amount = this.accountInfo.amountDelegated;
            }

            this.tx = await this.$fWallet.getSFCTransactionToSign(
                sfcUtils.unlockDelegationTx(stakerId, amount),
                this.currentAccount.address
            );
        },

        onSendTransactionSuccess(_data) {
            this.$emit('change-component', {
                to: 'staking-delegation-unlock-confirmation-success-message',
                from: 'delegation-unlock-confirmation',
                data: {
                    tx: _data.data.sendTransaction.hash,
                    successMessage: 'Unlock Successful',
                    continueToParams: {
                        accountInfo: this.accountInfo,
                        amount: this.amount,
                        toUnlockAmount: this.toUnlockAmount,
                        undelegateMax: this.undelegateMax,
                        stakerId: this.stakerId,
                        tmpPwdCode: this.tmpPwdCode,
                    },
                    continueTo: 'unstake-confirmation',
                    continueButtonLabel: 'Next Step',
                    cardOff: true,
                    windowMode: true,
                    autoContinueToAfter: appConfig.settings.autoContinueToAfter,
                },
            });
        },
    },
};
</script>
