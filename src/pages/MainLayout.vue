<template>
    <main class="w-screen h-screen flex bg-background text-foreground">
      <div class="hidden lg:flex lg:w-1/3 bg-gray-100 dark:bg-gray-900">
        <ChatList @chat-selected="selectedChat = $event" />
      </div>
      <div class="w-full lg:w-2/3">
        <ChatWindow v-if="selectedChat" :chat="selectedChat" />
        <ChatList v-else class="lg:hidden" @chat-selected="selectedChat = $event" />
      </div>
      <DarkModeToggle />
    </main>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import ChatList from "@/components/ChatList.vue";
  import ChatWindow from "@/components/ChatWindow.vue";
  import DarkModeToggle from "@/components/DarkModeToggle.vue";
  
  const selectedChat = ref(null);
  </script>
  