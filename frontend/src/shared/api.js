import axios from 'axios';

export async function fetchCoins() {
  return axios
    .get('/api/coins')
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
}
