<template>
    <div class="stake-form" :class="{ 'increase-delegation': d_increaseDelegation }">
        <h1 :id="labelId" data-focus class="with-back-btn align-center" aria-label="Delegate TPC">
            <span>Delegate TPC</span>
            <f-back-button ref="backButton" :route-name="getBackButtonRoute('staking-stake-form')" />
        </h1>
        <br />

        <f-card class="f-card-double-padding">
            <f-form ref="stakeForm" center-form :aria-labelledby="labelId" @f-form-submit="onFormSubmit">
                <fieldset class="">
                    <div class="form-body">
                        <f-input
                            v-model="amount"
                            label="Amount"
                            field-size="large"
                            type="number"
                            autocomplete="off"
                            min="1"
                            step="any"
                            name="amount"
                            :validator="checkAmount"
                            validate-on-input
                        >
                            <template #top="sProps">
                                <div class="input-label-layout">
                                    <label :for="sProps.inputId">{{ sProps.label }}</label>
                                    <button type="button" class="btn light small" @click="onEntireBalanceClick">
                                        Entire Balance -2 TPC
                                    </button>
                                </div>
                            </template>
                            <template #bottom="sProps">
                                <f-message v-show="sProps.showErrorMessage" type="error" alert with-icon>
                                    {{ amountErrMsg }}
                                </f-message>
                            </template>
                        </f-input>

                        <f-input
                            v-model="validator"
                            label="Validator"
                            field-size="large"
                            autocomplete="off"
                            name="validator"
                            readonly
                            :disabled="d_increaseDelegation"
                            disabled-as-text
                            class="validator-select"
                            :validator="checkValidator"
                            validate-on-input
                            @click.native="onSelectValidatorClick"
                            @keydown.native="onSelectValidatorKeyup"
                        >
                            <template #suffix>
                                <span class="btn same-size round small light">
                                    <icon data="@/assets/svg/chevron-down.svg" color="rgb(140,140,140)" />
                                </span>
                            </template>
                            <template #bottom="sProps">
                                <f-message v-show="sProps.showErrorMessage" type="error" alert with-icon>
                                    {{ validatorErrMsg }}
                                </f-message>
                            </template>
                        </f-input>

                        <div class="align-center form-buttons">
                            <button type="submit" class="btn large break-word" style="max-width: 100%;">
                                Continue
                            </button>
                        </div>
                    </div>
                </fieldset>
            </f-form>
        </f-card>

        <validator-picker-window ref="validatorPickerWindow" @validator-selected="onValidatorSelected" />

        <tx-confirmation-window
            ref="confirmationWindow"
            body-min-height="350px"
            window-class="send-transaction-form-tx-window"
            window-title="Delegate TPC"
            :steps-count="1"
            :active-step="1"
            @cancel-button-click="onCancelButtonClick"
        />
    </div>
</template>

<script>
import FCard from '../core/FCard/FCard.vue';
import FForm from '../core/FForm/FForm.vue';
import FMessage from '../core/FMessage/FMessage.vue';
import FInput from '../core/FInput/FInput.vue';
import ValidatorPickerWindow from '../windows/ValidatorPickerWindow.vue';
import { mapGetters } from 'vuex';
import { focusElem, isAriaAction } from '../../utils/aria.js';
import sfcUtils from 'techpay-ledgerjs/src/sfc-utils.js';
import { GAS_LIMITS } from '../../plugins/techpay-web3-wallet.js';
import { getUniqueId } from '@/utils';
import FBackButton from '@/components/core/FBackButton/FBackButton.vue';
import { viewHelpersMixin } from '@/mixins/view-helpers.js';
import TxConfirmationWindow from '@/components/windows/TxConfirmationWindow/TxConfirmationWindow.vue';

// import { formatHexToInt } from '../../filters.js';
// import { WEIToTPC } from '../../utils/transactions.js';

