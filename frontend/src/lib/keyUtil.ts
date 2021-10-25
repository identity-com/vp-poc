import { Ed25519VerificationKey2018 } from '@transmute/ed25519-key-pair';
import bs58 from 'bs58';
import { Keypair } from '@solana/web3.js';
import { JsonWebKey } from '@transmute/json-web-signature';

export const createKeypair = (key: string): Keypair => Keypair.fromSecretKey(bs58.decode(key));

export const createKey = (keyPair: Keypair, did: string, id: string)
  : Ed25519VerificationKey2018 => ({
  id: `${did}#${id}`,
  type: 'Ed25519VerificationKey2018',
  controller: did,
  publicKeyBase58: keyPair.publicKey.toBase58(),
  privateKeyBase58: bs58.encode(keyPair.secretKey),
});

export const createJwkFromBs58 = async (
  key: string,
  did: string,
  name: string): Promise<JsonWebKey> => {
  const kp = createKeypair(key);

  const ed25519 = createKey(kp, did, name);

  return JsonWebKey.from(ed25519);
};
