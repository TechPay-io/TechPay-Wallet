<template>
    <div class="send-transaction-form">
        <h2 :id="labelId" class="with-back-btn align-center" data-focus>
            <template v-if="token.address"> Send {{ tokenSymbol }} </template>
            <template v-else>Send Photon TPC</template>
            <f-back-button ref="backButton" :route-name="getBackButtonRoute('account-send-transaction-form')" />
        </h2>

        <f-card class="f-card-double-padding">
            <f-form ref="form" center-form :aria-labelledby="labelId" @f-form-submit="onFormSubmit">
                <fieldset class="">
                    <div class="form-body">
                        <div v-if="token.address" class="available-balance">
                            <div class="row align-items-center no-collapse">
                                <div class="col ab-label">Available balance</div>
                                <div class="col ab-balance">
                                    <f-token-value :value="availableERC20TokenBalance" :token="token" />
                                </div>
                            </div>
                        </div>

                        <f-input
                            v-model="amount"
                            label="Amount"
                            field-size="large"
                            type="number"
                            autocomplete="off"
                            min="0"
                            step="any"
                            name="amount"
                            :validator="checkAmount"
                            validate-on-input
                        >
                            <template #top="sProps">
                                <div class="input-label-layout">
                                    <label :for="sProps.inputId">{{ sProps.label }}</label>
                                    <button type="button" class="btn light small" @click="onEntireBalanceClick">
                                        Entire Balance
                                    </button>
                                </div>
                            </template>
                            <template #bottom="sProps">
                                <f-message v-show="sProps.showErrorMessage" type="error" alert with-icon>
                                    {{ amountErrMsg }}
                                </f-message>
                            </template>
                        </f-input>

                        <address-field
                            :blockchain="blockchain"
                            :label="sendToLabel"
                            field-size="large"
                            name="address"
                            :validator="checkAddress"
                            :validate-on-input="d_sendDirection === 'PhotonToPhoton'"
                        >
                            <template #bottom="sProps">
                                <f-message v-show="sProps.showErrorMessage" type="error" alert with-icon>
                                    {{ sendToErrorMsg }}
                                </f-message>
                                <div v-if="resolvedAddress">Domain resolved to {{ resolvedAddress }}</div>
                                <div v-if="ETHOrBNBAccountBalance">
                                    {{ ETHOrBNBAccountBalance }}
                                </div>
                            </template>
                        </address-field>

                        <f-input
                            v-if="d_sendDirection !== 'PhotonToEthereum' && !token.address"
                            label="Memo (optional)"
                            field-size="large"
                            name="memo"
                        />

                        <div class="align-center form-buttons">
                            <template v-if="d_sendDirection !== 'PhotonToPhoton'">
                                <f-message type="warning" class="align-center">
                                    All bridge transactions incur a fee of {{ minTPCToTransfer }} TPC, deducted from the
                                    transfer amount.
                                </f-message>
                                <f-message
                                    v-if="amount >= minTPCToTransfer && checkAmount(amount)"
                                    type="info"
                                    class="big"
                                >
                                    You will receive <b>{{ amount - minTPCToTransfer }} TPC</b>
                                </f-message>
                                <br />
                            </template>

                            <button type="submit" class="btn large break-word" style="max-width: 100%;">
                                Continue
                            </button>
                        </div>
                    </div>
                </fieldset>
            </f-form>
        </f-card>

        <tx-confirmation-window
            ref="confirmationWindow"
            body-min-height="350px"
            window-class="send-transaction-form-tx-window"
            :window-title="windowTitle"
            :steps-count="1"
            :active-step="1"
            @cancel-button-click="onCancelButtonClick"
        />
    </div>
</template>

<script>
import FForm from '../core/FForm/FForm.vue';
import FMessage from '../core/FMessage/FMessage.vue';
import FInput from '../core/FInput/FInput.vue';
import FCard from '../core/FCard/FCard.vue';
import { mapGetters } from 'vuex';
import { eventBusMixin } from '../../mixins/event-bus.js';
import { BNBridgeExchangeErrorCodes } from '../../plugins/bnbridge-exchange/bnbridge-exchange.js';
import AddressField from '../AddressField/AddressField.vue';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';
import appConfig from '../../../app.config.js';
import Resolution from '@unstoppabledomains/resolution';
import { focusElem } from '@/utils/aria.js';
import { viewHelpersMixin } from '@/mixins/view-helpers.js';
import FBackButton from '@/components/core/FBackButton/FBackButton.vue';
import { getUniqueId } from '@/utils';
import TxConfirmationWindow from '@/components/windows/TxConfirmationWindow/TxConfirmationWindow.vue';
import Web3 from 'web3';
import { abi, contract_address } from '../AddressField/fns';

const resolution = new Resolution();
const web3 = new Web3(appConfig.rpc);
const contract = new web3.eth.Contract(abi, contract_address);

