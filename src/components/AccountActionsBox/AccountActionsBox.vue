<template>
    <nav class="account-actions-box actions-box" aria-label="Wallet actions">
        <ul class="no-markers">
            <li>
                <router-link :to="{ name: 'account-history' }" class="action" title="Home" aria-label="Wallet info">
                    <span class="btn large same-size round">
                        <icon data="@/assets/svg/wallet.svg" width="20" height="20" :fill="false" aria-hidden="true" />
                    </span>
                    <span class="link-label">Wallet</span>
                </router-link>
            </li>
            <li>
                <router-link
                    :to="{ name: 'account-blockchain-picker-form' }"
                    class="action"
                    title="Send"
                    aria-label="Send TPC"
                >
                    <span class="btn large same-size round">
                        <icon data="@/assets/svg/send.svg" width="20" height="20" aria-hidden="true" />
                    </span>
                    <span class="link-label">Send</span>
                </router-link>
            </li>
            <li>
                <router-link :to="{ name: 'account-receive' }" class="action" title="Receive" aria-label="Receive TPC">
                    <span class="btn large same-size round">
                        <icon data="@/assets/svg/receive.svg" width="20" height="20" aria-hidden="true" />
                    </span>
                    <span class="link-label">Receive</span>
                </router-link>
            </li>
            <!--
            <li>
                <router-link :to="{ name: 'account-stake' }" class="action" title="Stake">
                    <span class="btn large same-size round">
                        <icon data="@/assets/svg/stake.svg" width="20" height="20" aria-hidden="true" />
                    </span>
                    <span class="link-label">Staking</span>
                </router-link>
            </li>
            -->
        </ul>
    </nav>
</template>

<script>
export default {};
</script>

<style lang="scss">
@import 'style';
</style>
