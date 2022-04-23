<template>
    <ul class="blockchain-picker no-markers">
        <li>
            <label for="bc-photon">
                <input
                    id="bc-photon"
                    v-model="blockchain"
                    type="radio"
                    name="blockchain"
                    value="photon"
                    class="not-visible"
                />
                <span>
                    <icon
                        data="@/assets/svg/chain-logos/techpay-active.svg"
                        width="64"
                        height="64"
                        original
                        aria-hidden="true"
                        class="logo-active"
                    />
                    <icon
                        data="@/assets/svg/chain-logos/techpay-inactive.svg"
                        width="64"
                        height="64"
                        original
                        aria-hidden="true"
                        class="logo-inactive"
                    />
                    <span class="title">TechPay Photon</span>
                </span>
            </label>
        </li>
        <li>
            <label for="bc-eth">
                <input
                    id="bc-eth"
                    v-model="blockchain"
                    type="radio"
                    name="blockchain"
                    value="ethereum"
                    class="not-visible"
                    :disabled="!appConfig.bnbridgeApi.useETH || disableETH"
                />
                <span>
                    <icon
                        data="@/assets/svg/chain-logos/ethereum-active.svg"
                        width="64"
                        height="64"
                        original
                        aria-hidden="true"
                        class="logo-active"
                    />
                    <icon
                        data="@/assets/svg/chain-logos/ethereum-inactive.svg"
                        width="64"
                        height="64"
                        original
                        aria-hidden="true"
                        class="logo-inactive"
                    />
                    <span class="title">Ethereum</span>
                </span>
            </label>
        </li>
        <li>
            <label for="bc-binance">
                <input
                    id="bc-binance"
                    v-model="blockchain"
                    type="radio"
                    name="blockchain"
                    value="binance"
                    class="not-visible"
                    :disabled="!appConfig.bnbridgeApi.useBNB || disableBNB"
                />
                <span>
                    <icon
                        data="@/assets/svg/chain-logos/binance-active.svg"
                        width="64"
                        height="64"
                        original
                        aria-hidden="true"
                        class="logo-active"
                    />
                    <icon
                        data="@/assets/svg/chain-logos/binance-inactive.svg"
                        width="64"
                        height="64"
                        original
                        aria-hidden="true"
                        class="logo-inactive"
                    />
                    <span class="title">Binance Chain</span>
                </span>
            </label>
        </li>
    </ul>
</template>

<script>
import appConfig from '../../../app.config.js';

export default {
    name: 'BlockchainPicker',

    props: {
        disableETH: {
            type: Boolean,
            default: false,
        },
        disableBNB: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            blockchain: 'photon',
            appConfig,
        };
    },

    watch: {
        blockchain(_value) {
            this.$emit('blockchain-pick', _value);
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
