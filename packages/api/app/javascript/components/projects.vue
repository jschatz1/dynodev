<template>
  <div class="padding-10">
    <div class="frow float-right">
      <router-link class="button is-primary" to="/new">New Project</router-link>
    </div>
    <div class="frow">
      <img src="../images/star.svg">
      <p class="title padding-15 grow">Hello Jacob! Let’s get started with a few easy steps</p>
    </div>
    <div class="fcolumn padding-top-10 padding-bottom-10">
      <p v-if="!hasProjects">No projects yet</p>
      <table class="table is-fullwidth">
        <tr v-for="project in projects">
          <td>
            <router-link :to="{name: 'project', params: {project_id: project.uuid}}">{{project.name}}</router-link>
          </td>
          <td>{{project.description}}</td>
          <td>{{project.uuid}}</td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script>
import { mapState, mapGetters } from "vuex";
export default {
  mounted() {
    this.$store.dispatch('getProjects');
  },
  computed: {
    ...mapState([
        'projects',
      ]),
    ...mapGetters([
        'hasProjects',
      ]),
  },
  methods: {
  }
}
</script>