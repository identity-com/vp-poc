<template>
  <div>
    <v-row>
      <v-col>
        <v-checkbox
          readonly
          v-model="verification.credentialProof"
          label="Credential Verified"
        ></v-checkbox>
      </v-col>
      <v-col>
        <v-checkbox
          readonly
          v-model="verification.presentationProof"
          label="Presentation Verified"
        ></v-checkbox>
      </v-col>
      <v-col>
        <v-checkbox
          readonly
          v-model="verification.subjectVerified"
          label="Subject Verified"
        ></v-checkbox>
      </v-col>
    </v-row>
    <v-row>
      <v-textarea v-model="signedPresentation" rows="30" class="presentation"/>
    </v-row>
  </div>
</template>
<style>
.presentation textarea {
  font-family: monospace;
  font-size: 10px;
  line-height: 10px !important;
  white-space: pre;
  overflow-wrap: normal;
  overflow-x: scroll;
}
</style>
<script lang="ts">
import Vue from 'vue';

import { presentation } from '@/lib/index';
import verifyCredentials from '@/lib/credential';

interface ComponentData {
  signedPresentation?: string | null,
  verification: {
    presentationProof: boolean,
    credentialProof: boolean,
    subjectVerified: boolean
  }
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
      const vp = JSON.parse(newValue);
      this.verification.presentationProof = await presentation.verify(vp);
      this.verification.credentialProof = await verifyCredentials(vp.verifiableCredential);
    },
  },
  props: {
    presentation: {
      type: Object,
    },
  },
  methods: {},
  mounted() {
    this.signedPresentation = JSON.stringify(this.presentation, null, 2);
  },
});
</script>
