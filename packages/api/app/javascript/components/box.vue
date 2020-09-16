<template>
  <div>
    <router-view></router-view>
  </div>
</template>
<script>
import stepCLIInstall from "./step-cli-install.vue";
import projects from "./projects.vue"
export default {
  components: {
    stepCLIInstall,
    projects,
  },
}
</script>