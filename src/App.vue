<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {});
</script>

<template>
  <main class="w-screen h-screen bg-gray-100 flex">
    <!-- Needed for mobile chat window to use full width -->
    <div class="flex-1">
      <RouterView></RouterView>
    </div>
  </main>
</template>
