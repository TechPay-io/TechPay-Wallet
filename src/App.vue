<template>
    <div id="app">
        <!--        <top-disclaimer />-->
        <!--            <router-view :key="$route.path"></router-view>-->

        <!--        <router-view aria-live="polite"></router-view>-->
        <router-view></router-view>

        <!--
        <f-header></f-header>
        <main>
            <router-view></router-view>
        </main>
        <f-footer></f-footer>
-->

        <f-breakpoints @f-breakpoint-change="onFBreakpointChange">
            <f-breakpoint value="576px" code="small"></f-breakpoint>
            <f-breakpoint value="600px" code="data-table-mobile-view"></f-breakpoint>
            <f-breakpoint value="768px" code="menu-mobile"></f-breakpoint>
            <f-breakpoint value="769px" code="medium"></f-breakpoint>
            <f-breakpoint value="870px" code="account-transaction-list-dt-mobile-view"></f-breakpoint>
            <f-breakpoint value="890px" code="pairs-list-mobile-view"></f-breakpoint>
            <f-breakpoint value="992px" code="large"></f-breakpoint>
            <f-breakpoint value="1100px" code="validator-list-dt-mobile-view"></f-breakpoint>
        </f-breakpoints>
        <f-aria-alert />
        <f-network-status />
        <m-m-account-picker-window ref="mmAccountPickerWindow" :mm-account="dMMAccount" />
    </div>
</template>

<script>
import FBreakpoint from './components/core/FBreakpoints/FBreakpoint.vue';
import FBreakpoints from './components/core/FBreakpoints/FBreakpoints.vue';
import {
    PUSH_BNBRIDGE_PENDING_REQUEST,
    SET_BREAKPOINT,
    SET_CURRENCY,
    SET_DEFI_SLIPPAGE_RESERVE,
    SET_FRACTION_DIGITS,
    SET_DARK_MODE,
    SET_TOKEN_PRICE,
    SHIFT_BNBRIDGE_PENDING_REQUEST,
    REMOVE_BNBRIDGE_PENDING_REQUEST,
    SET_FUNISWAP_SLIPPAGE_TOLERANCE,
} from './store/mutations.type.js';
import FAriaAlert from './components/core/FAriaAlert/FAriaAlert.vue';
import { filtersOptions } from './filters.js';
import { eventBusMixin } from './mixins/event-bus.js';
import FNetworkStatus from '@/components/core/FNetworkStatus/FNetworkStatus.vue';
import MMAccountPickerWindow from '@/components/mm/MMAccountPickerWindow/MMAccountPickerWindow.vue';
import { mapGetters, mapState } from 'vuex';
import { switchRTLDirection } from '@/components/RTLSwitch/RTLSwitch.vue';

