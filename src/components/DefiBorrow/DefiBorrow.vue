<template>
    <div class="defi-borrow" :class="{ 'borrow-or-repay': borrowOrRepay }">
        <div class="grid">
            <div>
                <div class="df-data-item smaller">
                    <h3 class="label">Available balance</h3>
                    <div class="value">
                        <f-token-value :token="dToken" :value="availableBalance" />
                    </div>
                </div>
                <div class="df-data-item smaller">
                    <h3 class="label">
                        <template v-if="mintRepayMode">Minted</template>
                        <template v-else>Borrowed</template>
                    </h3>
                    <div class="value">
                        <f-token-value :token="dToken" :value="debt" />
                    </div>
                </div>
                <template v-if="!largeView">
                    <div class="df-data-item smaller">
                        <h3 class="label">
                            <template v-if="mintRepayMode">Max Mintable</template>
                            <template v-else>Borrow Limit</template>
                        </h3>
                        <div class="value">
                            <f-token-value :token="dToken" :value="borrowLimit + debt" />
                        </div>
                    </div>
                </template>
                <!--
                <div v-else class="df-data-item smaller">
                    <h3 class="label">{{ cTokenSymbol }} balance</h3>
                    <div class="value">{{ debt }} <span class="currency">{{ cTokenSymbol }}</span></div>
                </div>
                -->

                <div class="df-data-item smaller">
                    <h3 class="label">Current price</h3>
                    <div class="value">
                        <f-token-value
                            :value="currentPrice"
                            :content-loaded="!!tokenPrice"
                            :decimals="2"
                            number-currency="USD"
                            replacement-text="$0.00000"
                            no-currency
                        />
                    </div>
                </div>

                <!--
                <template v-if="!largeView">
                    <div class="df-data-item smaller">
                        <h3 class="label">Total Deposit</h3>
                        <div class="value">
                            <f-token-value :token="tusdToken" :value="collateralInTUSD" />
                        </div>
                    </div>
                </template>
-->
            </div>
            <div class="defi-price-input-col align-center">
                <div class="defi-price-input">
                    <div class="token-label">
                        <f-select-button
                            v-if="!singleToken"
                            collapsed
                            aria-label="pick a token"
                            @click.native="onTokenSelectorClick"
                        >
                            <f-crypto-symbol :token="dToken" />
                        </f-select-button>
                        <template v-else>
                            <f-crypto-symbol :token="dToken" />
                        </template>
                    </div>

                    <label :for="`text-input-${id}`" class="not-visible">{{ label }}</label>
                    <input
                        :id="`text-input-${id}`"
                        ref="input"
                        :value="inputValue"
                        :min="minDebt"
                        :max="maxDebt"
                        type="text"
                        inputmode="decimal"
                        step="any"
                        class="text-input no-style"
                        @change="onInput"
                    />

                    <div v-if="!borrowOrRepay" class="f-slider-wrap">
                        <f-slider
                            ref="slider"
                            v-model="currDebt"
                            step="any"
                            :min="minDebt.toString()"
                            :max="fSliderMax.toString()"
                            use-lower-fill-bar
                        >
                            <template #top="sProps">
                                <label :for="sProps.inputId" class="not-visible">{{ label }}</label>
                            </template>
                        </f-slider>
                        <div class="slider-buttons">
                            <button class="btn small light" @click="onMinBtnClick">Min</button>
                            <button
                                v-show="currDebt !== debt.toString()"
                                class="btn small light"
                                @click="onResetBtnClick"
                            >
                                Reset
                            </button>
                            <button class="btn small light" @click="onMaxBtnClick">Max</button>
                        </div>
                    </div>
                    <div v-else class="f-slider-wrap">
                        <f-slider
                            ref="slider"
                            v-model="currDebt"
                            step="any"
                            :min="minDebt.toString()"
                            :max="fSliderMax.toString()"
                            :labels="sliderLabels"
                            clickable-labels
                            use-lower-fill-bar
                        >
                            <template #top="sProps">
                                <label :for="sProps.inputId" class="not-visible">{{ label }}</label>
                            </template>
                        </f-slider>
                    </div>

                    <div class="token-info">
                        <div class="token-info-label">Repay <br />{{ cTokenSymbol }}</div>
                        <icon data="@/assets/svg/angle-double-left.svg" width="66" height="66" aria-hidden="true" />
                    </div>
                    <div class="token-info increase">
                        <div class="token-info-label">Borrow {{ cTokenSymbol }}</div>
                        <icon data="@/assets/svg/angle-double-right.svg" width="66" height="66" aria-hidden="true" />
                    </div>
                </div>
            </div>
            <div v-if="!smallView" class="minting-limit-col align-center">
                <ratio-info :value="collateralRatio" />
            </div>
            <div v-if="largeView" class="right-col">
                <!--
                <div v-if="!smallView" class="df-data-item smaller">
                    <h3 class="label">Today’s change</h3>
                    <div class="value">2.38%</div>
                </div>
