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
function openInNewTab(url) {
  console.log(`Opening ${url} in new tab.`);
  window.open(url, '_blank').focus();
}
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
async function loadLikedNFTs() {
  const res = await makeAPIRequestWithToken(`liked/0`, {method: "GET"});
  $(".likes-gallery-grid .gallery-nft-container").each(async function( idx ) {
    const nft = res.liked_nfts[idx];
    const nftSrc = nft.links[0];
    const nftId = nft.nft_id || "";
    const name = nft.name;
    const artist = nft.artist;
    const $currGalleryItem = $(this).find(".imagegrid");
    const $currGalleryTitle = $(this).find(".nft-title");
    const $currGalleryArtist = $(this).find(".nft-artist");
    const $currGalleryLikeButton = $(this).find(".like-nft-heart");
    const $currGalleryEtherscanLink = $(this).find(".etherscan-link");
    const etherscanLink = `${baseUrl}/etherscan/${nftId}`;
    const isVideoFile = checkIfVideo(nftSrc);
    const likedRes = await makeAPIRequestWithToken(`liked/${nftId}`, {method: "GET"});
    if ( likedRes.message === "NFT is liked" ) {
      $currGalleryLikeButton.addClass("liked");
    }
    $currGalleryLikeButton.click(function () {
      toggleNFTLike($(this), nftId);
    });
    if (isVideoFile) {
      let webpSrc = nftSrc.replace("/static/", `/static/min/`);
      webpSrc = webpSrc.substr(0, webpSrc.length - 4) + ".webp";
      $currGalleryItem.replaceWith(
        `<img src="${webpSrc}" data-nftid="${nftId}" data-src="${nftSrc}" data-name="${name}" class="imagegrid-replacement" />`
      );
    } else {
      $currGalleryItem.replaceWith(
        `<img src="${baseUrl}/thumbnail/${nftId}?w=300&h=300&square=1" data-nftid="${nftId}" data-src="${nftSrc}" data-name="${name}" class="imagegrid-replacement" />`
      );
    }
    $currGalleryTitle.html(name);
    $currGalleryArtist.html(artist);
    $currGalleryLikeButton.addClass("liked");
    $currGalleryEtherscanLink.click(function() { openInNewTab( etherscanLink ) });
  });
}
async function toggleNFTLike($currGalleryLikeButton, nftId) {
  if ( $currGalleryLikeButton.hasClass("liked") ) {
    const res = await makeAPIRequestWithToken(`unlike/${nftId}`, {method: "GET"});
    $currGalleryLikeButton.removeClass("liked");
  } else {
    const res = await makeAPIRequestWithToken(`like/${nftId}`, {method: "GET"});
    $currGalleryLikeButton.addClass("liked");
  }
}
function swapOutLightbox(nftSrc, name, data, isVideoFile) {
  const classes = `w-lightbox-image w-lightbox-img`;
  const dataAttr = getDataAttr(data);
  const purchaseUrl = data["nftid"]
    ? `https://nftviewr.completewebtech.com/etherscan/${data["nftid"]}`
    : `https://etherscan.io/nft/${data["contractaddress"]}/${data["tokenid"]}`;
  const imageCode = isVideoFile
    ? `<video src="${nftSrc}" ${dataAttr} class="${classes}" muted playsinline loop preload="auto" autoplay webkit-playsinline x5-playsinline />`
    : `<img src="${nftSrc}" ${dataAttr} class="${classes}" />`;
  const options = devices.map(
    (d, idx) => `<option value="${idx}">${d.name}</option>`
  );
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
  const walletAddress = window.getCookie("user wallet address");
  const $galleryItems = $(`.new-gallery-grid img`);
  const $galleryItemsTitles = $(`.new-gallery-grid .nft-title`);
  const $galleryItemsArtists = $(`.new-gallery-grid .nft-artist`);
  const $galleryItemsEtherscanLinks = $(`.new-gallery-grid .etherscan-link`);
  const $galleryItemsLikeButtons = $(`.new-gallery-grid .like-nft-heart`);
  $galleryItems.css("margin-bottom", 0);
  $galleryItems.wrap(`<div class="imagegrid imagegrid-container"></div>`);
  nfts.forEach(async (nft, idx) => {
    let nftSrc = nft.artwork;
    const nftId = nft.nft_id || "";
    const name = nft.query;
    const artist = nft.username;
    const $currGalleryItem = $galleryItems.eq(idx);
    const $currGalleryTitle = $galleryItemsTitles.eq(idx);
    const $currGalleryArtist = $galleryItemsArtists.eq(idx);
    const $currGalleryEtherscanLink = $galleryItemsEtherscanLinks.eq(idx);
    const $currGalleryLikeButton = $galleryItemsLikeButtons.eq(idx);
    const etherscanLink = `${baseUrl}/etherscan/${nftId}`;
    const $lightboxLink = $currGalleryItem.parent();
    const isVideoFile = checkIfVideo(nftSrc);
    const likedRes = await makeAPIRequestWithToken(`liked/${nftId}`, {method: "GET"});
    if ( likedRes.message === "NFT is liked" ) {
      $currGalleryLikeButton.addClass("liked");
    }
    $currGalleryLikeButton.click(function () {
      toggleNFTLike($(this), nftId);
    });
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
        `<img src="${baseUrl}/thumbnail/${nft.nft_id}?w=300&h=300&square=1" data-nftid="${nftId}" data-src="${nftSrc}" data-name="${name}" class="imagegrid-replacement" />`
      );
    }
    $currGalleryTitle.html(name);
    $currGalleryArtist.html(artist);
    $currGalleryEtherscanLink.click(function() { openInNewTab( etherscanLink ) });
  });
});
makeAPIRequest(`search?q=meta-featured`).then((nfts) => {
  const $galleryItems = $(`.featured-gallery-grid img`);
  const $galleryItemsTitles = $(`.featured-gallery-grid .nft-title`);
  const $galleryItemsArtists = $(`.featured-gallery-grid .nft-artist`);
  const $galleryItemsEtherscanLinks = $(`.featured-gallery-grid .etherscan-link`);
  const $galleryItemsLikeButtons = $(`.featured-gallery-grid .like-nft-heart`);
  $galleryItems.css("margin-bottom", 0);
  $galleryItems.wrap(`<div class="imagegrid imagegrid-container"></div>`);
  nfts.collection.forEach(async (nft, idx) => {
    let nftSrc = nft.links[0];
    const nftId = nft.nft_id || "";
    const name = nft.name;
    const artist = nft.artist;
    const $currGalleryItem = $galleryItems.eq(idx);
    const $currGalleryTitle = $galleryItemsTitles.eq(idx);
    const $currGalleryArtist = $galleryItemsArtists.eq(idx);
    const $currGalleryEtherscanLink = $galleryItemsEtherscanLinks.eq(idx);
    const $currGalleryLikeButton = $galleryItemsLikeButtons.eq(idx);
    const etherscanLink = `${baseUrl}/etherscan/${nftId}`;
    const $lightboxLink = $currGalleryItem.parent();
    const isVideoFile = checkIfVideo(nftSrc);
    const likedRes = await makeAPIRequestWithToken(`liked/${nftId}`, {method: "GET"});
    if ( likedRes.message === "NFT is liked" ) {
      $currGalleryLikeButton.addClass("liked");
    }
    $currGalleryLikeButton.click(function () {
      toggleNFTLike($(this), nftId);
    });
    if (isVideoFile) {
      let webpSrc = nftSrc.replace("/static/", `/static/min/`);
      webpSrc = webpSrc.substr(0, webpSrc.length - 4) + ".webp";
      $currGalleryItem.replaceWith(
        `<img src="${webpSrc}" data-nftid="${nftId}" data-src="${nftSrc}" data-name="${name}" class="imagegrid-replacement" />`
      );
    } else {
      $currGalleryItem.replaceWith(
        `<img src="${baseUrl}/thumbnail/${nft.nft_id}?w=300&h=300&square=1" data-nftid="${nftId}" data-src="${nftSrc}" data-name="${name}" class="imagegrid-replacement" />`
      );
    }
    $currGalleryTitle.html(name);
    $currGalleryArtist.html(artist);
    $currGalleryEtherscanLink.click(function() { openInNewTab( etherscanLink ) });
  });
});
const getDataAttr = (data) => {
  const dataList = [];
  for (const [key, value] of Object.entries(data)) {
    dataList.push(`data-${key}="${value}"`);
  }
  return dataList.join(" ");
};
const setGridContents = async (nfts, $grid, data = {}) => {
  const $containers = $grid.find(".gallery-nft-container");
  $containers.removeClass("active");
  nfts.forEach(async (nft, idx) => {
    const $container = $containers.eq(idx);
    const $image = $container.find(".imagegrid");
    const $name = $container.find(".nft-title");
    const $artist = $container.find(".nft-artist");
    const $etherscanLink = $container.find(".etherscan-link");
    const etherscanLink = nft.nft_id ? `${baseUrl}/etherscan/${nft.nft_id}` : `https://etherscan.io/nft/${nft.contractAddress}/${nft.tokenId}`;
    const $likeButton = $container.find(".like-nft-heart");
    const $copyButton = $container.find(".copy-button");

    if (nft.contractAddress) {
      data["contractaddress"] = nft.contractAddress;
    }
    if (nft.tokenId) {
      data["tokenid"] = nft.tokenId;
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
    $likeButton.removeClass("liked");
    if ( nft.nft_id ) {
      const likedRes = await makeAPIRequestWithToken(`liked/${nft.nft_id}`, {method: "GET"});
      if ( likedRes.message === "NFT is liked" ) {
        $likeButton.addClass("liked");
      }
    }
    let newImage = `<div class="imagegrid imagegrid-container"><img src="${nftSrc}" data-src="${nftSrc}" data-name="${name}" ${dataAttr} class="imagegrid-replacement" /></div>`;
    if (isVideoFile) {
      newImage = `<div class="imagegrid imagegrid-container"><video src="${nftSrc}" data-src="${nftSrc}" data-name="${name}" ${dataAttr} class="imagegrid-replacement" muted playsinline loop preload="auto" autoplay webkit-playsinline x5-playsinline /></div>`;
    }
    $container.addClass("active");
    $image.replaceWith(newImage);
    $name.html(nft.name);
    $artist.html(nft.artist);
    $etherscanLink.click(function() { openInNewTab( etherscanLink ) });
  });
  $copyButton.on("click", () => {
    const url = `https://share.metabeam.app/?id=${nft.nft_id}`;
    const el = document.createElement("textarea");
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  });
  $grid.find("img.imagegrid-replacement").on("error", (e) => {
    $(e.target).parent().remove();
  });
};
const setWalletCollection = (nfts, walletAddress = "") => {
  if (nfts.length > 0) {
    $(".empty-wallet").hide();
    $(".wallet-grid").show();
  } else {
    $(".empty-wallet").show();
    $(".wallet-grid").hide();
  }
  setGridContents(nfts, $yourNFTsGrid, { walletAddress });
};
const setSearchResults = (nfts, data = {}) => {
  if (nfts.length === 0) {
    $(".search-no-results").show();
  } else {
    $resultsGrid.show();
  }
  setGridContents(nfts, $resultsGrid, data);
};
const deleteTV = async ($target) => {
  const serial = encodeURIComponent($target.data("serial") || "");
  const tvName = $target.data("name") || "";
  const isClickingDeleteBtn = $target.hasClass("delete-tv-icon");
  if (!isClickingDeleteBtn || serial === "" || tvName === "") {
    return;
  }
  if (!confirm(`Are you sure you want to delete ${tvName}?`)) {
    return;
  }
  try {
    await makeAPIRequest(`pairing/setup?serial=${serial}`, {
      method: "DELETE",
    });
  } catch {}
  loadUserDevicesList();
};
$(document).click(function (e) {
  deleteTV($(e.target));
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
  try {
    $(".search-no-results").hide();
    $resultsGrid.hide();
    if (contractAddress !== "" && tokenId !== "") {
      const nfts = await makeAPIRequest(
        `contract/${contractAddress}/${tokenId}`
      );
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
  } catch {
    $(".search-no-results").show();
  }
});

/////////////////////////////////////////////////////////////////////
// User Registration/Login Code
/////////////////////////////////////////////////////////////////////
const $registerBtn = $(".register-btn");
const $loginBtn = $("form#login-form input[type='submit']");
const $logoutBtn = $(".logout-button, .logout-link");

async function login(e, register = false) {
  e.preventDefault();
  const $form = register ? $("form#register-form") : $("form#login-form");
  const email = $form.find("input[type='email']").val();
  const password = $form.find("input[type='password']").val();
  const endpoint = register ? `register` : `login`;
  try {
    const res = await makeAPIRequest(endpoint, {
      method: "POST",
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
  } catch {
    $(".invalid-credentials").show();
  }
  ///  checkIfMembershipNeedsPayment();
  ///  window.initializeStripe();
}

$registerBtn.click((e) => login(e, true));
$loginBtn.click((e) => login(e));
$logoutBtn.click((e) => {
  window.setCookie("token", "");
  window.location = "/interface";
});

/////////////////////////////////////////////////////////////////////
// Wallet Connect Code
/////////////////////////////////////////////////////////////////////
const $connectWalletBtn = $(".wallet-connect, .login-with-wallet");
const checkIfWalletIsInstalled = () => !(typeof window.ethereum == "undefined");

async function connectWalletWithMetaMask(e) {
  e.preventDefault();
  const walletIsInstalled = checkIfWalletIsInstalled();
  if (!walletIsInstalled) {
    alert("MetaMask is not installed");
    return;
  }
  const token = getCookie("token");
  const accounts = await window.ethereum
    .request({ method: "eth_requestAccounts" })
    .catch((e) => {
      alert("Failed to connect wallet");
      return;
    });
  if (!accounts) {
    alert("No wallets found!");
    return;
  }
  const walletAddress = accounts[0];
  if (token === "") {
    const res = await makeAPIRequest(`register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet_address: walletAddress,
      }),
    });
    window.setCookie("token", res.token);
    window.setCookie("user wallet address", walletAddress);
    $("#sign-in-modal").hide();
    loadUserWallet();
    location.reload();
    loadUserDevicesList();
    return;
  }
  window.setCookie("user wallet address", walletAddress);
  const res = await makeAPIRequestWithToken("wallets/connect", {
    method: "POST",
    body: JSON.stringify({
      wallet_address: walletAddress,
    }),
  });
  if (!res.wallets.includes(walletAddress)) {
    alert(
      `Failed to connect wallet: ${walletAddress}. Did you register this wallet with another account?`
    );
    return;
  }
  alert(`Your wallet: ${walletAddress} has now been connected!`);
  loadUserWallet();
  loadLikedNFTs();
  location.reload();
  loadUserDevicesList();

}

$connectWalletBtn.click(connectWalletWithMetaMask);
loadUserWallet();
loadLikedNFTs();
///checkIfMembershipNeedsPayment();

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


///code from baron

  $('.nav_profile').on('click', function (evt) {
    $('.profile_tab').click();
  });
  $('.nav_featured').on('click', function (evt) {
    $('.featured_tab').click();
  });
  $('.nav_gallery').on('click', function (evt) {
    $('.gallery_tab').click();
  });
  $('.nav_search').on('click', function (evt) {
    $('.search_tab').click();
  });
  $('.nav_help').on('click', function (evt) {
    $('.help_tab').click();
  });

  $('.sign-up-tab-button').on('click', function (evt) {
    $('.sign-up-tab').click();
  });
  $('.log-in-tab-button').on('click', function (evt) {
    $('.log-in-tab').click();
  });

/// hide/show wallet connect buttons and identicon with ens or wallet address
async function waitForWallet() {
  // Get the wallet address
  const walletAddress = await userWalletAddress;
}
const connectWalletButton = document.querySelector(".wallet-connect")
const walletConnectedButton = document.querySelector(".wallet-connected-div");
const userWalletAddress = window.getCookie("user wallet address")
const walletAddress = waitForWallet()
if (userWalletAddress != null) {

  if (userWalletAddress !== "") {
    connectWalletButton.style.visibility = 'hidden';
    walletConnectedButton.style.visibility = 'visible';
  } 
  else {
  connectWalletButton.style.visibility = 'visible';
  walletConnectedButton.style.visibility = 'hidden';
  }
}
else {
  walletConnectedButton.style.visibility = 'hidden';

}


///get ens
const infuraProjectId = 'a2ac26ffafad4112921acd1e3213f623'; // Replace with your actual Infura project ID
const provider = new ethers.providers.InfuraProvider('mainnet', infuraProjectId);

async function getENSName(address) {
        try {
          const name = await provider.lookupAddress(address);
          return name;
        } catch (error) {
          return address
        }
      }

const walletButton = document.querySelector('.wallet-connected');
const ensName = document.querySelector('.ens-name');
const abbreviatedStr = `${userWalletAddress.substr(0, 6)}...${userWalletAddress.substr(-6)}`;
console.log(abbreviatedStr);
getENSName(userWalletAddress).then(name => {
	if (name) {
  walletButton.textContent = name;
	ensName.textContent = `ENS: ${name}`;
} else {
  walletButton.textContent = abbreviatedStr;
	ensName.textContent = `Address: ${abbreviatedStr}`;
}
}).catch(error => {
`${roundedBalance} ETH`;

});
const walletTextDropdown = document.querySelector('.wallet-text-dropdown');
walletTextDropdown.textContent = abbreviatedStr;

// Create the etherscan URL using the wallet address
const etherscanUrl = `https://etherscan.io/address/${userWalletAddress}`;

// Add a click event listener to the wallet-dropdown element
walletTextDropdown.addEventListener('click', () => {
  // Open the etherscan URL in a new tab
  window.open(etherscanUrl, '_blank');
});



const blockieIcon1 = blockies.create({ seed: userWalletAddress, size:8, scale: 3});

const identiconBox = document.querySelector('.identicon-box');

identiconBox.appendChild(blockieIcon1);


const blockieIcon2 = blockies.create({ seed: userWalletAddress, size:8, scale: 5});

const profileBox = document.querySelector('.profile-icon');

profileBox.appendChild(blockieIcon2);



const web3 = new Web3('https://mainnet.infura.io/v3/a2ac26ffafad4112921acd1e3213f623');
web3.eth.getBalance(userWalletAddress, (error, balance) => {
    if (error) {
      console.error(error);
    } else {
      // Convert the balance to Ether units and update the 'eth-balance' element
      const balanceEth = web3.utils.fromWei(balance, 'ether');
      const roundedBalance = Number(balanceEth).toFixed(4);
      document.querySelector('.eth-balance').textContent = `${roundedBalance} ETH`;
    }
  });


function deleteAllCookies() {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }

  // Disconnect the MetaMask wallet
  if (window.ethereum && window.ethereum.disconnect) {
    window.ethereum.disconnect()
      .then(() => {
        console.log("Wallet disconnected");
        // Add any additional code to run after the wallet is disconnected
      })
      .catch((err) => {
        console.error("Error disconnecting wallet:", err);
      });
  } else {
    console.warn("Ethereum wallet not detected or version is outdated.");
  }
}

///logout button
const logoutBtn = document.querySelector(".logout-button");

logoutBtn.addEventListener("click", () => {
	
  deleteAllCookies();
  location.reload();
  });

const refreshButton = document.querySelector(".refresh")
refreshButton.addEventListener("click", () => {
  location.reload();
  });



