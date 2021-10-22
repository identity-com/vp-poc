import rs from 'jsrsasign';
import axios from 'axios';
import timestamp from 'unix-timestamp';
import config from '../config';

const ALGO = 'ES256';
const CURVE = 'secp256r1';

const getScopeRequestId = (jwt: string) => {
  // @ts-ignore
  const parsed = rs.jws.JWS.parse(jwt);

  return parsed.payloadObj.data.codeToken;
};

const createToken = (scopeRequestId: string) => {
  const content = {
    iat: timestamp.now(),
    exp: timestamp.now(20),
    iss: config.sip.appId,
    aud: config.sip.audience,
    sub: `${config.sip.endpoint}prod/v3/scopeRequest/${scopeRequestId}`,
    data: {},
  };

  const header = {
    alg: ALGO,
    typ: 'JWT',
  };
  const sHeader = JSON.stringify(header);
  const sContent = JSON.stringify(content);

  // create ECDSA key object with Hex input
  const prvKey = new rs.KJUR.crypto.ECDSA({ curve: CURVE });

  prvKey.setPrivateKeyHex(config.sip.privateKey as string);
  // @ts-ignore
  prvKey.isPrivate = true;
  // @ts-ignore
  prvKey.isPublic = false;

  // @ts-ignore
  return `Bearer ${rs.jws.JWS.sign(null, sHeader, sContent, prvKey)}`;
};

export default async (token: string) => {
  const scopeRequestId = getScopeRequestId(token);

  const endPoint = `${config.sip.endpoint}prod/v3/scopeRequest/${scopeRequestId}`;

  const authToken = createToken(scopeRequestId);

  const response: any = await axios.get(endPoint, {
    headers: {
      Authorization: authToken,
    },
  });

  return response.data.components.identity.response.verifiableData
    .map((data: any) => data.credential);
};
