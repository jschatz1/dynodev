import Vue from "vue";
import VueRouter from "vue-router";
import Projects from "../components/projects.vue";
import Project from "../components/project.vue";
import ProjectsNew from "../components/projects.new.vue";

Vue.use(VueRouter);

const mode = 'history';
const base = '/projects/'

const routes = [
  { path: '/new', name: 'projectNew', component: ProjectsNew },
  { path: '/', name: 'projects', component: Projects },
  { path: '/:project_id', name: 'project', component: Project },
]

export default new VueRouter({
  routes,
  mode,
  base,
});