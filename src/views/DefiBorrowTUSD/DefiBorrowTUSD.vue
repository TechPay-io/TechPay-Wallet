<template>
    <div class="defi-borrow-tusd">
        <h1 class="with-back-btn">
            <f-back-button :route-name="backButtonRoute" />
            Mint/Repay tUSD
        </h1>

        <h2 class="perex">
            Mint tUSD with your locked {{ wtpcTokenSymbol }} or repay tUSD to unlock your {{ wtpcTokenSymbol }}. You can
            use tUSD to trade synths, lend it to the liquidity pool to earn interest, and use it as a collateral to
            borrow synths.
        </h2>

        <div class="grid">
            <div>
                <div class="df-data-item smaller">
                    <h3 class="label">Max mintable</h3>
                    <div class="value"><f-token-value :token="tusdToken" :value="maxMintable" /></div>
                </div>
                <!--
                <div v-else class="df-data-item smaller">
                    <h3 class="label">tUSD balance</h3>
                    <div class="value">{{ debt }} <span class="currency">tUSD</span></div>
                </div>
                -->

                <div class="df-data-item smaller">
                    <h3 class="label">Current price</h3>
                    <div class="value">
                        <f-token-value
                            :value="currentPrice"
                            :content-loaded="!!tokenPrice"
                            :decimals="5"
                            number-currency="USD"
                            replacement-text="$0.00000"
                            no-currency
                        />
                    </div>
                </div>

                <template v-if="!largeView">
                    <div class="df-data-item smaller">
                        <h3 class="label">Minted</h3>
                        <div class="value"><f-token-value :token="tusdToken" :value="debt" /></div>
                    </div>
                    <div class="df-data-item smaller">
                        <h3 class="label">Locked balance</h3>
                        <div class="value"><f-token-value :token="wtpcToken" :value="collateral" /></div>
                    </div>
                </template>
            </div>
            <div class="defi-price-input-col align-center">
                <div class="defi-price-input">
                    <label :for="`text-input-${id}`" class="not-visible">{{ label }}</label>
                    <input
                        :id="`text-input-${id}`"
                        ref="input"
                        :value="inputValue"
                        :min="minDebt"
                        :max="maxDebt"
                        type="number"
                        step="any"
                        class="text-input no-style"
                        @change="onInput"
                    />

                    <div class="f-slider-wrap">
                        <f-slider
                            ref="slider"
                            v-model="currDebt"
                            step="any"
                            :min="minDebt.toString()"
                            :max="maxDebt.toString()"
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

                    <div class="token-label">tUSD</div>
                    <div class="token-info">
                        <div class="token-info-label">Repay<br />tUSD</div>
                        <icon data="@/assets/svg/angle-double-left.svg" width="66" height="66" aria-hidden="true" />
                    </div>
                    <div class="token-info increase">
                        <div class="token-info-label">Mint<br />tUSD</div>
                        <icon data="@/assets/svg/angle-double-right.svg" width="66" height="66" aria-hidden="true" />
                    </div>
                </div>
            </div>
            <div v-if="!smallView" class="minting-limit-col align-center">
                <h3>Debt Limit <debt-limit-f-info /></h3>
                <f-circle-progress
                    show-percentage
                    :stroke-width="6"
                    :animate="false"
                    :colors="colors"
                    :value="debtLimit"
                />
            </div>
            <div v-if="largeView" class="right-col">
                <div v-if="!smallView" class="df-data-item smaller">
                    <h3 class="label">Today’s change</h3>
                    <div class="value">2.38%</div>
                </div>
                <div class="df-data-item smaller">
                    <h3 class="label">Locked balance</h3>
                    <div class="value"><f-token-value :token="wtpcToken" :value="collateral" /></div>
                </div>
                <div v-if="smallView" class="df-data-item smaller">
                    <h3 class="label">Debt Limit <debt-limit-f-info /></h3>
                    <div class="value">
                        <f-placeholder :content-loaded="!!tusdToken.symbol" replacement-text="99%">
                            <f-colored-number-range show-percentage :colors="colors" :value="debtLimit" />
                        </f-placeholder>
                    </div>
                </div>
            </div>

            <f-message v-if="increasedDebt > 0" type="info" role="alert" class="big">
                You’re adding
                <span class="inc-desc-collateral">
                    <f-token-value :token="tusdToken" :value="increasedDebt" no-currency /> tUSD
                </span>
            </f-message>
            <f-message v-else-if="decreasedDebt > 0" type="info" role="alert" class="big">
                You’re removing
                <span class="inc-desc-collateral">
                    <f-token-value :token="tusdToken" :value="decreasedDebt" no-currency /> tUSD
                </span>
            </f-message>
        </div>

        <div class="defi-buttons">
            <button class="btn large" :disabled="submitDisabled" @click="onSubmit">
                Submit
                <!--
                <template v-if="submitDisabled">Submit</template>
                <template v-else-if="increasedDebt > 0 || debt === 0">
                    Mint now
                </template>
                <template v-else>
                    Repay now
                </template>
                -->
            </button>
        </div>
    </div>
</template>

<script>
import FBackButton from '../../components/core/FBackButton/FBackButton.vue';
import FColoredNumberRange from '../../components/core/FColoredNumberRange/FColoredNumberRange.vue';
import FSlider from '../../components/core/FSlider/FSlider.vue';
import FCircleProgress from '../../components/core/FCircleProgress/FCircleProgress.vue';
import { getUniqueId } from '../../utils';
import { mapGetters } from 'vuex';
import { getAppParentNode } from '../../app-structure.js';
import FMessage from '../../components/core/FMessage/FMessage.vue';
import { eventBusMixin } from '../../mixins/event-bus.js';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';
import FPlaceholder from '@/components/core/FPlaceholder/FPlaceholder.vue';
import DebtLimitFInfo from '@/components/DebLimitFInfo/DebtLimitFInfo.vue';

