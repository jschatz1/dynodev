<template>
  <div class="box">
    <div class="row-padding-4">
      <img class="padding-left-10" src="../images/star.svg">
      <p class="title padding-15 grow">Hello Jacob! Let’s get started with a few easy steps</p>
    </div>
    <ul class="expandables">
      <step v-for="s in steps" :step="s" @expand="toggleExpand(s)" @done="doneClicked(s)"></step>
    </ul>
  </div>
</template>
<script>
import step from "./step.vue"
import stepCLIInstall from "./step-cli-install.vue";
import stepGetSecretKey from "./step-get-secret-key.vue";
export default {
  data() {
    return {
      steps: [
        {
          id: 0,
          text: "Install the CLI",
          expanded: false,
          component: stepCLIInstall
        },
        {
          id: 1,
          text: "Get your secret keys",
          expanded: false,
          component: stepGetSecretKey
        }
      ]
    }
  },
  components: {
    step,
    stepCLIInstall,
    stepGetSecretKey,
  },
  methods: {
    toggleExpand(step) {
      step.expanded = !step.expanded;
    },
    doneClicked(step) {
      this.toggleExpand(step);
      if(step.id === 0) {
        this.toggleExpand(this.steps[1]);
      }
    }
  }
}
</script>