<template>
  <section class="w-full h-full flex flex-col items-center justify-center">
    <div class="w-80 flex flex-col items-center">
      <img src="../assets/logo.png" alt="Quantum Logo" />

      <h1 class="text-3x1 mt-2 font-bold">Create an Account</h1>
      <p>
        or <span class="text-blue-500"><router-link to="/signin">Sign In to Your Account</router-link></span>
      </p>
      <Input type="text" label="Email" placeholder="user@example.com" class="w-full mt-10" ref="email" v-model="email"></Input>
      <Input type="password" label="Password" placeholder="Enter your password" class="w-full mt-5" ref="password" v-model="password"></Input>
      <Button class="mt-10 w-full" @click="signup">Sign Up</Button>
    </div>
  </section>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {account} from "@/config/config.ts";
import {ID} from "appwrite";

const email = ref("");
const password = ref("");

async function signup() {
  if (email.value && password.value) {
    await account.create(ID.unique(), email.value, password.value);
    await account.createEmailPasswordSession(email.value, password.value);
  }
}
</script>