export default {
    name: 'SendTransactionForm',

    components: {
        TxConfirmationWindow,
        FBackButton,
        FTokenValue,
        AddressField,
        FCard,
        FInput,
        FMessage,
        FForm,
    },

    mixins: [eventBusMixin, viewHelpersMixin],

    props: {
        /** @type {DefiToken} */
        token: {
            type: Object,
            default() {
                return {};
            },
        },
        sendDirection: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            d_sendDirection: 'PhotonToPhoton',
            amountErrMsg: 'Invalid amount',
            gasPrice: '',
            amount: '',
            sendToErrorMsg: 'Enter a valid Photon TPC address or domain name',
            /** Balance of BNB or ETH account. */
            ETHOrBNBAccountBalance: '',
            minTPCToTransfer: appConfig.bnbridgeApi.minTPCToTransfer,
            resolvedAddress: null,
            windowTitle: '',
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
                price = this.$fWallet.getRemainingBalance(currentAccount.balance, this.gasPrice);
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

        /**
         * @return {number}
         */
        maxRemainingErc20TokenBalance() {
            const { token } = this;

            return this.$defi.fromTokenValue(token.balanceOf || token.availableBalance, token) || 0;
        },

        /**
         * @return {number}
         */
        availableERC20TokenBalance() {
            return this.maxRemainingErc20TokenBalance;
        },

        /**
         * @return {string}
         */
        tokenSymbol() {
            const { token } = this;

            return token.address ? this.$defi.getTokenSymbol(token) : 'TPC';
        },

        /**
         * @return {string}
         */
        sendToLabel() {
            let sendTo = 'Send To (address or domain)';

            switch (this.d_sendDirection) {
                case 'PhotonToBinance':
                    sendTo = 'BNB Receive Address';
                    break;
                case 'PhotonToEthereum':
                    sendTo = 'ETH Receive Address';
                    break;
            }

            return sendTo;
        },

        /**
         * @return {WalletBlockchain}
         */
        blockchain() {
            let blockchain = 'techpay';

            switch (this.d_sendDirection) {
                case 'PhotonToBinance':
                    blockchain = 'binance';
                    break;
                case 'PhotonToEthereum':
                    blockchain = 'ethereum';
                    break;
            }

            return blockchain;
        },
    },

    created() {
        this.setDataFromParams();

        this.$fWallet.getGasPrice().then((_gasPrice) => {
            this.gasPrice = _gasPrice;
        });

        this._eventBus.on('account-picked', this.onAccountPicked);
    },

    mounted() {
        focusElem(this.$el);
    },

    methods: {
        /**
         * @param {string} _value
         */
        async checkAddress(_value) {
            const { d_sendDirection } = this;
            let validAddress = false;
            let value = _value.trim();

            this.ETHOrBNBAccountBalance = '';

            if (d_sendDirection === 'PhotonToPhoton') {
                value = (await this.resolveAddress(value, 'TPC', 'PHOTON')) || value;
                validAddress = this.$fWallet.isValidAddress(value);
                this.sendToErrorMsg = 'Enter a valid Photon TPC address or domain name';
            } else if (d_sendDirection === 'PhotonToBinance') {
                validAddress = this.$bnb.isBNBAddress(value);
                this.sendToErrorMsg = 'Enter a valid BNB address';

                if (validAddress) {
                    if (value.toLowerCase() === 'bnb136ns6lfw4zs5hg4n85vdthaad7hq5m4gtkgf23') {
                        validAddress = false;
                        this.sendToErrorMsg =
                            "Deposits to Binance's central BEP2 wallet address have been disabled to ensure users don't lose funds through MEMO errors. Please choose Ethereum as the receiving blockchain and use your Binance ERC20 deposit address instead";
                    } else {
                        try {
                            const data = await this.$bnb.getBNBBalances(value);
                            this.ETHOrBNBAccountBalance = `Current TechPay Balance: ${data.balance} TPC`;
                        } catch (_error) {
                            validAddress = false;

                            if (_error.code === BNBridgeExchangeErrorCodes.BRIDGE_IS_DOWN) {
                                this.sendToErrorMsg = 'Bridge is down';
                            } else if (_error.code !== BNBridgeExchangeErrorCodes.BAD_BNB_ADDRESS) {
                                this.sendToErrorMsg = _error;
                            }
                        }
                    }
                }
            } else if (d_sendDirection === 'PhotonToEthereum') {
                validAddress = this.$bnb.isETHAddress(value);
                this.sendToErrorMsg = 'Enter a valid ETH address';

                if (validAddress) {
                    try {
                        const balance = await this.$bnb.getETHBalance(value);
                        this.ETHOrBNBAccountBalance = `Current TechPay Balance: ${balance} TPC`;
                    } catch (_error) {
                        validAddress = false;

                        if (_error.code === BNBridgeExchangeErrorCodes.BRIDGE_IS_DOWN) {
                            this.sendToErrorMsg = 'Bridge is down';
                        } else if (_error.code !== BNBridgeExchangeErrorCodes.BAD_ETH_ADDRESS) {
                            this.sendToErrorMsg = _error;
                        }
                    }
                }
            }

            return validAddress;
        },

        async resolveAddress(value, currency, chain) {
            console.log('resolving ', value);
            this.resolvedAddress = null;
            if (resolution.isSupportedDomainInNetwork(value)) {
                try {
                    if (chain) {
                        this.resolvedAddress = await resolution.multiChainAddr(value, currency, chain);
                    } else {
                        this.resolvedAddress = await resolution.addr(value, currency);
                    }
                    console.log('domain ', value, ' resolved using unstoppable to ', this.resolvedAddress);
                    return this.resolvedAddress;
                } catch (e) {
                    console.log('Domain resolution failed', e);
                }
            }

            const isOwned = await contract.methods.isOwnedByMapping(value.toUpperCase()).call();
            if (isOwned) {
                this.resolvedAddress = await contract.methods.getOwnerOfName(value.toUpperCase()).call();
                console.log('domain ', value, ' resolved using rave names to ', this.resolvedAddress);
            }
            return this.resolvedAddress;
        },

        checkAmount(_value) {
            const remainingBalance = this.token.address
                ? parseFloat(this.maxRemainingErc20TokenBalance)
                : parseFloat(this.remainingBalance);
            const value = parseFloat(_value);
            const { minTPCToTransfer } = this;
            const photonToBridge = this.d_sendDirection !== 'PhotonToPhoton';
            const { tokenSymbol } = this;
            let ok = false;

            this.amountErrMsg = 'Invalid amount';

            if (!isNaN(value)) {
                if (value <= remainingBalance && value > 0) {
                    if (photonToBridge && value < minTPCToTransfer) {
                        this.amountErrMsg = `You must transfer at least ${minTPCToTransfer} ${tokenSymbol}`;
                    } else {
                        ok = true;
                    }
                } else if (remainingBalance < 0) {
                    this.amountErrMsg = 'You have no balance left';
                } else if (value > 0) {
                    this.amountErrMsg = `You can transfer max ${remainingBalance} ${tokenSymbol}`;
                }

                if (!ok && value === 0) {
                    ok = true;
                }
            }

            return ok;
        },

        /*
        onFormInput() {
            this.submitDisabled = !this.validate();
        },

        onFormChange() {
            this.submitDisabled = !this.validate();
        },

        */
        async onFormSubmit(_event) {
            const { data } = _event.detail;
            const { d_sendDirection } = this;

            if (this.currentAccount && data.amount) {
                if (d_sendDirection === 'PhotonToPhoton') {
                    data.photon_address = this.resolvedAddress || data.address;
                } else if (d_sendDirection === 'PhotonToBinance') {
                    data.bnb_address = data.address;
                } else if (d_sendDirection === 'PhotonToEthereum') {
                    data.eth_address = data.address;
                }

                // TMP!
                /*
                this.$emit('change-component', {
                    to: 'transaction-completing',
                    from: 'send-transaction-form',
                    data: {
                        address: 'bnb1jvlepaalght59kwhfh44k54u3elmhuurnt0lxc',
                        amount: '0.1',
                        fee: '0.000044',
                        from_photon_address: '0x76AE07E6D236c1aE3F5C3112F387ad82c69A2471',
                        memo: '',

                        bnb_address: 'bnb1jvlepaalght59kwhfh44k54u3elmhuurnt0lxc',
                        direction: 'PhotonToBinance',
                        photon_address: '0xE504aF2999644A86162Df892E86E3809a365AEBa',
                        uuid: 'd727d651-c06e-d770-fb35-87fc7a4f0ade',
                        tx: '0xefb8001268d8b5441678004b9641f26ad6b1577b',
                    },
                });
*/

                this.windowTitle =
                    this.token && this.token.symbol
                        ? `Send ${this.$defi.getTokenSymbol(this.token)}`
                        : 'Send Photon TPC';

                this.$refs.confirmationWindow.changeComponent('transaction-confirmation', {
                    txData: { ...data },
                    sendDirection: d_sendDirection,
                    token: this.token,
                });
                this.$refs.confirmationWindow.show();

                /*this.$emit('change-component', {
                    to: 'transaction-confirmation',
                    from: 'send-transaction-form',
                    data: {
                        ...data,
                        // fee: this.$fWallet.WEIToTPC(this.$fWallet.getTransactionFee(this.gasPrice)),
                    },
                });*/
            }
        },

        onAccountPicked() {
            this.$refs.backButton.goBack();
            // this.$refs.form.reset(true);
        },

        onEntireBalanceClick() {
            const { token } = this;

            if (token.address) {
                this.amount =
                    this.maxRemainingErc20TokenBalance > 0 ? this.maxRemainingErc20TokenBalance.toString() : '0';
            } else {
                this.amount = this.maxRemainingBalance > 0 ? this.maxRemainingBalance.toString() : '0';
            }
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
.send-transaction-form {
    .available-balance {
        margin-bottom: 24px;

        .ab-label {
            font-weight: bold;
        }

        .ab-balance {
            font-size: 26px;
            text-align: end;
        }
    }
}

.send-transaction-form-tx-window {
    .column-layout--body-footer > div:first-child {
        overflow: hidden;
    }
}
</style>
