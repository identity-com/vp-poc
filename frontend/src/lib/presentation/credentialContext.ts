export default {
  '@context': {
    '@version': 1.1,
    '@protected': true,
    id: '@id',
    type: '@type',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    IdentityCredential: {
      '@id': 'https://www.identity.com/credentials/v1#identityCredential',
      '@context': {
        '@version': 1.1,
        '@protected': true,
        id: '@id',
        type: '@type',
        cvc: 'https://www.identity.com/credentials/v1#',
        meta: {
          '@id': 'cvc:meta',
          '@type': '@json',
        },
        identifier: {
          '@id': 'cvc:identifier',
          '@type': 'xsd:string',
        },
        version: {
          '@id': 'cvc:version',
          '@type': 'xsd:decimal',
        },
        granted: {
          '@id': 'cvc:granted',
          '@type': 'xsd:string',
        },
        transient: {
          '@id': 'cvc:transient',
          '@type': 'xsd:boolean',
        },
        claim: {
          '@id': 'cvc:claim',
          '@type': '@json',
        },
        contact: {
          '@id': 'cvc:claim',
          '@type': '@json',
        },
      },
    },
    CvcMerkleProof2018: {
      '@id': 'https://www.identity.com/proofs/v1#CvcMerkleProof2018',
      '@context': {
        '@version': 1.1,
        '@protected': true,
        id: '@id',
        type: '@type',
        cvc: 'https://www.identity.com/credentials/v1#',
        merkleRoot: {
          '@id': 'cvc:merkleRoot',
          '@type': 'xsd:string',
        },
        merkleRootSignature: {
          '@id': 'cvc:merkleRootSignature',
          '@type': '@json',
        },
        anchor: {
          '@id': 'cvc:anchor',
          '@type': '@json',
        },
        leaves: {
          '@id': 'cvc:leaves',
          '@type': '@json',
        },
      },
    },
  },
};
