<template>
  <v-main>
    <v-container>
      <v-stepper v-model="step" vertical>
        <v-stepper-step :complete="step > 1" step="1">
          Connect Cryptid
        </v-stepper-step>

        <v-stepper-content step="1">
          <Cryptid v-if="!cryptidAccount"
                   v-bind:on-connected="onWalletConnected"
                   v-bind:on-disconnected="onWalletDisconnected"
                   :network="$config['solanaNetwork']"/>
        </v-stepper-content>

        <v-stepper-step :complete="step > 2" step="2">
          Capture Private Key
          <small>temporary solution</small>
        </v-stepper-step>

        <v-stepper-content step="2">
          <Key v-bind:connection="onDidConnected" v-bind:cryptid-address="cryptidAccount"/>
        </v-stepper-content>

        <v-stepper-step :complete="step > 3" step="3">
          Civic SIP Flow
        </v-stepper-step>

        <v-stepper-content step="3">
          <Civic
            :app-id="$config['sipAppId']"
            :scope-request="$config['civicScopeRequest']"
            :on-auth-code-received="onAuthCodeRecevied"/>
        </v-stepper-content>

        <v-stepper-step step="4">
          Exchange Token for Credentials
        </v-stepper-step>
        <v-stepper-content step="4">
          <CivicExchange
            :auth-code="civicAuthCode"
            :on-exchanged="onAuthCodeExchanged"
            :endpoint="$config['sipExchangeEndpoint']"/>
        </v-stepper-content>
      </v-stepper>
    </v-container>
  </v-main>
</template>
<script lang="ts">
import Vue from 'vue';
import { clusterApiUrl, Connection, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { JsonWebKey } from '@transmute/json-web-signature';
import Cryptid from '@/components/Cryptid.vue';
import Civic from '@/components/Civic.vue';
import Key from '@/components/Key.vue';
import CivicExchange from '@/components/CivicExchange.vue';
import { presentation } from '@/lib';
import createKey from '@/lib/keyUtil';

const storage: any = {};

export default Vue.extend({
  components: {
    Cryptid,
    Civic,
    Key,
    CivicExchange,
  },
  data(): any {
    return {
      step: 3,
      connection: undefined,
      cryptidAccount: '',
      did: undefined,
      civicAuthCode: '',
    };
  },
  methods: {
    async onWalletConnected(wallet: any) {
      storage.wallet = wallet;
      this.cryptidAccount = wallet.publicKey.toBase58();
      this.did = null;

      this.$log.debug(`Connected to Cryptid account: ${this.cryptidAccount}`);

      this.step = 2;
    },
    onWalletDisconnected() {
      storage.wallet = undefined;
      this.did = null;
      this.cryptidAccount = null;
      this.step = 1;
    },
    async onDidConnected(did: string, keyname: string, prvKey: string, cryptid: any) {
      const document = await cryptid.document();

      this.did = {
        did,
        keyname,
        prvKey,
        cryptid,
        document,
      };

      this.step = 3;
    },
    async onAuthCodeRecevied(token: string) {
      this.civicAuthCode = token;

      this.step = 4;
    },
    async onAuthCodeExchanged(data: any) {
      const keyPair = Keypair.fromSecretKey(bs58.decode(this.did.prvKey));

      const key = createKey(keyPair, this.did.did, this.did.keyname);
      const jwkPvt = await JsonWebKey.from(key);

      const vp = presentation.create(data.credentials, `${this.did.did}#${this.did.keyname}`);

      const signedVp = await presentation.sign(vp, jwkPvt);

      console.log('=== Signed Presentation ===');
      console.log(signedVp);
    },
  },
});
</script>
