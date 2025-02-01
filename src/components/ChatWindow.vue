<template>
  <div class="w-full flex flex-col h-full dark:bg-gray-900">
    <!-- Header row -->
    <div class="p-4 border-b flex items-center">
      <!-- Only visible on mobile (hidden at lg+) -->
      <button @click="goBack" class="mr-4 text-blue-500 lg:hidden">
        ← Back
      </button>
      <h2 class="text-xl font-semibold">
        Chat with {{ chatPartnerName || "Loading..." }}
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
              'bg-blue-500 text-white': message.senderId === currentUser?.$id,
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
          class="flex-1 p-2 border rounded-lg"
      />
      <button
          @click="sendMessage"
          class="ml-2 bg-blue-500 text-white p-2 rounded-lg"
      >
        Send
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { appwriteService } from "@/lib/appwriteService";

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

const messages = ref<any[]>([]);
const newMessage = ref("");
const loading = ref(true);
const errorMessage = ref("");
const currentUser = ref<any>(null);
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
    const chatList = await appwriteService.getUserChatsWithNames(currentUser.value.$id);
    const chat = chatList.find((c) => c.$id === resolvedChatId.value);
    if (!chat) {
      throw new Error("Chat not found.");
    }

    chatPartnerName.value =
        chat.user1Id === currentUser.value.$id ? chat.user2Name : chat.user1Name;
  } catch (error: any) {
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
        currentUser.value.$id,
        newMessage.value
    );
    messages.value.push(sentMessage);
    newMessage.value = "";
  } catch (error: any) {
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
