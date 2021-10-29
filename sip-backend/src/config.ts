import dotenv from 'dotenv';

dotenv.config();

export default {
  sip: {
    appId: process.env.SIP_APP_ID,
    audience: process.env.SIP_AUDIENCE,
    privateKey: process.env.SIP_PRIVATE_KEY,
    endpoint: process.env.SIP_ENDPOINT,
  },
};
