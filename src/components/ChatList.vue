<template>
  <section class="w-full h-screen overflow-y-auto bg-gray-100 dark:bg-gray-800">
    <div
      class="flex items-center justify-between p-4 border-b dark:border-gray-700"
    >
      <img src="../assets/logo.png" alt="Logo" class="w-64" />
      <button
        @click="logout"
        class="p-3 bg-red-700 text-white shadow-md rounded-full flex items-center gap-2"
      >
        <span>Sign Out</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
          />
        </svg>
      </button>
    </div>
    <div class="flex items-center p-4 bg-slate-200 dark:bg-gray-700">
      <Avatar />
      <p class="ml-4 font-semibold">Jan</p>
    </div>
    <hr class="my-4" />
    <div class="flex items-center justify-between p-4">
      <h1 class="font-semibold">Chats</h1>
      <Button
        text="New Chat"
        class="bg-blue-500 text-white rounded-full shadow-md"
      />
    </div>
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
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Button from "@/components/Button.vue";
import { account } from "@/config/config.ts";
import { useRouter } from "vue-router";
import Avatar from "@/components/Avatar.vue";

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
