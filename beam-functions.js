const $searchBtn = $("form#wf-form-search_form input[type='submit']");
const $yourNFTsGrid = $(".wallet-grid");
const $resultsGrid = $(".results-grid");
const $contractAddress = $("input[name='contract-address']");
const $tokenId = $("input[name='token-id']");
const $walletAddress = $("input[name='Wallet-Address']");
const $keyword = $("input[name='keyword']");
const fetchWallet = (walletAddress) =>
  makeAPIRequest(`wallet/${walletAddress}`);
const checkIfVideo = (nftSrc) => nftSrc.endsWith(".mp4");
function loadUserWallet() {
  const userWalletAddress = window.getCookie("user wallet address");
  if (userWalletAddress === "") {
    $(".main-network-title").html("Main Network (Wallet Not Connected)");
    $(".your-nfts-title").html("Your NFTs (Wallet Not Connected)");
    $(".empty-wallet").show();
    $(".wallet-grid").hide();
    return;
  }
  const walletAbrv =
    userWalletAddress.substr(0, 4) + "..." + userWalletAddress.substr(-4);
  $(".main-network-title").html(`Main Network (${walletAbrv})`);
  $(".your-nfts-title").html(`Your NFTs (${walletAbrv})`);
  fetchWallet(userWalletAddress).then(
    (nfts) => setWalletCollection(nfts.collection, userWalletAddress),
    (reason) => $(".wallet-grid").hide()
  );
}
function swapOutLightbox(nftSrc, name, data, isVideoFile) {
  const classes = `w-lightbox-image w-lightbox-img`;
  const dataAttr = getDataAttr(data);
  const purchaseUrl = data['nftid'] ? `https://nftviewr.completewebtech.com/etherscan/${data['nftid']}` : `https://etherscan.io/nft/${data['contractaddress']}/${data['tokenid']}`;
  const imageCode = isVideoFile
    ? `<video src="${nftSrc}" ${dataAttr} class="${classes}" muted playsinline loop preload="auto" autoplay webkit-playsinline x5-playsinline />`
    : `<img src="${nftSrc}" ${dataAttr} class="${classes}" />`;
  const options = devices.map((d, idx) => `<option value="${idx}">${d.name}</option>`);
  const deviceSelect =
    devices.length <= 1
      ? ``
      : `<select class="beam-select">${options}</select>`;
  const beamWrapper = `<div class="beam-wrapper">${deviceSelect}<div class='beam-btn'>Beam NFT</div></div>`;
  const caption = `${name}<a href="${purchaseUrl}" target="_blank"><img src="https://uploads-ssl.webflow.com/62dec8d82ed41d0b91ac5cf1/6308a790758189efc490aaca_etherscan-logo-circle.png" alt="etherscan link" class="etherscan-link" /></a>`;
  $(`.w-lightbox-figure`).hide();
  setTimeout(() => {
    const $img = $(`.w-lightbox-img`);
    const $figure = $(`.w-lightbox-figure`);
    const $caption = $(`.w-lightbox-caption`);
    $figure.show();
    $img.replaceWith(imageCode);
    $caption.html(caption);
    $caption.after(beamWrapper);
    $(`.beam-btn`).click(() =>
      beamNFT(
        nftSrc,
        data["walletaddress"] || "",
        data["contractaddress"] || "",
        data["tokenid"] || ""
      )
    );
  }, 500);
}
makeAPIRequest(`random?size=20`).then((nfts) => {
  const $galleryItems = $(`.new-gallery-grid img`);
  $galleryItems.css("margin-bottom", 0);
  $galleryItems.wrap(`<div class="imagegrid imagegrid-container"></div>`);
  nfts.forEach(async (nft, idx) => {
    let nftSrc = nft.artwork;
    const nftId = nft.nft_id || "";
    const name = nft.query;
    const $currGalleryItem = $galleryItems.eq(idx);
    const $lightboxLink = $currGalleryItem.parent();
    const isVideoFile = checkIfVideo(nftSrc);
    if (isVideoFile) {
      let webpSrc = nftSrc.replace("./static/", `${baseUrl}/static/min/`);
      webpSrc = webpSrc.substr(0, webpSrc.length - 4) + ".webp";
      nftSrc = nftSrc.replace("./static/", `${baseUrl}/static/`);
      $currGalleryItem.replaceWith(
        `<img src="${webpSrc}" data-nftid="${nftId}" data-src="${nftSrc}" data-name="${name}" class="imagegrid-replacement" />`
      );
    } else {
      nftSrc = nftSrc.replace("./static/", `${baseUrl}/static/`);
      $currGalleryItem.replaceWith(
        `<img src="${baseUrl}/thumbnail/${nft.nft_id}?w=300&h=300" data-nftid="${nftId}" data-src="${nftSrc}" data-name="${name}" class="imagegrid-replacement" />`
      );
    }
  });
});
const getDataAttr = (data) => {
  const dataList = [];
  for (const [key, value] of Object.entries(data)) {
    dataList.push(`data-${key}="${value}"`);
  }
  return dataList.join(" ");
};
const setGridContents = (nfts, $grid, data = {}) => {
  $grid.find("*").remove();
  $grid.css("display", "");
  if (nfts.length === 1) {
    $grid.css("display", "flex");
  }
  nfts.forEach((nft, idx) => {
    if (nft.contractAddress) {
      data['contractaddress'] = nft.contractAddress;
    }
    if (nft.tokenId) {
      data['tokenid'] = nft.tokenId;
    }
    let nftSrc =
      nft.links.find((link) => link.endsWith(".mp4")) ||
      nft.links.find(
        (link) => link.startsWith("http") && !link.endsWith("{id}")
      );
    if (!nftSrc) {
      return;
    }
    const dataAttr = getDataAttr(data);
    const artist = nft.artist;
    const name = `${nft.name} - ${artist}`;
    const isVideoFile = checkIfVideo(nftSrc);
    let newImage = `<div class="imagegrid imagegrid-container"><img src="${nftSrc}" data-src="${nftSrc}" data-name="${name}" ${dataAttr} class="imagegrid-replacement" /></div>`;
    if (isVideoFile) {
      newImage = `<div class="imagegrid imagegrid-container"><video src="${nftSrc}" data-src="${nftSrc}" data-name="${name}" ${dataAttr} class="imagegrid-replacement" muted playsinline loop preload="auto" autoplay webkit-playsinline x5-playsinline /></div>`;
    }
    const $imageContainer = $grid.append(newImage);
  });
  $grid.find("img.imagegrid-replacement").on("error", (e) => {
    $(e.target).parent().remove();
  });
};
const setWalletCollection = (nfts, walletAddress = "") => {
  if ( nfts.length > 0 ) {
    $(".empty-wallet").hide();
    $(".wallet-grid").show();
  } else {
    $(".empty-wallet").show();
    $(".wallet-grid").hide();
  }
  setGridContents(nfts, $yourNFTsGrid, { walletAddress });
};
const setSearchResults = (nfts, data = {}) => {
  setGridContents(nfts, $resultsGrid, data);
};
$(document).click(function (e) {
  const nftSrc = $(e.target).data("src");
  const name = $(e.target).data("name") || "";
  if (!nftSrc) {
    return;
  }
  swapOutLightbox(nftSrc, name, $(e.target).data(), checkIfVideo(nftSrc));
});
$searchBtn.click(async (e) => {
  e.preventDefault();
  const contractAddress = encodeURIComponent($contractAddress.val());
  const tokenId = encodeURIComponent($tokenId.val());
  const walletAddress = encodeURIComponent($walletAddress.val());
  const keyword = encodeURIComponent($keyword.val());
  if (contractAddress !== "" && tokenId !== "") {
    const nfts = await makeAPIRequest(`contract/${contractAddress}/${tokenId}`);
    setSearchResults(nfts.collection, { contractAddress, tokenId });
  } else if (walletAddress !== "") {
    fetchWallet(walletAddress).then((nfts) =>
      setSearchResults(nfts.collection, { walletAddress })
    );
  } else if (keyword !== "") {
    const nfts = await makeAPIRequest(`search?q=${keyword}`);
    setSearchResults(nfts.collection);
  } else {
    alert(
      "Please fill out either the contract address and token id or the wallet address."
    );
  }
});

