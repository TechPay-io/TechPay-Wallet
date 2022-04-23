<template>
    <div class="synths-positions-list-dt">
        <f-data-table
            :columns="columns"
            :items="items"
            :action-on-row="actionOnRow"
            first-m-v-column-width="6"
            f-card-off
            caption="Synths Positions"
            class="f-data-table-body-bg-color"
        >
            <template v-slot:column-asset="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <f-crypto-symbol :token="item" />
                    </div>
                </div>
                <template v-else>
                    <f-crypto-symbol :token="item" />
                </template>
            </template>

            <template v-slot:column-amount="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <f-token-value
                            :value="formatDebt(item)"
                            :token="item"
                            :use-placeholder="false"
                            :max-decimals="MAX_TOKEN_DECIMALS_IN_TABLES"
                            no-currency
                        />
                    </div>
                </div>
                <template v-else>
                    <f-token-value
                        :value="formatDebt(item)"
                        :token="item"
                        :use-placeholder="false"
                        :max-decimals="MAX_TOKEN_DECIMALS_IN_TABLES"
                        no-currency
                    />
                </template>
            </template>

            <template v-slot:column-amount_tusd="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <f-token-value
                            :value="formatDebtTUSD(item)"
                            :token="{ symbol: 'TUSD' }"
                            :use-placeholder="false"
                            :max-decimals="MAX_TOKEN_DECIMALS_IN_TABLES"
                            no-currency
                        />
                    </div>
                </div>
                <template v-else>
                    <f-token-value
                        :value="formatDebtTUSD(item)"
                        :token="{ symbol: 'TUSD' }"
                        :use-placeholder="false"
                        :max-decimals="MAX_TOKEN_DECIMALS_IN_TABLES"
                        no-currency
                    />
                </template>
            </template>

            <template v-slot:column-actions="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <template v-if="item.canMint">
                            <router-link :to="{ name: 'defi-mint', params: { tokenAddress: item.address } }">
                                Mint
                            </router-link>
                            ,
                        </template>
                        <router-link :to="{ name: 'defi-repay', params: { tokenAddress: item.address } }">
                            Repay
                        </router-link>
                    </div>
                </div>
                <template v-else>
                    <template v-if="item.canMint">
                        <router-link :to="{ name: 'defi-mint', params: { tokenAddress: item.address } }">
                            Mint
                        </router-link>
                        <br />
                    </template>
                    <router-link :to="{ name: 'defi-repay', params: { tokenAddress: item.address } }">
                        Repay
                    </router-link>
                </template>
            </template>
        </f-data-table>

        <deposit-or-borrow-token-window
            ref="win"
            :token="dbToken"
            :deposit-route-name="depositRouteName"
            :borrow-route-name="borrowRouteName"
        />
    </div>
</template>

<script>
import FDataTable from '@/components/core/FDataTable/FDataTable.vue';
import FCryptoSymbol from '@/components/core/FCryptoSymbol/FCryptoSymbol.vue';
import { numberSort, stringSort } from '@/utils/array-sorting.js';
import DepositOrBorrowTokenWindow from '@/components/windows/DepositOrBorrowTokenWindow/DepositOrBorrowTokenWindow.vue';
import { MAX_TOKEN_DECIMALS_IN_TABLES } from '@/plugins/techpay-web3-wallet.js';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';

export default {
    name: 'SynthsPositionsList',

    components: { FTokenValue, DepositOrBorrowTokenWindow, FCryptoSymbol, FDataTable },

    props: {
        /** @type {DefiToken[]} */
        tokens: {
            type: Array,
            required: true,
            default() {
                return [];
            },
        },
        /** @type {FMintAccount} */
        fMintAccount: {
            type: Object,
            default() {
                return {
                    collateral: [],
                    debt: [],
                };
            },
        },
        depositRouteName: {
            type: String,
            default: 'defi-manage-deposit',
        },
        borrowRouteName: {
            type: String,
            default: 'defi-manage-borrow',
        },
        /** If `true`, row will become clickable. */
        actionOnRow: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            items: [],
            /** @type {DeFi} */
            defi: this.$defi,
            /** Token used in <deposit-or-borrow-token-window> */
            dbToken: {},
            columns: [
                {
                    name: 'asset',
                    label: 'Asset',
                    sortFunc: (_itemProp, _direction = 'asc') => {
                        return (_a, _b) => {
                            const a = _a.symbol;
                            const b = _b.symbol;

                            return (_direction === 'desc' ? -1 : 1) * stringSort(a, b);
                        };
                    },
                    width: '140px',
                },
                {
                    name: 'amount',
                    label: 'Amount',
                    cssClass: 'align-center',
                },
                {
                    name: 'amount_tusd',
                    label: 'Amount (tUSD)',
                    sortDir: 'desc',
                    sortFunc: (_itemProp, _direction = 'asc') => {
                        return (_a, _b) => {
                            const aTokenPrice = this.defi.getTokenPrice(_a);
                            const a = this.getDebt(_a) * aTokenPrice + this.getCollateral(_a) * aTokenPrice;
                            const bTokenPrice = this.defi.getTokenPrice(_b);
                            const b = this.getDebt(_b) * bTokenPrice + this.getCollateral(_b) * bTokenPrice;

                            return (_direction === 'desc' ? -1 : 1) * numberSort(a, b);
                        };
                    },
                    cssClass: 'align-center',
                },
                {
                    name: 'actions',
                    label: 'Actions',
                    width: '180px',
                    cssClass: 'align-end',
                },
            ],
            MAX_TOKEN_DECIMALS_IN_TABLES,
        };
    },

    watch: {
        /**
         * @param {DefiToken[]} _value
         */
        async tokens(_value) {
            let tokens = _value.filter((_item) => _item.isActive && _item.symbol !== 'TPC');

            const items = tokens.filter((_item) => {
                const debt = this.getDebt(_item);

                if (debt !== 0) {
                    _item._debt = debt;

                    return true;
                }

                return false;
            });

            this.items = items;

            this.$emit('records-count', this.items.length);
        },
    },

    methods: {
        /**
         * @param {DefiToken} _token
         * @return {*|number}
         */
        getDebt(_token) {
            /** @type {FMintTokenBalance} */
            const tokenBalance = this.$defi.getFMintAccountDebt(this.fMintAccount, _token);

            return this.$defi.fromTokenValue(tokenBalance.balance, _token) || 0;
        },

        /**
         * @param {DefiToken} _token
         * @return {*|number}
         */
        formatDebt(_token) {
            const debt = '_debt' in _token ? _token._debt : this.getDebt(_token);

            return debt > 0 ? debt : 0;
        },

        /**
         * @param {DefiToken} _token
         * @return {*|number}
         */
        formatDebtTUSD(_token) {
            const debt = this.getDebt(_token);

            return debt > 0 ? debt * this.defi.getTokenPrice(_token) : 0;
        },

        /**
         * @param {DefiToken} _token
         * @return {*|number}
         */
        getCollateral(_token) {
            /** @type {FMintTokenBalance} */
            const tokenBalance = this.$defi.getFMintAccountCollateral(this.fMintAccount, _token);

            return this.$defi.fromTokenValue(tokenBalance.balance, _token) || 0;
        },
    },
};
</script>
