import axios from 'axios';

import ACTIONS from './index';

export const fetchAllUsers = async (token) => {
  const res = await axios.get('/user/all-info', {
    headers: { Authorization: token }
  });
  return res;
};

export const dispatchGetAllUsers = (res) => {
  return {
    type: ACTIONS.GET_ALL_USERS,
    payload: res.data
  };
};
