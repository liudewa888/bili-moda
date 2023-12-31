import { createApp } from "vue";
import "element-plus/dist/index.css";

import { router } from "./router/index";
import App from "./App.vue";
import { vueErrorHandler } from "./utils/errorHandler";
import "./assets/css/base.css";
import "./assets/css/normalize.css";

const app = createApp(App);

app.use(router)
app.use(vueErrorHandler);

app.mount("#app");