export default {
    name: 'App',

    components: {
        MMAccountPickerWindow,
        FNetworkStatus,
        FAriaAlert,
        FBreakpoint,
        FBreakpoints,
    },

    mixins: [eventBusMixin],

    data() {
        return {
            dMMAccount: '',
        };
    },

    computed: {
        /*
        ...mapState('mm', {
            mmAccount: 'account',
        }),
        */

        ...mapGetters(['getAccountByAddress']),

        ...mapState(['autoDarkMode']),
    },

    watch: {
        autoDarkMode(value) {
            if (value) {
                const useDarkColorScheme = window.matchMedia('(prefers-color-scheme: dark)');

                if (useDarkColorScheme) {
                    this.darkMode(useDarkColorScheme.matches);
                }
            }
        },
    },

    created() {
        const { state } = this.$store;

        const useDarkColorScheme = window.matchMedia('(prefers-color-scheme: dark)');

        if (useDarkColorScheme) {
            useDarkColorScheme.addEventListener('change', (_event) => {
                if (state.autoDarkMode) {
                    this.darkMode(_event.matches);
                }
            });
        }

        this.darkMode(state.autoDarkMode && useDarkColorScheme ? useDarkColorScheme.matches : state.darkMode);

        switchRTLDirection(state.rtlDir);

        filtersOptions.currency = state.currency;
        filtersOptions.fractionDigits = state.fractionDigits;
        this.setTokenPrice(state.currency);

        this.$bnb.setFSTRequestPushCallback((_request) => {
            this.onFSTRequestPush(_request);
        });
        this.$bnb.setFSTRequestDoneCallback((_request) => {
            this.onFSTRequestDone(_request);
        });
        this.$bnb.setFSTRequestCancelCallback((_request) => {
            this.onFSTRequestCancel(_request);
        });
        this.$bnb.setFSTPendingRequests([...state.bnbridgePendingRequests]);
        this.$bnb.processFSTPendingRequests();

        // this.$store.dispatch(ADD_ACCOUNT, { address: '' });
    },

    methods: {
        async setTokenPrice(_currency = filtersOptions.currency) {
            const tokenPrice = await this.$fWallet.getTokenPrice(_currency);

            filtersOptions.tokenPrice = tokenPrice;

            this.$store.commit(SET_TOKEN_PRICE, tokenPrice);
        },

        /**
         * @param {string} _currency
         */
        async setCurrency(_currency) {
            if (_currency) {
                filtersOptions.currency = _currency;
                this.$store.commit(SET_CURRENCY, _currency);
                await this.setTokenPrice(_currency);
            }
        },

        /**
         * @param {int} _fractionDigits
         */
        setFractionDigits(_fractionDigits) {
            if (_fractionDigits) {
                filtersOptions.fractionDigits = _fractionDigits;
                this.$store.commit(SET_FRACTION_DIGITS, _fractionDigits);
            }
        },

        /**
         * @param {number} _defiSlippageReserve
         */
        setDefiSlippageReserve(_defiSlippageReserve) {
            if (_defiSlippageReserve) {
                this.$store.commit(SET_DEFI_SLIPPAGE_RESERVE, _defiSlippageReserve);
            }
        },

        /**
         * @param {number} _fUniswapSlippageTolerance
         */
        setFUniswapSlippageTolerance(_fUniswapSlippageTolerance) {
            if (_fUniswapSlippageTolerance) {
                this.$store.commit(SET_FUNISWAP_SLIPPAGE_TOLERANCE, _fUniswapSlippageTolerance);
            }
        },

        /**
         * @param {boolean} _on
         */
        setDarkMode(_on) {
            this.$store.commit(SET_DARK_MODE, _on);

            this.darkMode(_on);
        },

        /**
         * @param {boolean} _on
         */
        darkMode(_on) {
            const { documentElement } = document;

            documentElement.classList.add('theme-transition');

            if (_on) {
                documentElement.classList.add('dark-theme');
            } else {
                documentElement.classList.remove('dark-theme');
            }

            setTimeout(function () {
                documentElement.classList.remove('theme-transition');
            }, 250);
        },

        /**
         * @param {string} _account MM account.
         */
        showMMAccountPickerWindow(_account) {
            if (_account) {
                this.dMMAccount = this.$fWallet.toChecksumAddress(_account);
            }
            this.$refs.mmAccountPickerWindow.show();
        },

        onFBreakpointChange(_event) {
            this.$store.commit(SET_BREAKPOINT, _event.detail);
        },

        /**
         * @param {FSTRequest} _request
         */
        onFSTRequestPush(_request) {
            // console.log('onFSTRequestPush', _request);
            this.$store.commit(PUSH_BNBRIDGE_PENDING_REQUEST, _request);
        },

        /**
         * @param {FSTRequest} _request
         */
        onFSTRequestDone(_request) {
            // console.log('onFSTRequestDone', _request);
            this._eventBus.emit('fst-request-done', _request);
            this.$store.commit(SHIFT_BNBRIDGE_PENDING_REQUEST);
        },

        /**
         * @param {FSTRequest} _request
         */
        onFSTRequestCancel(_request) {
            this.$store.commit(REMOVE_BNBRIDGE_PENDING_REQUEST, _request);
        },
    },
};
</script>

<style lang="scss">
@import './assets/scss/main';
</style>