-->
                <!--
                <div class="df-data-item smaller">
                    <h3 class="label">Total Deposit</h3>
                    <div class="value">
                        <f-token-value :token="tusdToken" :value="collateralInTUSD" />
                    </div>
                </div>
-->
                <div v-if="smallView" class="df-data-item smaller">
                    <ratio-info :display-circle="false" :content-loaded="!!tokenPrice" :value="collateralRatio" />
                </div>
                <div class="df-data-item smaller">
                    <h3 class="label">
                        <template v-if="mintRepayMode">Max Mintable</template>
                        <template v-else>Borrow Limit</template>
                    </h3>
                    <div class="value">
                        <f-token-value :token="dToken" :value="borrowLimit + debt" />
                    </div>
                </div>
            </div>

            <f-message v-if="increasedDebt > 0" type="info" role="alert" class="big">
                <defi-minting-message :token="dToken" :value="increasedDebt" />
            </f-message>
            <f-message v-else-if="decreasedDebt > 0" type="info" role="alert" class="big">
                You're removing
                <span class="inc-desc-collateral">
                    <f-token-value :token="dToken" :value="decreasedDebt" no-currency /> {{ cTokenSymbol }}
                </span>
            </f-message>
        </div>

        <div class="defi-buttons">
            <button class="btn large" :disabled="submitDisabled" @click="onSubmit">
                Submit
                <!--
                <template v-if="submitDisabled">Submit</template>
                <template v-else-if="increasedDebt > 0 || debt === 0">
                    Borrow now
                </template>
                <template v-else>
                    Repay now
                </template>
                -->
            </button>
        </div>

        <defi-token-picker-window ref="pickTokenWindow" :tokens="tokens" @defi-token-picked="onDefiTokenPicked" />
        <tx-confirmation-window
            ref="confirmationWindow"
            body-min-height="350px"
            :steps-count="stepsCount"
            :active-step="1"
            :window-title="windowTitle"
            :steps="windowSteps"
            @cancel-button-click="onCancelButtonClick"
        />
    </div>
</template>

<script>
import FSlider from '../../components/core/FSlider/FSlider.vue';
import { getUniqueId } from '../../utils';
import { mapGetters } from 'vuex';
import { formatNumberByLocale } from '../../filters.js';
import FMessage from '../../components/core/FMessage/FMessage.vue';
import DefiTokenPickerWindow from '../windows/DefiTokenPickerWindow/DefiTokenPickerWindow.vue';
import FCryptoSymbol from '../core/FCryptoSymbol/FCryptoSymbol.vue';
import FSelectButton from '../core/FSelectButton/FSelectButton.vue';
import { eventBusMixin } from '../../mixins/event-bus.js';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';
import RatioInfo from '@/components/RatioInfo/RatioInfo.vue';
import DefiMintingMessage from '@/components/DefiMintingMessage/DefiMintingMessage.vue';
import TxConfirmationWindow from '@/components/windows/TxConfirmationWindow/TxConfirmationWindow.vue';

/**
 * Common component for defi mint and repay.
 */
