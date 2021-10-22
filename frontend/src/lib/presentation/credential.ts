const convert = (credentials: any[], subject: string) => credentials.map((credential) => {
  // eslint-disable-next-line no-param-reassign
  credential['@context'] = [
    'https://www.w3.org/2018/credentials/v1',
    'https://www.identity.com/credentials/v1',
  ];

  // eslint-disable-next-line no-param-reassign
  credential.credentialSubject = {
    id: subject,
  };

  // eslint-disable-next-line no-param-reassign
  credential.type = [
    'VerifiableCredential',
    'IdentityCredential',
  ];

  // eslint-disable-next-line no-param-reassign
  credential.issuanceDate = credential.issuanceDate.replace(/\.\d+Z/, 'Z');

  // eslint-disable-next-line no-restricted-syntax
  for (const prop in credential) {
    if (!credential[prop]) {
      // eslint-disable-next-line no-param-reassign
      delete credential[prop];
    }
  }

  return credential;
});

export default convert;
