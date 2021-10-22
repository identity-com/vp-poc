export default {
  '@context': {
    '@version': 1.1,
    '@protected': true,
    id: '@id',
    type: '@type',
    IdentityCredential: {
      '@id': 'https://www.identity.com/credentials/v1#identityCredential',
      '@context': {
        '@version': 1.1,
        '@protected': true,
        id: '@id',
        type: '@type',
        cvc: 'https://www.identity.com/credentials/v1#',
        identifier: {
          '@id': 'cvc:identifier',
          '@type': '@id',
        },
        version: {
          '@id': 'cvc:version',
          '@type': '@id',
        },
        granted: {
          '@id': 'cvc:granted',
          '@type': '@id',
        },
        transient: {
          '@id': 'cvc:transient',
          '@type': '@id',
        },
        claim: {
          '@id': 'cvc:claim',
          '@type': '@json',
          '@container': '@graph',
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
          '@type': '@id',
        },
        merkleRootSignature: {
          '@id': 'cvc:merkleRootSignature',
          '@type': '@json',
          '@container': '@graph',
        },
        anchor: {
          '@id': 'cvc:anchor',
          '@type': '@json',
          '@container': '@graph',
        },
        leaves: {
          '@id': 'cvc:leaves',
          '@type': '@json',
          '@container': '@graph',
        },
      },
    },
  },
};
