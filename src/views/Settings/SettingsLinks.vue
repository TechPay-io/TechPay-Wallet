<template>
    <div class="settingslinks">
        <f-card class="f-card-double-padding">
            <div class="small-container">
                <p>
                    <a href="https://explorer.techpay.io/" rel="noopener" target="_blank">
                        TechPay Explorer
                    </a>
                </p>

                <social-media-links />
            </div>
        </f-card>
    </div>
</template>

<script>
import SocialMediaLinks from '@/components/SocialMediaLinks/SocialMediaLinks.vue';
import FCard from '@/components/core/FCard/FCard.vue';

export default {
    name: 'SettingsLinks',

    components: { FCard, SocialMediaLinks },
};
</script>
