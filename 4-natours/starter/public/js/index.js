/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';

const mapBox = document.getElementById('map');
const form = document.querySelector('form');
const logOutBtn = document.querySelector('.nav__el--logout');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // @ts-ignore
    const email = document.getElementById('email').value;
    // @ts-ignore
    const password = document.getElementById('password').value;

    login({ email, password });
  });
}

// @ts-ignore
if (logOutBtn) logOutBtn.addEventListener('click', logout);
