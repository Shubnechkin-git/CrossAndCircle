let currentPlayer;
let cells = document.querySelectorAll(".cell");

let gameOver = false;
let xPlayerWins = 0;
let oPlayerWins = 0;
let xRobotWins = 0;
let oRobotWins = 0;
let robotMode = false;
let playerMode = true;
let winningCells = []; // Массив для хранения индексов победных ячеек
let direction = "";
// Yandex
let gameStartCounter = 1;
YaGames.init().then((ysdk) => ysdk.adv.showFullscreenAdv());
let userPointsLb;
// UI Message
let messageContainer = document.getElementById("message_container");
let counterContainer = document.getElementById("counter_container");
let modeMessageContainer = document.getElementById("mode_message_container");

// UI Control
let restartButton = document.getElementById("restart_button");
let modeButton = document.getElementById("mode_button");
let modeSwitch = document.getElementById("mode_switch");

// UI Language
var url = window.location.href;
let groupButton = document.getElementById("group_button");
let moreButton = document.getElementById("more_button");
let playerModeText;
let robotModeText;

// Разбиваем URL на части, используя знак вопроса в качестве разделителя
var parts = url.split("?");
var lang = "ru";
// Проверяем, есть ли в URL параметр lang
if (parts.length > 1) {
  // Получаем часть URL с параметрами
  var params = parts[1].split("&");

  // Ищем параметр lang
  for (var i = 0; i < params.length; i++) {
    var param = params[i].split("=");
    if (param[0] === "lang") {
      // Если параметр lang найден, выводим его значение
      console.log("Значение параметра lang:", param[1]);
      switch (param[1]) {
        case "tr":
          lang = "tr";
          restartButton.innerText = "Baştan başlamak";
          groupButton.innerText = "Vkontakte'deyiz";
          moreButton.innerText = "Diğer Oyunlar";
          break;
        case "en":
          lang = "en";
          restartButton.innerText = "Start over";
          groupButton.innerText = "We are in Vkontakte";
          moreButton.innerText = "Other games";
          break;
        default:
          break;
      }
      break;
    }
  }
} else {
  console.log("URL не содержит параметров");
}

const setLocalStorage = (name, value) => {
  localStorage.setItem(name, value);
};

const getLocalStorage = (name) => {
  return localStorage.getItem(name);
};

console.log("localStorage:", getLocalStorage("xPlayerWins"));

const setMessageContainer = (message, container) => {
  container.innerHTML = message;
};

const applyWinClasses = () => {
  lastWining = winningCells.slice(-3);
  console.log("lastWining: ", lastWining);
  if (lastWining[0] == 0 && lastWining[1] == 4 && lastWining[2] == 8) {
    direction = "diagonal-right";
  } else if (lastWining[0] == 2 && lastWining[1] == 4 && lastWining[2] == 6) {
    direction = "diagonal-left";
  } else if (lastWining[0] == 0 && lastWining[1] == 1 && lastWining[2] == 2) {
    direction = "horizontal";
  } else if (lastWining[0] == 3 && lastWining[1] == 4 && lastWining[2] == 5) {
    direction = "horizontal";
  } else if (lastWining[0] == 6 && lastWining[1] == 7 && lastWining[2] == 8) {
    direction = "horizontal";
  } else if (lastWining[0] == 0 && lastWining[1] == 3 && lastWining[2] == 6) {
    direction = "vertical";
  } else if (lastWining[0] == 1 && lastWining[1] == 4 && lastWining[2] == 7) {
    direction = "vertical";
  } else if (lastWining[0] == 2 && lastWining[1] == 5 && lastWining[2] == 8) {
    direction = "vertical";
  }
  if (cells[lastWining[0]].textContent === "X") {
    lastWining.forEach((index) => {
      cells[index].classList.add("winning-cell", direction + "-cross");
    });
  } else {
    lastWining.forEach((index) => {
      cells[index].classList.add("winning-cell", direction + "-circle");
    });
  }
  winningCells = [];
  lastWining = [];
  console.log("lastWining: ", lastWining);
};

