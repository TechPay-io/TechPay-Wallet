<template>
    <div class="unstake-tpc">
        <h2 :id="labelId" class="not-visible" data-focus>Undelegate TPC</h2>

        <f-card class="__f-card-double-padding f-data-layout" off>
            <f-form ref="form" center-form :aria-labelledby="labelId" @f-form-submit="onFormSubmit">
                <!--                <legend class="h2" data-focus>
                    <div class="cont-with-back-btn">
                        <span>
                            Undelegate TPC <span class="f-steps"><b>1</b> / {{ lockExist ? '3' : '2' }}</span>
                        </span>
                        <button
                            type="button"
                            class="btn light"
                            aria-label="Go to previous page"
                            @click="onPreviousBtnClick"
                        >
                            Back
                        </button>
                    </div>
                </legend>-->

                <div class="form-body">
                    <h3>The withdrawal of your delegated tokens will take 7 days</h3>
                    <h3 v-if="lockExist" class="orange-color" style="padding-top: 0;">
                        {{ cToUnlockAmount }} TPC of {{ amount }} TPC are still locked.
                        <template v-if="cUnlockPenalty > 0">
                            You will lose {{ cUnlockPenalty }} TPC by undelegating before the lock expiration.
                        </template>
                    </h3>
                    <!--                    <h3 v-if="lockExist" class="orange-color" style="padding-top: 0;">
                        Your delegation is still locked. You will lose
                        {{ cUnlockPenalty > 0 ? `${cUnlockPenalty} TPC` : 'part of your rewards' }}
                        by undelegating before the lock expiration.
                    </h3>-->

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
                                <button type="button" class="btn light small" @click="onEntireDelegationClick">
                                    Entire Delegation
                                </button>
                            </div>
                        </template>
                        <template #bottom="sProps">
                            <f-message v-show="sProps.showErrorMessage" type="error" alert with-icon>
                                {{ amountErrMsg }}
                            </f-message>
                        </template>
                    </f-input>

                    <div class="form-buttons align-center">
                        <button
                            type="button"
                            class="btn secondary large break-word"
                            style="max-width: 100%;"
                            @click="$emit('cancel-button-click', $event)"
                        >
                            Cancel
                        </button>
                        <button type="submit" class="btn large" :class="{ 'orange-btn': orangeBtn }">
                            <template v-if="!lockExist">Ok, undelegate</template>
                            <template v-else>Ok, unlock</template>
                        </button>
                    </div>
                </div>
            </f-form>
        </f-card>
    </div>
</template>

