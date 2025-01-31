<template>
    <div>
      <label class="block text-sm font-medium text-gray-700">{{ label }}</label>
      <div class="mt-1">
        <input
          :type="type"
          class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-md border-gray-300 rounded-md p-2"
          :placeholder="placeholder"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  interface Props {
    label?: string;
    type: string;
    placeholder?: string;
    modelValue: string;
  }
  
  defineProps<Props>();
  </script>
  