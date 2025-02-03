<template>
  <main class="w-screen h-screen flex bg-background text-foreground">
    <!-- Desktop: Left column with ChatList (visible at lg and up) -->
    <div class="hidden lg:flex lg:w-1/3 bg-gray-100 dark:bg-gray-900">
      <ChatList mode="desktop" @chat-selected="selectedChat = $event" />
    </div>

    <!-- Right column -->
    <div class="w-full lg:w-2/3 relative">
      <!-- Desktop: Show ChatWindow if a chat is selected -->
      <ChatWindow v-if="selectedChat" :chatId="selectedChat.$id" />

      <!-- Mobile: If no chat is selected, show ChatList in mobile mode -->
      <ChatList v-else class="lg:hidden" mode="mobile" @chat-selected="selectedChat = $event" />

      <!-- Optional placeholder for desktop when no chat is selected -->
      <div v-if="!selectedChat" class="hidden lg:flex items-center justify-center h-full text-gray-500">
        Select a chat to start messaging.
      </div>
    </div>

    <DarkModeToggle />
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ChatList from "@/components/ChatList.vue";
import ChatWindow from "@/components/ChatWindow.vue";
import DarkModeToggle from "@/components/DarkModeToggle.vue";

import type { ChatDoc } from "@/lib/types"; // <--- NEW

// Tracks the active chat for desktop mode
const selectedChat = ref<ChatDoc | null>(null);
</script>