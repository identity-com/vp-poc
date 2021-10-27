import { JsonWebKey } from '@transmute/json-web-signature';
import { presentation } from '@/lib/index';
import credentials from './fixtures/credentials.json';
import { createJwkFromBs58 } from '@/lib/keyUtil';
import defaultDocumentLoader from '@/lib/presentation/documentLoader';
import didcontroller from './fixtures/didcontroller.json';
import {WalletAdapter} from '@solana/wallet-adapter-base';

const did = 'did:sol:devnet:3emPMNueBjcnLxpxJLrakNjBHyXZdZ1djdgqUvYNwpXF';
const keyBs58 = '22jH4D3nP2aELBvEMFHYd16MQNACy3zSKJTNj3aM2ic8nbkT9KEYEFMcg5XXr39KNe8GMFYefVAyfvEGLniZ884u';

const createPresentation = () => presentation.create(credentials, did);
let jwk: JsonWebKey;

// document loader to prevent reliance on solana node
const documentLoader = async (iri: string) => {
  if (iri.startsWith('did:sol')) {
    return {
      document: didcontroller,
    };
  }

  return defaultDocumentLoader(iri);
};

describe('Presentation Tests', () => {
  beforeAll(async () => {
    jwk = await createJwkFromBs58(keyBs58, did, 'default');
  });

  it('creates a verifiable presentation', () => {
    const vp = createPresentation();

    expect(vp)
      .toEqual(
        expect.objectContaining({
          type: ['VerifiablePresentation'],
          holder: { id: did },
          verifiableCredential: expect.arrayContaining([
            expect.objectContaining({
              type: ['VerifiableCredential', 'IdentityCredential'],
              credentialSubject: {
                id: did,
              },
            }),
          ]),
        }),
      );
  });

  it('signs a verifiable presentation', async () => {
    const vp = createPresentation();

    const signedVp = await presentation.sign(undefined as unknown as WalletAdapter, vp, jwk);

    expect(signedVp)
      .toEqual(
        expect.objectContaining({
          type: ['VerifiablePresentation'],
          holder: { id: `${did}#default` },
          verifiableCredential: expect.arrayContaining([
            expect.objectContaining({
              type: ['VerifiableCredential', 'IdentityCredential'],
              credentialSubject: {
                id: did,
              },
            }),
          ]),
          proof: expect.objectContaining({
            type: 'JsonWebSignature2020',
            verificationMethod: `${did}#default`,
            proofPurpose: 'authentication',
            challenge: expect.any(String),
            jws: expect.any(String),
          }),
        }),
      );
  });

  it('verifies a signed verifiable presentation', async () => {
    const vp = createPresentation();

    const signedVp = await presentation.sign(undefined as unknown as WalletAdapter, vp, jwk);

    const verified = await presentation.verify(signedVp);

    expect(verified)
      .toEqual(true);
  });

  it('fails to verify a tampered signed verifiable presentation', async () => {
    const vp = createPresentation();

    const signedVp = await presentation.sign(undefined as unknown as WalletAdapter, vp, jwk);

    signedVp.proof.jws = 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..WKFBoCg4B-eAFROQCNtreY6WNz2WDjGjRl2M9nmSLwmIVnHyamYQ7ulh3FB6_l51uhC_RP19aGEk4LrPqGB0Cw';

    const verified = await presentation.verify(signedVp, documentLoader);

    expect(verified).toEqual(false);
  });
});
