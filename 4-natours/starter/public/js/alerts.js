/* eslint-disable */

const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, message) => {
  hideAlert();
  const markup = document.createElement('div');
  markup.innerHTML = message;
  markup.className = `alert alert--${type}`;
  const body = document.querySelector('body');
  // @ts-ignore
  if (body) body.insertAdjacentElement('afterbegin', markup);

  window.setTimeout(hideAlert, 5000);
};
