<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex">
        <v-img src="./assets/identity.png"/>
      </div>
      <v-spacer></v-spacer>
      <div>Verifiable Presentations Showcase</div>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>
<style>
/*.display-text {*/
/*  font-family: monospace;*/
/*  font-size: 11px !important;*/
/*  line-height: 11px !important;*/
/*}*/

</style>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'App',
  components: { },
  data: () => ({
    //
  }),
});
</script>
