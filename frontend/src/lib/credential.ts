import { VC } from '@identity.com/credential-commons';
import { Credential, revert } from '@/lib/presentation/credential';

export default async (credentials: any[]) => {
  const revertedCredentials = revert(credentials);
  const promises = revertedCredentials.map(async (credential) => {
    const vc = await VC.fromJSON(credential);
    return VC.nonCryptographicallySecureVerify(vc);
  });

  const results = await Promise.all(promises);

  const invalid = results.find((result) => !result);

  return invalid === undefined;
};
