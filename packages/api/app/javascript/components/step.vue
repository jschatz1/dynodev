<template>
  <li class="expandable padding-20" aria-role="button" @click="expand">
    <a class="expander-btn">
      <chevron :expanded="step.expanded"></chevron>
    </a>
    <a class="expander-btn padding-left-12">{{step.text}}</a>
    <div class="expanded-content padding-top-10" v-if="step.expanded">
      <component :is="step.component" class="padding-left-22" @done="$emit('done')"></component>
    </div>
  </li>
</template>
<script>
import chevron from "./chevron.vue";
export default {
  components: {
    chevron,
  },
  props: {
    step: {
      type: Object
    }
  },
  methods: {
    expand() {
      this.$emit("expand");
    }
  }
}
</script>