/////////////////////////////////////////////////////////////////////
// User Registration/Login Code
/////////////////////////////////////////////////////////////////////
const $registerBtn = $("form#register-form input[type='submit']");
const $loginBtn = $("form#login-form input[type='submit']");
const $logoutBtn = $(".logout-button, .logout-link");

async function login(e, register = false) {
  e.preventDefault();
  const $form = register ? $("form#register-form") : $("form#login-form");
  const email = $form.find("input[type='email']").val();
  const password = $form.find("input[type='password']").val();
  const endpoint = register ? `register` : `login`;
  const res = await makeAPIRequest(endpoint, {
    method: "POST", // or 'PUT'
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  window.setCookie("token", res.token);
  $("#sign-in-modal").hide();
  checkIfMembershipNeedsPayment();
  window.initializeStripe();
}

$registerBtn.click((e) => login(e, true));
$loginBtn.click((e) => login(e));
$logoutBtn.click((e) => {
  setCookie("token", "");
  window.location = "/interface";
});

/////////////////////////////////////////////////////////////////////
// Wallet Connect Code
/////////////////////////////////////////////////////////////////////
const connectWalletBtn = document.querySelector(".wallet-connect");
const checkIfWalletIsInstalled = () => !(typeof window.ethereum == "undefined");

async function connectWalletWithMetaMask(e) {
  e.preventDefault();
  const walletIsInstalled = checkIfWalletIsInstalled();
  if (!walletIsInstalled) {
    alert(
      "MetaMask isnt installed, please install it. \
			You cannot connect your wallet to your account without first \
			installing the MetaMask extension."
    );
    return;
  }
  const token = getCookie("token");
  if (token === "") {
    alert("You are not logged in. Please login to connect your wallet.");
    return;
  }
  const accounts = await window.ethereum
    .request({ method: "eth_requestAccounts" })
    .catch((e) => {
      alert("Failed to fetch wallets. Did you grant us permission?");
      return;
    });
  if (!accounts) {
    alert("No wallets found!");
    return;
  }
  const walletAddress = accounts[0];
  setCookie("user wallet address", walletAddress);
  const res = await makeAPIRequestWithToken("wallets/connect", {
    method: "POST",
    body: JSON.stringify({
      wallet_address: walletAddress,
    }),
  });
  if (!res.wallets.includes(walletAddress)) {
    alert(
      `Failed to connect your wallet: ${walletAddress}. Did you register this wallet with another account?`
    );
    return;
  }
  alert(`Your wallet: ${walletAddress} has now been connected!`);
  loadUserWallet();
}

connectWalletBtn.addEventListener("click", connectWalletWithMetaMask);
loadUserWallet();
checkIfMembershipNeedsPayment();

// Register METABEAM
$(".register-metabeam-btn").click(async (e) => {
  e.preventDefault();
  const name = encodeURIComponent($(".metabeam-name").val());
  const user_code = encodeURIComponent($(".registration-code").val());
  const res = await window.makeAPIRequestWithToken(
    `pairing/consume?name=${name}&user_code=${user_code}`
  );
  $(".register-modal-div").hide();
  loadUserDevicesList();
});

const clearAllSearch = () => {
  $contractAddress.val("");
  $tokenId.val("");
  $walletAddress.val("");
  $keyword.val("");
};

$contractAddress.click(clearAllSearch);
$walletAddress.click(clearAllSearch);
$keyword.click(clearAllSearch);

