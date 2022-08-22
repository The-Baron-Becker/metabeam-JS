window.devices = [];
window.setCookie = (cname, cvalue, exdays = 365) => {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};
window.getCookie = (cname) => {
  let name = cname + "=";
  let ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};
window.baseUrl = "https://nftviewr.completewebtech.com";
window.makeAPIRequestWithToken = async (endpoint, options = {}) => {
  const token = window.getCookie("token");
  if (token === "") {
    document.querySelector("#sign-in-modal").style.display = "block";
    return { status: "Not logged in" };
  }
  try {
    const res = await fetch(`${baseUrl}/${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        "x-access-tokens": token,
      },
      ...options,
    });
    const ret = await res.json();
    if (ret?.message === "token is invalid") {
      document.querySelector("#sign-in-modal").style.display = "block";
      return { status: "Failed to verify status. Is your token valid?" };
    }
    return ret;
  } catch (e) {
    console.log(e.message);
    return { status: e.message };
  }
};
window.makeAPIRequest = async (endpoint, options = {}) => {
  const res = await fetch(`${baseUrl}/${endpoint}`, options);
  return await res.json();
};
window.loadUserDevicesList = async () => {
  const { devices } = await makeAPIRequestWithToken(`devices`);
  window.devices = devices;
};
window.checkIfMembershipNeedsPayment = async () => {
  const res = await makeAPIRequestWithToken("membership/status");
  if (res.status === "overdue") {
    $(".stripe-payment").css("display", "flex");
  }
  loadUserDevicesList();
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const payment = urlParams.get("payment");
  if (payment === "1") {
    $(".stripe-payment").hide();
    $(".successful-payment-modal").css("display", "flex");
  }
};
window.beamNFT = async (url, wallet_address, contract_address, token_id) => {
  const selDevice = devices[0];
  const devName = selDevice.name;
  const serial = selDevice.serial_number;
  const modal = document.querySelector(".beaming-modal");
  const modalMsg = document.querySelector(".beaming-modal .beaming-message");
  await makeAPIRequestWithToken("display", {
    method: "POST",
    body: JSON.stringify({
      serial,
      url,
      wallet_address,
      contract_address,
      token_id,
    }),
  });
  console.log({ modal, modalMsg });
  modal.style.display = "flex";
  modalMsg.innerHTML = `Beaming to ${devName}`;
  setTimeout(() => (modal.style.display = "none"), 3000);
};