const randomizeCurrentPlayer = () => {
  currentPlayer = Math.random() >= 0.5 ? "X" : "O";
  console.log(currentPlayer);
  if (currentPlayer === "O") {
    switch (lang) {
      case "en":
        setMessageContainer(
          `Enemy move: <span class="circle">${currentPlayer}</span>`,
          messageContainer
        );
        break;
      case "tr":
        setMessageContainer(
          `Düşman Hareketi: <span class="circle">${currentPlayer}</span>`,
          messageContainer
        );
        break;
      default:
        setMessageContainer(
          `Ход противника: <span class="circle">${currentPlayer}</span>`,
          messageContainer
        );
        break;
    }
    playBot();
  } else {
    switch (lang) {
      case "en":
        setMessageContainer(
          `Your turn:<span class="cross">${currentPlayer}</span>`,
          messageContainer
        );
        break;
      case "tr":
        setMessageContainer(
          `Senin sıran: <span class="cross">${currentPlayer}</span>`,
          messageContainer
        );
        break;
      default:
        setMessageContainer(
          `Ваш ход: <span class="cross">${currentPlayer}</span>`,
          messageContainer
        );
        break;
    }
  }
};

const startGame = () => {
  // restartButton.disabled = true; // Делаем кнопку перезагрузки неактивной при загрузке страницы
  // restartButton.style.cursor = 'not-allowed';
  xPlayerWins = parseInt(getLocalStorage("xPlayerWins")) || 0;
  oPlayerWins = parseInt(getLocalStorage("oPlayerWins")) || 0;
  xRobotWins = parseInt(getLocalStorage("xRobotWins")) || 0;
  oRobotWins = parseInt(getLocalStorage("oRobotWins")) || 0;

  switch (lang) {
    case "en":
      playerModeText = "Two players";
      robotModeText = "Playing VS robot";
      break;
    case "tr":
      playerModeText = "Iki oyuncu";
      robotModeText = "Robota karşı oyun";
      break;
    default:
      playerModeText = "Два игрока";
      robotModeText = "Игра против робота";
      break;
  }
  modeMessageContainer.innerText = robotMode ? robotModeText : playerModeText;

  randomizeCurrentPlayer();
  if (currentPlayer === "O") {
    switch (lang) {
      case "en":
        setMessageContainer(
          `Enemy move: <span class="circle">${currentPlayer}</span>`,
          messageContainer
        );
        break;
      case "tr":
        setMessageContainer(
          `Düşman Hareketi: <span class="circle">${currentPlayer}</span>`,
          messageContainer
        );
        break;
      default:
        setMessageContainer(
          `Ход противника: <span class="circle">${currentPlayer}</span>`,
          messageContainer
        );
        break;
    }
    playBot();
  } else {
    switch (lang) {
      case "en":
        setMessageContainer(
          `Your turn: <span class="cross">${currentPlayer}</span>`,
          messageContainer
        );
        break;
      case "tr":
        setMessageContainer(
          `Senin sıran: <span class="cross">${currentPlayer}</span>`,
          messageContainer
        );
        break;
      default:
        setMessageContainer(
          `Ваш ход: <span class="cross">${currentPlayer}</span>`,
          messageContainer
        );
        break;
    }
  }
  if (playerMode) {
    setMessageContainer(
      ` <span class="cross">X - ${xPlayerWins}</span> <span class="circle">O - ${oPlayerWins}</span>`,
      counterContainer
    );
  } else {
    setMessageContainer(
      ` <span class="cross">X - ${xRobotWins}<span class="circle">O - ${oRobotWins}</span>`,
      counterContainer
    );
  }
  // toggleMode();
};

window.onload = function () {
  // Создание контекста аудио после пользовательского взаимодействия
  startGame();
  // document.body.addEventListener("click", function () {
  //   if (!audioContext) {
  //     audioContext = new (window.AudioContext || window.webkitAudioContext)();
  //     // playBackgroundAudio();
  //   }
  // });
};

