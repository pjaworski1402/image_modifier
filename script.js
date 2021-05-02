const submitUploadButton = document.querySelector(".app__submit");
const uploadWrapper = document.querySelector(".app__upload");
const imageWrapper = document.querySelector(".app__imageWrapper");
const fileUpload = document.querySelector("#fileUpload");
const tools = document.querySelector(".app__tools");

const testImage = (url, callback) => {
  const timeout = 5000;
  let timedOut = false;
  let timer;
  const img = new Image();
  img.onerror = img.onabort = () => {
    if (!timedOut) {
      clearTimeout(timer);
      callback(url, "error");
    }
  };
  img.onload = () => {
    if (!timedOut) {
      clearTimeout(timer);
      callback(url, "success");
    }
  };
  img.src = url;
  timer = setTimeout(() => {
    timedOut = true;
    callback(url, "timeout");
  }, timeout);
};

const displayImage = (src) => {
  const img = document.createElement("img");
  img.src = src;
  img.alt = "Image edit";
  img.classList.add("app__image");
  uploadWrapper.style.display = "none";
  imageWrapper.appendChild(img);
  toggleTools();
};

const toggleTools = () => {
  const imageIsLoaded = !!document.querySelector(".app__image");
  console.log(imageIsLoaded);
  if (imageIsLoaded) {
    tools.style.display = "block";
  } else {
    tools.style.display = "none";
  }
};

uploadWrapper.addEventListener(
  "dragenter",
  () => (uploadWrapper.style.border = "2px solid black"),
  false
);
uploadWrapper.addEventListener(
  "dragleave",
  () => (uploadWrapper.style.border = "2px dashed black"),
  false
);
uploadWrapper.addEventListener(
  "dragover",
  (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadWrapper.style.border = "2px solid black";
  },
  false
);
uploadWrapper.addEventListener(
  "drop",
  (e) => {
    e.preventDefault();
    e.stopPropagation();
    const image = e.dataTransfer.files;
    fileUpload.files = image;
  },
  false
);

const uploadFile = () => {
  const uploadFromLink = document.querySelector(".app__uploadFromLink");
  const fileFromDevice = fileUpload.files[0];
  if (!!fileFromDevice) {
    const reader = new FileReader();
    reader.onload = (e) => {
      displayImage(e.target.result);
    };
    reader.readAsDataURL(fileFromDevice);
  } else {
    testImage(uploadFromLink.value, (url, status) => {
      displayImage(url);
    });
  }
};

submitUploadButton.addEventListener("click", uploadFile);
