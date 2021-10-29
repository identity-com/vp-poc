import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import credentialsApi from './api/credentials';

const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(cors());

// define a route handler for the default home page
// @ts-ignore
app.get('/', (req: any, res: any) => {
  res.send('Demo SIP Server');
});

app.use('/credentials', credentialsApi);

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
