<template>
  <v-container>
    <v-row>
      <v-col>
        <v-checkbox
          readonly
          v-model="verification.credentialProof"
          label="Credential Verified"
          :indeterminate="verification.credentialProof === undefined"
        ></v-checkbox>
      </v-col>
      <v-col>
        <v-checkbox
          readonly
          v-model="verification.presentationProof"
          label="Presentation Verified"
          :indeterminate="verification.presentationProof === undefined"
        ></v-checkbox>
      </v-col>
      <!--      <v-col>-->
      <!--        <v-checkbox-->
      <!--          readonly-->
      <!--          v-model="verification.subjectVerified"-->
      <!--          label="Subject Verified"-->
      <!--          :indeterminate="verification.subjectVerified === undefined"-->
      <!--        ></v-checkbox>-->
      <!--      </v-col>-->
    </v-row>
    <v-row>
      <v-col>
        <v-textarea v-model="signedPresentation" rows="30" class="presentation" outlined/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn color="primary" @click="getGKToken"
               outlined
               :disabled="!verification.subjectVerified
                            || !verification.presentationProof
                            || !verification.credentialProof">
          Get Token
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<style>
.presentation textarea {
  font-family: monospace;
  font-size: 11px;
  line-height: 11px !important;
  white-space: pre;
  overflow-wrap: normal;
  overflow-x: scroll;
}
</style>
<script lang="ts">
import Vue, { PropType } from 'vue';
import _ from 'lodash';
import { GatewayToken } from '@identity.com/solana-gateway-ts';
import { presentation } from '@/lib/index';
import verifyCredentials from '@/lib/credential';
import * as gatekeeper from '@/lib/gatekeeper';

interface ComponentData {
  signedPresentation?: string | null,
  verification: {
    presentationProof: boolean | undefined,
    credentialProof: boolean | undefined,
    subjectVerified: boolean | undefined
  },
}

export default Vue.extend({
  name: 'VPValidator',
  data(): ComponentData {
    return {
      signedPresentation: null,
      verification: {
        presentationProof: false,
        credentialProof: false,
        subjectVerified: false,
      },
    };
  },
  watch: {
    async signedPresentation(newValue, oldValue) {
      this.verification = {
        presentationProof: undefined,
        credentialProof: undefined,
        subjectVerified: undefined,
      };

      await this.debounceVerificationUpdate(newValue);
    },
    presentation() {
      this.signedPresentation = JSON.stringify(this.presentation, null, 2);
    },
  },
  props: {
    presentation: {
      type: Object,
    },
    onVerified: {
      type: Function as PropType<(token: GatewayToken) => void>,
    },
    account: {
      type: String,
      required: true,
    },
  },
  methods: {
    async updateVerification(value: string) {
      const verification = {
        presentationProof: false,
        credentialProof: false,
        subjectVerified: false,
      };

      if (value) {
        try {
          const vp = JSON.parse(value);

          try {
            verification.presentationProof = await presentation.verify(vp);
          } catch (e) {
            console.log(e);
            verification.presentationProof = false;
          }

          try {
            verification.credentialProof = await verifyCredentials(vp.verifiableCredential);
          } catch (e) {
            console.log(e);
            verification.credentialProof = false;
          }

          verification.subjectVerified = true;
        } catch (e) {
          console.log(e);
        }
      }

      this.verification = verification;
    },
    debounceVerificationUpdate(value: string): Promise<void> | undefined {
      // TODO: remove this once ready
      console.log(`Stub to make Vue happy ${value}`);
      return Promise.resolve();
    },
    async getGKToken() {
      const token = await gatekeeper.issueToken(this.account);

      this.onVerified(token);
    },
  },
  created() {
    // eslint-disable-next-line
    this.debounceVerificationUpdate = _.debounce(this.updateVerification, 100);
  },
  mounted() {
    this.signedPresentation = JSON.stringify(this.presentation, null, 2);
  },
});
</script>
