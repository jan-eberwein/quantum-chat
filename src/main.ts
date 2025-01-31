import { createApp } from 'vue';
import './assets/index.css';
import App from './App.vue';
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { account } from "@/config/config.ts";
import { ref } from "vue";

import Signin from "./pages/Signin.vue";
import Signup from "./pages/Signup.vue";
import ChatList from "./components/ChatList.vue";

// 🔐 Zustand für Authentifizierung
const isAuthenticated = ref(false);

// ✅ Asynchrone Session-Prüfung mit Appwrite
async function checkAuthStatus() {
  try {
    const user = await account.get(); // Holt den aktuellen User
    isAuthenticated.value = !!user; // Falls ein User existiert → Eingeloggt
  } catch (error) {
    isAuthenticated.value = false; // Keine Session → Ausgeloggt
  }
}

// 🌍 Routen-Definition
const routes: RouteRecordRaw[] = [
  { path: "/signin", component: Signin, name: "signin" },
  { path: "/signup", component: Signup, name: "signup" },
  {
    path: "/", 
    component: ChatList, 
    name: "chat-list",
    meta: { requiresAuth: true }
  },
];

// 🚀 Vue Router erstellen
const router = createRouter({
  history: createWebHistory(),
  routes
});

// 📌 App starten
const app = createApp(App);
app.use(router);
app.mount('#app');
