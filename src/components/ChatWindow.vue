<template>
  <div class="w-full flex flex-col h-full dark:bg-gray-900">
    <!-- Header row -->
    <div class="p-4 border-b flex items-center gap-3">
      <!-- Only visible on mobile (hidden at lg+) -->
      <button @click="goBack" class="mr-4 text-blue-500 lg:hidden">
        ← Back
      </button>
      <Avatar />
      <h2 class="text-xl font-semibold">
        {{ chatPartnerName || "Loading..." }}
      </h2>
    </div>

    <!-- Messages list -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="loading" class="text-gray-500">Loading messages...</div>
      <div v-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>

      <!-- For each message, align left/right based on sender -->
      <div v-for="message in messages" :key="message.$id" class="mb-4">
        <div
            :class="{
            'text-right': message.senderId === currentUser?.$id,
            'text-left': message.senderId !== currentUser?.$id,
          }"
        >
          <p
              :class="{
              'bg-blue-400 text-white': message.senderId === currentUser?.$id,
              'bg-gray-200 text-black': message.senderId !== currentUser?.$id,
            }"
              class="inline-block p-2 rounded-lg"
          >
            {{ message.content }}
          </p>
        </div>
      </div>

      <!-- If no messages were found -->
      <p v-if="!loading && messages.length === 0" class="text-gray-500">
        No messages yet.
      </p>
    </div>

    <!-- Send Message Input -->
    <div class="p-4 border-t flex">
      <input
          type="text"
          v-model="newMessage"
          placeholder="Type a message..."
          class="flex-1 p-2 border rounded-lg dark:bg-gray-800"
          @keyup.enter="sendMessage"
      />
      <button
          @click="sendMessage"
          class="ml-2 bg-blue-400 text-white p-2 rounded-lg flex gap-1 font-bold hover:bg-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
        Send
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { appwriteService } from "@/lib/appwriteService";
import Avatar from "@/components/Avatar.vue";
import type { MessageDoc, AppwriteAccount, ChatDoc } from "@/lib/types";

// Allow an optional prop so that in desktop mode the parent can pass the chat id.
interface Props {
  chatId?: string;
}
const props = defineProps<Props>();

// Define an event to signal that the selected chat should be cleared.
// This is used when a chat-window that was embedded (desktop mode with a passed-in chatId)
// is now shown in mobile mode (via window resize) so that clicking the back button
// clears the active chat.
const emit = defineEmits(["clear-chat"]);

const route = useRoute();
const router = useRouter();

// Use the passed-in chatId (desktop) or fall back to the route param (mobile)
const resolvedChatId = computed(() => props.chatId || (route.params.id as string));

const messages = ref<MessageDoc[]>([]);
const newMessage = ref("");
const loading = ref(true);
const errorMessage = ref("");
const currentUser = ref<AppwriteAccount | null>(null);
const chatPartnerName = ref<string | null>(null);

// Extract the fetch logic into a function
async function fetchChatData() {
  try {
    loading.value = true;
    errorMessage.value = "";
    messages.value = [];

    currentUser.value = await appwriteService.getCurrentUser();
    if (!currentUser.value) {
      throw new Error("User not authenticated.");
    }

    // Fetch messages for the current chat
    const messageData = await appwriteService.getChatMessages(resolvedChatId.value);
    messages.value = messageData.documents.reverse(); // Show messages oldest to newest

    // Fetch enriched chat list to determine chat partner's name
    const chatList = (await appwriteService.getUserChatsWithNames(currentUser.value.$id)) as ChatDoc[];
    const chat = chatList.find((c) => c.$id === resolvedChatId.value);
    if (!chat) {
      throw new Error("Chat not found.");
    }

    // Use nullish coalescing to convert undefined to null.
    chatPartnerName.value =
        (chat.user1Id === currentUser.value.$id ? chat.user2Name : chat.user1Name) ?? null;
  } catch (error: unknown) {
    console.error("[ChatWindow] Error:", error);
    errorMessage.value = "Failed to load messages.";
  } finally {
    loading.value = false;
  }
}

// Initially load the chat data
onMounted(fetchChatData);

// Watch for changes in the chatId and refetch when it changes
watch(resolvedChatId, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    fetchChatData();
  }
});

// Sending a message
async function sendMessage() {
  if (!newMessage.value.trim()) return;
  try {
    const sentMessage = await appwriteService.sendMessage(
        resolvedChatId.value,
        currentUser.value!.$id,
        newMessage.value
    );
    messages.value.push(sentMessage as MessageDoc);
    newMessage.value = "";
  } catch (error: unknown) {
    console.error("[Send Message] Error:", error);
    errorMessage.value = "Failed to send message.";
  }
}

/**
 * The back button should return the user to the mobile chat list view.
 *
 * If this component was rendered with a passed-in chatId (i.e. as an embedded desktop chat)
 * then we emit "clear-chat" so that the parent layout can clear the selected chat.
 * Otherwise (mobile mode loaded via route), we navigate to the main layout.
 */
function goBack() {
  if (props.chatId) {
    emit("clear-chat");
  } else {
    router.push({ name: "main-layout" });
  }
}
</script>
