<template>
  <button @click="toggleDarkMode" :class="variantClasses">
    {{ isDark ? "Light Mode 🌞" : "Dark Mode 🌙" }}
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

interface Props {
  /** If "inline", the toggle will render without fixed positioning (for mobile header use).
   * Otherwise (or if omitted) it renders fixed at bottom left (desktop style). */
  variant?: "fixed" | "inline";
}

const props = defineProps<Props>();

const isDark = ref(false);

onMounted(() => {
  isDark.value = localStorage.getItem("dark-mode") === "true";
  document.documentElement.classList.toggle("dark", isDark.value);
});

function toggleDarkMode() {
  isDark.value = !isDark.value;
  localStorage.setItem("dark-mode", isDark.value.toString());
  document.documentElement.classList.toggle("dark", isDark.value);
}

const variantClasses = computed(() => {
  if (props.variant === "inline") {
    // Inline styling for mobile header use.
    return "p-2 bg-gray-800 dark:bg-gray-200 text-white dark:text-black rounded-full shadow-md";
  }
  // Default fixed styling for desktop.
  return "fixed bottom-4 left-4 p-3 bg-gray-800 dark:bg-gray-200 text-white dark:text-black rounded-full shadow-md hidden sm:block";
});
</script>
