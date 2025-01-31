<template>
    <main class="w-screen h-screen bg-gray-100 flex">
        <Sidebar>
            <ContactSidebar />
            <Button text="Logout" @click="logout" />
        </Sidebar>
    </main>
</template>

<script setup lang="ts">
import Sidebar from "@/components/sidebar/Sidebar.vue";
import ContactSidebar from "@/components/sidebar/ContactSidebar.vue";
import Button from "@/components/Button.vue";
import {account} from "@/config/config.ts";
import { useRouter } from "vue-router";

const router = useRouter();

async function logout() {
    await account.deleteSession("current");
    router.push("/signin");
}
</script>
