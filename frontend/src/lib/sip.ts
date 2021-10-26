import axios, { AxiosResponse } from 'axios';

const exchangeCode = (endpoint: string, jwt: string) : void => {
  axios.post(endpoint,
    { jwtToken: jwt },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response: AxiosResponse<any>) => Promise.resolve(response.data.credentials));
};

export default {
  exchangeCode,
};