export default {
    name: 'DefiBorrow',

    components: {
        TxConfirmationWindow,
        DefiMintingMessage,
        RatioInfo,
        FTokenValue,
        FSelectButton,
        FCryptoSymbol,
        DefiTokenPickerWindow,
        FMessage,
        FSlider,
    },

    mixins: [eventBusMixin],

    props: {
        /** @type {DefiToken} */
        token: {
            type: Object,
            default() {
                return null;
            },
        },
        /** */
        tokenSymbol: {
            type: String,
            default: '',
        },
        /** */
        tokenAddress: {
            type: String,
            default: '',
        },
        /** Follow this route on submit. */
        onSubmitRoute: {
            type: String,
            default: 'defi-manage-borrow-confirmation',
        },
        /** Used in fMint. */
        mintRepayMode: {
            type: Boolean,
            default: false,
        },
        /** Just borrow. */
        borrow: {
            type: Boolean,
            default: false,
        },
        /** Just repay. */
        repay: {
            type: Boolean,
            default: false,
        },
        /** Mode with sindgle token - no token picker,... */
        singleToken: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            /** @type {FMintAccount} */
            fMintAccount: {
                collateral: [],
                debt: [],
            },
            /** @type {DefiToken} */
            dToken: {},
            /** @type {DefiToken} */
            wtpcToken: {},
            /** @type {DefiToken} */
            tusdToken: {},
            /** @type {DefiToken[]} */
            tokens: [],
            currDebt: '0',
            tokenPrice: 0,
            increasedDebt: 0,
            decreasedDebt: 0,
            borrowOrRepay: this.borrow || this.repay,
            sliderLabels: ['0%', '25%', '50%', '75%', '100%'],
            windowTitle: '',
            windowSteps: [],
            id: getUniqueId(),
            stepsCount: this.repay ? 2 : 1,
        };
    },

    computed: {
        ...mapGetters(['currentAccount', 'defiSlippageReserve']),

        debt() {
            /** @type {FMintTokenBalance} */
            const tokenBalance = this.$defi.getFMintAccountDebt(this.fMintAccount, this.dToken);

            return this.$defi.fromTokenValue(tokenBalance.balance, this.dToken) || 0;
            // return this.$defi.fromTokenValue(this.fMintAccount.debtValue, this.tusdToken);
        },

        tokenDebt() {
            /** @type {FMintTokenBalance} */
            const tokenBalance = this.$defi.getFMintAccountDebt(this.fMintAccount, this.dToken);

            return this.$defi.fromTokenValue(tokenBalance.balance, this.dToken) || 0;
            // console.log(this.$defi.fromTokenValue(this.fMintAccount.debtValue, this.tusdToken));
            // return this.$defi.fromTokenValue(this.fMintAccount.debtValue, this.tusdToken);
        },

        /**
         * Temporarily take TPC as collateral.
         *
         * @return {number}
         */
        collateral() {
            /** @type {FMintTokenBalance} */
            const tokenBalance = this.$defi.getFMintAccountCollateral(this.fMintAccount, this.wtpcToken);

            return this.$defi.fromTokenValue(tokenBalance.balance, this.wtpcToken) || 0;
        },

        availableBalance() {
            return this.$defi.fromTokenValue(this.dToken.availableBalance, this.dToken) || 0;
        },

        collateralInTUSD() {
            return (this.collateral * this.$defi.getTokenPrice(this.wtpcToken)).toFixed(2);
            // return formatNumberByLocale(this.collateral * this.$defi.getTokenPrice(token), 2, 'USD');
        },

        currentPrice() {
            // return formatNumberByLocale(this.tokenPrice, 5, 'USD');
            return this.$defi.getTokenPrice(this.dToken);
        },

        borrowLimit() {
            const borrowLimit = this._borrowLimit;

            return borrowLimit - borrowLimit * this.defiSlippageReserve;
        },

        _borrowLimit() {
            if (this.borrowOrRepay) {
                return this.$defi.getBorrowLimit(this.fMintAccount) / this.tokenPrice;
            } else {
                return this.debt + this.$defi.getBorrowLimit(this.fMintAccount) / this.tokenPrice;
            }
            /*
            return (
                this.debt +
                Math.min(this.availableBalance, this.$defi.getBorrowLimit(this.fMintAccount) / this.tokenPrice)
            );
            */
            // return this.$defi.getBorrowLimit(this.fMintAccount) / this.tokenPrice;
        },

        currDebtTUSD() {
            // const currDebtTUSD = parseFloat(this.currDebt) * this.tokenPrice;
            const debt = parseFloat(this.debt);
            const debtTUSD = debt * this.tokenPrice;
            let cDebt = parseFloat(this.currDebt);

            if (this.borrow) {
                cDebt = debt + cDebt;
            } else if (this.repay) {
                cDebt = debt - cDebt;
            }

            return cDebt * this.tokenPrice - debtTUSD;
        },

        debtLimit() {
            return this.$defi.getDebtLimit(this.fMintAccount, this.currDebtTUSD);
        },

        collateralRatio() {
            return this.$defi.getCollateralRatio(this.fMintAccount, this.currDebtTUSD);
        },

        minDebt() {
            if (this.borrowOrRepay) {
                return 0;
            } else {
                return this._minDebt;
            }
        },

        _minDebt() {
            return this.defiSlippageReserve * this._maxDebt;
        },

        maxDebt() {
            if (this.repay) {
                return this.debt - this._minDebt;
            } else {
                // return Math.max(this.borrowLimit, this.debt);
                return this.borrowLimit;
            }
        },

        _maxDebt() {
            return Math.max(this._borrowLimit, this.debt);
        },

        fSliderMax() {
            let maxValue = 0;

            if (this.repay) {
                maxValue = this.availableBalance > 0 ? Math.min(this.maxDebt, this.availableBalance) : this.maxDebt;
            } else {
                maxValue = this.maxDebt;
            }

            return isNaN(maxValue) || maxValue < 0 ? 0 : maxValue;
        },

        inputValue() {
            return this.formatInputValue(this.currDebt);
        },

        submitDisabled() {
            return !parseFloat(this.currDebt);
            /*return !this.singleToken
                ? parseFloat(this.currDebt) === parseFloat(this.debt) && this.debt === 0
                : !parseFloat(this.currDebt);*/
        },

        cTokenSymbol() {
            return this.$defi.getTokenSymbol(this.dToken);
        },

        /**
         * Property is set to `true`, if 'small' breakpoint is reached.
         *
         * @return {Boolean}
         */
        smallView() {
            const breakpoint = this.$store.state.breakpoints['small'];

            return breakpoint && breakpoint.matches;
        },

        /**
         * Property is set to `true`, if 'medium' breakpoint is reached.
         *
         * @return {Boolean}
         */
        mediumView() {
            const breakpoint = this.$store.state.breakpoints['medium'];

            return breakpoint && breakpoint.matches;
        },

        /**
         * Property is set to `true`, if 'large' breakpoint is reached.
         *
         * @return {Boolean}
         */
        largeView() {
            const breakpoint = this.$store.state.breakpoints['large'];

            return breakpoint && breakpoint.matches;
        },

        label() {
            return this.borrow ? 'Borrow amount' : 'Repay amoun';
        },
    },

    watch: {
        currDebt(_value, _oldValue) {
            let cValue;

            if (_value !== _oldValue) {
                cValue = this.$refs.slider.getCorrectValue(_value);

                if (cValue !== _value && cValue === this.maxDebt.toString()) {
                    this.currDebt = cValue;
                }

                this.updateMessage();
            }
        },

        async dToken(_value) {
            if (_value) {
                this.tokenPrice = this.$defi.getTokenPrice(_value);

                if (!this.borrowOrRepay) {
                    this.$nextTick(() => {
                        this.currDebt = this.debt.toString();
                    });
                }
            }
        },
    },

    async created() {
        this.currDebt = this.debt.toString();
        this.updateMessage();

        this.init();

        this._eventBus.on('account-picked', this.onAccountPicked);
    },

    methods: {
        async init(_dontSetDToken) {
            const { $defi } = this;
            const result = await Promise.all([
                $defi.fetchFMintAccount(this.currentAccount.address),
                $defi.fetchTokens(this.currentAccount.address),
                $defi.init(),
            ]);
            const tokens = result[1];

            this.fMintAccount = result[0];
            this.wtpcToken = tokens.find((_item) => _item.symbol === 'WTPC');
            this.tusdToken = tokens.find((_item) => _item.symbol === 'TUSD');

            if (!this.singleToken) {
                // get tokens that are possible to borrow
                this.tokens = tokens.filter(this.getTokensFilter());
            }

            if (!_dontSetDToken) {
                if (this.token === null) {
                    if (this.tokenAddress) {
                        this.dToken = tokens.find((_token) => _token.address === this.tokenAddress);
                    } else if (this.tokenSymbol) {
                        this.dToken = tokens.find((_token) => _token.symbol === this.tokenSymbol);
                    } else {
                        // get first token that can be borrowed
                        this.dToken = tokens.find((token) => token.symbol === 'TUSD');
                    }
                } else {
                    this.dToken = tokens.find((_item) => _item.symbol === this.token.symbol);
                }
            }
        },

        getTokensFilter() {
            const { $defi } = this;

            if (this.mintRepayMode) {
                if (this.repay) {
                    return $defi.canTokenBeRepayed;
                } else {
                    return $defi.canTokenBeMinted;
                }
            }

            return $defi.canTokenBeBorrowed;
        },

        formatInputValue(_value) {
            return parseFloat(_value).toFixed(this.$defi.getTokenDecimals(this.dToken));
        },

        updateMessage() {
            this.increasedDebt = 0;
            this.decreasedDebt = 0;

            if (this.borrow) {
                this.increasedDebt = parseFloat(this.currDebt);
            } else if (this.repay) {
                this.decreasedDebt = parseFloat(this.currDebt);
            } else {
                const debtDiff = parseFloat(this.currDebt) - this.debt;

                if (debtDiff > 0) {
                    this.increasedDebt = debtDiff;
                } else if (debtDiff < 0) {
                    this.decreasedDebt = -debtDiff;
                }
                ``;
            }
        },

        updateCurrDebt() {
            if (!this.borrowOrRepay) {
                this.currDebt = this.debt.toString();
            }
        },

        onSubmit() {
            const tokenBalance = this.$defi.getFMintAccountDebt(this.fMintAccount, this.dToken);
            const params = {
                currDebt: parseFloat(this.currDebt),
                // debt: this.repay ? Math.min(this.availableBalance, this.debt) : this.debt,
                debt: this.debt,
                token: { ...this.dToken },
                debtBalanceHex: tokenBalance.balance,
                ratio: parseFloat(this.currDebt) / this.fSliderMax,
            };

            if ((this.borrowOrRepay && this.repay) || this.decreasedDebt > 0) {
                params.steps = this.stepsCount;
                params.step = this.$refs.confirmationWindow.activeStep;
            }

            if (this.borrow) {
                params.currDebt = this.debt + parseFloat(this.currDebt);
            } else if (this.repay) {
                params.currDebt = this.debt - parseFloat(this.currDebt);
            }

            if (!this.submitDisabled) {
                this.windowTitle = this.borrow ? 'Mint Synths' : 'Repay Synths';
                this.windowSteps = this.borrow ? [] : ['Allow', 'Confirm', 'Finished'];
                this.$refs.confirmationWindow.changeComponent('defi-borrow-confirmation', {
                    params,
                    compName: 'defi-mint-repay',
                    token: params.token,
                });
                this.$refs.confirmationWindow.show();

                /*
                this.$router.push({
                    name: this.onSubmitRoute,
                    params,
                });
                */
            }
        },

        onInput(_event) {
            this.currDebt = this.$refs.slider.getCorrectValue(_event.target.value);
            _event.target.value = this.formatInputValue(this.currDebt);
        },

        onTokenSelectorClick() {
            this.$refs.pickTokenWindow.show();
        },

        onDefiTokenPicked(_token) {
            this.dToken = _token;
            this.currDebt = '0';
        },

        onMinBtnClick() {
            this.currDebt = this.minDebt.toString();
        },

        onResetBtnClick() {
            this.updateCurrDebt();
        },

        onMaxBtnClick() {
            this.currDebt = this.maxDebt.toString();
        },

        onAccountPicked() {
            this.init();
        },

        onCancelButtonClick(cancelBtnClicked) {
            if (!cancelBtnClicked) {
                this.currDebt = '0';

                this.init();
            }
        },

        formatNumberByLocale,
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
