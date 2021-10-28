// import {
//   Connection, Keypair, LAMPORTS_PER_SOL, PublicKey,
// } from '@solana/web3.js';
//
// import { util, build } from '@identity.com/cryptid';
//
// const AIRDROP_LAMPORTS = 20_000_000;
// const airdrop = async (
//   connection: Connection,
//   publicKey: PublicKey,
//   lamports = AIRDROP_LAMPORTS,
// ): Promise<void> => {
//   let retries = 30;
//   for (; ;) {
//     console.log(`Airdropping ${lamports} Lamports to ${publicKey}`);
//     // eslint-disable-next-line no-await-in-loop
//     const airdropSignature = await connection.requestAirdrop(
//       publicKey,
//       lamports,
//     );
//     // eslint-disable-next-line no-await-in-loop
//     await connection.confirmTransaction(airdropSignature);
//     // eslint-disable-next-line no-await-in-loop
//     const balance = await connection.getBalance(publicKey);
//     console.log(`Balance: ${balance}`);
//     if (lamports <= balance) return;
//     // eslint-disable-next-line no-plusplus
//     if (--retries <= 0) break;
//   }
//   throw new Error(`Airdrop of ${lamports} failed`);
// };
//
// describe.only('thing', () => {
//   it.only('stuff', async () => {
//     const connection = new Connection('http://localhost:8899/', 'confirmed');
//
//     const kp = Keypair.generate();
//
//     const did = util.publicKeyToDid(kp.publicKey, 'localnet');
//
//     const cryptid = build(did, kp, {
//       connection,
//       waitForConfirmation: true,
//     });
//
//     const cryptidAddress = await cryptid.address();
//
//     await airdrop(connection, kp.publicKey, LAMPORTS_PER_SOL);
//     await airdrop(connection, cryptidAddress, LAMPORTS_PER_SOL);
//   });
// });
