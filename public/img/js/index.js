/*eslint-disable */

// import '@babel/polyfill';

import { displayMap } from '../js/mapbox.js';
import { login, logout } from '../js/login.js';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');

if (mapBox) {
  const locationsData = JSON.parse(mapBox.dataset.locations);

  displayMap(locationsData);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);
