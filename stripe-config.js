/*
const stripe = Stripe(
  "pk_live_51LX5GaK4Ah2UpgCD3vp0J0PFdUcRxTtW0CxEArCXVyxkojUk1clEHLoGbpwvE8n7kDgqqAEeCBwaHuBwIWH7QjOz00WSUUzbbj"
);

let elements;

window.initializeStripe = async () => {
  await window.makeAPIRequestWithToken("stripe/create-customer", {
    method: "POST",
  });
  const { clientSecret, subscriptionId } = await window.makeAPIRequestWithToken(
    "stripe/create-subscription",
    { method: "POST" }
  );
  const appearance = {
    theme: "stripe",
  };
  console.log({ clientSecret, subscriptionId });
  elements = stripe.elements({ appearance, clientSecret });

  const paymentElement = elements.create("payment");
  paymentElement.mount("#payment-element");
};

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: "https://metabeam.app/interface?payment=1",
    },
  });

  // This point will only be reached if there is an immediate error when
  // confirming the payment. Otherwise, your customer will be redirected to
  // your `return_url`.
  if (error.type === "card_error" || error.type === "validation_error") {
    showMessage(error.message);
  } else {
    showMessage("An unexpected error occurred.");
  }

  setLoading(false);
}

// Fetches the payment intent status after payment submission
async function checkStatus() {
  const clientSecret = new URLSearchParams(window.location.search).get(
    "payment_intent_client_secret"
  );

  if (!clientSecret) {
    return;
  }

  const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

  switch (paymentIntent.status) {
    case "succeeded":
      showMessage("Payment succeeded!");
      document.querySelector(".stripe-payment").style.display = "none";
      break;
    case "processing":
      showMessage("Your payment is processing.");
      break;
    case "requires_payment_method":
      showMessage("Your payment was not successful, please try again.");
      break;
    default:
      showMessage("Something went wrong.");
      break;
  }
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageText.textContent = "";
  }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}

window.initializeStripe();
checkStatus();

setTimeout(() => {
  document
    .querySelector("#payment-form")
    .addEventListener("submit", handleSubmit);
}, 1000);

*/