<template>
  <img class="chevron" :class="{'expanded': expanded}" src="../images/chevron.svg">
</template>
<script>
export default {
  props: {
    expanded: {
      type: Boolean,
      default: false,
    }
  }
}
</script>
<style type="scss" scoped>
.expanded {
  transform: rotate(90deg);
}
</style>