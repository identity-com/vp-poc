import { verifiable } from '@transmute/vc.js';
import { v4 as uuidv4 } from 'uuid';
import { JsonWebSignature, JsonWebKey } from '@transmute/json-web-signature';
import { WalletAdapter } from '@identity.com/wallet-adapter-base';
import { base64url } from '@/lib/base64url';
import defaultDocumentLoader from './presentation/documentLoader';
import { convert as convertCredential } from './presentation/credential';
import { getDIDFromCryptid } from '@/lib/cryptid';

export const create = (credentials: any[], controller: string) => ({
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/suites/jws-2020/v1',
  ],
  type: ['VerifiablePresentation'],
  holder: {
    id: controller,
  },
  verifiableCredential: convertCredential(credentials, controller),
});

async function signWithCryptid(wallet: WalletAdapter, data: Uint8Array): Promise<Uint8Array> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walletHack: any = wallet;
  // eslint-disable-next-line no-underscore-dangle
  const popupWindow = walletHack._wallet._popup as Window;
  // eslint-disable-next-line no-underscore-dangle
  const windowOrigin = walletHack._provider;

  return new Promise<Uint8Array>((resolve, reject) => {
    const signListener = (event: MessageEvent) => {
      if (event.origin === windowOrigin) {
        if (event.data.signature) {
          resolve(event.data.signature);
          window.removeEventListener('message', signListener);
        } else if (event.data.error) {
          reject(event.data.error);
          window.removeEventListener('message', signListener);
        }
      }
    };
    window.addEventListener('message', signListener);
    popupWindow.postMessage({
      method: 'signWithDIDKey',
      params: { message: data },
    }, windowOrigin);
  });
}

const jwtSigner = (wallet: WalletAdapter) => () => ({
  sign: async ({ data }: { data: Uint8Array | any }) => {
    const header = {
      alg: 'EdDSA',
      b64: false,
      crit: ['b64'],
    };
    const encodedHeader = base64url.encode(JSON.stringify(header));

    const toBeSigned = new Uint8Array(
      Buffer.concat([
        Buffer.from(encodedHeader, 'utf8'),
        Buffer.from('.', 'utf-8'),
        data,
      ]),
    );

    const signature = await signWithCryptid(wallet, toBeSigned);

    return `${encodedHeader}..${base64url.encode(Buffer.from(signature))}`;
  },
});

export const sign = async (
  signer: WalletAdapter | JsonWebKey,
  vp: any,
  documentLoader = defaultDocumentLoader,
): Promise<any> => {
  let signingKey: JsonWebKey;
  signingKey = signer as JsonWebKey;

  if ((signer as JsonWebKey).controller) {
    signingKey = signer as JsonWebKey;
  } else {
    const {
      did,
      keyName,
    } = await getDIDFromCryptid(signer as WalletAdapter);

    signingKey = new JsonWebKey();
    signingKey.id = `${did}#${keyName}`;
    signingKey.type = 'Ed25519VerificationKey2018';
    signingKey.controller = did;
    signingKey.signer = jwtSigner(signer as WalletAdapter);
  }

  const result = await verifiable.presentation.create({
    presentation: {
      ...vp,
      holder: { id: signingKey.id },
    },
    format: ['vp', 'vp-jwt'],
    documentLoader,
    challenge: uuidv4(),
    suite: new JsonWebSignature({
      key: signingKey,
    }),
  });
  console.log(result.items[1]);
  return result.items[0];
};

export const verify = async (
  vp: any,
  documentLoader = defaultDocumentLoader,
): Promise<boolean> => {
  const verified = await verifiable
    .presentation.verify({
      presentation: vp,
      format: ['vp'],
      documentLoader,
      challenge: vp.proof.challenge,
      suite: new JsonWebSignature({}),
    });

  return verified.verified;
};
