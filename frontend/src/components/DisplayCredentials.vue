<template>
  <div>
<!--    <v-checkbox-->
<!--      readonly-->
<!--      label="Credential Verified"-->
<!--    />-->
    <div>&nbsp;</div>
    <v-textarea readonly rows="12" class="display-text" v-model="credentialJson"
                label="Verifiable Credentials"
                outlined/>

  </div>
</template>
<script lang="ts">

import Vue from 'vue';

interface ComponentData {
  credentialJson: string
}

export default Vue.extend({
  name: 'DisplayCredentials',
  data(): ComponentData {
    return {
      credentialJson: '',
    };
  },
  watch: {
    credentials() {
      this.credentialJson = JSON.stringify(this.credentials, null, 2);
    },
  },
  props: {
    credentials: {
      type: Array,
    },
  },
  methods: {},
  mounted() {
    this.credentialJson = JSON.stringify(this.credentials, null, 2);
  },
});
</script>
