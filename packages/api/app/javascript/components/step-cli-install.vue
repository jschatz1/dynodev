<template>
  <div>
    <p class="padding-top-20">
      <code class="terminal" @click.stop="terminalClicked">yarn add dyno</code>
    </p>
    <p class="padding-top-20">
      <a class="button is-primary" @click.stop="doneClicked">Done</a>
    </p>
  </div>
</template>
<script>
export default {
  methods: {
    terminalClicked() {

    },
    doneClicked() {
      this.$emit("done");
    }
  }
}
</script>