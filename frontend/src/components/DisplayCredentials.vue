<template>

</template>
<script lang="ts">

import Vue from 'vue';

interface ComponentData {

}

export default Vue.extend({
  name: 'DisplayCredentials',
  data(): ComponentData {
    return {};
  },
  props: {
    credentials: {
      type: Array,
      required: true,
    },
  },
  methods: {},
  created() {
  },
  mounted() {
  },
});
</script>
