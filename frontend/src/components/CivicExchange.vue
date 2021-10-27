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
import Vue, { PropType } from 'vue';
import rs from 'jsrsasign';
import axios, { AxiosResponse } from 'axios';

export default Vue.extend({
  name: 'CivicExchange',
  data(): any {
    return {
      parsedToken: null,
    };
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
    onExchanged: {
      type: Function as PropType<(data: any) => void>,
    },
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
        .then((response: AxiosResponse<any>) => {
          this.onExchanged(response.data);
        });
    },
  },
  mounted() {
    try {
      if (!this.authCode) {
        this.parsedToken = null;
      }

      const parsed = rs.jws.JWS.parse(this.authCode);
      this.parsedToken = !parsed || !parsed.payloadObj ? ''
        : JSON.stringify(parsed.payloadObj, null, 2);
    } catch (e) {
      this.parsedToken = null;
    }
  },
});
</script>