const cellClicked = (event) => {
  if (gameOver || (currentPlayer === "O" && robotMode && !playerMode)) return;
  let cell = event.target;
  if (cell.textContent === "") {
    cell.textContent = currentPlayer;
    cell.style.border = "4px solid";
    cell.classList.remove("pointer"); // Убираем класс 'pointer'
    cell.classList.add(currentPlayer === "X" ? "cross" : "circle"); // Добавляем класс в зависимости от текущего игрока
    cell.classList.add("closed"); // Устанавливаем курсор для занятой ячейки

    if (checkWin()) {
      applyWinClasses();
      if (currentPlayer === "X") {
        switch (lang) {
          case "en":
            setMessageContainer(
              `You won: <span class="cross">${currentPlayer}</span>!`,
              messageContainer
            );
            break;
          case "tr":
            setMessageContainer(
              `Siz kazandınız: <span class="cross">${currentPlayer}</span>!`,
              messageContainer
            );
            break;
          default:
            setMessageContainer(
              `Вы выиграли: <span class="cross">${currentPlayer}</span>!`,
              messageContainer
            );
            break;
        }
        restartButton.disabled = false;
        restartButton.style.cursor = "pointer";
        if (playerMode) {
          xPlayerWins++;
        } else {
          xRobotWins++;
        }
      } else {
        restartButton.disabled = false;
        restartButton.style.cursor = "pointer";
        switch (lang) {
          case "en":
            setMessageContainer(
              `Your enemy won: <span class="circle">${currentPlayer}</span>!`,
              messageContainer
            );
            break;
          case "tr":
            setMessageContainer(
              `Düşmanınız kazandı: <span class="circle">${currentPlayer}</span>!`,
              messageContainer
            );
            break;
          default:
            setMessageContainer(
              `Ваш противник выиграл: <span class="circle">${currentPlayer}</span>!`,
              messageContainer
            );
            break;
        }
        if (playerMode) {
          oPlayerWins++;
        } else {
          oRobotWins++;
        }
      }
      updateScore();
      gameOver = true;
      btnPlayWinSound();
      cells.forEach((cell) => {
        cell.classList.add("closed");
      });
      return;
    }
    if (checkDraw()) {
      switch (lang) {
        case "en":
          setMessageContainer("Draw!", messageContainer);
          break;
        case "tr":
          setMessageContainer("Çizmek!", messageContainer);
          break;
        default:
          setMessageContainer("Ничья!", messageContainer);
          break;
      }
      restartButton.disabled = false;
      restartButton.style.cursor = "pointer";
      gameOver = true;
      return;
    }
    switch (currentPlayer) {
      case "X":
        currentPlayer = "O";
        console.log(87);
        switch (lang) {
          case "en":
            setMessageContainer(
              `Enemy move: <span class="circle">${currentPlayer}</span>`,
              messageContainer
            );
            break;
          case "tr":
            setMessageContainer(
              `Düşman Hareketi: <span class="circle">${currentPlayer}</span>`,
              messageContainer
            );
            break;
          default:
            setMessageContainer(
              `Ход противника: <span class="circle">${currentPlayer}</span>`,
              messageContainer
            );
            break;
        }
        break;
      case "O":
        currentPlayer = "X";
        switch (lang) {
          case "en":
            setMessageContainer(
              `Your turn: <span class="cross">${currentPlayer}</span>`,
              messageContainer
            );
            break;
          case "tr":
            setMessageContainer(
              `Senin sıran: <span class="cross">${currentPlayer}</span>`,
              messageContainer
            );
            break;
          default:
            setMessageContainer(
              `Ваш ход: <span class="cross">${currentPlayer}</span>`,
              messageContainer
            );
            break;
        }
        break;
    }

  }
  if (currentPlayer === "O" && robotMode && !playerMode) {
    playBot();
  }
};

const checkWin = () => {
  const lines = [
    [0, 1, 2], // Горизонтальные линии
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // Вертикальные линии
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // Диагональные линии (слева направо)
    [2, 4, 6], // Диагональные линии (справа налево)
  ];

  for (let line of lines) {
    let [a, b, c] = line;
    if (
      cells[a].textContent !== "" &&
      cells[a].textContent === cells[b].textContent &&
      cells[a].textContent === cells[c].textContent
    ) {
      // Добавляем индексы победных ячеек в массив
      winningCell = [];
      winningCells.push(a, b, c);
      return true;
    }
  }

  return false;
};

const checkDraw = () => {
  return [...cells].every((cell) => cell.textContent !== "");
};