<script>
import FCard from '../core/FCard/FCard.vue';
import FForm from '../core/FForm/FForm.vue';
import FInput from '../core/FInput/FInput.vue';
import FMessage from '../core/FMessage/FMessage.vue';
import { WEIToTPC } from '../../utils/transactions.js';
import gql from 'graphql-tag';
import { bFromWei, toBigNumber, toHex } from '@/utils/big-number.js';
import { focusElem } from '@/utils/aria.js';
import { getUniqueId } from '@/utils';
export default {
    name: 'UnstakeTPC',

    components: { FMessage, FInput, FForm, FCard },

    props: {
        /** `accountInfo` object from `StakingInfo` component. */
        accountInfo: {
            type: Object,
            default() {
                return {};
            },
        },
        /***/
        stakerId: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            amountErrMsg: '',
            amount: '',
            unlockPenalty: '',
            unlockedAmount: '',
            toUnlockAmount: '',
            labelId: getUniqueId(),
        };
    },

    computed: {
        undelegateMax() {
            return this.accountInfo ? WEIToTPC(this.accountInfo.delegation.amountDelegated) : 0;
            /*
            return this.accountInfo
                ? WEIToTPC(this.accountInfo.delegation.amount) - this.accountInfo.withdrawRequestsAmount
                : 0;
*/
        },

        /**
         * Returns `true` if delegetion is still locked.
         *
         * @return {boolean}
         */
        isLocked() {
            const { accountInfo } = this;
            /*const lockedUntilTS =
                accountInfo && accountInfo.delegation && accountInfo.delegation.lockedUntil
                    ? parseInt(accountInfo.delegation.lockedUntil, 16)
                    : 0;
            const now = new Date().getTime() / 1000;*/

            // return lockedUntilTS > now;
            return (accountInfo && accountInfo.delegation && accountInfo.delegation.isDelegationLocked) || false;
        },

        lockExist() {
            return this.isLocked && !!this.toUnlockAmount && this.amount;
        },

        /**
         * Color of 'Undelegate' button.
         *
         * @return {boolean}
         */
        orangeBtn() {
            return this.lockExist;
        },

        cUnlockPenalty() {
            return (this.unlockPenalty && this.$fWallet.fromWei(this.unlockPenalty)) || -1;
        },

        cToUnlockAmount() {
            return (this.toUnlockAmount && this.$fWallet.fromWei(this.toUnlockAmount)) || 0;
        },
    },

    watch: {
        amount: {
            async handler(_value) {
                if (_value && this.isLocked) {
                    console.log(', _value: ', _value, ', this.unlockedAmount: ', this.unlockedAmount);
                    this.unlockPenalty = await this.fetchUnlockedPenalty(parseFloat(_value));
                }
            },
            immediate: true,
        },
    },

    async created() {
        if (this.isLocked) {
            this.unlockedAmount = await this.$fWallet.fetchUnlockedAmount(this.accountInfo.address, this.stakerId);
            console.log(this.accountInfo);
        }

        this.setMaxUndelegation();
    },

    mounted() {
        focusElem(this.$el);
    },

    methods: {
        checkAmount(_value) {
            const value = parseFloat(_value);
            const { undelegateMax } = this;
            let ok = false;

            this.amountErrMsg = `You can undelegate min 1 TPC and max ${undelegateMax} TPC`;

            if (!isNaN(value)) {
                if (value >= 1 && value <= undelegateMax) {
                    ok = true;
                }
            }

            return ok;
        },

        async fetchUnlockedPenalty(_amount) {
            try {
                if (!this.unlockedAmount) {
                    return '';
                }

                let amount = _amount;
                let bAmount;

                if (typeof amount === 'number') {
                    amount = this.$fWallet.toWei(amount);
                }

                bAmount = toBigNumber(amount);

                if (_amount === this.undelegateMax || bAmount.comparedTo(this.accountInfo.amountDelegated) === 1) {
                    bAmount = toBigNumber(this.accountInfo.amountDelegated);
                }

                // console.log('amount: ', bFromWei(bAmount).toString());
                // console.log('unlockedAmount: ', bFromWei(this.unlockedAmount).toString());

                // amount > unlockedAmount
                if (bAmount.comparedTo(this.unlockedAmount) === 1) {
                    bAmount = bAmount.minus(this.unlockedAmount);
                    // console.log('diff: ', bFromWei(bAmount).toString());
                } else {
                    this.toUnlockAmount = '';
                    return '';
                }

                // console.log('final amount: ', bFromWei(bAmount).toString());

                this.toUnlockAmount = toHex(bAmount);
                console.log(
                    'toUnlockAmount: ',
                    this.toUnlockAmount,
                    bFromWei(this.toUnlockAmount).toString(),
                    this.accountInfo.amountDelegated
                );

                const data = await this.$apollo.query({
                    query: gql`
                        query GetUnlockedAmount($address: Address!, $staker: BigInt!, $amount: BigInt!) {
                            delegation(address: $address, staker: $staker) {
                                unlockPenalty(amount: $amount)
                            }
                        }
                    `,
                    variables: {
                        address: this.accountInfo.address,
                        staker: this.stakerId,
                        amount: this.toUnlockAmount,
                    },
                    fetchPolicy: 'network-only',
                });

                return data && data.data.delegation ? data.data.delegation.unlockPenalty : '';
            } catch (_error) {
                console.error(_error);
                return '';
            }
        },

        onFormSubmit(_event) {
            const amount = parseFloat(_event.detail.data.amount);

            this.$emit('change-component', {
                to: this.lockExist ? 'delegation-unlock-confirmation' : 'unstake-confirmation',
                from: 'unstake-t-p-c',
                data: {
                    accountInfo: this.accountInfo,
                    amount,
                    toUnlockAmount: this.toUnlockAmount,
                    undelegateMax: amount === this.undelegateMax,
                    stakerId: this.stakerId,
                },
            });
        },

        setMaxUndelegation() {
            this.amount = this.undelegateMax.toString();
        },

        onEntireDelegationClick() {
            this.setMaxUndelegation();
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
