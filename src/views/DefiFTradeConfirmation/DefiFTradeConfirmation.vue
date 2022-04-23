<template>
    <div class="defi-ftrade-confirmation">
        <tx-confirmation
            v-if="hasCorrectParams"
            :tx="tx"
            card-off
            :send-button-label="sendButtonLabel"
            :password-label="passwordLabel"
            :on-send-transaction-success="onSendTransactionSuccess"
            :set-tmp-pwd="params.step === 1"
            :tmp-pwd-code="tmpPwdCode"
            :show-cancel-button="true"
            :window-mode="!isView"
            class="min-h-100"
            @cancel-button-click="$emit('cancel-button-click', $event)"
            @change-component="onChangeComponent"
        >
            <h1 v-if="isView" class="with-back-btn" data-focus>
                Confirmation
                <template v-if="params.steps">({{ params.step }}/{{ params.steps }})</template>
                <f-back-button
                    v-if="!params.steps || params.step === 1"
                    :route-name="backButtonRoute"
                    :params="{ fromToken: params.fromToken, toToken: params.toToken }"
                />
            </h1>

            <div class="confirmation-info" tabindex="0" data-focus>
                <template v-if="params.step === 1">
                    You’re allowing
                    <span class="price">
                        <f-token-value
                            :value="params.fromValue"
                            :token="params.fromToken"
                            :use-placeholder="false"
                            no-currency
                        />
                        {{ fromTokenSymbol }}
                    </span>
                </template>
                <template v-else>
                    You're trading
                    <span class="price">
                        <f-token-value
                            :value="params.fromValue"
                            :token="params.fromToken"
                            :use-placeholder="false"
                            no-currency
                        />
                        {{ fromTokenSymbol }}
                    </span>
                    &#10141;
                    <span class="price">
                        <f-token-value
                            :value="params.toValue"
                            :token="params.toToken"
                            :use-placeholder="false"
                            no-currency
                        />
                        {{ toTokenSymbol }}
                    </span>
                </template>
            </div>

            <template #window-content>
                <ledger-confirmation-content :to="tx.to" :amount="amountTPC" :max-fee="tx._fee" />
            </template>
        </tx-confirmation>
        <template v-else>
            <f-message type="info" role="alert" class="big"> Trade tokens first, please. </f-message>
        </template>
    </div>
</template>

<script>
import TxConfirmation from '../../components/TxConfirmation/TxConfirmation.vue';
import LedgerConfirmationContent from '../../components/LedgerConfirmationContent/LedgerConfirmationContent.vue';
import { Web3 } from '../../plugins/techpay-web3-wallet.js';
import { mapGetters } from 'vuex';
import { toTPC } from '../../utils/transactions.js';
import FBackButton from '../../components/core/FBackButton/FBackButton.vue';
import { getAppParentNode } from '../../app-structure.js';
import FMessage from '../../components/core/FMessage/FMessage.vue';
import wtpcUtils from 'techpay-ledgerjs/src/wtpc-utils.js';
import erc20Utils from 'techpay-ledgerjs/src/erc20-utils.js';
import appConfig from '../../../app.config.js';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';
import { getUniqueId } from '@/utils';

/**
 * Common component for DefiBorrowTUSDConfirmation a DefiManageBorrowConfirmation
 */
