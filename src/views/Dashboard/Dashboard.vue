<template>
    <div class="view-dashboard">
        <dashboard-header />

        <main>
            <section :aria-labelledby="walletsId">
                <h2 :id="walletsId" class="h1">
                    Wallets <span class="f-records-count">({{ accounts.length }})</span>
                </h2>
                <account-list edit-mode />
            </section>

            <section :aria-labelledby="contactsId">
                <h2 :id="contactsId" class="h1">
                    Contacts <span class="f-records-count">({{ contacts.length }})</span>
                </h2>

                <contact-list edit-mode />
            </section>
        </main>
    </div>
</template>

<script>
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader.vue';
import AccountList from '../../components/AccountList/AccountList.vue';
import { mapGetters } from 'vuex';
import ContactList from '../../components/ContactList/ContactList.vue';
import { getUniqueId } from '@/utils';

export default {
    name: 'Dashboard',

    components: { ContactList, AccountList, DashboardHeader },

    data() {
        return {
            walletsId: getUniqueId(),
            contactsId: getUniqueId(),
        };
    },

    computed: {
        ...mapGetters(['accounts', 'contacts']),
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
