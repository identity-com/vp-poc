import { Connection, PublicKey } from '@solana/web3.js';

export const AIRDROP_LAMPORTS = 20_000_000;
export const airdrop = async (
  connection: Connection,
  publicKey: PublicKey,
  lamports = AIRDROP_LAMPORTS,
): Promise<void> => {
  let retries = 30;
  for (; ;) {
    console.log(`Airdropping ${lamports} Lamports to ${publicKey}`);
    // eslint-disable-next-line no-await-in-loop
    const airdropSignature = await connection.requestAirdrop(
      publicKey,
      lamports,
    );
    // eslint-disable-next-line no-await-in-loop
    await connection.confirmTransaction(airdropSignature);
    // eslint-disable-next-line no-await-in-loop
    const balance = await connection.getBalance(publicKey);
    console.log(`Balance: ${balance}`);
    if (lamports <= balance) return;
    // eslint-disable-next-line no-plusplus
    if (--retries <= 0) break;
  }
  throw new Error(`Airdrop of ${lamports} failed`);
};
