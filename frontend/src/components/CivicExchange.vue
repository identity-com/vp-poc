<template>
  <v-container>
    <div>&nbsp;</div>

    <v-textarea readonly rows="5" class="parsed" v-model="authCode" label="SIP Auth Token"
                outlined/>

    <v-textarea readonly rows="12" class="parsed" v-model="parsedToken" label="Payload"
                outlined/>

    <v-btn :disabled="busy" color="primary" @click="exchange" outlined>
      Exchange
    </v-btn>
  </v-container>
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

interface ComponentData {
  parsedToken: string | null,
  busy: boolean
}

export default Vue.extend({
  name: 'CivicExchange',
  data(): ComponentData {
    return {
      parsedToken: null,
      busy: false,
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
      this.busy = true;

      axios.post(this.endpoint,
        { jwtToken: this.authCode },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then((response: AxiosResponse<any>) => {
          this.onExchanged(response.data);
        })
        .catch((e) => {
          this.busy = false;

          console.log(e);
        });
    },
  },
  watch: {
    authCode() {
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
  },
});
</script>
