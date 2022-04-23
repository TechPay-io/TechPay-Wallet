<template>
    <div class="delegation-list-dt">
        <!--
        <h2 class="dt-heading">
            Delegations <span class="f-records-count">({{ totalCount | formatHexToInt }})</span>
        </h2>
        -->

        <template v-if="!delegationsByAddressError">
            <f-data-table
                :columns="columns"
                :items="dItems"
                :disable-infinite-scroll="!hasNext"
                :mobile-view="mobileView"
                :loading="loading"
                first-m-v-column-width="5"
                infinite-scroll
                f-card-off
                action-on-row
                caption="Wallet Delegations"
                class="f-data-table-body-bg-color"
                @row-action="$emit('row-action', $event)"
                @fetch-more="fetchMore"
            >
                <template v-slot:column-validator="{ value, item, column }">
                    <div v-if="column" class="row no-collapse no-vert-col-padding">
                        <div class="col-5 f-row-label">{{ column.label }}</div>
                        <div class="col break-word">
                            <template v-if="value">
                                {{ value.stakerInfo && value.stakerInfo.name ? value.stakerInfo.name : 'Unknown' }},
                                {{ value.id | formatHexToInt }}
                            </template>
                        </div>
                    </div>
                    <template v-else-if="value">
                        {{ value.stakerInfo && value.stakerInfo.name ? value.stakerInfo.name : 'Unknown' }},
                        {{ value.id | formatHexToInt }}
                    </template>
                </template>

                <template v-slot:column-amount="{ value, item, column }">
                    <div v-if="column" class="row no-collapse no-vert-col-padding">
                        <div class="col-6 f-row-label">{{ column.label }}</div>
                        <div class="col break-word">
                            <f-token-value
                                :value="value"
                                :decimals="filtersOptions.fractionDigits"
                                :use-placeholder="false"
                                no-currency
                            />
                        </div>
                    </div>
                    <template v-else>
                        <f-token-value
                            :value="value"
                            :decimals="filtersOptions.fractionDigits"
                            :use-placeholder="false"
                            no-currency
                        />
                    </template>
                </template>

                <template v-slot:column-detail="{ value, item, column }">
                    <div v-if="column" class="row no-collapse no-vert-col-padding">
                        <div class="col-5 f-row-label">{{ column.label }}</div>
                        <div class="col break-word">
                            <!--                        <button class="btn">Detail</button>-->
                            <a href="#" @click="onDetailLinkClick">Detail</a>
                            <br />
                            <a href="#" @click="(_event) => onClaimRewardsLinkClick(_event, item.delegation)">
                                Claim Rewards
                            </a>
                            <br />
                            <a href="#" @click="(_event) => onClaimRewardsLinkClick(_event, item.delegation, true)">
                                Claim & Restake
                            </a>
                        </div>
                    </div>
                    <template v-else-if="value">
                        <!--                        <button class="btn">Detail</button>-->
                        <a href="#" @click="onDetailLinkClick">Detail</a>
                        <br />
                        <a href="#" @click="(_event) => onClaimRewardsLinkClick(_event, item.delegation)">
                            Claim Rewards
                        </a>
                        <br />
                        <a href="#" @click="(_event) => onClaimRewardsLinkClick(_event, item.delegation, true)">
                            Claim & Restake
                        </a>
                    </template>
                </template>
            </f-data-table>
        </template>
        <template v-else>
            <div class="query-error">{{ delegationsByAddressError }}</div>
        </template>
    </div>
</template>

