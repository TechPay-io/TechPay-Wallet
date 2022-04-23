<template>
    <div class="delegations-info">
        <h1 data-focus="staking">Staking</h1>

        <f-tabs class="account-main-content-mt__">
            <template #delegations>
                Wallet Delegations
                <span class="f-records-count">({{ delegationsRecordsCount }})</span>
            </template>
            <template #all-delegations>
                All Delegations
                <span class="f-records-count">({{ allDelegationsRecordsCount }})</span>
            </template>

            <f-tab title-slot="delegations">
                <f-card class="f-data-layout">
                    <delegation-list
                        :account-address="currentAccount.address"
                        @row-action="onDelegationsRowAction"
                        @claim-rewards="onClaimRewards"
                        @records-count="onDelegationsRecordsCount"
                        @all-records-loaded="onDelegationsRecordsLoaded"
                    />
                    <div class="add-delegation-cont">
                        <button class="btn large" type="button" @click="onAddDelegationBtnClick">
                            <icon data="@/assets/svg/plus.svg" width="16" height="16" aria-hidden="true" /> Add
                            delegation
                        </button>
                    </div>
                </f-card>
            </f-tab>
            <f-tab title-slot="all-delegations">
                <f-card>
                    <all-delegations-list
                        :account-address="currentAccount.address"
                        :load-data="loadAllDelegations"
                        @row-action="onAllDelegationsRowAction"
                        @claim-rewards="onAllDelegationsClaimRewards"
                        @records-count="onAllDelegationsRecordsCount"
                    />
                </f-card>
            </f-tab>
        </f-tabs>

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
import FCard from '@/components/core/FCard/FCard.vue';
import DelegationList from '@/components/data-tables/DelegationList/DelegationList.vue';
import { mapGetters } from 'vuex';
import FTabs from '@/components/core/FTabs/FTabs.vue';
import FTab from '@/components/core/FTabs/FTab.vue';
import AllDelegationsList from '@/components/data-tables/AllDelegationsList/AllDelegationsList.vue';
import {
    DEACTIVATE_ACTIVE_ACCOUNT,
    SET_ACTIVE_ACCOUNT_ADDRESS,
    SET_ACTIVE_ACCOUNT_BY_ADDRESS,
} from '@/store/mutations.type.js';
import { focusElem } from '@/utils/aria.js';
import TxConfirmationWindow from '@/components/windows/TxConfirmationWindow/TxConfirmationWindow.vue';

export default {
    name: 'DelegationsInfo',

    components: { TxConfirmationWindow, AllDelegationsList, FTab, FTabs, DelegationList, FCard },

    data() {
        return {
            delegationsRecordsCount: 0,
            allDelegationsRecordsCount: 0,
            loadAllDelegations: false,
            reStake: false,
            windowTitle: '',
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),
    },

    mounted() {
        focusElem(null, '[data-focus="staking"]');
    },

    methods: {
        /**
         * @param {string} _address
         */
        setActiveAccount(_address) {
            this.$store.commit(DEACTIVATE_ACTIVE_ACCOUNT);
            this.$store.commit(SET_ACTIVE_ACCOUNT_BY_ADDRESS, _address);
            this.$store.commit(SET_ACTIVE_ACCOUNT_ADDRESS, _address);
        },

        showConfirmationWindow(_compName, _data, _title = '') {
            this.windowTitle = _title;
            this.$refs.confirmationWindow.changeComponent(_compName, _data);
            this.$refs.confirmationWindow.show();
        },

        onAddDelegationBtnClick() {
            this.$router.push({
                name: 'staking-stake-form',
                params: {
                    increaseDelegation: false,
                    stakerInfo: {
                        stakerInfo: {
                            name: 'Unknown',
                        },
                    },
                    previousComponent: 'delegations-info',
                },
            });
        },

        /**
         * @param {object} _item
         */
        onDelegationsRowAction(_item) {
            this.$router.push({
                name: 'staking-info',
                params: {
                    stakerId: _item.delegation.toStakerId,
                },
            });
        },

        /**
         * @param {object} _item
         */
        onAllDelegationsRowAction(_item) {
            const address = _item.accountAddress;

            if (this.currentAccount.address.toLowerCase() !== address.toLowerCase()) {
                this.setActiveAccount(address);
                this.$router.replace({
                    name: 'staking',
                    params: { address },
                });
            }

            this.$router.push({
                name: 'staking-info',
                params: {
                    stakerId: _item.delegation.toStakerId,
                },
            });
        },

        onDelegationsRecordsCount(_count) {
            this.delegationsRecordsCount = _count;
        },

        onDelegationsRecordsLoaded() {
            this.loadAllDelegations = true;
        },

        onAllDelegationsRecordsCount(_count) {
            this.allDelegationsRecordsCount = _count;
        },

        onClaimRewards(_data) {
            this.showConfirmationWindow(
                'claim-rewards-confirmation',
                {
                    stakerId: _data.delegation.toStakerId,
                    reStake: _data.reStake,
                    fromDelegationList: _data.fromDelegationList,
                },
                _data.reStake ? 'Claim & Restake' : 'Claim Rewards'
            );

            this.reStake = _data.reStake;
        },

        onAllDelegationsClaimRewards(_data) {
            const address = _data.accountAddress;

            if (address && this.currentAccount.address.toLowerCase() !== address.toLowerCase()) {
                this.setActiveAccount(address);
                this.$router.replace({
                    name: 'staking',
                    params: { address },
                });

                this.$router.push({
                    name: 'staking-info',
                    params: {
                        stakerId: _data.delegation.toStakerId,
                        claim: true,
                        reStake: _data.reStake,
                    },
                });
            } else {
                this.showConfirmationWindow(
                    'claim-rewards-confirmation',
                    {
                        stakerId: _data.delegation.toStakerId,
                        reStake: _data.reStake,
                        fromDelegationList: _data.fromDelegationList,
                    },
                    _data.reStake ? 'Claim & Restake' : 'Claim Rewards'
                );

                this.reStake = _data.reStake;
            }
        },

        onCancelButtonClick(cancelBtnClicked) {
            if (!cancelBtnClicked && this.reStake) {
                this.$emit('reload-view');
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
