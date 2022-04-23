<template>
    <div class="view-account-stake account-main-content-mt">
        <!--        <keep-alive>-->
        <component
            :is="currentComponent"
            v-bind="currentComponentProperties"
            @change-component="onChangeComponent"
        ></component>
        <!--        </keep-alive>-->
    </div>
</template>

<script>
import DelegationsInfo from '@/components/DelegationsInfo/DelegationsInfo.vue';
import StakingInfo from '../components/StakingInfo/StakingInfo.vue';
import StakeForm from '../components/forms/StakeForm.vue';
import StakeConfirmation from '../components/StakeConfirmation/StakeConfirmation.vue';
import TransactionSuccessMessage from '../components/TransactionSuccessMessage/TransactionSuccessMessage.vue';
import TransactionRejectMessage from '../components/TransactionRejectMessage/TransactionRejectMessage.vue';
import UnstakeTPC from '../components/UnstakeTPC/UnstakeTPC.vue';
import UnstakeConfirmation from '../components/UnstakeConfirmation/UnstakeConfirmation.vue';
import ClaimRewardsConfirmation from '../components/ClaimRewardsConfirmation/ClaimRewardsConfirmation.vue';
import WithdrawTPCConfirmation from '../components/WithdrawTPCConfirmation/WithdrawTPCConfirmation.vue';
import DelegationLock from '@/components/DelegationLock/DelegationLock.vue';
import DelegationLockConfirmation from '@/components/DelegationLockConfirmation/DelegationLockConfirmation.vue';
import DelegationUnlockConfirmation from '@/components/DelegationUnlockConfirmation/DelegationUnlockConfirmation.vue';
import DefiMintSTPCConfirmation from '@/components/DefiMintSTPCConfirmation/DefiMintSTPCConfirmation.vue';
import DefiRepaySTPCConfirmation from '@/components/DefiRepaySTPCConfirmation/DefiRepaySTPCConfirmation.vue';
import { eventBusMixin } from '../mixins/event-bus.js';

const DEFAULT_COMPONENT = 'delegations-info';

export default {
    name: 'AccountStake',

    components: {
        UnstakeTPC,
        TransactionSuccessMessage,
        TransactionRejectMessage,
        StakeConfirmation,
        StakeForm,
        DelegationsInfo,
        StakingInfo,
        UnstakeConfirmation,
        ClaimRewardsConfirmation,
        WithdrawTPCConfirmation,
        DelegationLock,
        DelegationLockConfirmation,
        DelegationUnlockConfirmation,
        DefiMintSTPCConfirmation,
        DefiRepaySTPCConfirmation,
    },

    mixins: [eventBusMixin],

    data() {
        return {
            currentComponent: DEFAULT_COMPONENT,
        };
    },

    computed: {
        currentComponentProperties() {
            switch (this.currentComponent) {
                case 'stake-confirmation':
                    return {
                        stakeData: this._data_,
                        increaseDelegation: this._data_.increaseDelegation,
                        stakerInfo: this._data_.stakerInfo,
                        previousComponent: this._data_.previousComponent,
                        stakerId: this._data_.stakerId,
                    };
                case 'unstake-t-p-c':
                case 'unstake-confirmation':
                case 'delegation-unlock-confirmation':
                case 'claim-rewards-confirmation':
                    return {
                        accountInfo: this._data_.accountInfo,
                        amount: this._data_.amount,
                        toUnlockAmount: this._data_.toUnlockAmount,
                        undelegateMax: this._data_.undelegateMax,
                        stakerId: this._data_.stakerId,
                        reStake: this._data_.reStake,
                        fromDelegationList: this._data_.fromDelegationList,
                        tmpPwdCode: this._data_.tmpPwdCode,
                    };
                case 'transaction-success-message':
                    return {
                        tx: this._data_.tx,
                        title: this._data_.successMessage,
                        continueTo: this._data_.continueTo,
                        continueToParams: this._data_.continueToParams,
                        stakerId: this._data_.stakerId,
                    };
                case 'withdraw-t-p-c-confirmation':
                case 'stake-form':
                case 'staking-info':
                case 'delegation-lock':
                case 'delegation-lock-confirmation':
                case 'defi-mint-s-t-p-c-confirmation':
                case 'defi-repay-s-t-p-c-confirmation':
                    return this._data_;
                default:
                    return null;
            }
        },
    },

    created() {
        // temporary data
        this._data_ = null;

        this._eventBus.on('account-picked', this.onAccountPicked);
    },

    methods: {
        /**
         * @param {Object} _data
         */
        onChangeComponent(_data) {
            this._data_ = _data.data;
            this.currentComponent = _data.to;

            this.$nextTick(() => {
                this._data_ = null;
            });
        },

        onAccountPicked() {
            this.currentComponent = '';
            this.$nextTick(() => {
                this.currentComponent = DEFAULT_COMPONENT;
            });
        },
    },
};
</script>
