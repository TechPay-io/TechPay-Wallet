<template>
    <div class="defi-mint-stpc-confirmation">
        <tx-confirmation
            v-if="hasCorrectParams"
            :tx="tx"
            send-button-label="Submit"
            password-label="Please enter your wallet password to mint sTPC"
            :on-send-transaction-success="onSendTransactionSuccess"
            card-off
            :show-cancel-button="true"
            :window-mode="true"
            class="min-h-100"
            @cancel-button-click="$emit('cancel-button-click', $event)"
        >
            <h2 class="not-visible" data-focus>Mint sTPC - Confirmation</h2>

            <div class="confirmation-info" tabindex="0" data-focus>
                You’re minting
                <f-token-value
                    :value="dAmountDelegated"
                    :decimals="filtersOptions.fractionDigits"
                    :use-placeholder="false"
                    no-currency
                />
                sTPC
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
import { toKebabCase } from '@/utils';
import sfcUtils from 'techpay-ledgerjs/src/sfc-utils.js';
import Web3 from 'web3';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';
import { filtersOptions } from '@/filters.js';

export default {
    name: 'DefiMintSTPCConfirmation',

    components: { FTokenValue, FMessage, LedgerConfirmationContent, TxConfirmation },

    // mixins: [viewHelpersMixin],

    props: {
        /***/
        stakerId: {
            type: String,
            default: '',
        },
        /***/
        amountDelegated: {
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
            dAmountDelegated: 0,
            d_stakerId: this.stakerId,
            d_amountDelegated: this.amountDelegated,
            filtersOptions,
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        hasCorrectParams() {
            return !!this.d_stakerId;
        },
    },

    created() {
        // this.setDataFromParams();

        if (!this.hasCorrectParams && this.isView) {
            // redirect
            setTimeout(() => {
                this.$router.replace({
                    name: this.getBackButtonRoute(this.compName),
                    params: this.$route.params,
                });
            }, 3000);
        }

        this.setTx();
    },

    methods: {
        async setTx() {
            const web3 = new Web3();

            await this.$defi.init();

            if (!this.$defi.contracts.StakeTokenizerContract) {
                return;
            }

            this.dAmountDelegated = this.$fWallet.WEIToTPC(this.d_amountDelegated);

            this.tx = await this.$fWallet.getDefiTransactionToSign(
                sfcUtils.sfcTokenizeLockedStake(
                    web3,
                    this.$defi.contracts.StakeTokenizerContract,
                    parseInt(this.d_stakerId, 16)
                ),
                this.currentAccount.address
            );
        },

        onSendTransactionSuccess(_data) {
            if (!this.isView) {
                this.$emit('change-component', {
                    to: 'staking-mint-stpc-confirmation-success-message',
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
            } else {
                const params = {
                    tx: _data.data.sendTransaction.hash,
                    title: 'Success',
                    continueTo: this.getBackButtonRoute(this.compName),
                    continueToParams: this.$route.params,
                };

                this.$router.replace({
                    name: `defi-mint-stpc-transaction-success-message`,
                    params,
                });
            }
        },

        /**
         * Re-target `'change-component'` event.
         *
         * @param {object} _data
         */
        onChangeComponent(_data) {
            let transactionRejectComp = `defi-mint-stpc-transaction-reject-message`;

            if (!this.isView) {
                this.$emit('change-component', _data);
            } else if (_data.to === 'transaction-reject-message') {
                this.$router.replace({
                    name: transactionRejectComp,
                    params: {
                        continueTo: this.getBackButtonRoute(this.compName),
                        continueToParams: this.$route.params,
                    },
                });
            }
        },
    },
};
</script>
