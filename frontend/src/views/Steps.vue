<template>
  <v-main>
    <v-container>
      <v-stepper v-model="step" vertical>
        <v-stepper-step :complete="step > 1" step="1">
          Connect Cryptid

          <small v-if="did">
            <strong>DID:</strong> {{ did.did }}
          </small>
          <small v-if="did">
            <strong>Cryptid Account:</strong> {{ cryptidAccount }}
          </small>
          <small v-if="did">
            <small v-if="did">
              <strong>Public Key:</strong> {{ did.pubKey }}
            </small>
          </small>
        </v-stepper-step>

        <v-stepper-content step="1">
          <Cryptid
            :on-connected="onWalletConnected"
            :on-disconnected="onWalletDisconnected"
            :network="$config['solanaNetwork']"/>

        </v-stepper-content>

        <v-stepper-step :complete="step > 2" step="2">
          Load Credentials via Civic
        </v-stepper-step>

        <v-stepper-content step="2">
          <Civic
            :app-id="$config['sipAppId']"
            :scope-request="$config['civicScopeRequest']"
            :on-auth-code-received="onAuthCodeRecevied"/>
        </v-stepper-content>

        <v-stepper-step :complete="step > 3" step="3">
          Exchange Token for Credentials
        </v-stepper-step>
        <v-stepper-content step="3">
          <CivicExchange
            :auth-code="civicAuthCode"
            :on-exchanged="onAuthCodeExchanged"
            :endpoint="$config['sipExchangeEndpoint']"/>
        </v-stepper-content>

        <v-stepper-step :complete="step > 4" step="4">
          Verify Presentation & Credentials
        </v-stepper-step>
        <v-stepper-content step="4">
          <VPValidator :presentation="signedVp" :on-verified="onProofVerified"
                       :account="cryptidAccount"/>
        </v-stepper-content>

        <v-stepper-step :complete="step > 5" step="5">
          Gateway Token
        </v-stepper-step>
        <v-stepper-content step="5">
          <div>&nbsp;</div>
          <v-textarea readonly rows="9" v-model="gkToken" label="Gateway Token"
                      outlined class="gk-token"/>
        </v-stepper-content>
      </v-stepper>
    </v-container>
  </v-main>
</template>
<style>
.gk-token {
  font-family: monospace;
  font-size: 11px;
  line-height: 11px !important;
}
</style>
<script lang="ts">
import Vue from 'vue';
import { Cryptid as CryptidInterface } from '@identity.com/cryptid';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { DIDDocument } from 'did-resolver';
import { GatewayToken } from '@identity.com/solana-gateway-ts';
import Cryptid from '@/components/Cryptid.vue';
import VPValidator from '@/components/VPValidator.vue';
import Civic from '@/components/Civic.vue';
import CivicExchange from '@/components/CivicExchange.vue';
import { presentation } from '@/lib';
import * as gatekeeper from '@/lib/gatekeeper';

// eslint-disable-next-line no-shadow
enum StepEnum {
  Connect = 1,
  SIP = 2,
  Exchange = 3,
  Validate = 4,
  Token = 5
}

interface ComponentData {
  step: StepEnum;
  cryptidAccount?: string;
  did: {
    did: string;
    keyname: string;
    pubKey: string;
    cryptid?: CryptidInterface;
    document?: DIDDocument;
  } | undefined;
  civicAuthCode: string;
  unsignedVp?: any;
  signedVp?: any;
  gkToken?: string
}

// Vue has a problem assigning the wallet to the component (due to the reactive getters)
let connectedWallet: WalletAdapter;

export default Vue.extend({
  components: {
    Cryptid,
    Civic,
    CivicExchange,
    VPValidator,
  },
  data(): ComponentData {
    return {
      step: StepEnum.Connect,
      cryptidAccount: '',
      did: undefined,
      civicAuthCode: '',
      signedVp: undefined,
      gkToken: undefined,
    };
  },
  methods: {
    async onWalletConnected(
      wallet: WalletAdapter,
      did: string,
      pubKey: string,
      keyname: string,
      document: DIDDocument,
    ) {
      connectedWallet = wallet;

      this.cryptidAccount = wallet.publicKey?.toBase58();

      this.did = {
        did,
        keyname,
        pubKey,
        document,
      };

      this.step = StepEnum.SIP;
    },
    onWalletDisconnected() {
      this.did = undefined;
      this.cryptidAccount = '';
      this.step = StepEnum.Connect;
    },
    async onAuthCodeRecevied(token: string) {
      this.civicAuthCode = token;

      this.step = StepEnum.Exchange;
    },
    async onAuthCodeExchanged(data: { credentials: any }) {
      if (!this.did) {
        return;
      }

      const vp = presentation.create(data.credentials, `${this.did?.did}`);

      this.signedVp = await presentation.sign(connectedWallet, vp);

      this.step = StepEnum.Validate;
    },
    async onProofVerified(token: GatewayToken) {
      this.gkToken = gatekeeper.prettyPrint(token);

      this.step = StepEnum.Token;
    },
  },
});
</script>
