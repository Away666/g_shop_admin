<template>
  <div class="dashboard-container">
    <card></card>
    <Sale></Sale>
    <Observe></Observe>
  </div>
</template>

<script>
import Card from "./card";
import Sale from "./Sale";
import Observe from "./Observe";

export default {
  name: "Dashboard",
  components: {
    Card,
    Sale,
    Observe,
  },
  mounted() {
    this.$store.dispatch("getData");
  },
  computed: {},
};
</script>

<style lang="scss" scoped>
</style>
