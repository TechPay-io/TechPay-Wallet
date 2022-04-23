<template>
    <div class="view-staking std-view">
        <template v-if="!currentAccount">
            <f-message type="error" alert with-icon>Bad wallet</f-message>
        </template>
        <template v-else>
            <address-info-box />

            <main class="main">
                <!--                <h1 data-focus="staking">Staking</h1>-->
                <!--                <account-stake />-->
                <!--                <router-view></router-view>-->
                <f-view-transition watch-route :views-structure="viewsStructure" :disabled="fViewTransitionDisabled">
                    <router-view
                        :key="reload + $route.fullPath"
                        :reloaded="reload !== ''"
                        @reload-view="onReloadView"
                    ></router-view>
                </f-view-transition>
            </main>
        </template>
    </div>
</template>

<script>
import FMessage from '@/components/core/FMessage/FMessage.vue';
import AddressInfoBox from '@/components/AddressInfoBox/AddressInfoBox.vue';
import { mapGetters } from 'vuex';
import {
    DEACTIVATE_ACTIVE_ACCOUNT,
    SET_ACTIVE_ACCOUNT_ADDRESS,
    SET_ACTIVE_ACCOUNT_BY_ADDRESS,
} from '@/store/mutations.type.js';
import { eventBusMixin } from '@/mixins/event-bus.js';
import { focusElem } from '@/utils/aria.js';
import FViewTransition from '@/components/core/FViewTransition/FViewTransition.vue';
import { appStructureTree } from '@/app-structure.js';
import { defer, getUniqueId } from '@/utils';

export default {
    name: 'Staking',

    components: { FViewTransition, AddressInfoBox, FMessage },

    mixins: [eventBusMixin],

    data() {
        return {
            reload: '',
            fViewTransitionDisabled: false,
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        viewsStructure() {
            const accountNode = appStructureTree.serialize(appStructureTree.get('staking'));

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

        onReloadView() {
            defer(() => {
                this.fViewTransitionDisabled = true;
                this.reload = getUniqueId();

                defer(() => {
                    this.fViewTransitionDisabled = false;
                }, 100);
            }, 250);
        },
    },
};
</script>
