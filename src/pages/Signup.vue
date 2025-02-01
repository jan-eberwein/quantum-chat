<template>
  <section class="w-full h-full flex flex-col items-center justify-center dark:bg-gray-900">
    <div class="w-80 flex flex-col items-center">
      <img
          :src="isDarkMode ? logoWhite : logo"
          alt="Quantum Logo"
          class="w-auto"
      />

      <h1 class="text-4xl mt-2 font-bold">Create an Account</h1>
      <p>
        or <span class="text-blue-500"><router-link to="/signin">Sign In</router-link></span>
      </p>

      <Input type="text" label="Name" placeholder="Your Name" class="w-full mt-5" v-model="name" />
      <p v-if="errorMessage && errorField === 'name'" class="text-red-500 text-sm mt-1">{{ errorMessage }}</p>

      <Input type="text" label="Email" placeholder="user@example.com" class="w-full mt-5" v-model="email" />
      <p v-if="errorMessage && errorField === 'email'" class="text-red-500 text-sm mt-1">{{ errorMessage }}</p>

      <Input type="password" label="Password" placeholder="Enter your password" class="w-full mt-5" v-model="password" />
      <p v-if="errorMessage && errorField === 'password'" class="text-red-500 text-sm mt-1">{{ errorMessage }}</p>

      <Input type="password" label="Confirm Password" placeholder="Confirm your password" class="w-full mt-5" v-model="confirmPassword" />
      <p v-if="errorMessage && errorField === 'confirmPassword'" class="text-red-500 text-sm mt-1">{{ errorMessage }}</p>

      <Button text="Sign Up" class="mt-10 w-full" @click="signup" />

      <p v-if="errorMessage && errorField === 'general'" class="text-red-500 text-sm mt-3">{{ errorMessage }}</p>
    </div>
    <DarkModeToggle />
  </section>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import Input from "@/components/Input.vue";
import Button from "@/components/Button.vue";
import DarkModeToggle from "@/components/DarkModeToggle.vue";
import { appwriteService } from "@/lib/appwriteService";
import logo from "@/assets/logo.png";
import logoWhite from "@/assets/logo_white.png";

const isDarkMode = ref(window.matchMedia("(prefers-color-scheme: dark)").matches);

watchEffect(() => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const updateMode = () => (isDarkMode.value = mediaQuery.matches);

  mediaQuery.addEventListener("change", updateMode);
  return () => mediaQuery.removeEventListener("change", updateMode);
});

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");
const errorField = ref("");
const router = useRouter();

async function signup() {
  errorMessage.value = "";
  errorField.value = "";

  if (!name.value) {
    errorMessage.value = "Name is required.";
    errorField.value = "name";
    return;
  }
  if (!email.value) {
    errorMessage.value = "Email is required.";
    errorField.value = "email";
    return;
  }
  if (!isValidEmail(email.value)) {
    errorMessage.value = "Invalid email format.";
    errorField.value = "email";
    return;
  }
  if (!password.value) {
    errorMessage.value = "Password is required.";
    errorField.value = "password";
    return;
  }
  if (password.value.length < 6) {
    errorMessage.value = "Password must be at least 6 characters.";
    errorField.value = "password";
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match.";
    errorField.value = "confirmPassword";
    return;
  }

  try {
    await appwriteService.registerUser(email.value, password.value, name.value);
    await appwriteService.signIn(email.value, password.value); // Auto login after signup
    await router.push({ name: "main-layout" });
  } catch (error: any) {
    console.error("Signup error:", error);

    if (error.message.includes("email")) {
      errorMessage.value = "This email is already in use.";
      errorField.value = "email";
    } else {
      errorMessage.value = "Something went wrong. Please try again.";
      errorField.value = "general";
    }
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
</script>