export default {
    name: 'DefiFTradeConfirmation',

    components: { FTokenValue, FMessage, FBackButton, LedgerConfirmationContent, TxConfirmation },

    props: {
        /** Address of smart contract. */
        contractAddress: {
            type: String,
            default: '',
        },
        props: {
            type: Object,
            default() {
                return {};
            },
        },
        /** Identifies if component is view (has route). */
        isView: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            compName: 'defi-ftrade',
            priceDecimals: 6,
            tx: {},
            amountTPC: 0,
            tmpPwdCode: '',
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        /**
         * @return {{fromValue: number, toValue: number, fromToken: DefiToken, toToken: DefiToken}}
         */
        params() {
            const { $route } = this;

            if (this.isView) {
                return $route && $route.params ? $route.params : {};
            }

            return this.props;
        },

        hasCorrectParams() {
            return !!this.params.fromValue;
        },

        increasedDebt() {
            return this.params.currDebt - this.params.debt;
        },

        decreasedDebt() {
            return this.params.debt - this.params.currDebt;
        },

        sendButtonLabel() {
            let label = '';

            // if (this.params.step === 1) {
            //     label = 'Continue to the next step';
            // } else {
            label = 'Submit';
            // label = 'Trade now';
            // }

            return label;
        },

        passwordLabel() {
            let label = '';

            if (this.params.step === 1) {
                label = 'Please enter your wallet password to allow your tokens';
            } else {
                label = 'Please enter your wallet password to trade your tokens';
            }

            return label;
        },

        fromTokenSymbol() {
            return this.$defi.getTokenSymbol(this.params.fromToken);
        },

        toTokenSymbol() {
            return this.$defi.getTokenSymbol(this.params.toToken);
        },

        backButtonRoute() {
            const parentNode = getAppParentNode(`${this.compName}-confirmation`);

            return parentNode ? parentNode.id : '';
        },
    },

    created() {
        if (!this.hasCorrectParams) {
            // redirect to <this.compName>
            setTimeout(() => {
                this.$router.replace({ name: this.compName });
            }, 3000);
        } else {
            this.setTx();
        }
    },

    methods: {
        async setTx() {
            let { contractAddress } = this;

            const { params } = this;
            const { fromToken } = params;
            const { toToken } = params;
            let txToSign;
            let fromValue;

            /*
            console.log(
                fromToken,
                toToken,
                this.$defi.shiftDecPointRight(params.fromValue.toString(), fromToken.decimals),
                Web3.utils.toHex(this.$defi.shiftDecPointRight(params.fromValue.toString(), fromToken.decimals))
            );
            */

            if (!fromToken || !toToken) {
                return;
            }

            this.tmpPwdCode = params.tmpPwdCode || getUniqueId();

            if (!contractAddress) {
                contractAddress = this.$defi.contracts.fMint;
            }

            if (this.params.step === 1) {
                fromValue = params.fromValue;

                if (fromToken.symbol === 'TUSD') {
                    // add 0.5% fee
                    fromValue += fromValue * 0.005;
                }

                txToSign = erc20Utils.erc20IncreaseAllowanceTx(
                    fromToken.address,
                    contractAddress,
                    Web3.utils.toHex(this.$defi.shiftDecPointRight((fromValue * 1.05).toString(), fromToken.decimals))
                );
            } else {
                if (fromToken.symbol === 'TPC' && toToken.canWrapTPC) {
                    this.amountTPC = params.fromValue.toFixed(this.$defi.getTokenDecimals(params.fromToken));

                    txToSign = wtpcUtils.defiWrapTpc(
                        toToken.address,
                        Web3.utils.toHex(this.$defi.shiftDecPointRight(params.toValue.toString(), toToken.decimals))
                    );
                } else if (fromToken.canWrapTPC && toToken.symbol === 'TPC') {
                    const amount = Web3.utils.toHex(
                        this.$defi.shiftDecPointRight(params.fromValue.toString(), toToken.decimals)
                    );

                    txToSign = wtpcUtils.defiUnwrapTpc(
                        fromToken.address,
                        params.max || this.$defi.compareBN(amount, fromToken.availableBalance) === 1
                            ? fromToken.availableBalance
                            : amount
                    );
                }
                /* else if (fromToken.symbol === 'TUSD') {
                    txToSign = defiUtils.defiBuyTokenTx(
                        contractAddress,
                        toToken.address,
                        // Web3.utils.toHex(this.$defi.shiftDecPointRight(params.fromValue.toString(), fromToken.decimals))
                        Web3.utils.toHex(this.$defi.shiftDecPointRight(params.toValue.toString(), toToken.decimals))
                    );
                } else if (toToken.symbol === 'TUSD') {
                    txToSign = defiUtils.defiSellTokenTx(
                        contractAddress,
                        fromToken.address,
                        Web3.utils.toHex(this.$defi.shiftDecPointRight(params.fromValue.toString(), fromToken.decimals))
                    );
                } else {
                    txToSign = defiUtils.defiTradeTokenTx(
                        contractAddress,
                        fromToken.address,
                        toToken.address,
                        Web3.utils.toHex(this.$defi.shiftDecPointRight(params.fromValue.toString(), fromToken.decimals))
                        // parseInt(this.decreasedDebt * Math.pow(10, token.decimals))
                    );
                } */
            }

            if (txToSign) {
                this.tx = await this.$fWallet.getDefiTransactionToSign(txToSign, this.currentAccount.address);
            }
        },

        onSendTransactionSuccess(_data) {
            const params = {
                tx: _data.data.sendTransaction.hash,
                title: 'Success',
                continueTo: this.compName,
            };
            let transactionSuccessComp = `${this.compName}-transaction-success-message`;

            if (this.params.step === 1) {
                params.continueTo = `${this.compName}-confirmation2`;
                params.continueToParams = { ...this.params, step: 2, isView: this.isView, tmpPwdCode: this.tmpPwdCode };
                params.autoContinueToAfter = appConfig.settings.autoContinueToAfter;
                params.continueButtonLabel = 'Next Step';
                params.title = `${this.params.step}/${this.params.steps}  ${params.title}`;
            } else if (this.params.step === 2) {
                transactionSuccessComp = `${this.compName}-transaction-success-message2`;
                params.continueToParams = {
                    fromToken: { ...this.params.fromToken },
                    toToken: { ...this.params.toToken },
                };
            }

            if (this.isView) {
                this.$router.replace({
                    name: transactionSuccessComp,
                    params,
                });
            } else {
                if (this.params.step === 1) {
                    params.continueToParams = {
                        props: { ...params.continueToParams },
                    };
                    params.title = `Success`;
                } else if (this.params.step === 2 || !this.params.step) {
                    params.continueTo = 'hide-window';
                    params.continueButtonLabel = 'Close';
                }

                this.$emit('change-component', {
                    to: transactionSuccessComp,
                    data: { ...params, cardOff: true, windowMode: true },
                });
            }
        },

        /**
         * Re-target `'change-component'` event.
         *
         * @param {object} _data
         */
        onChangeComponent(_data) {
            let transactionRejectComp = `${this.compName}-transaction-reject-message`;

            if (!this.isView) {
                return;
            }

            if (_data.to === 'transaction-reject-message') {
                if (this.params.step === 2) {
                    transactionRejectComp = `${this.compName}-transaction-reject-message2`;
                }

                this.$router.replace({
                    name: transactionRejectComp,
                    params: {
                        continueTo: this.compName,
                        continueToParams: {
                            fromToken: { ...this.params.fromToken },
                            toToken: { ...this.params.toToken },
                        },
                    },
                });
            }
        },

        toTPC,
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
