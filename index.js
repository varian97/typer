const sentences = document.querySelector("#sentence-container");

const statisticContainer = document.querySelector("#statistic-container");
const speedVal = document.querySelector("#speed-value");
const accuracyVal = document.querySelector("#accuracy-value");
const timeVal = document.querySelector("#time-value");

const capsContainer = document.querySelector(".caps-alert");
const cursor = document.querySelector(".cursor");

let letters = [];
let pointer = 0;
let startTimer = null;
let endTimer = null;
let falseCount = 0;
let typeCount = 0;
let finished = false;
let capsLockPressed = false;

const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    try {
      navigator.serviceWorker.register("/typer/sw.js", { scope: "/typer/" });
    } catch (err) {
      console.error(`Failed to register service worker: ${err}`);
    }
  }
};

const generateQuote = () => {
  return (
    window.generateRandomQuote().split("-")[0].trim() ||
    "Lorem ipsum dolor sit amet"
  );
};

let textToType = generateQuote();

const moveCursor = () => {
  if (pointer < letters.length) {
    const { top, left } = letters[pointer].getBoundingClientRect();
    cursor.style.transform = `translate(${left - 4}px, ${top}px)`;
  }
  cursor.classList.remove("hideable");
};

const resetGame = () => {
  document.activeElement?.blur();

  statisticContainer.classList.add("hideable");
  speedVal.innerText = "-";
  accuracyVal.innerText = "-";
  timeVal.innerText = "-";

  sentences.classList.remove("hideable");
  sentences.innerHTML = "";

  pointer = 0;
  startTimer = null;
  endTimer = null;
  falseCount = 0;
  typeCount = 0;
  finished = false;

  textToType = generateQuote();

  letters = Array.from(textToType).map((ch) => {
    const spanLetter = document.createElement("span");
    spanLetter.innerText = ch;
    sentences.appendChild(spanLetter);

    return spanLetter;
  });

  moveCursor();
};

const calculateStats = () => {
  const accuracy = Math.round(((typeCount - falseCount) * 100) / typeCount);
  const words = textToType.split(" ").length;
  const diffInMs = Math.abs(endTimer - startTimer);

  const msInSecond = 1000;
  const msInMinute = 60 * 1000;
  const msInHour = 60 * 60 * 1000;
  const msInDay = 24 * 60 * 60 * 1000;

  const diffInDays = Math.floor(diffInMs / msInDay);
  const diffInHours = Math.floor(diffInMs / msInHour);
  const diffInMinutes = Math.floor(diffInMs / msInMinute);
  const diffInSeconds = Math.floor(diffInMs / msInSecond);

  const wpm = Math.round((words * 60) / diffInSeconds);

  let durationText = "";
  if (diffInDays >= 1) {
    durationText = `${diffInDays} day${diffInDays > 1 ? "s" : ""}`;
  } else if (diffInHours >= 1) {
    const minutesLeft = Math.floor((diffInMs % msInHour) / msInMinute);
    const secondsLeft = Math.floor(
      ((diffInMs % msInHour) % msInMinute) / msInSecond
    );
    durationText = `${diffInHours < 10 ? "0" : ""}${diffInHours}:${
      minutesLeft < 10 ? "0" : ""
    }${minutesLeft}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
  } else if (diffInMinutes >= 1) {
    const secondsLeft = Math.floor((diffInMs % msInMinute) / msInSecond);
    durationText = `${diffInMinutes < 10 ? "0" : ""}${diffInMinutes}:${
      secondsLeft < 10 ? "0" : ""
    }${secondsLeft}`;
  } else {
    durationText = `00:${diffInSeconds < 10 ? "0" : ""}${diffInSeconds}`;
  }

  return {
    accuracy,
    speed: wpm,
    time: durationText,
  };
};

const toggleCapsLockAlert = (event) => {
  if (!finished) {
    capsContainer.classList.toggle(
      "hideable",
      !event.getModifierState("CapsLock")
    );
  }
};

const handleResetTest = (event) => {
  if (event.key === "Escape") {
    resetGame();
  }
};

const handleCharacterTyped = (event) => {
  const pressed = event.key;

  if (pressed === "'" || pressed === "/") {
    event.preventDefault();
  }

  if (pressed === "Backspace" && pointer > 0) {
    pointer -= 1;
    letters[pointer].classList.remove("letter-correct");
    letters[pointer].classList.remove("letter-false");
    letters[pointer].classList.remove("letter-false-space");
  } else if (pressed.length === 1) {
    typeCount += 1;

    if (startTimer === null) {
      startTimer = new Date();
    }

    const current = letters[pointer];

    if (pressed === current.innerText) {
      current.classList.add("letter-correct");
    } else {
      falseCount += 1;
      current.classList.add("letter-false");
      if (current.innerText === " ") {
        current.classList.add("letter-false-space");
      }
    }
    pointer += 1;
  }
};

document.addEventListener("keyup", toggleCapsLockAlert);

document.addEventListener("keydown", (event) => {
  handleResetTest(event);
  toggleCapsLockAlert(event);

  if (finished) {
    return;
  }

  handleCharacterTyped(event);

  if (pointer === letters.length) {
    finished = true;
    endTimer = new Date();

    const { accuracy, speed, time } = calculateStats();
    accuracyVal.innerText = `${accuracy}%`;
    speedVal.innerText = `${speed} wpm`;
    timeVal.innerText = `${time}`;

    cursor.classList.add("hideable");
    sentences.classList.add("hideable");

    statisticContainer.classList.remove("hideable");
  } else {
    moveCursor();
  }
});

document.fonts.ready.then(() => {
  resetGame();
});

registerServiceWorker();
