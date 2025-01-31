<template>
  <section class="w-full h-full flex flex-col items-center justify-center">
    <div class="w-80 flex flex-col items-center">
      <img src="../assets/logo.png" alt="Quantum Logo" />

      <h1 class="text-4xl mt-2 font-bold">Create an Account</h1>
      <p>
        or <span class="text-blue-500"><router-link to="/signin">Sign In</router-link></span>
      </p>

      <Input type="text" label="Email" placeholder="user@example.com" class="w-full mt-10" v-model="email" />
      <p v-if="errorMessage && errorField === 'email'" class="text-red-500 text-sm mt-1">{{ errorMessage }}</p>

      <Input type="password" label="Password" placeholder="Enter your password" class="w-full mt-5" v-model="password" />
      <p v-if="errorMessage && errorField === 'password'" class="text-red-500 text-sm mt-1">{{ errorMessage }}</p>

      <Button text="Sign Up" class="mt-10 w-full" @click="signup" />

      <!-- Allgemeine Fehlernachricht -->
      <p v-if="errorMessage && errorField === 'general'" class="text-red-500 text-sm mt-3">{{ errorMessage }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Input from "@/components/Input.vue";
import Button from "@/components/Button.vue";
import { account } from "@/config/config.ts";
import { ID } from "appwrite";
import { useRouter } from "vue-router";

const email = ref("");  
const password = ref("");

const errorMessage = ref(""); 
const errorField = ref(""); 

const router = useRouter();

async function signup() {
  errorMessage.value = "";
  errorField.value = "";

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

  try {
    await account.create(ID.unique(), email.value, password.value);
    await account.createEmailPasswordSession(email.value, password.value);
    router.push({ name: "application" });
  } catch (error: any) {
    console.error("Signup error:", error);
    
    if (error.message.includes("email")) {
      errorMessage.value = "This email is already in use.";
      errorField.value = "email";
    } else if (error.message.includes("password")) {
      errorMessage.value = "Incorrect password.";
      errorField.value = "password";
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