import {
  getConnection,
} from '@identity.com/solana-gatekeeper-lib/dist/util';
import {
  GatekeeperService,
} from '@identity.com/solana-gatekeeper-lib/dist/service';
import { clusterApiUrl, Keypair, PublicKey } from '@solana/web3.js';
import { GatewayToken } from '@identity.com/solana-gateway-ts';

export const prettyPrint = (token: GatewayToken) => JSON.stringify(
  {
    issuingGatekeeper: token.issuingGatekeeper.toBase58(),
    gatekeeperNetwork: token.gatekeeperNetwork.toBase58(),
    owner: token.owner.toBase58(),
    state: token.state,
    publicKey: token.publicKey.toBase58(),
    programId: token.programId.toBase58(),
    expiryTime: token.expiryTime,
  },
  null,
  1,
);

export const issueToken = async (publicKey: string): Promise<GatewayToken> => {
  const connection = getConnection(clusterApiUrl('devnet'));

  const gatekeeper = Keypair.fromSecretKey(new Uint8Array([20, 176, 58, 90, 100, 4, 17,
    124, 238, 124, 251, 23, 155, 75, 184, 228, 115, 62, 6, 215, 151, 140, 141, 65, 209, 208, 66,
    165, 55, 108, 24, 2, 13, 61, 145, 4, 93, 103, 145, 136, 236, 41, 200, 31, 198, 27, 116, 46, 69,
    3, 78, 29, 113, 144, 240, 147, 53, 135, 113, 165, 27, 225, 221, 163]));

  const gatekeeperNetwork = Keypair.fromSecretKey(new Uint8Array([58, 211, 144, 58, 78,
    187, 81, 70, 198, 114, 124, 247, 46, 177, 9, 222, 10, 128, 210, 190, 165, 217, 111, 30, 36,
    129, 78, 207, 40, 128, 197, 188, 13, 61, 157, 22, 194, 40, 43, 49, 99, 194, 219, 188, 124, 255,
    19, 26, 214, 194, 38, 153, 38, 196, 18, 104, 220, 215, 105, 41, 71, 156, 6, 66]));

  const service = new GatekeeperService(
    connection,
    gatekeeper,
    gatekeeperNetwork.publicKey,
    gatekeeper,
  );

  let token = await service.findGatewayTokenForOwner(new PublicKey(publicKey));
  if (token === null) {
    token = await service.issue(new PublicKey(publicKey));
  }

  return token;
};
