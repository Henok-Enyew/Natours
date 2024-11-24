import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51QNVlnHxFH44SbdjKmieFxTsWG03Wu0X0S38oqeDeDbW2AXHzMhiifM1tnT5Qo0NHCBylgDPJ0TzGFrQRypcfVQt00s7h1Ugqh',
);

export const bookTour = async (tourId) => {
  try {
    // 1 Get checkout session from API
    const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);
    console.log(session);
    //2 create checkout form and charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
