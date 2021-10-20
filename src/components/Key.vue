<template>
  <v-row>
    <v-col>
      <v-text-field label="DID" v-model="did"/>

      <v-text-field label="Private Key" v-model="prvKey"/>

      <v-btn @click="next" color="primary">Next</v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">

import Vue from 'vue';
import * as cryptid from '@identity.com/cryptid';
import bs58 from 'bs58';
import { Keypair } from '@solana/web3.js';

export default Vue.extend({
  name: 'Key',
  data(): any {
    return {
      prvKey: '',
      did: '',
    };
  },
  props: {
    connection: Object,
    cryptidAddress: {
      type: String,
      required: true,
    },
  },
  methods: {
    async next() {
      try {
        const key = bs58.decode(this.prvKey);
        const keyPair = Keypair.fromSecretKey(key);

        const cryptidInstance = cryptid.build(
          this.did,
          keyPair,
          { connection: this.connection },
        );

        const connectedAddress = (await cryptidInstance.address()).toBase58();

        if (connectedAddress !== this.cryptidAddress) {
          throw new Error('Connect Cryptid account does not match the provided Cryptid account');
        }

        const didDocument = await cryptidInstance.document();

        const foundKey = didDocument.publicKey?.find(
          (publicKey) => publicKey.publicKeyBase58 === keyPair.publicKey.toBase58(),
        );

        if (!foundKey) {
          throw new Error('Key not found on DID');
        }

        this.$log.debug(JSON.stringify(didDocument, null, 2));

        this.connection(this.did, foundKey.id.split('#')[1], this.prvKey, cryptidInstance);
      } catch (e) {
        console.error(e);
      }
    },
  },
});
</script>
