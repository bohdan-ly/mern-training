/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async ({ email, password }) => {
  try {
    // @ts-ignore

    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      location.assign('/');
    }
  } catch (error) {
    showAlert('error', error.response.data?.message || error.message);
  }
};

export const logout = async ({ email, password }) => {
  try {
    // @ts-ignore
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    // @ts-ignore
    if (res.data.status === 'success') location.reload(true);
  } catch (error) {
    showAlert('error', 'Error logging out! Try again.');
  }
};
