<template>
  <div class="w-full h-full flex flex-col dark:bg-gray-900">
    <!-- Logged-in User Info Header -->
    <div class="p-4 border-b flex justify-between items-center bg-gray-100 dark:bg-gray-800">
      <span class="text-lg font-medium">
        Logged in as:
        <b>{{ currentUser?.name || currentUser?.email || "Loading..." }}</b>
      </span>
      <div class="flex items-center space-x-2">
        <button @click="logout" class="text-red-500 hover:underline">
          Logout
        </button>
        <!-- If in mobile mode, display the inline dark mode toggle in the header -->
        <template v-if="mode === 'mobile'">
          <DarkModeToggle variant="inline" />
        </template>
      </div>
    </div>

    <h2 class="text-3xl font-semibold p-4">Chats</h2>

    <!-- Start New Chat Section -->
    <div class="p-4">
      <select
          v-model="selectedUser"
          class="p-2 border rounded-lg w-full dark:bg-gray-800"
      >
        <option :value="null" disabled>Select a user to chat with</option>
        <option
            v-for="user in filteredUsers"
            :key="user.accountId"
            :value="user.accountId"
        >
          {{ user.name || user.email }}
        </option>
      </select>
      <button
          @click="startNewChat"
          class="mt-2 w-full bg-blue-400 text-white p-2 rounded-lg flex gap-2 justify-center font-bold hover:bg-blue-500"
          :disabled="!selectedUser"
      >
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
              d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
          />
        </svg>
        Start Chat
      </button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="p-4 text-gray-500">Loading chats...</div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="p-4 text-red-500">{{ errorMessage }}</div>

    <!-- Chat List -->
    <ul v-if="!loading && chats.length > 0">
      <li
          v-for="chat in chats"
          :key="chat.$id"
          @click="openChat(chat)"
          class="p-4 border-b cursor-pointer flex items-center gap-4 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-800"
          :class="{
          'bg-blue-100 dark:bg-blue-700': selectedChatId === chat.$id,
          'bg-gray-100 dark:bg-inherit': selectedChatId !== chat.$id,
        }"
      >
        <Avatar />
        <span v-if="chat.user1Id !== currentUser?.$id">
          {{ chat.user1Name }}
        </span>
        <span v-else>
          {{ chat.user2Name }}
        </span>
      </li>
    </ul>

    <p v-if="!loading && chats.length === 0" class="p-4 text-gray-500">
      No chats found.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { appwriteService } from "@/lib/appwriteService";
import Avatar from "@/components/Avatar.vue";
import DarkModeToggle from "@/components/DarkModeToggle.vue";
import type { ChatDoc, UserDoc, AppwriteAccount } from "@/lib/types";

// Accept a prop to know which mode we're in: "mobile" or "desktop"
const props = defineProps({
  mode: {
    type: String,
    default: "mobile",
  },
});
const mode = props.mode;
const emit = defineEmits(["chat-selected"]);

const router = useRouter();
const chats = ref<ChatDoc[]>([]);
const users = ref<UserDoc[]>([]);
const selectedUser = ref<string | null>(null);
const selectedChatId = ref<string | null>(null);
const loading = ref(true);
const errorMessage = ref("");
const currentUser = ref<AppwriteAccount | null>(null);

// Computed: filter out the current user and those already in chats.
const filteredUsers = computed(() => {
  const curr = currentUser.value;
  if (!curr) return [];
  return users.value.filter((u) => {
    return (
        u.accountId !== curr.$id &&
        !chats.value.some((chat) => {
          return (
              (chat.user1Id === curr.$id && chat.user2Id === u.accountId) ||
              (chat.user2Id === curr.$id && chat.user1Id === u.accountId)
          );
        })
    );
  });
});

onMounted(async () => {
  try {
    loading.value = true;
    currentUser.value = await appwriteService.getCurrentUser();
    if (!currentUser.value) {
      throw new Error("User not authenticated.");
    }
    // Fetch enriched chats with partner names.
    const chatData = await appwriteService.getUserChatsWithNames(currentUser.value.$id);
    chats.value = chatData;
    // Fetch all users (excluding current user)
    const userData = await appwriteService.getAllUsers(currentUser.value.$id);
    users.value = userData;
  } catch (error: unknown) {
    console.error("[ChatList] Error:", error);
    errorMessage.value = "Failed to load chats.";
  } finally {
    loading.value = false;
  }
});

async function startNewChat() {
  if (!selectedUser.value) return;
  try {
    console.log(
        `[startNewChat] Initiating chat between ${currentUser.value!.$id} and ${selectedUser.value}`
    );
    // Create or fetch existing chat.
    const newChat = await appwriteService.createChat(
        currentUser.value!.$id,
        selectedUser.value
    );
    console.log(`[startNewChat] Chat created/found with ID: ${newChat.$id}`);

    // If the returned chat is missing partner names, enrich it using our local users list.
    if (!newChat.user1Name || !newChat.user2Name) {
      if (currentUser.value!.$id === newChat.user1Id) {
        const partner = users.value.find((u) => u.accountId === newChat.user2Id);
        newChat.user2Name = partner?.name || "Unknown";
      } else {
        const partner = users.value.find((u) => u.accountId === newChat.user1Id);
        newChat.user1Name = partner?.name || "Unknown";
      }
    }

    chats.value.push(newChat);
    selectedUser.value = null;
    selectedChatId.value = newChat.$id;

    if (mode === "desktop") {
      emit("chat-selected", newChat);
    } else {
      await router.push({ name: "chat-window", params: { id: newChat.$id } });
    }
  } catch (error: unknown) {
    console.error("[Start New Chat] Error:", error);
    errorMessage.value = "Failed to start chat.";
  }
}

// Logout function
async function logout() {
  try {
    await appwriteService.logout();
    router.push({ name: "signin" });
  } catch (error: unknown) {
    console.error("[Logout Error]:", error);
    errorMessage.value = "Failed to log out.";
  }
}

// When a chat is clicked, update `selectedChatId` to highlight it
function openChat(chat: ChatDoc) {
  selectedChatId.value = chat.$id;
  if (mode === "desktop") {
    emit("chat-selected", chat);
  } else {
    router.push({ name: "chat-window", params: { id: chat.$id } });
  }
}
</script>
