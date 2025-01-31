<template>
    <button @click="toggleDarkMode" class="fixed bottom-4 left-4 p-3 bg-gray-800 dark:bg-gray-200 text-white dark:text-black rounded-full shadow-md hidden sm:block">
      {{ isDark ? "Light Mode 🌞" : "Dark Mode 🌙" }}
    </button>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from "vue";
  
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
  </script>
  