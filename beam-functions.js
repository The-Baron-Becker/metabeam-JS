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
  const walletAddress = $walletAddress.val();
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
    $.get( `${baseUrl}/liked/${nftId}?wallet_address=${walletAddress}`, function () {
      $currGalleryLikeButton.addClass("liked");
    } );
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
    const etherscanLink = `${baseUrl}/etherscan/${nftId}`;
    const $lightboxLink = $currGalleryItem.parent();
    const isVideoFile = checkIfVideo(nftSrc);
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
const setGridContents = (nfts, $grid, data = {}) => {
  $grid.find("*").remove();
  $grid.css("display", "");
  if (nfts.length === 1) {
    $grid.css("display", "flex");
  }
  nfts.forEach((nft, idx) => {
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
// Wallet Connect Code
/////////////////////////////////////////////////////////////////////
const connectWalletBtn = document.querySelector(".wallet-connect");
const checkIfWalletIsInstalled = () => !(typeof window.ethereum == "undefined");

async function connectWalletWithMetaMask(e) {
  e.preventDefault();
  const walletIsInstalled = checkIfWalletIsInstalled();
  if (!walletIsInstalled) {
    alert("MetaMask is not installed");
    return;
  }
 
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
  setCookie("user wallet address", walletAddress);
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

