import axios from 'axios';

import ACTIONS from './index';

export const dispatchLogin = () => {
  return {
    type: ACTIONS.LOGIN
  };
};

export const fetchUser = async (token) => {
  const res = await axios.get('/user/info', {
    headers: { Authorization: token }
  });
  return res;
};

export const dispatchGetUser = (res) => {
  return {
    type: ACTIONS.GET_USER,
    payload: {
      user: res.data,
      isAdmin: res.data.role === 1
    }
  };
};
