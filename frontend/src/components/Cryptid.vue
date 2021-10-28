<template>
  <v-btn @click="connectWallet" color="#DC3131" outlined :disabled="connecting">
    <v-img src="../assets/cryptid.png" class="cryptid" />
    CONNECT
  </v-btn>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { DIDDocument } from 'did-resolver';
import { resolve } from '@identity.com/sol-did-client';
import * as cryptid from '@/lib/cryptid';

interface ComponentData {
  connecting: boolean
}

export default Vue.extend({
  name: 'Cryptid',
  data(): ComponentData {
    return {
      connecting: false,
    };
  },
  props: {
    onConnected: {
      type: Function as PropType<(
        wallet: WalletAdapter,
        did: string,
        pubKey: string,
        key: string,
        document: DIDDocument
      ) => void>,
    },
    onDisconnected: {
      type: Function as PropType<() => void>,
    },
  },
  methods: {
    async connectWallet() {
      this.connecting = true;
      try {
        const wallet = cryptid.getCryptidWalletAdapter()
          .adapter();

        await wallet.connect();

        const {
          did,
          keyName,
        } = await cryptid.getDIDFromCryptid(wallet);

        const document = await resolve(did);

        const publicKey = document.publicKey?.find(
          (key) => key.id === `${did}#${keyName}`,
        );

        if (publicKey && publicKey.publicKeyBase58) {
          this.onConnected(wallet, did, publicKey.publicKeyBase58, keyName, document);
        }
      } catch (e) {
        this.connecting = false;

        console.error(e);
      }
    },
    walletDisconnected() {
      this.onDisconnected();
    },
  },
});
</script>