const getRandomMove = (board) => {
  let emptyCells = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i].textContent === "") {
      emptyCells.push(i);
    }
  }
  if (emptyCells.length > 0) {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  } else {
    return undefined;
  }
};

const playBot = () => {
  if (gameOver || (currentPlayer === "X" && !robotMode) || playerMode) return;
  setTimeout(() => {
    const randomProbability = Math.random() * 0.1 + 0.3;
    if (Math.random() < randomProbability) {
      let randomMove = getRandomMove(cells);
      if (randomMove !== undefined) {
        currentPlayer = "X";
        cells[randomMove].textContent = "O";
        cells[randomMove].style.border = "4px solid";
        cells[randomMove].classList.add("circle");
        cells[randomMove].classList.add("closed");
      }
    } else {
      let bestMove = getBestMove(cells, -Infinity, Infinity, true);

      currentPlayer = "X";
      if (bestMove !== undefined) {
        cells[bestMove].textContent = "O";
        cells[bestMove].style.border = "4px solid";
        cells[bestMove].classList.add("circle");
        cells[bestMove].classList.add("closed");
      }
    }

    if (checkWin()) {
      // Обновляем сообщение о победе и обновляем счет
      applyWinClasses();
      switch (lang) {
        case "en":
          setMessageContainer(
            `Your enemy won: <span class="circle">${currentPlayer}</span>!`,
            messageContainer
          );
          break;
        case "tr":
          setMessageContainer(
            `Düşmanınız kazandı: <span class="circle">${currentPlayer}</span>!`,
            messageContainer
          );
          break;
        default:
          setMessageContainer(
            `Ваш противник выиграл: <span class="circle">${currentPlayer}</span>!`,
            messageContainer
          );
          break;
      }
      oRobotWins++;
      updateScore();
      restartButton.disabled = false;
      restartButton.style.cursor = "pointer";
      gameOver = true;
      cells.forEach((cell) => {
        cell.classList.add("closed");
      });
      return;
    }
    if (checkDraw()) {
      // Выводим сообщение о ничьей и активируем кнопку перезапуска
      switch (lang) {
        case "en":
          setMessageContainer("Draw!", messageContainer);
          break;
        case "tr":
          setMessageContainer("Çizmek!", messageContainer);
          break;
        default:
          setMessageContainer("Ничья!", messageContainer);
          break;
      }
      restartButton.disabled = false;
      restartButton.style.cursor = "pointer";
      gameOver = true;
      return;
    }

    // Выводим сообщение о ходе следующего игрока
    switch (lang) {
      case "en":
        setMessageContainer(
          `Your turn: <span class="cross">X</span>`,
          messageContainer
        );
        break;
      case "tr":
        setMessageContainer(
          `Senin sıran: <span class="cross">X</span>`,
          messageContainer
        );
        break;
      default:
        setMessageContainer(
          `Ваш ход: <span class="cross">X</span>`,
          messageContainer
        );
        break;
    }
  }, Math.floor(Math.random() * 800) + 300);
};

const getBestMove = (board, alpha, beta, isMaximizing) => {
  if (checkWin()) {
    return isMaximizing ? -10 : 10;
  }
  if (checkDraw()) {
    return 0;
  }

  let bestScore = isMaximizing ? -Infinity : Infinity;
  let move = null;

  for (let i = 0; i < board.length; i++) {
    if (board[i].textContent === "") {
      board[i].textContent = isMaximizing ? "O" : "X";
      let score = minimax(board, alpha, beta, !isMaximizing);
      board[i].textContent = "";
      if (isMaximizing) {
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
        alpha = Math.max(alpha, score);
      } else {
        if (score < bestScore) {
          bestScore = score;
          move = i;
        }
        beta = Math.min(beta, score);
      }
      if (beta <= alpha) {
        break;
      }
    }
  }

  return move;
};

const minimax = (board, alpha, beta, isMaximizing) => {
  if (checkWin()) {
    return isMaximizing ? -10 : 10;
  }
  if (checkDraw()) {
    return 0;
  }

  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (let i = 0; i < board.length; i++) {
    if (board[i].textContent === "") {
      board[i].textContent = isMaximizing ? "O" : "X";
      let score = minimax(board, alpha, beta, !isMaximizing);
      board[i].textContent = "";
      if (isMaximizing) {
        bestScore = Math.max(score, bestScore);
        alpha = Math.max(alpha, score);
      } else {
        bestScore = Math.min(score, bestScore);
        beta = Math.min(beta, score);
      }
      if (beta <= alpha) {
        break;
      }
    }
  }

  return bestScore;
};

