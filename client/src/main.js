import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue";
import Pusher from "pusher-js";
import axios from "axios";
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;
Pusher.logToConsole = true;

Vue.prototype.$pusher = new Pusher(process.env.VUE_APP_PUSHER_KEY, {
  cluster: process.env.VUE_APP_PUSHER_CLUSTER,
  forceTLS: true
});

Vue.prototype.$axios = axios;

Vue.use(VueRouter);

const routes = [
  { path: "/foo", component: null },
  { path: "/bar", component: null }
];

const router = new VueRouter({
  routes // short for `routes: routes`
});

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount("#app");
