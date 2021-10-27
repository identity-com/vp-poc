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
      <v-col>
        <v-checkbox
          readonly
          v-model="verification.subjectVerified"
          label="Subject Verified"
          :indeterminate="verification.subjectVerified === undefined"
        ></v-checkbox>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-textarea v-model="signedPresentation" rows="30" class="presentation" outlined/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn color="primary" :disabled="!verification.subjectVerified
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
import Vue from 'vue';
import _ from 'lodash';
import { presentation } from '@/lib/index';
import verifyCredentials from '@/lib/credential';

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

      this.debounceVerificationUpdate(newValue);
    },
  },
  props: {
    presentation: {
      type: Object,
    },
  },
  methods: {
    async updateVerification(value: string) {
      const vp = JSON.parse(value);
      this.verification.presentationProof = await presentation.verify(vp);
      try {
        this.verification.credentialProof = await verifyCredentials(vp.verifiableCredential);
      } catch (e) {
        this.verification.credentialProof = false;
      }

      this.verification.subjectVerified = true;
    },
    async debounceVerificationUpdate() {
      console.log('Stub to make Vue happy');
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
