<template>
  <section class="w-full h-screen flex flex-col bg-white dark:bg-gray-900">
    <header class="p-4 flex items-center border-b dark:border-gray-700">
      <button class="lg:hidden p-2 text-blue-500" @click="$emit('back')">← Back</button>
        <Avatar />
      <h2 class="ml-4 text-2xl font-semibold">{{ chat.name }}</h2>
    </header>
    <div class="flex-1 p-4 overflow-y-auto">
      <div v-for="message in chat.messages" :key="message.id" class="mb-2">
        <p class="font-medium">{{ message.sender }}:</p>
        <p class="bg-gray-100 dark:bg-gray-700 p-2 rounded-md">{{ message.text }}</p>
      </div>
    </div>
    <footer class="p-4 border-t flex dark:border-gray-700">
      <input type="text" v-model="newMessage" class="flex-1 p-2 border rounded-md dark:bg-gray-800 dark:text-white" placeholder="Type a message..." />
      <button class="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md" @click="sendMessage">Send</button>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Avatar from "@/components/Avatar.vue";

const props = defineProps<{ chat: any }>();
const newMessage = ref("");

function sendMessage() {
  if (newMessage.value.trim() !== "") {
    props.chat.messages.push({ id: Date.now(), sender: "Me", text: newMessage.value });
    newMessage.value = "";
  }
}
</script>
