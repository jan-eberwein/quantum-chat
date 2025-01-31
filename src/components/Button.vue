<template>
    <button
      type="button"
      class="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      {{ text }}
    </button>
  </template>
  
  <script setup lang="ts">
  interface Props {
    text: string;
  }
  
  defineProps<Props>();
  </script>
  