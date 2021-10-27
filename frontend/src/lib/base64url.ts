export const base64 = {
  encode: (unencoded: any) => Buffer.from(unencoded || '').toString('base64'),
  decode: (encoded: any) => Buffer.from(encoded || '', 'base64').toString('utf8'),
};

export const base64url = {
  encode: (unencoded: any) => {
    const encoded = base64.encode(unencoded);
    return encoded
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  },
  decode: (encoded: any) => {
    // eslint-disable-next-line no-param-reassign
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // eslint-disable-next-line no-param-reassign
    while (encoded.length % 4) encoded += '=';
    return base64.decode(encoded);
  },
};
