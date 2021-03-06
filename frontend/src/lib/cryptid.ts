import { WalletName } from '@identity.com/wallet-adapter-wallets/src/types';
import { SolletWalletAdapter } from '@identity.com/wallet-adapter-sollet';
import { WalletAdapterNetwork, WalletAdapter } from '@solana/wallet-adapter-base';

const DEFAULT_SOLANA_NETWORK = WalletAdapterNetwork.Devnet;

export function getCryptidWalletAdapter(network: WalletAdapterNetwork = DEFAULT_SOLANA_NETWORK) {
  const LOCAL_URL = 'https://cryptid.identity.com';
  const cryptidAdapter = {
    name: WalletName.Cryptid,
    url: LOCAL_URL,
    icon: 'data:image/png;base64,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',
    // eslint-disable-next-line max-len
    adapter: () => new SolletWalletAdapter({
      provider: LOCAL_URL,
      useExtendedIF: true,
      network,
    }),

  };

  return cryptidAdapter;
}

export async function getDIDFromCryptid(wallet: WalletAdapter): Promise<{
  did: string,
  keyName: string,
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walletHack: any = wallet;
  // eslint-disable-next-line no-underscore-dangle
  const popupWindow = walletHack._wallet._popup as Window;
  // eslint-disable-next-line no-underscore-dangle
  const windowOrigin = walletHack._provider;
  return new Promise<{
    did: string,
    keyName: string,
  }>((resolve, reject) => {
    const didListener = (event: MessageEvent) => {
      if (event.origin === windowOrigin) {
        if (event.data.did) {
          console.log('Got DID: ', event.data.did);
          console.log('Got Keyname: ', event.data.keyName);
          resolve({ did: event.data.did, keyName: event.data.keyName });
          window.removeEventListener('message', didListener);
        } else if (event.data.error) {
          reject(event.data.error);
          window.removeEventListener('message', didListener);
        }
      }
    };
    window.addEventListener('message', didListener);
    popupWindow.postMessage({
      method: 'getDID',
    }, windowOrigin);

    popupWindow.focus();
  });
}