/**
 * Common component for defi mint and repay.
 */
export default {
    name: 'DefiBorrowTUSD',

    components: {
        DebtLimitFInfo,
        FPlaceholder,
        FTokenValue,
        FMessage,
        FBackButton,
        FColoredNumberRange,
        FSlider,
        FCircleProgress,
    },

    mixins: [eventBusMixin],

    data() {
        return {
            /** @type {FMintAccount} */
            fMintAccount: {
                collateral: [],
                debt: [],
            },
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
            label: 'tmp',
            id: getUniqueId(),
        };
    },

    computed: {
        ...mapGetters(['currentAccount', 'defiSlippageReserve']),

        debt() {
            /** @type {FMintTokenBalance} */
            const tokenBalance = this.$defi.getFMintAccountDebt(this.fMintAccount, this.tusdToken);

            return this.$defi.fromTokenValue(tokenBalance.balance, this.tusdToken) || 0;
        },

        collateral() {
            /** @type {FMintTokenBalance} */
            const tokenBalance = this.$defi.getFMintAccountCollateral(this.fMintAccount, this.wtpcToken);

            return this.$defi.fromTokenValue(tokenBalance.balance, this.wtpcToken) || 0;
        },

        currentPrice() {
            return this.tokenPrice;
        },

        availableBalance() {
            return this.wtpcToken ? this.$defi.fromTokenValue(this.wtpcToken.availableBalance, this.wtpcToken) || 0 : 0;
        },

        maxMintable() {
            const maxMintable = this._maxMintable;

            return maxMintable - maxMintable * this.defiSlippageReserve;
        },

        _maxMintable() {
            return this.debt + this.$defi.getBorrowLimit(this.fMintAccount);
            /*
            return (
                this.debt +
                Math.min(
                    this.availableBalance * this.tokenPrice,
                    this.$defi.getBorrowLimit(this.fMintAccount) / this.tokenPrice
                )
            );
            */
            // return this.$defi.getMaxDebt(this.collateral, this.tokenPrice).toFixed(2);
        },

        debtLimit() {
            const debtTUSD = parseFloat(this.debt);
            const currDebtTUSD = parseFloat(this.currDebt) - debtTUSD;

            return this.$defi.getDebtLimit(this.fMintAccount, currDebtTUSD);
        },

        minDebt() {
            return this.defiSlippageReserve * this._maxDebt;
        },

        maxDebt() {
            return Math.max(this.maxMintable, this.debt);
        },

        _maxDebt() {
            return Math.max(this._maxMintable, this.debt);
        },

        inputValue() {
            return this.formatInputValue(this.currDebt);
        },

        submitDisabled() {
            return parseFloat(this.currDebt) === parseFloat(this.debt);
        },

        colors() {
            return this.$defi.getDebtLimitColors();
        },

        wtpcTokenSymbol() {
            return this.$defi.getTokenSymbol(this.wtpcToken);
        },

        backButtonRoute() {
            const parentNode = getAppParentNode('defi-borrow-tusd');

            return parentNode ? parentNode.id : '';
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
    },

    created() {
        this.updateMessage();

        this.init();

        this._eventBus.on('account-picked', this.onAccountPicked);
    },

    methods: {
        async init() {
            const { $defi } = this;
            const result = await Promise.all([
                $defi.fetchFMintAccount(this.currentAccount.address),
                $defi.fetchTokens(this.currentAccount.address),
                $defi.init(),
            ]);

            this.fMintAccount = result[0];
            this.tokens = result[1];
            this.wtpcToken = this.tokens.find((_item) => _item.symbol === 'WTPC');
            this.tusdToken = this.tokens.find((_item) => _item.symbol === 'TUSD');
            this.tokenPrice = $defi.getTokenPrice(this.wtpcToken);
            this.currDebt = this.debt.toString();
        },

        formatInputValue(_value) {
            return parseFloat(_value).toFixed(this.$defi.getTokenDecimals(this.tusdToken));
        },

        updateMessage() {
            const debtDiff = parseFloat(this.currDebt) - this.debt;

            this.increasedDebt = 0;
            this.decreasedDebt = 0;

            if (debtDiff > 0) {
                this.increasedDebt = debtDiff;
            } else if (debtDiff < 0) {
                this.decreasedDebt = -debtDiff;
            }
        },

        updateCurrDebt() {
            this.currDebt = this.debt.toString();
        },

        onSubmit() {
            const tokenBalance = this.$defi.getFMintAccountDebt(this.fMintAccount, this.tusdToken);
            const params = {
                currDebt: parseFloat(this.currDebt),
                debt: this.debt,
                token: this.tusdToken,
                borrowLimitHex: this.$defi.getBorrowLimitHex(this.fMintAccount),
                debtBalanceHex: tokenBalance.balance,
            };

            if (this.decreasedDebt > 0) {
                params.steps = 2;
                params.step = 1;
            }

            if (!this.submitDisabled) {
                this.$router.push({
                    name: 'defi-borrow-tusd-confirmation',
                    params,
                });
            }
        },

        onInput(_event) {
            this.currDebt = this.$refs.slider.getCorrectValue(_event.target.value);
            _event.target.value = this.formatInputValue(this.currDebt);
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
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
