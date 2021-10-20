import { Ed25519VerificationKey2018 } from '@transmute/ed25519-key-pair';
import bs58 from 'bs58';
import { Keypair } from '@solana/web3.js';

export default (keyPair: Keypair, did: string, id: string): Ed25519VerificationKey2018 => ({
  id: `${did}#${id}`,
  type: 'Ed25519VerificationKey2018',
  controller: did,
  publicKeyBase58: keyPair.publicKey.toBase58(),
  privateKeyBase58: bs58.encode(keyPair.secretKey),
});
