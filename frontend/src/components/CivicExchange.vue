<template>
  <div>
    <v-text-field readonly v-model="authCode" label="SIP Auth Token"/>

    <v-textarea readonly rows="11" class="parsed" v-model="parsedToken"></v-textarea>

    <v-btn :disabled="!parsedToken || parsedToken === ''" color="primary" @click="exchange">
      Exchange
    </v-btn>
  </div>
</template>
<style scoped>
.parsed {
  font-family: monospace;
  font-size: 10px;
  line-height: 10px !important;
}

</style>
<style>
.v-textarea textarea {
  line-height: 1rem !important;
}
</style>
<script lang="ts">
import Vue from 'vue';
import rs from 'jsrsasign';
import axios from 'axios';

export default Vue.extend({
  name: 'CivicExchange',
  components: {},
  data(): any {
    return {
      civic: null,
    };
  },
  computed: {
    parsedToken() {
      try {
        if (!this.authCode) {
          return null;
        }
        const parsed = rs.jws.JWS.parse(this.authCode);

        return !parsed || !parsed.payloadObj ? ''
          : JSON.stringify(parsed.payloadObj, null, 2);
      } catch (e) {
        return null;
      }
    },
  },
  props: {
    authCode: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    onExchanged: Function,
  },
  methods: {
    exchange() {
      axios.post(this.endpoint,
        { jwtToken: this.authCode },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then((response) => {
          response.data.credentials.forEach((credential) => {
            this.$log.debug('=== Credential ===');
            this.$log.debug(JSON.stringify(credential, null, 2));
          });

          this.onExchanged(response.data);
        });
    },
  },
});
</script>
