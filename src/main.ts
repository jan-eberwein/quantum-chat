import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import './assets/index.css';
import App from './App.vue';
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Signin from "./pages/Signin.vue";
import Signup from "./pages/Signup.vue";

const app = createApp(App);

// Set up PrimeVue
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

// Define routes
const routes: RouteRecordRaw[] = [
    { path: "/signin", component: Signin, name: "signin" },
    { path: "/signup", component: Signup, name: "signup" },
];

// Set up and use router
const router = createRouter({ history: createWebHistory(), routes });
app.use(router);

// Mount the app once
app.mount('#app');
