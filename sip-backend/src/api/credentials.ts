import express from 'express';

import readCredentials from '../services/credentials';

const router = express.Router();

// @ts-ignore
router.post('/', async (req: any, res: any) => {
  const credentials = await readCredentials(req.body.jwtToken);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  return res.json({ credentials });
});

export default router;
