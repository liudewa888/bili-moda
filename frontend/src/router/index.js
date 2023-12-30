import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../view/home.vue";
import Login from "../view/login.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/admin/login", component: Login },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export { router };
