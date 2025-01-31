<template>
  <section class="w-full h-screen overflow-y-auto bg-white dark:bg-gray-800">
    <h2 class="text-lg font-bold p-4">Chats</h2>
    <Button text="New Chat" class="w-full" @click="$emit('new-chat')" />
    <ul>
      <li
        v-for="chat in chats"
        :key="chat.id"
        class="p-4 border-b cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
        @click="$emit('chat-selected', chat)"
      >
        <p class="font-semibold">{{ chat.name }}</p>
        <p class="text-gray-500 dark:text-gray-400">{{ chat.lastMessage }}</p>
      </li>
    </ul>
    <Button text="Sign Out" @click="logout" class="w-full bg-gray-800 dark:bg-gray-200 text-white dark:text-black rounded-full shadow-md" />
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Button from "@/components/Button.vue";
import { account } from "@/config/config.ts";
import { useRouter } from "vue-router";

const router = useRouter();

const chats = ref([
  { id: 1, name: "Alice", lastMessage: "Hey, how are you?" },
  { id: 2, name: "Bob", lastMessage: "See you later!" },
]);
async function logout() {
  await account.deleteSession("current");
  router.push({ name: "signin" });
}
</script>
