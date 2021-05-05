const submitUploadButton = document.querySelector(".app__submit");
const uploadWrapper = document.querySelector(".app__upload");
const imageWrapper = document.querySelector(".app__imageWrapper");
const fileUpload = document.querySelector("#fileUpload");
const tools = document.querySelector(".app__tools");
const toolButtons = document.querySelectorAll(".app__toolButtons");
const toolList = document.querySelector(".app__toolList");
const canvas = document.querySelector(".app__canvas");
let context = canvas.getContext("2d");
let img = new Image();
img.crossOrigin = "anonymous";
let imageUrl = "";
let degrees = 0;

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

const render = () => {
  img.src = imageUrl;
};

const toggleTools = (imageIsLoaded) => {
  if (imageIsLoaded) {
    tools.style.display = "initial";
  } else {
    tools.style.display = "none";
  }
};

const hideUploadUI = () => {
  uploadWrapper.style.display = "none";
  canvas.style.display = "initial";
  toggleTools(true);
};

const downloadPicture = () => {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "filename.png";
  document.body.appendChild(a);
  a.click();
};

const displayImage = (src) => {
  hideUploadUI();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((degrees * Math.PI) / 180);
    context.drawImage(img, -img.width / 2, -img.height / 2);
  };
  imageUrl = src;
  render();
};

const rotate = (value, input) => {
  degrees = value;
  input.value = value;
  render();
};

const rotateTool = () => {
  const previousDegree = degrees;
  const toolWrapper = document.createElement("li");
  const title = document.createElement("span");
  const inputRange = document.createElement("input");
  const input = document.createElement("input");
  const buttonsWrapper = document.createElement("div");
  const saveButton = document.createElement("button");
  const cancelButton = document.createElement("button");
  const range = { max: 359, min: -359 };

  const setInputAttributes = (element, type, className) => {
    element.min = range.min;
    element.max = range.max;
    element.value = degrees;
    element.type = type;
    element.classList.add(className);
  };

  const quitFromTool = () => {
    render();
    toolWrapper.remove();
    toggleToolButtons(true);
  };

  setInputAttributes(inputRange, "range", "app__rotateRange");
  setInputAttributes(input, "number", "app__rotateValue");
  saveButton.innerText = "save";
  cancelButton.innerText = "cancel";
  title.innerText = "Rotate";
  title.classList.add("app__rotateTitle");
  toolWrapper.classList.add("app__rotateTool");
  buttonsWrapper.classList.add("app__toolButtonsWrapper");
  inputRange.addEventListener("change", (e) => rotate(e.target.value, input));
  inputRange.addEventListener("mousemove", (e) =>
    rotate(e.target.value, input)
  );
  inputRange.addEventListener("touchmove", (e) =>
    rotate(e.target.value, input)
  );
  input.addEventListener("change", (e) => rotate(e.target.value, inputRange));
  saveButton.addEventListener("click", () => quitFromTool());
  cancelButton.addEventListener("click", () => {
    degrees = previousDegree;
    quitFromTool();
  });
  buttonsWrapper.append(saveButton, cancelButton);
  toolWrapper.append(title, inputRange, input, buttonsWrapper);
  toolList.appendChild(toolWrapper);
};

const toggleToolButtons = (enable) => {
  toolButtons.forEach((button) => {
    const parentButton = button.parentElement;
    parentButton.style.transform = enable ? "scale(1)" : "scale(0)";
    parentButton.style.display = enable ? "initial" : "none";
  });
};

const openToolPanel = (tool) => {
  toggleToolButtons(false);
  switch (tool) {
    case "rotate":
      {
        rotateTool();
      }
      break;

    default:
      break;
  }
};

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
submitUploadButton.addEventListener("click", uploadFile);
toolButtons.forEach((button) => {
  button.addEventListener("click", () => openToolPanel(button.value));
});