restartButton.addEventListener("click", () => {
  if (gameOver) {
    restartGame();
  }
});

const restartGame = () => {
  // btnPlaySound();
  winningCell = [];
  // restartButton.disabled = true; // Делаем кнопку перезагрузки неактивной при загрузке страницы
  // restartButton.style.cursor = 'not-allowed';
  gameOver = false;
  gameStartCounter++;
  if (gameStartCounter == 3) {
    ysdk.feedback.canReview().then(({ value, reason }) => {
      if (value) {
        ysdk.feedback.requestReview().then(({ feedbackSent }) => {
          console.log(feedbackSent);
        });
      } else {
        console.log(reason);
      }
    });
  } else if (gameStartCounter % 10 == 0) {
    ysdk.adv.showRewardedVideo({
      callbacks: {
        onOpen: () => {
          console.log("Video ad open.");
        },
        onRewarded: () => {
          console.log("Rewarded!");
        },
        onClose: () => {
          console.log("Video ad closed.");
        },
        onError: (e) => {
          console.log("Error while open video ad:", e);
        },
      },
    });
  }
  cells.forEach((cell) => {
    cell.style.border = "4px solid grey";
    cell.classList.remove("winning-cell");
    cell.classList.remove("winning-cell");
    cell.classList.remove("diagonal-right" + "-cross");
    cell.classList.remove("diagonal-right" + "-circle");
    cell.classList.remove("diagonal-left" + "-cross");
    cell.classList.remove("diagonal-left" + "-circle");
    cell.classList.remove("horizontal" + "-cross");
    cell.classList.remove("horizontal" + "-circle");
    cell.classList.remove("vertical" + "-cross");
    cell.classList.remove("vertical" + "-circle");
  });

  switch (currentPlayer) {
    case "X":
      currentPlayer = "O";
      switch (lang) {
        case "en":
          setMessageContainer(
            `Enemy move: <span class="circle">${currentPlayer}</span>`,
            messageContainer
          );
          break;
        case "tr":
          setMessageContainer(
            `Düşman Hareketi: <span class="circle">${currentPlayer}</span>`,
            messageContainer
          );
          break;
        default:
          setMessageContainer(
            `Ход противника: <span class="circle">${currentPlayer}</span>`,
            messageContainer
          );
          break;
      }
      break;
    case "O":
      currentPlayer = "X";
      switch (lang) {
        case "en":
          setMessageContainer(
            `Your turn: <span class="cross">${currentPlayer}</span>`,
            messageContainer
          );
          break;
        case "tr":
          setMessageContainer(
            `Senin sıran: <span class="cross">${currentPlayer}</span>`,
            messageContainer
          );
          break;
        default:
          setMessageContainer(
            `Ваш ход: <span class="cross">${currentPlayer}</span>`,
            messageContainer
          );
          break;
      }
      break;
  }
  var player;

  ysdk
    .getPlayer({ scopes: false })
    .then((_player) => {
      player = _player;
      player
        .setData({
          xPlayerWins: xPlayerWins,
          oPlayerWins: oPlayerWins,
          xRobotWins: xRobotWins,
          oRobotWins: oRobotWins,
        })
        .then(() => {
          console.log("data is set");
        });
    })
    .catch((err) => {
      // Ошибка при инициализации объекта Player.
      console.log("data is not set:", err);
    });
  ysdk
    .getPlayer({ scopes: false })
    .then((_player) => {
      player = _player;
      player.getData().then((res) => {
        console.log("data is get:", res);
        if (res.xPlayerWins != undefined) {
          xPlayerWins = res.xPlayerWins;
        }
      });
    })
    .catch((err) => {
      // Ошибка при инициализации объекта Player.
      console.log("Player init:", err);
    });

  var lb;

  ysdk.getLeaderboards().then((_lb) => (lb = _lb));

  console.log("userPoints LB: ", lb);

  ysdk
    .getLeaderboards()
    .then((lb) => lb.getLeaderboardPlayerEntry("userPoints"))
    .then((res) => {
      userPointsLb = res.score;
      console.log("userPoints: ", res);
    })
    .catch((err) => {
      console.log("userPoints err: ", err);
      if (err.code === "LEADERBOARD_PLAYER_NOT_PRESENT") {
        lb.setLeaderboardScore("userPoints", xRobotWins);
        // Срабатывает, если у игрока нет записи в лидерборде
      }
    });
  if (xRobotWins > userPointsLb)
    ysdk.getLeaderboards().then((lb) => {
      // Без extraData
      lb.setLeaderboardScore("userPoints", xRobotWins);
    });

  randomizeCurrentPlayer();
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("closed");
    cell.classList.remove("circle");
    cell.classList.remove("cross");
  });
  updateScore();
};