<script>
import FDataTable from '@/components/core/FDataTable/FDataTable.vue';
import gql from 'graphql-tag';
import { cloneObject } from '@/utils';
import { filtersOptions, formatDate, timestampToDate } from '@/filters.js';
import { WEIToTPC } from '@/utils/transactions.js';
import appConfig from '../../../../app.config.js';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';
// import { formatHexToInt } from '@/filters.js';
export default {
    name: 'DelegationList',

    components: { FTokenValue, FDataTable },

    props: {
        /** */
        accountAddress: {
            type: String,
            default: '',
            required: true,
        },
        /** Number of items per page. */
        itemsPerPage: {
            type: Number,
            default: 25,
        },
    },

    apollo: {
        delegationsByAddress: {
            query: gql`
                query DelegationsByAddress($address: Address!, $cursor: Cursor, $count: Int!) {
                    delegationsByAddress(address: $address, cursor: $cursor, count: $count) {
                        pageInfo {
                            first
                            last
                            hasNext
                            hasPrevious
                        }
                        totalCount
                        edges {
                            cursor
                            delegation {
                                toStakerId
                                createdTime
                                amount
                                isDelegationLocked
                                lockedFromEpoch
                            }
                        }
                    }
                }
            `,
            variables() {
                return {
                    address: this.accountAddress,
                    count: this.itemsPerPage,
                    cursor: null,
                };
            },
            async result(_data, _key) {
                let data;

                if (_key === 'delegationsByAddress') {
                    data = cloneObject(_data.data.delegationsByAddress);

                    let edges = data.edges;

                    if (edges && edges.length > 0 && edges[0].id && this.dItems.length > 0) {
                        return;
                    }

                    this.hasNext = data.pageInfo.hasNext;

                    edges = edges.filter((_edge) => _edge.delegation && _edge.delegation.amount !== '0x0');

                    if (this.dItems.length === 0) {
                        this.dItems = edges;
                    } else {
                        for (let i = 0, len1 = edges.length; i < len1; i++) {
                            this.dItems.push(edges[i]);
                        }
                    }

                    // this.totalCount = data.totalCount;
                    // const totalCount = formatHexToInt(this.totalCount);
                    this.totalCount = this.dItems.length;
                    const totalCount = this.totalCount;
                    this.$emit('records-count', totalCount);

                    if (totalCount === this.dItems.length) {
                        this.$emit('all-records-loaded');
                    }

                    const stakers = await this.fetchStakers();
                    if (stakers && stakers.length > 0) {
                        // data.edges[0].delegation._validator = 'werwer';
                        edges.forEach((_item) => {
                            _item.delegation = {
                                ..._item.delegation,
                                _validator: stakers.find((_staker) => _staker.id === _item.delegation.toStakerId),
                            };
                        });
                    }
                }
            },
            error(_error) {
                this.delegationsByAddressError = _error.message;
            },
        },
    },

    data() {
        return {
            columns: [
                {
                    name: 'createdTime',
                    label: 'Delegation Time',
                    itemProp: 'delegation.createdTime',
                    formatter: (_value) => formatDate(timestampToDate(_value), true),
                },
                {
                    name: 'validator',
                    label: 'Validator',
                    itemProp: 'delegation._validator',
                    // formatter: (_value, _item) => _item._validator,
                    width: '150px',
                    cssClass: 'align-center',
                },
                {
                    name: 'amount',
                    label: 'Amount (TPC)',
                    itemProp: 'delegation.amount',
                    formatter: (_value) => WEIToTPC(_value),
                    width: '160px',
                    cssClass: 'align-center',
                },
                /*{
                    name: 'rewards',
                    label: 'Pending Rewards (TPC)',
                    itemProp: 'delegation.pendingRewards',
                    formatter: (_value) => (_value ? formatNumberByLocale(WEIToTPC(_value.amount)) : '-'),
                    width: '160px',
                    cssClass: 'align-center',
                },
                {
                    name: '',
                    label: 'Unlock Date',
                    itemProp: 'delegation.lockedUntil',
                    formatter: (_value) => formatDate(timestampToDate(_value), true) || '-',
                    cssClass: 'align-center',
                },*/
                {
                    name: 'detail',
                    label: 'Action',
                    // itemProp: 'delegation.lockedUntil',
                    formatter: () => true,
                    cssClass: 'align-end',
                },
            ],
            dItems: [],
            explorerUrl: appConfig.explorerUrl,
            hasNext: false,
            delegationsByAddressError: '',
            totalCount: 0,
            filtersOptions,
        };
    },

    computed: {
        /**
         * Property is set to `true`, if 'account-transaction-list-dt-mobile-view' breakpoint is reached.
         *
         * @return {Boolean}
         */
        mobileView() {
            const dataTableBreakpoint = this.$store.state.breakpoints['account-transaction-list-dt-mobile-view'];

            return dataTableBreakpoint && dataTableBreakpoint.matches;
        },

        loading() {
            return this.$apollo.queries.delegationsByAddress.loading;
        },
    },

    methods: {
        async fetchStakers() {
            const data = await this.$apollo.query({
                query: gql`
                    query Stakers {
                        stakers {
                            id
                            stakerAddress
                            stakerInfo {
                                name
                                website
                                contact
                                logoUrl
                            }
                        }
                    }
                `,
                fetchPolicy: 'network-only',
            });

            return data.data.stakers;
        },

        fetchMore() {
            const { delegationsByAddress } = this;

            if (delegationsByAddress && delegationsByAddress.pageInfo && delegationsByAddress.pageInfo.hasNext) {
                const cursor = delegationsByAddress.pageInfo.last;

                this.$apollo.queries.delegationsByAddress.fetchMore({
                    variables: {
                        cursor,
                        count: this.itemsPerPage,
                    },
                    updateQuery: (previousResult, { fetchMoreResult }) => {
                        return fetchMoreResult;
                    },
                });
            }
        },

        onDetailLinkClick(_event) {
            _event.preventDefault();
        },

        onClaimRewardsLinkClick(_event, _delegation, _reStake = false) {
            _event.preventDefault();
            _event.stopPropagation();

            this.$emit('claim-rewards', {
                delegation: _delegation,
                reStake: _reStake,
                fromDelegationList: true,
            });
        },
    },
};
</script>
