import Vue from 'vue';
import App from '../app.vue';
import resources from "../resources";
document.addEventListener('DOMContentLoaded', () => {
  const app = new Vue({
    render: h => h(App),
    resources
  }).$mount()
  document.getElementById("projects-app").appendChild(app.$el);
})
