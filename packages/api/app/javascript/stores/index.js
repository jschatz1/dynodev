import Vue from 'vue';
import Vuex from 'vuex';
import {
          getUser,
          getProjects,
          getInvites,
          checkInvite,
        } from "../services/user-service";
import {
          getProject,
          getProjectSchema,
          getProjectRoutes,
        } from "../services/project-service";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    project: {name: "", description: ""},
    projects: [],
    invites: [],
    user: null,
  },
  getters: {
    hasAcceptedUser(state) {
      return state.user && state.user.accepted;
    },
    hasProjects(state) {
      return state.projects.length;
    },
    projectLoaded(state) {
      return !!state.project;
    }
  },
  mutations: {
    setUser (state, user) {
      state.user = user;
    },
    setProjects (state, projects) {
      state.projects = projects;
    },
    setProject (state, project) {
      state.project = project;
    },
    setInvites (state, invites) {
      state.invites = invites;
    },
    setProjectSchema(state, schema) {
      state.project.schema = schema.original;
    },
    setProjectRoutes(state, routes) {
      state.project.routes = routes;
    },
    setProjectCurlExamples(state, examples) {
      state.project.curlExamples = examples
    }
  },
  actions: {
    async getUser({ commit }) {
      const user = await getUser();
      commit('setUser', user.data);
    },
    async getProjects({ commit }) {
      const projects = await getProjects();
      commit('setProjects', projects.data);
    },
    async getProject({ commit, dispatch }, projectUUID) {
      const project = await getProject(projectUUID);
      commit('setProject', project.data);
      const schema = await getProjectSchema(projectUUID);
      commit('setProjectSchema', schema.data);
      const routes = await getProjectRoutes(projectUUID);
      commit('setProjectRoutes', routes.data);
      dispatch('createExamples', routes.data);
      return project;
    },
    async getInvites({ commit }) {
      const invites = await getInvites();
      commit('setInvites', invites.data);
    },

    async checkInvite({ commit }, inviteCode) {
      const inviteStatus = await checkInvite({code: inviteCode});
      return inviteStatus.data;
    },

    createExamples({ commit }, routes) {
      const baseURL = process.env['NODE_ENV'] === 'development' ? 'http://localhost:3001' : 'https://api.dyno.dev';
      let payload = {};
      const ignoreProps = ['id', 'created_at', 'updated_at'];
      const examples = routes.tables.map(table => {
        return table.urls.map(url => {
          if(url.method === "GET") {
            return `${url.verb}\ncurl -XGET -H "Content-type: application/json" '${baseURL}${url.url}'`;
          } else if (url.method === "POST" || url.method === "PUT") {
            payload = {};
            table.properties.forEach(prop => {
              if(!ignoreProps.includes(prop.name)) {
                if(prop.type === "character varying") {
                  payload[prop.name] = "lorem ipsum";
                } else if(prop.type === "boolean") {
                  payload[prop.name] = false;
                } else if(prop.type === "bigint") {
                  payload[prop.name] = 2465;
                }
              }
            });
            return `${url.verb}\ncurl -X${url.method} -H "Content-type: application/json" -d '${JSON.stringify(payload)}' '${baseURL}${url.url}'`
          }
          return ""
        }).join("\n")
      }).join("\n\n");
      commit('setProjectCurlExamples', examples)
    }
  }
})