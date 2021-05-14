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
const imageSettings = {
  degrees: 0,
  previousDegree: 0,
  flip: [1, 1],
  previousFlip: [1, 1],
  previousValue: (tool) => {
    tool = tool.toUpperCase();
    switch (tool) {
      case "ROTATE":
        imageSettings.degrees = imageSettings.previousDegree;
        break;
      case "FLIP":
        {
          imageSettings.flip[0] = imageSettings.previousFlip[0];
          imageSettings.flip[1] = imageSettings.previousFlip[1];
        }
        break;
      default:
        break;
    }
  },
};

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
    context.scale(imageSettings.flip[0], imageSettings.flip[1]);
    context.translate(
      (canvas.width / 2) * imageSettings.flip[0],
      (canvas.height / 2) * imageSettings.flip[1]
    );
    context.rotate((imageSettings.degrees * Math.PI) / 180);
    context.drawImage(img, -img.width / 2, -img.height / 2);
  };
  imageUrl = src;
  render();
};

const rotate = (value, input) => {
  imageSettings.degrees = value;
  input.value = value;
  render();
};

const flip = (orientation) => {
  if (orientation === "horizontal") {
    imageSettings.flip[0] *= -1;
  } else if (orientation === "vertical") {
    imageSettings.flip[1] *= -1;
  }
  render();
};
const renderTool = (tool, toolName) => {
  const quitFromTool = () => {
    render();
    toolWrapper.remove();
    toggleToolButtons(true);
  };
  const toolWrapper = document.createElement("li");
  const title = document.createElement("span");
  const saveButton = document.createElement("button");
  const cancelButton = document.createElement("button");
  const buttonsWrapper = document.createElement("div");
  buttonsWrapper.classList.add("app__toolButtonsWrapper");
  saveButton.innerText = "save";
  cancelButton.innerText = "cancel";
  title.innerText = toolName;
  title.classList.add(`app__toolTitle`);
  toolWrapper.classList.add("app__toolWrapper");
  saveButton.addEventListener("click", () => quitFromTool());
  cancelButton.addEventListener("click", () => {
    imageSettings.previousValue(toolName);
    quitFromTool();
  });
  toolWrapper.appendChild(title);
  tool(toolWrapper);
  buttonsWrapper.append(saveButton, cancelButton);
  toolWrapper.appendChild(buttonsWrapper);
  toolList.appendChild(toolWrapper);
};

const rotateTool = (toolWrapper) => {
  imageSettings.previousDegree = imageSettings.degrees;
  const inputRange = document.createElement("input");
  const input = document.createElement("input");
  const range = { max: 359, min: -359 };

  const setInputAttributes = (element, type, className) => {
    element.min = range.min;
    element.max = range.max;
    element.value = imageSettings.degrees;
    element.type = type;
    element.classList.add(className);
  };

  setInputAttributes(inputRange, "range", "app__rotateRange");
  setInputAttributes(input, "number", "app__rotateValue");
  inputRange.addEventListener("change", (e) => rotate(e.target.value, input));
  inputRange.addEventListener("mousemove", (e) =>
    rotate(e.target.value, input)
  );
  inputRange.addEventListener("touchmove", (e) =>
    rotate(e.target.value, input)
  );
  input.addEventListener("change", (e) => rotate(e.target.value, inputRange));
  toolWrapper.append(inputRange, input);
};

const flipTool = (toolWrapper) => {
  imageSettings.previousFlip[0] = imageSettings.flip[0];
  imageSettings.previousFlip[1] = imageSettings.flip[1];
  const title = document.createElement("span");
  const flipVertButton = document.createElement("button");
  const flipHorizButton = document.createElement("button");
  const flipIcoVert = document.createElement("img");
  const flipIcoHoriz = document.createElement("img");
  flipIcoVert.src = "./assets/icons/flip.svg";
  flipIcoVert.alt = "flip vertically";
  flipIcoVert.style.transform = "rotate(90deg)";
  flipIcoVert.style.margin = "auto";
  flipIcoHoriz.src = "./assets/icons/flip.svg";
  flipIcoHoriz.alt = "flip horizontally";
  flipIcoHoriz.style.margin = "auto";
  flipVertButton.appendChild(flipIcoVert);
  flipHorizButton.appendChild(flipIcoHoriz);
  flipVertButton.addEventListener("click", () => flip("vertical"));
  flipHorizButton.addEventListener("click", () => flip("horizontal"));
  toolWrapper.append(title, flipVertButton, flipHorizButton);
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
        renderTool(rotateTool, "Rotate");
      }
      break;
    case "flip":
      {
        renderTool(flipTool, "Flip");
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
