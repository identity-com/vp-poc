<template>
  <v-btn @click="connectWallet">
    <v-img src="../assets/cryptid.svg" class="cryptid"/>
  </v-btn>
</template>
<style scoped>
.cryptid {
  height: 18px;
  width: 116px;
}
</style>
<script lang="ts">
import Vue from 'vue';
import { getCryptidWallet } from '@identity.com/wallet-adapter-wallets';

const DEFAULT_SOLANA_NETWORK = 'devnet';

export default Vue.extend({
  name: 'Cryptid',
  props: {
    onConnected: Function,
    onDisconnected: Function,
    network: {
      required: true,
      type: String,
    },
  },
  methods: {
    async connectWallet() {
      try {
        const cryptidAdapter = getCryptidWallet({
          network: this.network ?? DEFAULT_SOLANA_NETWORK,
        });
        const wallet = cryptidAdapter.adapter();
        await wallet.connect();

        this.onConnected(wallet);
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
