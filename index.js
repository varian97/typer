const textToType = "Lorem ipsum dolor sit amet";

const sentenceContainer = document.querySelector("#sentence-container");
const refreshButton = document.querySelector("#refresh-btn");
const newTestButton = document.querySelector("#new-test-btn");

const speedVal = document.querySelector("#speed-value");
const accuracyVal = document.querySelector("#accuracy-value");
const timeVal = document.querySelector("#time-value");

let letters = [];
let pointer = 0;
let startTimer = null;
let endTimer = null;
let falseCount = 0;
let typeCount = 0;
let finished = false;

const resetGame = () => {
  document.activeElement?.blur();

  sentenceContainer.innerHTML = "";
  speedVal.innerText = "-";
  accuracyVal.innerText = "-";
  timeVal.innerText = "-";

  pointer = 0;
  startTimer = null;
  endTimer = null;
  falseCount = 0;
  typeCount = 0;
  finished = false;

  letters = Array.from(textToType).map((ch) => {
    const spanLetter = document.createElement("span");
    spanLetter.innerText = ch;
    sentenceContainer.appendChild(spanLetter);

    return spanLetter;
  });

  letters[0].classList.add("current-letter");
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

document.addEventListener("keydown", (event) => {
  const pressed = event.key;

  if (pressed === "Escape") {
    event.preventDefault();
    resetGame();
  }

  if (finished) {
    return;
  }

  if (pressed.length === 1) {
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

  if (pointer === letters.length) {
    finished = true;
    endTimer = new Date();
    letters[pointer - 1].classList.remove("current-letter");

    const { accuracy, speed, time } = calculateStats();
    accuracyVal.innerText = `${accuracy}%`;
    speedVal.innerText = `${speed} wpm`;
    timeVal.innerText = `${time}`;
  } else {
    letters[pointer].classList.add("current-letter");
    if (pointer > 0) {
      letters[pointer - 1].classList.remove("current-letter");
    }
  }
});

refreshButton.addEventListener("click", resetGame);
newTestButton.addEventListener("click", resetGame);

resetGame();
