import { JsonWebKey } from '@transmute/json-web-signature';
import { presentation } from '@/lib/index';
import credentials from './fixtures/credentials.json';
import { createJwkFromBs58 } from '@/lib/keyUtil';

const did = 'did:sol:devnet:3emPMNueBjcnLxpxJLrakNjBHyXZdZ1djdgqUvYNwpXF';
const keyBs58 = '22jH4D3nP2aELBvEMFHYd16MQNACy3zSKJTNj3aM2ic8nbkT9KEYEFMcg5XXr39KNe8GMFYefVAyfvEGLniZ884u';

const createPresentation = () => presentation.create(credentials, did);
let jwk: JsonWebKey;

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

    const signedVp = await presentation.sign(vp, jwk);
    console.log(signedVp);
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
});
