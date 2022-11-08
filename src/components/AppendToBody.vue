<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "AppendToBody",
  mounted() {
    const node = this.$mount().$el
    document.body.appendChild(node)
  },
  destroyed() {
    const node = this.$mount().$el
    node.remove()
  },
}
</script>

<style scoped>

</style>