<template>
    <div class="defi-repay-stpc-confirmation">
        <tx-confirmation
            v-if="hasCorrectParams"
            :tx="tx"
            send-button-label="Submit"
            set-tmp-pwd
            :tmp-pwd-code="d_tmpPwdCode"
            :password-label="passwordLabel"
            :on-send-transaction-success="onSendTransactionSuccess"
            card-off
            :show-cancel-button="true"
            :window-mode="true"
            class="min-h-100"
            @cancel-button-click="$emit('cancel-button-click', $event)"
        >
            <h2 class="not-visible" data-focus>
                <span>
                    Repay sTPC - Confirmation
                    <span class="f-steps">
                        <b>{{ d_step }}</b> / 2
                    </span>
                </span>
            </h2>

            <div class="confirmation-info" tabindex="0" data-focus>
                <template v-if="d_step === 1"
                    >You’re allowing {{ parseFloat(dOutstandingSTPC).toFixed(2) }} sTPC</template
                >
                <template v-else>You’re repaying {{ parseFloat(dOutstandingSTPC).toFixed(2) }} sTPC</template>
            </div>

            <template #window-content>
                <ledger-confirmation-content :to="tx.to" :amount="0" :max-fee="tx._fee" />
            </template>
        </tx-confirmation>
        <template v-else>
            <f-message type="info" role="alert" class="big"> Bad parameters. </f-message>
        </template>
    </div>
</template>

<script>
import TxConfirmation from '@/components/TxConfirmation/TxConfirmation.vue';
import LedgerConfirmationContent from '@/components/LedgerConfirmationContent/LedgerConfirmationContent.vue';
import FMessage from '@/components/core/FMessage/FMessage.vue';
import { mapGetters } from 'vuex';
// import { viewHelpersMixin } from '@/mixins/view-helpers.js';
import { getUniqueId, toKebabCase } from '@/utils';
import sfcUtils from 'techpay-ledgerjs/src/sfc-utils.js';
import erc20Utils from 'techpay-ledgerjs/src/erc20-utils.js';
import Web3 from 'web3';
import appConfig from '../../../app.config.js';

export default {
    name: 'DefiRepaySTPCConfirmation',

    components: { FMessage, LedgerConfirmationContent, TxConfirmation },

    // mixins: [viewHelpersMixin],

    props: {
        /***/
        stakerId: {
            type: String,
            default: '',
        },
        /***/
        outstandingSTPC: {
            type: String,
            default: '',
        },
        /***/
        step: {
            type: Number,
            default: 1,
        },
        /***/
        tmpPwdCode: {
            type: String,
            default: '',
        },
        /** Identifies if component is view (has route). */
        isView: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            tx: {},
            compName: toKebabCase(this.$options.name),
            dOutstandingSTPC: 0,
            d_stakerId: this.stakerId,
            d_outstandingSTPC: this.outstandingSTPC,
            d_step: this.step,
            d_tmpPwdCode: this.tmpPwdCode,
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        hasCorrectParams() {
            return !!this.d_stakerId && !!this.d_outstandingSTPC;
        },

        passwordLabel() {
            let label = '';

            if (this.d_step === 1) {
                label = 'Please enter your wallet password to allow your token';
            } else {
                label = 'Please enter your wallet password to mint sTPC';
            }

            return label;
        },
    },

    created() {
        if (this.d_step === 2) {
            this.$emit('step', 2);
        }

        this.setTx();
    },

    methods: {
        async setTx() {
            const web3 = new Web3();
            const { $defi } = this;
            const { address } = this.currentAccount;
            const result = await Promise.all([$defi.fetchTokens(address), $defi.init()]);
            let txToSign;

            this.stpcToken = result[0].find((_item) => _item.symbol === 'STPC');

            if (!this.stpcToken || !$defi.contracts.StakeTokenizerContract) {
                return;
            }

            this.dOutstandingSTPC = $defi.fromTokenValue(this.d_outstandingSTPC, this.stpcToken);

            if (!this.d_tmpPwdCode) {
                this.d_tmpPwdCode = getUniqueId();
            }

            if (this.d_step === 1) {
                txToSign = erc20Utils.erc20IncreaseAllowanceTx(
                    this.stpcToken.address,
                    $defi.contracts.StakeTokenizerContract,
                    Web3.utils.toHex(
                        $defi.shiftDecPointRight((this.dOutstandingSTPC * 1.05).toString(), this.stpcToken.decimals)
                    )
                );
            } else {
                txToSign = sfcUtils.sfcRedeemTokenizedStake(
                    web3,
                    $defi.contracts.StakeTokenizerContract,
                    parseInt(this.d_stakerId, 16),
                    this.d_outstandingSTPC
                );
            }

            this.tx = await this.$fWallet.getDefiTransactionToSign(txToSign, address);
        },

        onSendTransactionSuccess(_data) {
            if (this.d_step === 1) {
                this.$emit('change-component', {
                    to: 'staking-repay-stpc-confirmation-success-message',
                    from: this.compName,
                    data: {
                        tx: _data.data.sendTransaction.hash,
                        continueToParams: {
                            step: 2,
                            stakerId: this.d_stakerId,
                            outstandingSTPC: this.d_outstandingSTPC,
                            tmpPwdCode: this.d_tmpPwdCode,
                        },
                        continueTo: 'staking-repay-stpc-confirmation2',
                        continueButtonLabel: 'Next Step',
                        cardOff: true,
                        windowMode: true,
                        autoContinueToAfter: appConfig.settings.autoContinueToAfter,
                    },
                });
            } else {
                this.$emit('change-component', {
                    to: 'staking-repay-stpc-confirmation-success-message2',
                    from: this.compName,
                    data: {
                        tx: _data.data.sendTransaction.hash,
                        // successMessage: 'Undelegation Successful',
                        continueToParams: {
                            stakerId: this.d_stakerId,
                        },
                        continueTo: 'hide-window',
                        continueButtonLabel: 'Close',
                        cardOff: true,
                        windowMode: true,
                    },
                });
            }
        },
    },
};
</script>
