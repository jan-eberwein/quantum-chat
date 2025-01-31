<template>
  <section class="w-full h-full flex flex-col items-center justify-center">
    <div class="w-80 flex flex-col items-center">
      <img src="../assets/logo.png" alt="Quantum Logo" />

      <h1 class="text-3xl mt-2 font-bold">Create an Account</h1>
      <p>
        or <span class="text-blue-500"><router-link to="/signin">Sign In to Your Account</router-link></span>
      </p>

      <!-- PrimeVue Form -->
      <form @submit.prevent="signup" class="w-full">
        <!-- Email Input -->
        <div class="w-full mt-10">
          <label for="email" class="block text-sm font-medium">Email</label>
          <InputText
              id="email"
              type="text"
              v-model="email"
              placeholder="user@example.com"
              class="w-full p-inputtext-sm"
              :class="{ 'p-invalid': errors.email }"
          />
          <Message v-if="errors.email" severity="error">{{ errors.email }}</Message>
        </div>

        <!-- Password Input -->
        <div class="w-full mt-5">
          <label for="password" class="block text-sm font-medium">Password</label>
          <InputText
              id="password"
              type="password"
              v-model="password"
              placeholder="Enter your password"
              class="w-full p-inputtext-sm"
              :class="{ 'p-invalid': errors.password }"
          />
          <Message v-if="errors.password" severity="error">{{ errors.password }}</Message>
        </div>

        <!-- Submit Button -->
        <Button class="mt-10 w-full" label="Sign Up" type="submit" :disabled="hasErrors" />
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Message from "primevue/message";
import { account } from "@/config/config.ts";
import { ID } from "appwrite";

// Form fields
const email = ref("");
const password = ref("");

// Validation errors
const errors = ref<{ email?: string; password?: string }>({});

// Function to validate inputs
const validateForm = () => {
  errors.value = {}; // Reset errors

  if (!email.value) {
    errors.value.email = "Email is required.";
  } else if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    errors.value.email = "Invalid email format.";
  }

  if (!password.value) {
    errors.value.password = "Password is required.";
  } else if (password.value.length < 6) {
    errors.value.password = "Password must be at least 6 characters long.";
  }
};

// Watch for input changes and re-validate
watch([email, password], () => {
  validateForm();
});

// Computed property to check if there are errors
const hasErrors = computed(() => Object.keys(errors.value).length > 0);

async function signup() {
  validateForm(); // Final validation before submitting
  if (hasErrors.value) return;

  await account.create(ID.unique(), email.value, password.value);
  await account.createEmailPasswordSession(email.value, password.value);
}
</script>
