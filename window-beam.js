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
  const devicesList = devices.map(d => `<li><img src="https://uploads-ssl.webflow.com/62dec8d82ed41d0b91ac5cf1/6310cf8381e79c171b4d1345_trash.svg" class="delete-tv-icon" alt="Delete this TV" data-name="${d.name}" data-serial="${d.serial_number}" /> ${d.name}</li>`).join();
  $(".registered-devices-list").html(`<ul>${devicesList}</ul>`);
};
window.checkIfMembershipNeedsPayment = async () => {
  const res = await makeAPIRequestWithToken("membership/status");
  const { email, status } = res;
  if (status === "overdue") {
    $(".stripe-payment").css("display", "flex");
  }
  $(".email-text").html(`Username: ${email}`);
  $(".email-display").show();
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
  const devIdx = parseInt(document.querySelector(".beam-select")?.value || 0);
  const selDevice = devices[devIdx];
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

