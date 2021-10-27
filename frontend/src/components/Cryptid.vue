<template>
  <v-btn @click="connectWallet" color="#DC3131" outlined>
    <v-img src="../assets/cryptid.png" class="cryptid"/>
    CONNECT
  </v-btn>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import * as cryptid from '@/lib/cryptid';

export default Vue.extend({
  name: 'Cryptid',
  props: {
    onConnected: {
      type: Function as PropType<(wallet: WalletAdapter, did: string) => void>,
    },
    onDisconnected: {
      type: Function as PropType<() => void>,
    },
    network: {
      required: true,
      type: String,
    },
  },
  methods: {
    async connectWallet() {
      try {
        const wallet = cryptid.getCryptidWalletAdapter()
          .adapter();
        await wallet.connect();
        const did = await cryptid.getDIDFromCryptid(wallet);

        this.onConnected(wallet, did);
      } catch (e) {
        console.error(e);
      }
    },
    walletDisconnected() {
      this.onDisconnected();
    },
  },
});
</script>
