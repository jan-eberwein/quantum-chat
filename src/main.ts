import { createApp } from 'vue';
import './assets/index.css';
import App from './App.vue';
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { account } from "@/config/config.ts";
import { ref } from "vue";

import Signin from "./pages/Signin.vue";
import Signup from "./pages/Signup.vue";
import MainLayout from "./pages/MainLayout.vue";
import ChatWindow from "./components/ChatWindow.vue";

const isAuthenticated = ref(false);

async function checkAuthStatus() {
  try {
    const user = await account.get(); // get current user
    isAuthenticated.value = !!user; // if User exists -> Loged in
  } catch (error) {
    isAuthenticated.value = false; // No Session -> Not Loged in
  }
}

// Route Definition
const routes: RouteRecordRaw[] = [
  { path: "/signin", component: Signin, name: "signin" },
  { path: "/signup", component: Signup, name: "signup" },
  {
    path: "/", 
    component: MainLayout,
    name: "main-layout",
    meta: { requiresAuth: true }
  },
  {
    path: "/app",
    component: MainLayout,
    meta: { requiresAuth: true },
  },
  {
    path: "/chat/:id", 
    component: ChatWindow, 
    name: "chat-window", 
    props: true,
    meta: { requiresAuth: true }
  },
];

// Vue Router 
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Route Guard for Authentification
router.beforeEach(async (to, _ , next) => {
  await checkAuthStatus(); // Check Auth Status

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next({ name: "signin" }); // Not Authenticated -> Redirect to Signin
  } else {
    next(); // Grant access
  }
});

const app = createApp(App);
app.use(router);
app.mount('#app');
