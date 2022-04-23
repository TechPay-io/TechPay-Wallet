<template>
    <div ref="doc" class="stake-tpc" tabindex="0">
        <h1 :id="infoId" class="with-back-btn align-center" aria-label="Delegation" data-focus>
            <span>Delegation</span>
            <f-back-button ref="backButton" :route-name="getBackButtonRoute('staking-info')" />
        </h1>
        <br />

        <f-card class="f-card-double-padding f-data-layout" tag="section" :aria-labelledby="infoId">
            <div class="row no-vert-col-padding collapse-md">
                <div class="col">
                    <div class="row no-collapse">
                        <div class="col f-row-label">Delegated</div>
                        <div class="col">
                            <f-placeholder :content-loaded="!!accountInfo" block :replacement-num-chars="10">
                                <template v-if="accountInfo">
                                    <t-p-c-token-value :value="accountInfo.amountDelegated" convert />
                                </template>
                            </f-placeholder>
                        </div>
                    </div>
                    <div class="row no-collapse">
                        <div class="col f-row-label">Pending Rewards</div>
                        <div class="col">
                            <f-placeholder :content-loaded="!!accountInfo" block :replacement-num-chars="10">
                                <template v-if="accountInfo">
                                    <t-p-c-token-value :value="accountInfo.pendingRewards" convert />
                                </template>
                            </f-placeholder>
                        </div>
                    </div>
                    <div class="row no-collapse">
                        <div class="col f-row-label">Claimed Rewards</div>
                        <div class="col">
                            <f-placeholder :content-loaded="!!accountInfo" block :replacement-num-chars="10">
                                <template v-if="accountInfo">
                                    -
                                    <!--{{ toTPC(accountInfo.claimedRewards) }} TPC-->
                                </template>
                            </f-placeholder>
                        </div>
                    </div>
                    <div class="row no-collapse">
                        <div class="col f-row-label">Minted sTPC</div>
                        <div class="col">
                            <f-placeholder :content-loaded="!!accountInfo" block :replacement-num-chars="10">
                                <template v-if="accountInfo">
                                    <t-p-c-token-value :value="outstandingSTPC" convert no-currency />
                                    sTPC
                                </template>
                            </f-placeholder>
                        </div>
                    </div>
                    <div class="row no-collapse">
                        <div class="col f-row-label">Pending withdraw</div>
                        <div class="col">
                            <f-placeholder :content-loaded="!!accountInfo" block :replacement-num-chars="10">
                                <template v-if="accountInfo">
                                    <t-p-c-token-value :value="accountInfo.pendingWithdraw" convert />
                                </template>
                            </f-placeholder>
                        </div>
                    </div>
                </div>

                <div class="col">
                    <div class="row no-collapse">
                        <div class="col f-row-label">Validator</div>
                        <div class="col">
                            <div v-if="stakerInfo">
                                <a
                                    v-if="stakerInfo"
                                    :href="`${explorerUrl}validator/${stakerInfo.stakerAddress}`"
                                    rel="noopener"
                                    target="_blank"
                                >
                                    {{ stakerInfo.stakerInfo.name }}
                                </a>
                            </div>
                            <template v-else>-</template>
                        </div>
                    </div>
                    <div class="row no-collapse">
                        <div class="col f-row-label">Validator Id</div>
                        <div class="col">
                            <f-placeholder :content-loaded="!!accountInfo" block :replacement-num-chars="10">
                                <template v-if="accountInfo">{{ accountInfo.stakerId || '-' }}</template>
                            </f-placeholder>
                        </div>
                    </div>
                    <div class="row no-collapse">
                        <div class="col f-row-label">Delegation Time</div>
                        <div class="col">
                            <f-placeholder :content-loaded="!!accountInfo" block :replacement-num-chars="10">
                                <template v-if="accountInfo">
                                    {{
                                        accountInfo.createdTime && accountInfo.createdTime !== '0x0'
                                            ? formatDate(timestampToDate(accountInfo.createdTime), false, true)
                                            : '-'
                                    }}
                                </template>
                            </f-placeholder>
                        </div>
                    </div>
                    <div class="row no-collapse">
                        <div class="col f-row-label">Unlock Date</div>
                        <div class="col">
                            <f-placeholder :content-loaded="!!accountInfo" block :replacement-num-chars="10">
                                <template v-if="accountInfo">
                                    <f-message
                                        v-if="lockedUntil !== '0x0'"
                                        :type="lockedUntilMessageType"
                                        style="margin-top: 0; padding-top: 0;"
                                    >
                                        {{ formatDate(timestampToDate(lockedUntil), false, true) }}
                                    </f-message>
                                    <template v-else>-</template>
                                </template>
                            </f-placeholder>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col align-center">
                    <div class="form-buttons">
                        <template v-if="accountInfo && accountInfo.delegated !== '0x0'">
                            <template v-if="accountInfo && accountInfo.preparedForWithdrawal && false">
                                <f-message type="info" with-icon>
                                    You will be able to delegate from this address again once all pending undelegations
                                    have been withdrawn.
                                </f-message>
                                <!--
                                <h3 class="align-center">
                                    Your {{ toTPC(accountInfo.delegated) }} Photon TPC is available for withdraw in 7 days.
                                </h3>
                                -->
                            </template>
                            <template v-else>
                                <button
                                    v-show="canClaimRewards"
                                    class="btn large"
                                    :disabled="!canClaimRewards"
                                    @click="claimRewards()"
                                >
                                    Claim Rewards
                                </button>
                                <button
                                    v-show="canClaimRewards"
                                    class="btn large"
                                    :disabled="!canClaimRewards"
                                    @click="claimRewardsAndReStake()"
                                >
                                    Claim & Restake
                                </button>
                                <!--
                                <button
                                    v-show="canIncreaseDelegation"
                                    class="btn large"
                                    :disabled="!canIncreaseDelegation"
                                    @click="increaseDelegation()"
                                >
                                    Increase Delegation
                                </button>
                                -->
                                <button
                                    v-show="canUndelegate"
                                    class="btn large"
                                    :class="{ 'orange-btn': orangeBtn }"
                                    :disabled="!canUndelegate"
                                    @click="undelegate()"
                                >
                                    Undelegate
                                </button>
                                <button
                                    v-show="canLockDelegation"
                                    class="btn large"
                                    :disabled="!canLockDelegation"
                                    @click="lockDelegation()"
                                >
                                    Lock Delegation
                                </button>
                                <!--                                <button
                                    v-show="canExtendDelegationLock"
                                    class="btn large"
                                    :disabled="!canExtendDelegationLock"
                                    @click="extendDelegationLock()"
                                >
                                    Extend Delegation Lock
                                </button>-->
                                <button
                                    v-show="canMintSTPC"
                                    class="btn large"
                                    :disabled="!canMintSTPC"
                                    @click="mintSTPC()"
                                >
                                    Mint sTPC
                                </button>
                                <button
                                    v-show="canRepaySTPC"
                                    class="btn large"
                                    :disabled="!canRepaySTPC"
                                    @click="repaySTPC()"
                                >
                                    Repay sTPC
                                </button>

                                <f-message
                                    v-if="!canUndelegate && canClaimRewards"
                                    type="info"
                                    with-icon
                                    class="align-start"
                                >
                                    You need to claim all pending rewards before
                                    <!--increasing your delegation or-->
                                    undelegating.
                                    <!--                                    <br />
                                    You can claim rewards for a maximum of {{ claimMaxEpochs }} epochs at once (use
                                    repeatedly if needed).-->
                                </f-message>
                                <f-message v-if="showRepaySTPCMessage" type="info" with-icon class="align-start">
                                    Can't repay sTPC, not enough unlocked sTPC
                                </f-message>
                                <f-message v-if="showUndelegateMessage" type="info" with-icon class="align-start">
                                    Can't undelegate, repay sTPC first please
                                </f-message>
                            </template>
                        </template>
                        <!--                        <template v-else>
                            <button v-show="accountInfo" class="btn large" :disabled="!accountInfo" @click="stake()">
                                Delegate
                            </button>
                        </template>-->

                        <f-message v-if="!!accountInfo && !isFluidStakingActive" type="warning">
                            To participate in Fluid Staking, please claim your outstanding rewards. <br />
                            Even if your pending rewards balance shows 0, go ahead and claim anyway and you’ll receive
                            the correct amount.
                        </f-message>

                        <details>
                            <summary>Advanced Functions</summary>
                            <p>
                                <button class="btn large secondary" @click="claimRewards()">
                                    Claim Rewards (Unconditioned)
                                </button>
                            </p>
                        </details>
                    </div>
                </div>
            </div>
        </f-card>

        <f-card
            v-if="withdrawRequests.length"
            class="f-card-double-padding account-main-content-mt"
            tag="section"
            :aria-labelledby="undelegationId"
        >
            <h2 :id="undelegationId">Undelegation History</h2>

            <f-message
                v-if="outstandingSTPC > 0"
                type="warning"
                with-icon
                class="align-start"
                style="margin-bottom: 16px;"
            >
                Can't withdraw, repay sTPC first please
            </f-message>

            <withdraw-request-list
                :disable-withdraw="outstandingSTPC > 0"
                :items="withdrawRequests"
                @withdraw-request-selected="onWithdrawRequestSelected"
            />
        </f-card>

        <tx-confirmation-window
            ref="confirmationWindow"
            body-min-height="350px"
            window-class="send-transaction-form-tx-window"
            :steps-count="stepsCount"
            :active-step="activeStep"
            :titles="titles"
            :window-title="windowTitle"
            :steps="windowSteps"
            @cancel-button-click="onCancelButtonClick"
        />
    </div>
