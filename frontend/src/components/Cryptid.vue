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
import Vue, { PropType } from 'vue';
import { getCryptidWallet } from '@identity.com/wallet-adapter-wallets';
import { WalletAdapterNetwork, WalletAdapter } from '@solana/wallet-adapter-base';

const DEFAULT_SOLANA_NETWORK = WalletAdapterNetwork.Devnet;

export default Vue.extend({
  name: 'Cryptid',
  props: {
    onConnected: {
      type: Function as PropType<(wallet: WalletAdapter) => void>,
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
        const cryptidAdapter = getCryptidWallet({
          network: this.network as WalletAdapterNetwork ?? DEFAULT_SOLANA_NETWORK,
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