const switchPlayer = () => {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  switch (currentPlayer) {
    case "X":
      switch (lang) {
        case "en":
          setMessageContainer(
            `Enemy move: <span class="circle">${currentPlayer}</span>`,
            messageContainer
          );
          break;
        case "tr":
          setMessageContainer(
            `Düşman Hareketi: <span class="circle">${currentPlayer}</span>`,
            messageContainer
          );
          break;
        default:
          setMessageContainer(
            `Ход противника: <span class="circle">${currentPlayer}</span>`,
            messageContainer
          );
          break;
      }
      break;
    case "O":
      switch (lang) {
        case "en":
          setMessageContainer(
            `Your turn: <span class="circle">${currentPlayer}</span>`,
            messageContainer
          );
          break;
        case "tr":
          setMessageContainer(
            `Senin sıran: <span class="circle">${currentPlayer}</span>`,
            messageContainer
          );
          break;
        default:
          setMessageContainer(
            `Ваш ход: <span class="circle">${currentPlayer}</span>`,
            messageContainer
          );
          break;
      }
      break;
  }
};

const updateScore = () => {
  if (playerMode) {
    setMessageContainer(
      ` <span class="cross">X - ${xPlayerWins}</span> <span class="circle">O - ${oPlayerWins}</span>`,
      counterContainer
    );
  } else {
    setMessageContainer(
      ` <span class="cross">X - ${xRobotWins}</span> <span class="circle">O - ${oRobotWins}</span>`,
      counterContainer
    );
  }
  setLocalStorage("xPlayerWins", xPlayerWins); // Сохраняем количество побед X игрока на 1 год
  setLocalStorage("oPlayerWins", oPlayerWins); // Сохраняем количество побед O игрока на 1 год
  setLocalStorage("xRobotWins", xRobotWins); // Сохраняем количество побед X робота на 1 год
  setLocalStorage("oRobotWins", oRobotWins); // Сохраняем количество побед O робота на 1 год
};

const toggleMode = () => {
  robotMode = !robotMode;
  playerMode = !playerMode;
  modeSwitch.checked = robotMode;
  switch (lang) {
    case "en":
      playerModeText = "Two players";
      robotModeText = "Playing VS robot";
      break;
    case "tr":
      playerModeText = "Bir bilgisayİki oyuncu";
      robotModeText = "Robota karşı oyun";
      break;
    default:
      playerModeText = "Два игрока";
      robotModeText = "Игра против робота";
      break;
  }
  modeMessageContainer.innerText = robotMode ? robotModeText : playerModeText;
  restartGame();
};

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Функция для установки цвета при наведении на ячейку
const setHoverColor = () => {
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.addEventListener(
      isMobileDevice() ? "touchstart" : "mouseenter",
      () => {
        switch (currentPlayer) {
          case "X":
            cell.style.backgroundColor = "lightblue";
            break;
          case "O":
            cell.style.backgroundColor = "lightsalmon";
            break;
        }
      }
    );

    cell.addEventListener(isMobileDevice() ? "touchend" : "mouseleave", () => {
      cell.style.backgroundColor = "#ffffff";
    });
  });
};

// Устанавливаем цвет при загрузке страницы
setHoverColor();

// Постоянная проверка каждые 100 миллисекунд
setInterval(() => {
  setHoverColor();
}, 100);
