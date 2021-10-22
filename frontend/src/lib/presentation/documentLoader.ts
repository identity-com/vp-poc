import cre from '@transmute/credentials-context';
import sec from '@transmute/security-context';
import did from '@transmute/did-context';

import { JsonWebKey } from '@transmute/json-web-signature';
import vc from '@digitalbazaar/vc';
import { resolve } from '@identity.com/sol-did-client';
import { Ed25519VerificationKey2018 } from '@transmute/ed25519-key-pair';
import credentialContext from './credentialContext';

const { defaultDocumentLoader } = vc;

const contexts: any = {
  [sec.constants.JSON_WEB_SIGNATURE_2020_V1_URL]: sec.contexts.get(
    sec.constants.JSON_WEB_SIGNATURE_2020_V1_URL,
  ),
  [sec.constants.ED25519_2020_V1_URL]: sec.contexts.get(
    sec.constants.ED25519_2020_V1_URL,
  ),
  [sec.constants.ED25519_2018_v1_URL]: sec.contexts.get(
    sec.constants.ED25519_2018_v1_URL,
  ),
  [cre.constants.CREDENTIALS_CONTEXT_V1_URL]: cre.contexts.get(
    cre.constants.CREDENTIALS_CONTEXT_V1_URL,
  ),
  [did.constants.DID_CONTEXT_V1_URL]: did.contexts.get(
    did.constants.DID_CONTEXT_V1_URL,
  ),
  [sec.constants.BLS12381_2020_V1_URL]: sec.contexts.get(
    sec.constants.BLS12381_2020_V1_URL,
  ),
};

const cvcContexts: any = {
  'https://www.identity.com/credentials/v1': credentialContext,
};

export default async (iri: string) => {
  if (iri.startsWith('did:')) {
    const doc = await resolve(iri.split('#')[0]);

    const foundKey = doc?.publicKey?.find((pk) => pk.id.startsWith(iri));

    const key = await JsonWebKey.from(foundKey as Ed25519VerificationKey2018);

    const vm = await key.export({ type: 'JsonWebKey2020' });

    const controller = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/jws-2020/v1',
      ],
      id: vm.controller,
      verificationMethod: [vm],
      assertionMethod: [vm.id],
      authentication: [vm.id],
      capabilityInvocation: [vm.id],
      capabilityDelegation: [vm.id],
      keyAgreement: [vm.id],
    };

    return {
      document: controller,
    };
  }

  if (cvcContexts[iri]) {
    return { document: cvcContexts[iri] };
  }

  if (contexts[iri]) {
    return { document: contexts[iri] };
  }

  const def = defaultDocumentLoader(iri);

  return def;
};
