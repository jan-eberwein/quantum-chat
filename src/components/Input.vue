<template>
  <div>
    <label class="block text-sm font-medium text-gray-700">{{ label }}</label>
    <div class="mt-1">
      <input
        :type="type"
        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-md border-gray-300 rounded-md p-2"
        :placeholder="placeholder"
        :value="modelValue"
        @input="handleInput"
        @keyup.enter="handleEnter"
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
const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "enter"): void; 
}>();

// ✅ Sicherstellen, dass `$event.target` ein `HTMLInputElement` ist
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target) {
    emit("update:modelValue", target.value);
  }
}

function handleEnter(event: KeyboardEvent) {
  if (event.key === "Enter") {
    emit("enter"); // Emit 'enter' event when Enter key is pressed
  }
}
</script>