</template>

<script>
import FCard from '../core/FCard/FCard.vue';
import { mapGetters } from 'vuex';
import { toTPC, WeiToTpc } from '../../utils/transactions.js';
import { formatHexToInt, timestampToDate, formatDate } from '../../filters.js';
import appConfig from '../../../app.config.js';
import WithdrawRequestList from '../data-tables/WithdrawRequestList.vue';
import FMessage from '../core/FMessage/FMessage.vue';
import FPlaceholder from '@/components/core/FPlaceholder/FPlaceholder.vue';
import gql from 'graphql-tag';
import { SFC_CLAIM_MAX_EPOCHS } from '@/plugins/techpay-web3-wallet.js';
import dayjs from 'dayjs';
import TPCTokenValue from '@/components/core/TPCTokenValue/TPCTokenValue.vue';
import { getUniqueId } from '@/utils';
import { viewHelpersMixin } from '@/mixins/view-helpers.js';
import FBackButton from '@/components/core/FBackButton/FBackButton.vue';
import TxConfirmationWindow from '@/components/windows/TxConfirmationWindow/TxConfirmationWindow.vue';
import { eventBusMixin } from '@/mixins/event-bus.js';
import { toBigNumber } from '@/utils/big-number.js';

export default {
    name: 'StakingInfo',

    components: {
        TxConfirmationWindow,
        FBackButton,
        TPCTokenValue,
        FPlaceholder,
        FMessage,
        WithdrawRequestList,
        FCard,
    },

    mixins: [viewHelpersMixin, eventBusMixin],

    props: {
        /***/
        stakerId: {
            type: String,
            default: '',
        },
        /** Name of previous component. */
        previousComponent: {
            type: String,
            default: 'delegations-info',
        },
        /** Show 'claim rewards' popup */
        claim: {
            type: Boolean,
            default: false,
        },
        /** Show 'claim rewards and restake' popup */
        reStake: {
            type: Boolean,
            default: false,
        },
        /** Component was reloaded */
        reloaded: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            d_stakerId: '',
            d_claim: false,
            d_reStake: false,
            isFluidStakingActive: false,
            lockedUntil: '',
            isDelegationLocked: false,
            lockDuration: 0,
            explorerUrl: appConfig.explorerUrl2,
            claimMaxEpochs: SFC_CLAIM_MAX_EPOCHS,
            /** @type {DefiToken} */
            stpcToken: {},
            stepsCount: 1,
            activeStep: 1,
            titles: [],
            windowTitle: '',
            windowSteps: [],
            infoId: getUniqueId(),
            undelegationId: getUniqueId(),
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        canClaimRewards() {
            const { accountInfo } = this;

            if (!this.isFluidStakingActive) {
                return accountInfo.delegation
                    ? accountInfo.delegation.amountDelegated !== '0x0' //accountInfo.delegation.amountInWithdraw
                    : true;
            } else {
                return (
                    accountInfo &&
                    accountInfo.pendingRewards &&
                    accountInfo.pendingRewards !== '0x0' &&
                    (accountInfo.delegation ? accountInfo.delegation.amountDelegated !== '0x0' : true)
                    /*
                    (accountInfo.delegation
                        ? accountInfo.delegation.amountDelegated !== accountInfo.delegation.amountInWithdraw
                        : true)
*/
                );
            }
        },

        canIncreaseDelegation() {
            const { accountInfo } = this;

            if (!this.isFluidStakingActive) {
                return accountInfo.delegation
                    ? accountInfo.delegation.amountDelegated === accountInfo.delegation.amountInWithdraw
                    : false;
            } else {
                return (
                    accountInfo &&
                    accountInfo.pendingRewards &&
                    accountInfo.pendingRewards === '0x0' &&
                    (accountInfo.delegation
                        ? accountInfo.delegation.amountDelegated !== accountInfo.delegation.amountInWithdraw
                        : true)
                );
            }
        },

        canUndelegate() {
            const { accountInfo } = this;

            if (!this.isFluidStakingActive) {
                return accountInfo && accountInfo.delegation
                    ? accountInfo.delegation.amountDelegated !== accountInfo.delegation.amountInWithdraw &&
                          accountInfo.delegation.amountDelegated !== '0x0'
                    : false;
            } else {
                return (
                    this._delegation &&
                    this._delegation.tokenizerAllowedToWithdraw &&
                    accountInfo &&
                    // accountInfo.pendingRewards &&
                    // accountInfo.pendingRewards === '0x0' &&
                    (accountInfo.delegation ? accountInfo.delegation.amountDelegated !== '0x0' : true)
                    /*
                    (accountInfo.delegation
                        ? accountInfo.delegation.amountDelegated !== accountInfo.delegation.amountInWithdraw &&
                          accountInfo.delegation.amountDelegated !== '0x0'
                        : true)
*/
                );
            }
        },

        showUndelegateMessage() {
            const { accountInfo } = this;

            if (!this.isFluidStakingActive) {
                return false;
            } else {
                return (
                    accountInfo &&
                    accountInfo.pendingRewards &&
                    accountInfo.pendingRewards === '0x0' &&
                    (accountInfo.delegation ? accountInfo.delegation.amountDelegated !== '0x0' : true) &&
                    /*
                    (accountInfo.delegation
                        ? accountInfo.delegation.amountDelegated !== accountInfo.delegation.amountInWithdraw
                        : true) &&
*/
                    this._delegation &&
                    !this._delegation.tokenizerAllowedToWithdraw
                );
                // return !this.canUndelegate;
            }
        },

        canLockDelegation() {
            return this._delegation ? this._delegation.unlockedAmount !== '0x0' && !this.isDelegationLocked : false;
        },

        canExtendDelegationLock() {
            if (
                !this.isDelegationLocked ||
                !this.stakerInfo ||
                this._delegation.lockedUntil === '0x0' ||
                this.lockDuration === 0
            ) {
                return false;
            }

            const lockDuration = dayjs.utc(this.lockDuration * 1000);
            const now = dayjs().utc();
            const stakerLockedUntil = dayjs.utc(parseInt(this.stakerInfo.lockedUntil, 16) * 1000);

            // (stakerLockedUntil - (now + lockDuration)) > 0
            return this.isValidator || stakerLockedUntil.diff(now.add(lockDuration), 'day') > 0;
        },

        canMintSTPC() {
            const { delegation } = this.accountInfo;
            let delegationOk = true;

            if (delegation) {
                delegationOk = this.accountInfo.delegated !== delegation.amountInWithdraw;
            }

            return (
                // this.canUndelegate &&
                this.isDelegationLocked &&
                this._delegation &&
                this._delegation.tokenizerAllowedToWithdraw &&
                delegationOk
            );
        },

        canRepaySTPC() {
            return (
                // this.canUndelegate &&
                this._delegation &&
                this._delegation.outstandingSTPC !== '0x0' &&
                this.outstandingSTPC <= this.availableSTPC
            );
        },

        isValidator() {
            if (!this.stakerInfo) {
                return false;
            }

            return this.currentAccount.address.toLowerCase() === this.stakerInfo.stakerAddress.toLowerCase();
        },

        showRepaySTPCMessage() {
            return (
                this._delegation &&
                this._delegation.outstandingSTPC !== '0x0' &&
                this.outstandingSTPC > this.availableSTPC
            );
        },

        availableSTPC() {
            return this.stpcToken ? this.$defi.fromTokenValue(this.stpcToken.availableBalance, this.stpcToken) || 0 : 0;
        },

        outstandingSTPC() {
            return this.stpcToken && this._delegation
                ? this.$defi.fromTokenValue(this._delegation.outstandingSTPC, this.stpcToken) || 0
                : 0;
        },

        /**
         * Data for WithdrawRequestList.
         *
         * @return {array} Array of withdraw requests.
         */
        withdrawRequests() {
            const { accountInfo } = this;
            const delegation = accountInfo ? accountInfo.delegation : null;
            const requests = [];
            // let amount = '';

            if (delegation) {
                /*if (accountInfo.preparedForWithdrawal) {
                    amount = delegation.amountDelegated;
                }

                if (accountInfo.preparedForWithdrawal) {
                    requests.push({
                        amount: amount,
                        final: true,
                        requestBlock: {
                            timestamp: delegation.deactivatedTime,
                        },
                    });
                }*/

                if (delegation.withdrawRequests && delegation.withdrawRequests.length) {
                    delegation.withdrawRequests.forEach((_request) => {
                        if (delegation.toStakerId === _request.stakerID) {
                            requests.push(_request);
                        }
                    });
                }
            }

            return requests;
        },

        /**
         * Sum of amount of withdraw request (not withdrawn yet).
         */
        withdrawRequestsAmount() {
            const { accountInfo } = this;
            const delegation = accountInfo ? accountInfo.delegation : null;
            let amount = 0;

            if (delegation && delegation.withdrawRequests && delegation.withdrawRequests.length) {
                delegation.withdrawRequests.forEach((_request) => {
                    if (delegation.toStakerId === _request.stakerID) {
                        amount += WeiToTpc(_request.amount);
                    }
                });
            }

            return amount;
        },

        /**
         * @return {string}
         */
        lockedUntilMessageType() {
            return this.isLocked ? 'warning' : 'success';
        },

        /**
         * Color of 'Undelegate' button.
         *
         * @return {boolean}
         */
        orangeBtn() {
            return this.isLocked;
        },

        /**
         * Returns `true` if delegetion is still locked.
         *
         * @return {boolean}
         */
        isLocked() {
            return this.isDelegationLocked;
        },
    },

    asyncComputed: {
        async accountInfo() {
            let accountInfo = this._accountInfo;
            let delegation = this._delegation;

            if (!accountInfo) {
                accountInfo = await this.fetchAccountInfo();
                this._accountInfo = accountInfo;
            }

            if (!delegation) {
                delegation = await this.fetchDelegation(this.d_stakerId);
                this._delegation = delegation;
                this.isFluidStakingActive = delegation.isFluidStakingActive;
                this.lockedUntil = delegation.lockedUntil;
                this.lockDuration = parseInt(delegation.lockDuration, 16);
                this.isDelegationLocked = delegation.isDelegationLocked;
            }

            accountInfo.delegation = delegation;

            accountInfo.delegated = delegation ? delegation.amount : 0;
            accountInfo.amountDelegated = delegation ? delegation.amountDelegated : 0;
            accountInfo.pendingWithdraw = delegation
                ? `0x${toBigNumber(accountInfo.delegated).minus(accountInfo.amountDelegated).toString(16)}`
                : 0;
            accountInfo.pendingRewards = delegation ? delegation.pendingRewards.amount : 0;
            accountInfo.claimedRewards = delegation ? delegation.claimedReward : 0;

            accountInfo.stakerId = delegation ? formatHexToInt(delegation.toStakerId) : 0;
            accountInfo.stakerIdHex = delegation ? delegation.toStakerId : '0x0';
            accountInfo.createdTime = delegation ? delegation.createdTime : '';

            accountInfo.preparedForWithdrawal = delegation && delegation.pendingRewards.amount === '0x0';

            return accountInfo;
        },

        async stakerInfo() {
            const { accountInfo } = this;
            const stakerInfo =
                accountInfo && accountInfo.stakerId ? await this.$fWallet.getStakerById(accountInfo.stakerIdHex) : null;

            if (stakerInfo && !stakerInfo.stakerInfo) {
                stakerInfo.stakerInfo = {
                    name: 'Unknown',
                };
            }

            return stakerInfo;
        },
    },

    created() {
        this.setDataFromParams();

        this._accountInfo = null;
        this._delegation = null;

        this._eventBus.on('account-picked', this.onAccountPicked);
    },

    mounted() {
        this.$refs.doc.focus();

        this.init();

        if (!this.reloaded) {
            if (this.d_reStake) {
                this.claimRewardsAndReStake();
            } else if (this.d_claim) {
                this.claimRewards();
            }
        }
    },

    methods: {
        async init() {
            const { $defi } = this;
            const { address } = this.currentAccount;
            const result = await Promise.all([$defi.fetchTokens(address), $defi.init()]);

            this.stpcToken = result[0].find((_item) => _item.symbol === 'STPC') || {};
        },

        /**
         * @param {boolean} [_increaseDelegation]
         */
        async stake(_increaseDelegation) {
            const stakerInfo = await this.stakerInfo;

            this.$emit('change-component', {
                to: 'stake-form',
                from: 'staking-info',
                data: {
                    increaseDelegation: !!_increaseDelegation,
                    stakerInfo,
                    stakerId: this.d_stakerId,
                },
            });
        },

        async undelegate() {
            if (!this.canUndelegate) {
                return;
            }

            const accountInfo = await this.accountInfo;
            const stakerInfo = await this.stakerInfo;
            const isLocked =
                (accountInfo && accountInfo.delegation && accountInfo.delegation.isDelegationLocked) || false;

            this.showConfirmationWindow({
                compName: 'unstake-t-p-c',
                data: {
                    accountInfo: {
                        ...accountInfo,
                        stakerInfo,
                        withdrawRequestsAmount: this.withdrawRequestsAmount,
                    },
                    stakerId: this.d_stakerId,
                },
                stepsCount: isLocked ? 4 : 3,
                windowTitle: 'Undelegate TPC',
                steps: isLocked
                    ? ['Unlock', 'Confirm', 'Undelegate', 'Finished']
                    : ['Undelegate', 'Confirm', 'Finished'],
            });

            /*this.$router.push({
                name: 'staking-unstake-tpc',
                params: {
                    accountInfo: {
                        ...accountInfo,
                        stakerInfo,
                        withdrawRequestsAmount: this.withdrawRequestsAmount,
                    },
                    stakerId: this.d_stakerId,
                },
            });*/

            /*this.$emit('change-component', {
                to: 'unstake-t-p-c',
                from: 'staking-info',
                data: {
                    accountInfo: {
                        ...accountInfo,
                        stakerInfo,
                        withdrawRequestsAmount: this.withdrawRequestsAmount,
                    },
                    stakerId: this.d_stakerId,
                },
            });*/
        },

        lockDelegation() {
            if (!this.canLockDelegation) {
                return;
            }

            this.showConfirmationWindow({
                compName: 'delegation-lock',
                data: {
                    stakerId: this.d_stakerId,
                },
                stepsCount: 2,
                windowTitle: 'Lock Delegation',
                steps: ['Lock', 'Confirm', 'Finished'],
            });
        },

        extendDelegationLock() {
            if (!this.canExtendDelegationLock) {
                return;
            }

            this.$emit('change-component', {
                to: 'delegation-lock',
                from: 'staking-info',
                data: {
                    stakerId: this.d_stakerId,
                    extendLock: true,
                    delegationLockDuration: this.lockDuration,
                },
            });
        },

        mintSTPC() {
            if (!this.canMintSTPC) {
                return;
            }

            // const stakerInfo = await this.stakerInfo;

            this.showConfirmationWindow({
                compName: 'defi-mint-s-t-p-c-confirmation',
                data: {
                    stakerId: this.d_stakerId,
                    amountDelegated: this._delegation.amountDelegated,
                    // stakerAddress: stakerInfo ? stakerInfo.stakerAddress : '',
                },
                windowTitle: 'Mint sTPC',
            });
        },

        repaySTPC() {
            if (!this.canRepaySTPC) {
                return;
            }

            this.showConfirmationWindow({
                compName: 'defi-repay-s-t-p-c-confirmation',
                data: {
                    stakerId: this.d_stakerId,
                    outstandingSTPC: this._delegation.outstandingSTPC,
                    // stakerAddress: stakerInfo ? stakerInfo.stakerAddress : '',
                },
                stepsCount: 2,
                steps: ['Allow', 'Confirm', 'Finished'],
                windowTitle: 'Repay sTPC',
            });

            /*this.$emit('change-component', {
                to: 'defi-repay-s-t-p-c-confirmation',
                from: 'staking-info',
                data: {
                    stakerId: this.d_stakerId,
                    outstandingSTPC: this._delegation.outstandingSTPC,
                    // stakerAddress: stakerInfo ? stakerInfo.stakerAddress : '',
                },
            });*/
        },

        increaseDelegation() {
            if (this.canIncreaseDelegation) {
                this.stake(true);
            }
        },

        now() {
            return new Date().getTime();
        },

        showConfirmationWindow({
            compName = '',
            data = null,
            stepsCount = 1,
            titles = [],
            windowTitle = '',
            steps = [],
        }) {
            this.stepsCount = stepsCount;
            this.titles = titles;
            this.windowTitle = windowTitle;
            this.windowSteps = steps;

            this.$refs.confirmationWindow.changeComponent(compName, data);
            this.$refs.confirmationWindow.show();
        },

        async claimRewards() {
            const accountInfo = await this.accountInfo;
            const stakerInfo = await this.stakerInfo;

            // if (accountInfo.pendingRewards > 0 && !this.canIncreaseDelegation) {
            this.showConfirmationWindow({
                compName: 'claim-rewards-confirmation',
                data: {
                    accountInfo: {
                        ...accountInfo,
                        stakerInfo,
                    },
                    stakerId: this.d_stakerId,
                },
                windowTitle: 'Claim Rewards',
            });
            // }
        },

        async claimRewardsAndReStake() {
            const accountInfo = await this.accountInfo;
            const stakerInfo = await this.stakerInfo;

            // if (accountInfo.pendingRewards > 0 && !this.canIncreaseDelegation) {
            this.showConfirmationWindow({
                compName: 'claim-rewards-confirmation',
                data: {
                    accountInfo: {
                        ...accountInfo,
                        stakerInfo,
                    },
                    stakerId: this.d_stakerId,
                    reStake: true,
                },
                windowTitle: 'Claim & Restake',
            });
            // }
        },

        /**
         * Fetch account info by current account address.
         */
        async fetchAccountInfo() {
            const data = await this.$apollo.query({
                query: gql`
                    query AccountByAddress($address: Address!) {
                        account(address: $address) {
                            address
                            balance
                        }
                    }
                `,
                variables: {
                    address: this.currentAccount.address,
                },
                fetchPolicy: 'network-only',
            });

            return data.data.account;
        },

        /**
         * Fetch delegation by staker id and current account address.
         *
         * @param {string} _stakerId
         */
        async fetchDelegation(_stakerId) {
            const data = await this.$apollo.query({
                query: gql`
                    query Delegation($address: Address!, $staker: BigInt!) {
                        delegation(address: $address, staker: $staker) {
                            toStakerId
                            createdTime
                            amount
                            amountDelegated
                            amountInWithdraw
                            unlockedAmount
                            claimedReward
                            outstandingSTPC
                            tokenizerAllowedToWithdraw
                            isFluidStakingActive
                            isDelegationLocked
                            lockDuration
                            lockedUntil
                            pendingRewards {
                                amount
                            }
                            withdrawRequests {
                                address
                                stakerID
                                withdrawRequestID
                                createdTime
                                withdrawTime
                                amount
                            }
                        }
                    }
                `,
                variables: {
                    address: this.currentAccount.address,
                    staker: _stakerId,
                },
                fetchPolicy: 'network-only',
            });

            return data.data.delegation;
        },

        /**
         * @param {object} _withdrawRequest
         */
        async onWithdrawRequestSelected(_withdrawRequest) {
            const accountInfo = await this.accountInfo;
            const stakerInfo = await this.stakerInfo;

            this.showConfirmationWindow({
                compName: 'withdraw-t-p-c-confirmation',
                data: {
                    accountInfo: {
                        ...accountInfo,
                        stakerInfo,
                    },
                    amount: WeiToTpc(_withdrawRequest.amount),
                    withdraw: true,
                    withdrawRequest: _withdrawRequest,
                    stakerId: this.d_stakerId,
                },
                windowTitle: 'Withdraw delegated TPC',
            });

            /*this.$emit('change-component', {
                to: 'withdraw-t-p-c-confirmation',
                from: 'staking-info',
                data: {
                    accountInfo: {
                        ...accountInfo,
                        stakerInfo,
                    },
                    amount: WeiToTpc(_withdrawRequest.amount),
                    withdraw: true,
                    withdrawRequest: _withdrawRequest,
                    stakerId: this.d_stakerId,
                },
            });*/
        },

        /*onPreviousBtnClick() {
            this.$emit('change-component', {
                to: this.previousComponent,
                from: 'stake-form',
            });
        },*/

        onCancelButtonClick(cancelBtnClicked) {
            if (!cancelBtnClicked) {
                this.$emit('reload-view');
            }
        },

        onAccountPicked() {
            this.$refs.backButton.goBack();
        },

        toTPC,
        timestampToDate,
        formatDate,
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
