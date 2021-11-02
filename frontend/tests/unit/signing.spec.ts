import {
  Connection, Keypair, LAMPORTS_PER_SOL, PublicKey,
} from '@solana/web3.js';
import { util, build, Cryptid } from '@identity.com/cryptid';
import { JsonWebKey } from '@transmute/json-web-signature';
import { WalletAdapter } from '@identity.com/wallet-adapter-base';
import { presentation } from '@/lib/index';
import * as testUtil from '../util/helper';
import vc from './lib/fixtures/credentials.json';
import { base64url } from '@/lib/base64url';

const findKeyName = async (cryptid: Cryptid, pk: PublicKey) => {
  const document = await cryptid.document();

  const found = document.publicKey?.find(
    (key) => key.publicKeyBase58 === pk.toBase58(),
  );

  if (!found) {
    return null;
  }

  const [did, name] = found.id.split('#');

  return name;
};

describe.only('thing', () => {
  it.only('stuff', async () => {
    const connection = new Connection('http://localhost:8899/', 'confirmed');

    const kp = Keypair.generate();

    const did = util.publicKeyToDid(kp.publicKey, 'localnet');

    const cryptid = build(did, kp, {
      connection,
      waitForConfirmation: true,
    });

    const keyName = await findKeyName(cryptid, kp.publicKey);

    const cryptidAddress = await cryptid.address();

    await testUtil.airdrop(connection, kp.publicKey, LAMPORTS_PER_SOL);
    await testUtil.airdrop(connection, cryptidAddress, LAMPORTS_PER_SOL);

    const vp = await presentation.create(vc, did);
    const key = new JsonWebKey();
    key.id = `${did}#${keyName}`;
    key.type = 'Ed25519VerificationKey2018';
    key.controller = did;

    // const signedVp = await presentation.sign(, vp);

    console.log(vc);
  });
});
