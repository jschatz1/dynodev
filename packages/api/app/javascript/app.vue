<template>
  <div id="app" class="section columns">
    <div class="column is-8 is-offset-2">
      <box></box>
    </div>
  </div>
</template>

<script>
import box from "./components/box.vue";
export default {
  components: {
    box,
  }
}
</script>

<style scoped></style>
