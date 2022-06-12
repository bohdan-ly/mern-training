/* eslint-disable */
// @ts-nocheck
import axios from 'axios';
const stripe = Stripe(
  'pk_test_51L9nQvJLRd1BUR5iEMhCK3eOfJY4DDK8HlgmNVPc1KD5JTmP5x813UF0KA1MAabKuUEIJiLLnCwLTqduQicEzNk900UrqNdxWD'
);
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API

    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    // 2) Create checkout form + change credit card

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (e) {
    console.log(e);
    showAlert('error', e.response.data?.message || e.message);
  }
};