export default {
    name: 'StakeForm',

    components: { TxConfirmationWindow, FBackButton, ValidatorPickerWindow, FInput, FMessage, FForm, FCard },

    mixins: [viewHelpersMixin],

    props: {
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
        /** */
        stakerId: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            d_increaseDelegation: false,
            d_stakerInfo: {},
            d_stakerId: '',
            amountErrMsg: 'Invalid amount',
            gasPrice: '',
            validator: 'Select a Validator',
            validatorErrMsg: 'Please select a validator',
            /** Info about selected validator. */
            validatorInfo: {
                address: '',
                id: '',
                name: '',
            },
            amount: '',
            labelId: getUniqueId(),
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        /**
         * @return {number}
         */
        remainingBalance() {
            const { currentAccount } = this;
            let price = 0;

            if (this.gasPrice && currentAccount) {
                price = this.$fWallet.getRemainingBalance(currentAccount.balance, this.gasPrice, GAS_LIMITS.max);
            }

            return price;
        },

        /**
         * @return {number}
         */
        maxRemainingBalance() {
            const { currentAccount } = this;
            let price = 0;

            if (this.gasPrice && currentAccount) {
                price = this.$fWallet.getMaxRemainingBalance(currentAccount.balance, this.gasPrice);
            }

            return price;
        },
    },

    created() {
        this.setDataFromParams();

        this.$fWallet.getGasPrice().then((_gasPrice) => {
            this.gasPrice = _gasPrice;
        });
    },

    // activated() {
    mounted() {
        const { d_stakerInfo } = this;

        this.validator = 'Select a Validator';
        this.validatorInfo = {
            address: '',
            id: '',
            name: '',
        };

        if (d_stakerInfo && d_stakerInfo.id) {
            this.validatorInfo = {
                id: d_stakerInfo.id,
                address: d_stakerInfo.stakerAddress,
                name: d_stakerInfo.stakerInfo.name,
            };

            this.updateValidatorInfo().then(() => {
                this.validator = `${this.validatorInfo.name}, ${parseInt(this.validatorInfo.id, 16)}`;
            });
        }

        focusElem(this.$el);
    },

    methods: {
        /**
         * Validator for `amount` input field.
         *
         * @param {String} _value
         * @return {Boolean}
         */
        checkAmount(_value) {
            const remainingBalance = parseFloat(this.remainingBalance);
            const value = parseFloat(_value);
            let ok = false;

            this.amountErrMsg = 'Invalid amount';

            // await this.$fWallet.getStakerById(accountInfo.stakerIdHex)

            if (!isNaN(value)) {
                if (value <= remainingBalance && value >= 1) {
                    ok = true;
                } else if (remainingBalance < 0) {
                    this.amountErrMsg = `You have no balance left`;
                } else if (value > 0 && value < 1) {
                    this.amountErrMsg = `You can't stake amount less than 1 TPC`;
                } else if (value >= 1) {
                    this.amountErrMsg = `You can stake max ${remainingBalance} TPC`;
                }
            }

            if (ok && this.validatorInfo.delegatedLimit && this.validatorInfo.address) {
                const delegatedLimit = parseFloat(this.$fWallet.WEIToTPC(this.validatorInfo.delegatedLimit));

                if (value > delegatedLimit) {
                    this.amountErrMsg =
                        `Staking limit reached. You can stake max ${delegatedLimit} TPC on validator ` + this.validator;
                    ok = false;
                }
            }

            return ok;
        },

        /**
         * Validator for `validator` input field.
         *
         * @return {Boolean}
         */
        checkValidator() {
            return !!this.validatorInfo.address;
        },

        /**
         * Update validator info with the newest data.
         *
         * @return {Promise<void>}
         */
        async updateValidatorInfo() {
            if (this.validatorInfo.id) {
                const validatorInfo = await this.$fWallet.getStakerById(this.validatorInfo.id);

                this.validatorInfo = {
                    ...this.validatorInfo,
                    ...validatorInfo,
                };
            }
        },

        /**
         * Get transaction object for staking and change view to `StakeConfirmation`.
         *
         * @param {Number} _amount Amount of TPC to stake.
         * @return {Promise<void>}
         */
        async stakeCofirmation(_amount) {
            const amount = parseFloat(_amount);
            const amountWei = this.$fWallet.toWei(_amount);
            const validatorId = parseInt(this.validatorInfo.id, 16);
            let delegationTx = null;

            if (this.d_increaseDelegation) {
                delegationTx = sfcUtils.increaseDelegationTx(amountWei, validatorId);
            } else {
                delegationTx = sfcUtils.createDelegationTx(amountWei, validatorId);
            }

            const tx = await this.$fWallet.getSFCTransactionToSign(delegationTx, this.currentAccount.address);

            const data = {
                amount: amount,
                ...this.validatorInfo,
                tx,
                increaseDelegation: this.d_increaseDelegation,
                stakerInfo: this.d_stakerInfo || this.validatorInfo,
                previousComponent: this.previousComponent,
                stakerId: this.d_stakerId,
            };

            this.$refs.confirmationWindow.changeComponent('stake-confirmation', {
                stakeData: data,
                increaseDelegation: data.increaseDelegation,
                stakerInfo: data.stakerInfo,
                previousComponent: data.previousComponent,
                stakerId: data.stakerId,
            });
            this.$refs.confirmationWindow.show();

            /*this.$emit('change-component', {
                to: 'stake-confirmation',
                from: 'stake-form',
                data: {
                    amount: amount,
                    ...this.validatorInfo,
                    tx,
                    increaseDelegation: this.d_increaseDelegation,
                    stakerInfo: this.d_stakerInfo || this.validatorInfo,
                    previousComponent: this.previousComponent,
                    stakerId: this.d_stakerId,
                },
            });*/
        },

        onValidatorSelected(_validatorInfo) {
            if (!this.d_increaseDelegation) {
                this.validator = `${_validatorInfo.name}, ${parseInt(_validatorInfo.id, 16)}`;
                this.validatorInfo = { ..._validatorInfo };
                this.updateValidatorInfo().then(() => {
                    this.$refs.stakeForm.checkValidity();
                });
            }
        },

        onSelectValidatorClick() {
            if (!this.d_increaseDelegation) {
                this.$refs.validatorPickerWindow.show();
            }
        },

        onSelectValidatorKeyup(_event) {
            if (!this.d_increaseDelegation && isAriaAction(_event)) {
                this.$refs.validatorPickerWindow.show();
            }
        },

        async onFormSubmit(_event) {
            const { data } = _event.detail;

            this.updateValidatorInfo().then(async () => {
                if ((await this.$refs.stakeForm.checkValidity()) && this.validatorInfo.address) {
                    this.stakeCofirmation(parseFloat(data.amount));
                }
            });
        },

        onEntireBalanceClick() {
            let amount = 0;

            if (this.maxRemainingBalance > 0) {
                amount = Math.ceil(this.maxRemainingBalance) - 2;
            }

            this.amount = amount.toString();
        },

        onCancelButtonClick(cancelBtnClicked) {
            if (!cancelBtnClicked) {
                this.$refs.backButton.goBack();
            }
        },
    },
};
</script>

<style lang="scss">
.stake-form:not(.increase-delegation) {
    .validator-select,
    .validator-select > *,
    .validator-select input {
        cursor: pointer !important;
    }
}
</style>
