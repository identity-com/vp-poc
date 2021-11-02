import { JsonWebKey } from '@transmute/json-web-signature';
import { VC, schemaLoader } from '@identity.com/credential-commons';
import CVCSchemaLoader from '@/schemas';
import { presentation } from '@/lib';
import credentials from './fixtures/credentials.json';
import { createJwkFromBs58 } from '@/lib/keyUtil';
import { revert as revertCredential } from '@/lib/presentation/credential';

const did = 'did:sol:devnet:3emPMNueBjcnLxpxJLrakNjBHyXZdZ1djdgqUvYNwpXF';
const keyBs58 = '22jH4D3nP2aELBvEMFHYd16MQNACy3zSKJTNj3aM2ic8nbkT9KEYEFMcg5XXr39KNe8GMFYefVAyfvEGLniZ884u';

let jwk: JsonWebKey;

const createPresentation = () => presentation.create(credentials, did);

const createdSignedPresentation = async () => {
  const vp = createPresentation();

  return presentation.sign(jwk, vp);
};

describe('credential verifiation checks', () => {
  beforeAll(async () => {
    jwk = await createJwkFromBs58(keyBs58, did, 'default');

    schemaLoader.addLoader(new CVCSchemaLoader());
  });

  it('validates the proof on a credential', async () => {
    const signedVp = await createdSignedPresentation();
    const revertedCredentials = revertCredential(signedVp.verifiableCredential);

    const promises = revertedCredentials.map(async (credential) => {
      const vc = await VC.fromJSON(credential);
      return VC.nonCryptographicallySecureVerify(vc);
    });

    const result = await Promise.all(promises);

    expect(result)
      .toEqual([true, true]);
  });

  it('invalidates the proof on a tampered credential', async () => {
    const signedVp = await createdSignedPresentation();
    const revertedCredentials = revertCredential(signedVp.verifiableCredential);
    revertedCredentials[0].claim = {
      contact: {
        email: {
          domain: {
            name: 'acme',
            tld: 'com',
          },
          username: 'wile.coyote',
        },
      },
    };

    const promises = revertedCredentials.map(async (credential) => {
      const vc = await VC.fromJSON(credential);
      return VC.nonCryptographicallySecureVerify(vc);
    });

    const result = await Promise.all(promises);

    expect(result)
      .toEqual([false, true]);
  });
});
