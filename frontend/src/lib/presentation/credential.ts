/**
 * A Verifiable Claim Identifier
 */
export type ClaimIdentifier = string;

/**
 * A VerifiableCredential Identifier
 * This define the type of the verifiable credential or verifiable presentation
 */
export type CredentialIdentifier = string;

/**
 * Credential Proof Leave Node Representation
 */
export interface CredentialProofLeaveNode {
  right?: string;
  left?: string;
}

/**
 * Credential Proof Leave Representation
 */
export interface CredentialProofLeave {
  /**
   * see [[ClaimIdentifier]]
   */
  identifier: ClaimIdentifier;
  /**
   * The leave value
   */
  value: string;
  /**
   * The claim path
   */
  claimPath: string;
  /**
   * The target hash
   */
  targetHash: string;
  /**
   * node
   */
  node: CredentialProofLeaveNode[];
}

export interface CredentialSubject {
  id: string
}

/**
 * Credential Proof Representation
 */
export interface CredentialProof {
  /**
   * A list of [[CredentialProofLeave]]
   */
  leaves: CredentialProofLeave[];
  /**
   * The proof anchor information
   */
  anchor: any;
}

/**
 * Credential representation
 */
export interface Credential {
  /**
   * Credential context
   */
  '@context'?: string[],
  /**
   * Unique identifier
   */
  id: string;
  /**
   * see [[CredentialIdentifier]]
   */
  identifier: CredentialIdentifier;
  /**
   * The expiration credential date
   */
  expirationDate: string;
  /**
   * see [[CredentialProof]]
   */
  proof: CredentialProof;
  /**
   * Claim values (dynamic object)
   */
  claim: any;
  /**
   * Credential Subject
   */
  credentialSubject?: CredentialSubject;
  /**
   * The credential type
   */
  type: string[];
  /**
   * The credential issueanceData
   */
  issuanceDate: string;
}

export const convert = (
  credentials: any[],
  subject: string,
): any[] => credentials.map((credential) => {
  // eslint-disable-next-line no-param-reassign
  credential['@context'] = [
    'https://www.w3.org/2018/credentials/v1',
    'https://www.identity.com/credentials/v1',
  ];

  // eslint-disable-next-line no-param-reassign
  credential.credentialSubject = {
    id: subject,
    type: 'IdentityCredential',
  };
  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const key in credential.claim) {
    // eslint-disable-next-line no-param-reassign
    credential.credentialSubject[key] = credential.claim[key];
  }

  // eslint-disable-next-line no-param-reassign
  credential.type = [
    'VerifiableCredential',
    'IdentityCredential',
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const prop in credential) {
    if (credential[prop] === null) {
      // eslint-disable-next-line no-param-reassign
      delete credential[prop];
    }
  }

  // eslint-disable-next-line no-param-reassign
  delete credential.claim;

  return {
    '@context': credential['@context'],
    id: credential.id,
    identifier: credential.identifier,
    version: credential.version,
    type: credential.type,
    issuer: credential.issuer,
    issuanceDate: credential.issuanceDate,
    credentialSubject: credential.credentialSubject,
    transient: credential.transient,
    granted: credential.granted,
    proof: credential.proof,
  };
});

export const revert = (credentials: any[]) => credentials.map((credential: any) => {
  // eslint-disable-next-line no-param-reassign
  credential.type = ['Credential', credential.identifier];

  // eslint-disable-next-line no-param-reassign
  credential.claim = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const key in credential.credentialSubject) {
    if (!['id', 'type'].includes(key)) {
      // eslint-disable-next-line no-param-reassign
      credential.claim[key] = credential.credentialSubject[key];
    }
  }

  // eslint-disable-next-line no-param-reassign
  delete credential['@context'];
  // eslint-disable-next-line no-param-reassign
  delete credential.credentialSubject;
  // eslint-disable-next-line no-param-reassign
  delete credential.meta;

  if (!credential.expirationDate) {
    // eslint-disable-next-line no-param-reassign
    credential.expirationDate = null;
  }

  return credential;
});
