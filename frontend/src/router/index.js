import { defineAsyncComponent } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

const _import = (path) => {
  return defineAsyncComponent(() => import(`../view/${path}.vue`));
};

const routes = [
  { path: "/", component: _import("home") },
  { path: "/admin/login", component: _import("login") },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export { router };
