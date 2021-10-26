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
import { Cryptid as CryptidInterface } from '@identity.com/cryptid';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { DIDDocument } from 'did-resolver';
import Cryptid from '@/components/Cryptid.vue';
import Civic from '@/components/Civic.vue';
import Key from '@/components/Key.vue';
import CivicExchange from '@/components/CivicExchange.vue';
import { presentation } from '@/lib';
import { createJwkFromBs58 } from '@/lib/keyUtil';

interface ComponentData {
  step: number;
  cryptidAccount: string | undefined;
  did: {
    did: string;
    keyname: string;
    prvKey: string;
    cryptid: CryptidInterface;
    document: DIDDocument;
  } | undefined;
  civicAuthCode: string;
}

export default Vue.extend({
  components: {
    Cryptid,
    Civic,
    Key,
    CivicExchange,
  },
  data(): ComponentData {
    return {
      step: 1,
      cryptidAccount: '',
      did: undefined,
      civicAuthCode: '',
    };
  },
  methods: {
    async onWalletConnected(wallet: WalletAdapter) {
      this.cryptidAccount = wallet.publicKey?.toBase58();
      this.did = undefined;

      console.log(`Connected to Cryptid account: ${this.cryptidAccount}`);

      this.step = 2;
    },
    onWalletDisconnected() {
      this.did = undefined;
      this.cryptidAccount = '';
      this.step = 1;
    },
    async onDidConnected(did: string, keyname: string, prvKey: string, cryptid: CryptidInterface) {
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
    async onAuthCodeExchanged(data: { credentials: any }) {
      if (!this.did) {
        return;
      }

      const jwkPvt = await createJwkFromBs58(this.did.prvKey, this.did.did, this.did.keyname);

      const vp = presentation.create(data.credentials, `${this.did?.did}#${this.did?.keyname}`);

      const signedVp = await presentation.sign(vp, jwkPvt);

      console.log('=== Signed Presentation ===');
      console.log(signedVp);
    },
  },
});
</script>