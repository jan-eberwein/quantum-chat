import { createApp } from 'vue'
import './assets/index.css'
import App from './App.vue'
import {createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Signin from "./pages/Signin.vue";
import Signup from "./pages/Signup.vue";
import Application from "./pages/Application.vue";

const routes: RouteRecordRaw[] = [
    { path: "/signin", component: Signin, name: "signin" },
    { path: "/signup", component: Signup, name: "signup" },
    { path: "/app", component: Application, name: "application" },
];


const router = createRouter({history: createWebHistory(), routes});
createApp(App).use(router).mount('#app')
