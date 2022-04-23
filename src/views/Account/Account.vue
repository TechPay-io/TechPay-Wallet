<template>
    <div class="view-account std-view">
        <h1 class="not-visible" data-focus>
            Wallet <span v-if="currentAccount">{{ currentAccount.name || currentAccount.address }}</span>
        </h1>

        <template v-if="!currentAccount">
            <f-message type="error" alert with-icon>Bad wallet</f-message>
        </template>
        <template v-else>
            <address-info-box />
            <account-header />

            <!--            <button @click="onRemoveAccountButClick">Remove wallet</button>-->

            <main class="main">
                <f-view-transition watch-route :views-structure="viewsStructure">
                    <router-view></router-view>
                </f-view-transition>
            </main>
        </template>
    </div>
</template>

<script>
// import FCard from "../components/FCard.vue";

import {
    DEACTIVATE_ACTIVE_ACCOUNT,
    REMOVE_ACTIVE_ACCOUNT,
    SET_ACTIVE_ACCOUNT_ADDRESS,
    SET_ACTIVE_ACCOUNT_BY_ADDRESS,
} from '../../store/mutations.type.js';
import { mapGetters } from 'vuex';
import AccountHeader from '../../components/AccountHeader/AccountHeader.vue';
import AddressInfoBox from '../../components/AddressInfoBox/AddressInfoBox.vue';
import FMessage from '../../components/core/FMessage/FMessage.vue';
import { eventBusMixin } from '@/mixins/event-bus.js';
import { focusElem } from '@/utils/aria.js';
import FViewTransition from '@/components/core/FViewTransition/FViewTransition.vue';
import { appStructureTree } from '@/app-structure.js';

export default {
    components: {
        FViewTransition,
        FMessage,
        AddressInfoBox,
        AccountHeader,
        // FMessage,
        // FCard
    },

    mixins: [eventBusMixin],

    computed: {
        ...mapGetters(['currentAccount']),

        viewsStructure() {
            const accountNode = appStructureTree.serialize(appStructureTree.get('account'));

            return accountNode ? [JSON.parse(accountNode)] : [];
        },
    },

    watch: {
        $route(_value) {
            const { address } = _value.params;

            if (address && address.toLowerCase() !== this.currentAccount.address.toLowerCase()) {
                this.setActiveAccount(address);
                this._eventBus.emit('account-picked', address);
            }
        },
    },

    created() {
        this.setActiveAccount(this.$route.params.address);
    },

    mounted() {
        focusElem(this.$el);
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

        // tmp
        onRemoveAccountButClick() {
            this.$store.commit(REMOVE_ACTIVE_ACCOUNT);
            this.$router.replace({ path: '/' });
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
