import Vue from 'vue';
import App from '../app.vue';
import Rien from "rien";
import resources from "../resources";
Vue.use(Rien);
document.addEventListener('DOMContentLoaded', () => {
  const app = new Vue({
    render: h => h(App),
    resources
  }).$mount()
  document.getElementById("projects-app").appendChild(app.$el);
})
