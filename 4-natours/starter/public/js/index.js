// @ts-nocheck
/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

const mapBox = document.getElementById('map');
const bookBtn = document.getElementById('book-tour');
const loginForm = document.querySelector('#login');
const settingsForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-settings');
const logOutBtn = document.querySelector('.nav__el--logout');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // @ts-ignore
    const email = document.getElementById('email').value;
    // @ts-ignore
    const password = document.getElementById('password').value;

    login({ email, password });
  });
}

if (settingsForm) {
  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('email', document.getElementById('email').value);
    formData.append('name', document.getElementById('name').value);
    formData.append('photo', document.getElementById('photo').files[0]);

    updateSettings(formData, 'data');
  });
}

if (passwordForm) {
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.getElementById('btn--save-password').textContent = 'Updating...';
    // @ts-ignore
    const curPassword = document.getElementById('password-current').value;
    const newPasswordConfirm =
      // @ts-ignore
      document.getElementById('password-confirm').value;
    // @ts-ignore
    const newPassword = document.getElementById('password').value;

    await updateSettings(
      {
        newPassword,
        newPasswordConfirm,
        curPassword,
      },
      'password'
    );

    document.getElementById('btn--save-password').textContent = 'Save password';
    // @ts-ignore
    document.getElementById('password-current').value = '';
    // @ts-ignore
    document.getElementById('password-confirm').value = '';
    // @ts-ignore
    document.getElementById('password').value = '';
  });
}

// @ts-ignore
if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (bookBtn)
  bookBtn.addEventListener('click', async (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    await bookTour(tourId);
    e.target.textContent = 'Book tour now!';
  });
