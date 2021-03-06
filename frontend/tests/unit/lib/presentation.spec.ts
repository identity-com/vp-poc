import { JsonWebKey } from '@transmute/json-web-signature';
import { presentation } from '@/lib/index';
import credentials from './fixtures/credentials.json';
import { createJwkFromBs58 } from '@/lib/keyUtil';
import defaultDocumentLoader from '@/lib/presentation/documentLoader';
import didcontroller from './fixtures/didcontroller.json';
import didcontrollerAlt from './fixtures/didcontroller-alt.json';
import vpAlternative from './fixtures/vp-alternative.json';

const did = 'did:sol:devnet:3emPMNueBjcnLxpxJLrakNjBHyXZdZ1djdgqUvYNwpXF';
const keyBs58 = '22jH4D3nP2aELBvEMFHYd16MQNACy3zSKJTNj3aM2ic8nbkT9KEYEFMcg5XXr39KNe8GMFYefVAyfvEGLniZ884u';

const createPresentation = () => presentation.create(credentials, did);
let jwk: JsonWebKey;

// document loader to prevent reliance on solana node
const documentLoader = async (iri: string) => {
  if (iri.startsWith('did:sol:devnet:3emPMNueBjcnLxpxJLrakNjBHyXZdZ1djdgqUvYNwpXF')) {
    return {
      document: didcontroller,
    };
  }

  if (iri.startsWith('did:sol:devnet:E9yXcjNZiVRzcEhzNkUHAvrrbmkJnfXRd8Q7eHnirihb')) {
    return {
      document: didcontrollerAlt,
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
              credentialSubject: expect.objectContaining({
                id: did,
              }),
            }),
          ]),
        }),
      );
  });

  it('signs a verifiable presentation', async () => {
    const vp = createPresentation();

    const signedVp = await presentation.sign(jwk, vp);

    expect(signedVp)
      .toEqual(
        expect.objectContaining({
          type: ['VerifiablePresentation'],
          holder: { id: `${did}` },
          verifiableCredential: expect.arrayContaining([
            expect.objectContaining({
              type: ['VerifiableCredential', 'IdentityCredential'],
              credentialSubject: expect.objectContaining({
                id: did,
              }),
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

    const signedVp = await presentation.sign(jwk, vp);

    const verified = await presentation.verify(signedVp, documentLoader);

    expect(verified)
      .toEqual(true);
  });

  it('fails to verify a tampered signed verifiable presentation', async () => {
    const vp = createPresentation();
    const signedVp = await presentation.sign(jwk, vp);
    signedVp.verifiableCredential[0].credentialSubject.contact = {
      email: {
        domain: {
          name: 'acme',
          tld: 'com',
        },
        username: 'wile.coyote',
      },
    };

    const verified = await presentation.verify(signedVp, documentLoader);

    expect(verified)
      .toEqual(false);
  });

  it('verifies a presentation with an alternative key', async () => {
    const verified = await presentation.verify(vpAlternative, documentLoader);

    expect(verified).toEqual(true);
  });
});
