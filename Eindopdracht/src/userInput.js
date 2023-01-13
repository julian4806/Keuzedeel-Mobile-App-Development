// Modal Code
let caniopenthemenu = true;
const closeLeaderboardModalButton = document.querySelector(
  ".close-leaderboard-modal"
);
const leaderboard = document.querySelector(".leaderboard-modal");
const leaderboardButton = document.querySelector(".leaderboard-button");
const closeSettingsModalButton = document.querySelector(
  ".close-settings-modal"
);
const settings = document.querySelector(".settings-modal");
const settingsButton = document.querySelector(".settings-button");

closeSettingsModalButton.onclick = closeModals;
closeLeaderboardModalButton.onclick = closeModals;

function closeModals() {
  leaderboard.style.display = "none";
  settings.style.display = "none";
  enableEnterKey();
}

function leaderboardOpen() {
  if (!caniopenthemenu) return;
  settings.style.display = "none";
  leaderboard.style.display = "block";
  disableEnterKey();
}

function settingsOpen() {
  if (!caniopenthemenu) return;
  leaderboard.style.display = "none";
  settings.style.display = "block";
  disableEnterKey();
}

function disableEnterKey() {
  document.onkeydown = function (e) {
    if (e.code === "Enter") {
      return false;
    }
  };
}
function enableEnterKey() {
  document.onkeydown = function (e) {
    if (e.code === "Enter") {
      return true;
    }
  };
}

// Save Username and Userphoto
const form = document.querySelector("form");
const username = document.querySelector(".username");
const displayUserImage = document.querySelector(".display-current-image > img");
const saveUserSettings = document.querySelector(".save-user-settings");

displayUserImage.src = localStorage.getItem("userimage");
username.value = localStorage.getItem("username");

saveUserSettings.onclick = (e) => {
  saveUserSettingsToLocalStorage();
  return false;
};

function saveUserSettingsToLocalStorage() {
  //userimage
  const userimage = document.querySelector(".userimage").files[0];

  const reader = new FileReader();
  reader.addEventListener(
    "load",
    () => {
      resizebase64(reader.result, 140, 180);
      localStorage.setItem("username", username.value);
    },
    false
  );

  if (userimage) {
    reader.readAsDataURL(userimage);
  }

  if (userimage !== undefined) return;

  // username
  if (username.value.length < 3) {
    saveUserSettings.innerText = `fill in at least 3 characters`;
    resetTextSaveButton();
    return;
  }

  if (localStorage.getItem("username") !== username.value) {
    localStorage.setItem("username", username.value);
    saveUserSettings.innerText = `saved username!`;
    resetTextSaveButton();
  } else {
    saveUserSettings.innerText = `no change detected in username`;
    resetTextSaveButton();
  }
}

function resetTextSaveButton() {
  setTimeout(() => {
    saveUserSettings.innerText = `save`;
  }, 1000);
}

// test
function resizebase64(base64, maxWidth, maxHeight) {
  // Max size for thumbnail
  if (typeof maxWidth === "undefined") maxWidth = 500;
  if (typeof maxHeight === "undefined") maxHeight = 500;

  // Create and initialize two canvas

  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var canvasCopy = document.createElement("canvas");
  var copyContext = canvasCopy.getContext("2d");

  // Create original image
  var img = new Image();
  img.src = base64;

  img.addEventListener("load", () => {
    // Determine new ratio based on max size
    var ratio = 1;
    if (img.width > maxWidth) ratio = maxWidth / img.width;
    else if (img.height > maxHeight) ratio = maxHeight / img.height;
    // Draw original image in second canvas
    canvasCopy.width = img.width;
    canvasCopy.height = img.height;
    copyContext.drawImage(img, 0, 0);
    // Copy and resize second canvas to first canvas
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    ctx.drawImage(
      canvasCopy,
      0,
      0,
      canvasCopy.width,
      canvasCopy.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    localStorage.setItem("userimage", canvas.toDataURL());
    location.reload();
  });
}
