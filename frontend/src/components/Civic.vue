<template>
  <div>
    <v-btn @click="connect" color="#2F4D6D">
      <v-img src="../assets/civic.svg" class="civic"/>
    </v-btn>
  </div>
</template>
<style scoped>
.civic {
  height: 18px;
  width: 51px;
}
</style>
<script lang="ts">
import Vue from 'vue';

declare const civic: any;

export default Vue.extend({
  name: 'Civic',
  components: {},
  data(): any {
    return {
      civic: null,
    };
  },
  mounted() {
    // eslint-disable-next-line new-cap
    this.civic = new civic.sip({
      appId: this.appId,
      hideIntro: false,
    });

    this.civic.on('auth-code-received', this.authCodeReceived);
  },
  props: {
    onAuthCodeReceived: Function,
    appId: {
      type: String,
      required: true,
    },
    scopeRequest: {
      type: String,
      required: true,
    },
  },
  methods: {
    connect() {
      this.civic.signup({
        style: 'popup',
        scopeRequest: this.scopeRequest,
      });
    },
    authCodeReceived(event: any) {
      if (this.onAuthCodeReceived) {
        this.onAuthCodeReceived(event.response);
      }
    },
  },
});
</script>
