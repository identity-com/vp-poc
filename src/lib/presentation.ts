import { verifiable } from '@transmute/vc.js';
import { v4 as uuidv4 } from 'uuid';
import { JsonWebSignature, JsonWebKey } from '@transmute/json-web-signature';

import defaultDocumentLoader from './presentation/documentLoader';
import convertCredential from './presentation/credential';

export const create = (credentials: any[], controller: string) => ({
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/suites/jws-2020/v1',
  ],
  type: ['VerifiablePresentation'],
  holder: {
    id: controller,
  },
  verifiableCredential: convertCredential(credentials, controller),
});

export const sign = async (vp: any, key: JsonWebKey, documentLoader = defaultDocumentLoader) => {
  const result = await verifiable.presentation.create({
    presentation: {
      ...vp,
      holder: { id: key.id },
    },
    format: ['vp'],
    documentLoader,
    challenge: uuidv4(),
    suite: new JsonWebSignature({
      key,
    }),
  });

  return result.items[0];
};

export const verify = async (vp: any, documentLoader = defaultDocumentLoader) => verifiable
  .presentation.verify({
    presentation: vp,
    format: ['vp'],
    documentLoader,
    challenge: vp.proof.challenge,
    suite: new JsonWebSignature({}),
  });
