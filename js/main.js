let currentPlayer;
let cells = document.querySelectorAll('.cell');

let gameOver = false;
let xPlayerWins = 0;
let oPlayerWins = 0;
let xRobotWins = 0;
let oRobotWins = 0;
let robotMode = false;
let playerMode = true;

// Yandex 
let gameStartCounter = 1;
YaGames.init().then(ysdk => ysdk.adv.showFullscreenAdv())

// UI Message
let messageContainer = document.getElementById('message_container');
let counterContainer = document.getElementById('counter_container');
let modeMessageContainer = document.getElementById('mode_message_container');

// UI Control
let restartButton = document.getElementById('restart_button');
let modeButton = document.getElementById('mode_button');
let modeSwitch = document.getElementById('mode_switch');

const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
};

const getCookie = (name) => {
    const cookieName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(cookieName) == 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
};

console.log("cookie:", getCookie());

const setMessageContainer = (message, container) => {
    container.innerHTML = message;
}

const randomizeCurrentPlayer = () => {
    currentPlayer = Math.random() >= 0.5 ? 'X' : 'O';
    console.log(currentPlayer);
    if (currentPlayer === 'O') {
        setMessageContainer(`Ход противника: <span class="circle">${currentPlayer}</span>`, messageContainer);
        playBot();
    } else {
        setMessageContainer(`Ваш ход: <span class="cross">${currentPlayer}</span>`, messageContainer);
    }
}


const startGame = () => {
    // restartButton.disabled = true; // Делаем кнопку перезагрузки неактивной при загрузке страницы
    // restartButton.style.cursor = 'not-allowed';
    xPlayerWins = parseInt(getCookie("xPlayerWins")) || 0;
    oPlayerWins = parseInt(getCookie("oPlayerWins")) || 0;
    xRobotWins = parseInt(getCookie("xRobotWins")) || 0;
    oRobotWins = parseInt(getCookie("oRobotWins")) || 0;

    randomizeCurrentPlayer();
    if (currentPlayer === 'O') {
        setMessageContainer(`Ход противника: <span class="circle">${currentPlayer}</span>`, messageContainer);
        playBot();
    } else {
        setMessageContainer(`Ваш ход: <span class="cross">${currentPlayer}</span>`, messageContainer);
    }
    if (playerMode) {
        setMessageContainer(` <span class="cross">X - ${xPlayerWins}</span> <span class="circle">O - ${oPlayerWins}</span>`, counterContainer);
    } else {
        setMessageContainer(` <span class="cross">X - ${xRobotWins}<span class="circle">O - ${oRobotWins}</span>`, counterContainer);
    }
    // toggleMode();
}

window.onload = startGame;

const cellClicked = (event) => {
    if (gameOver || (currentPlayer === 'O' && robotMode && !playerMode)) return;

    let cell = event.target;
    if (cell.textContent === '') {
        cell.textContent = currentPlayer;
        cell.style.border = '4px solid';
        cell.classList.remove('pointer'); // Убираем класс 'pointer'
        cell.classList.add(currentPlayer === 'X' ? 'cross' :
            'circle'); // Добавляем класс в зависимости от текущего игрока
        cell.classList.add('closed'); // Устанавливаем курсор для занятой ячейки

        if (checkWin()) {

            if (currentPlayer === 'X') {
                setMessageContainer(`Вы выиграли: <span class="cross">${currentPlayer}</span>!`, messageContainer);
                restartButton.disabled = false;
                restartButton.style.cursor = 'pointer';
                if (playerMode) {
                    xPlayerWins++;
                } else {
                    xRobotWins++;
                }
            } else {
                restartButton.disabled = false;
                restartButton.style.cursor = 'pointer';
                setMessageContainer(`Ваш противник выиграл: <span class="circle">${currentPlayer}</span>!`, messageContainer);
                if (playerMode) {
                    oPlayerWins++;
                } else {
                    oRobotWins++;
                }
            }
            updateScore();
            gameOver = true;
            cells.forEach(cell => {
                cell.classList.add('closed');
            });
            return;
        }
        if (checkDraw()) {
            setMessageContainer('Ничья!', messageContainer);
            restartButton.disabled = false;
            restartButton.style.cursor = 'pointer';
            gameOver = true;
            return;
        }
        switch (currentPlayer) {
            case 'X':
                currentPlayer = 'O';
                console.log(87);
                setMessageContainer(`Ход противника: <span class="circle">${currentPlayer}</span>`, messageContainer);
                break;
            case 'O':
                currentPlayer = 'X';
                setMessageContainer(`Ваш ход: <span class="cross">${currentPlayer}</span>`, messageContainer);
                break;
        }
    }
    if (currentPlayer === 'O' && robotMode && !playerMode) {
        playBot();
    }
}

const checkWin = () => {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];



    for (let line of lines) {
        let [a, b, c] = line;
        if (cells[a].textContent !== '' && cells[a].textContent === cells[b].textContent && cells[a]
            .textContent === cells[c].textContent) {
            return true;
        }
    }

    return false;
}

const checkDraw = () => {
    return [...cells].every(cell => cell.textContent !== '');
}

const getRandomMove = (board) => {
    let emptyCells = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i].textContent === '') {
            emptyCells.push(i);
        }
    }
    if (emptyCells.length > 0) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else {
        return undefined;
    }
}

const playBot = () => {
    if (gameOver || (currentPlayer === 'X' && !robotMode) || playerMode) return;

    setTimeout(() => {
        const randomProbability = Math.random() * 0.1 + 0.30;
        if (Math.random() < randomProbability) {
            let randomMove = getRandomMove(cells);
            if (randomMove !== undefined) {
                currentPlayer = 'X';
                cells[randomMove].textContent = 'O';
                cells[randomMove].style.border = '4px solid';
                cells[randomMove].classList.add('circle');
                cells[randomMove].classList.add('closed');
            }
        } else {
            let bestMove = getBestMove(cells, -Infinity, Infinity, true);

            currentPlayer = 'X';
            if (bestMove !== undefined) {
                cells[bestMove].textContent = 'O';
                cells[bestMove].style.border = '4px solid';
                cells[bestMove].classList.add('circle');
                cells[bestMove].classList.add('closed');
            }
        }

        if (checkWin()) {
            // Обновляем сообщение о победе и обновляем счет
            setMessageContainer(`Ваш противник выиграл: <span="circle">O</span>!`, messageContainer);
            oRobotWins++;
            updateScore();
            restartButton.disabled = false;
            restartButton.style.cursor = 'pointer';
            gameOver = true;
            cells.forEach(cell => {
                cell.classList.add('closed');
            });
            return;
        }
        if (checkDraw()) {
            // Выводим сообщение о ничьей и активируем кнопку перезапуска
            setMessageContainer('Ничья!', messageContainer);
            restartButton.disabled = false;
            restartButton.style.cursor = 'pointer';
            gameOver = true;
            return;
        }

        // Выводим сообщение о ходе следующего игрока
        setMessageContainer(`Ваш ход: <span class="cross">X</span>`, messageContainer);
    }, Math.floor(Math.random() * 800) + 300);
}

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
        if (board[i].textContent === '') {
            board[i].textContent = isMaximizing ? 'O' : 'X';
            let score = minimax(board, alpha, beta, !isMaximizing);
            board[i].textContent = '';
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
}

const minimax = (board, alpha, beta, isMaximizing) => {
    if (checkWin()) {
        return isMaximizing ? -10 : 10;
    }
    if (checkDraw()) {
        return 0;
    }

    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (let i = 0; i < board.length; i++) {
        if (board[i].textContent === '') {
            board[i].textContent = isMaximizing ? 'O' : 'X';
            let score = minimax(board, alpha, beta, !isMaximizing);
            board[i].textContent = '';
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
}

restartButton.addEventListener('click', () => {
    if (gameOver) {
        restartGame();
    }
});

const restartGame = () => {
    // restartButton.disabled = true; // Делаем кнопку перезагрузки неактивной при загрузке страницы
    // restartButton.style.cursor = 'not-allowed';
    gameOver = false;
    gameStartCounter++;

    if (gameStartCounter == 3) {
        ysdk.feedback.canReview()
            .then(({ value, reason }) => {
                if (value) {
                    ysdk.feedback.requestReview()
                        .then(({ feedbackSent }) => {
                            console.log(feedbackSent);
                        })
                } else {
                    console.log(reason)
                }
            })
    }
    else if (gameStartCounter % 10 == 0) {
        ysdk.adv.showRewardedVideo({
            callbacks: {
                onOpen: () => {
                    console.log('Video ad open.');
                },
                onRewarded: () => {
                    console.log('Rewarded!');
                },
                onClose: () => {
                    console.log('Video ad closed.');
                },
                onError: (e) => {
                    console.log('Error while open video ad:', e);
                }
            }
        })

    }
    cells.forEach(cell => {
        cell.style.border = '4px solid grey';
    });

    switch (currentPlayer) {
        case 'X':
            currentPlayer = 'O';
            console.log(254);
            setMessageContainer(`Ход противника: <span class="circle">${currentPlayer}</span>`, messageContainer);
            break;
        case 'O':
            currentPlayer = 'X';
            setMessageContainer(`Ваш ход: <span class="cross">${currentPlayer}</span>`, messageContainer);
            break;
    }

    randomizeCurrentPlayer();
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('closed');
        cell.classList.remove('circle');
        cell.classList.remove('cross');
    });
    updateScore();
}

const switchPlayer = () => {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    switch (currentPlayer) {
        case 'X':
            setMessageContainer(`Ход противника: <span class="cross">${currentPlayer}</span>`, messageContainer);
            break;
        case 'O':
            setMessageContainer(`Ваш ход: <span class="circle">${currentPlayer}</span>`, messageContainer);
            break;
    }
}

const updateScore = () => {
    if (playerMode) {
        setMessageContainer(` <span class="cross">X - ${xPlayerWins}</span> <span class="circle">O - ${oPlayerWins}</span>`, counterContainer);
    } else {
        setMessageContainer(` <span class="cross">X - ${xRobotWins}</span> <span class="circle">O - ${oRobotWins}</span>`, counterContainer);
    }
    setCookie("xPlayerWins", xPlayerWins, 365); // Сохраняем количество побед X игрока на 1 год
    setCookie("oPlayerWins", oPlayerWins, 365); // Сохраняем количество побед O игрока на 1 год
    setCookie("xRobotWins", xRobotWins, 365); // Сохраняем количество побед X робота на 1 год
    setCookie("oRobotWins", oRobotWins, 365); // Сохраняем количество побед O робота на 1 год
}

const toggleMode = () => {
    robotMode = !robotMode;
    playerMode = !playerMode;
    modeSwitch.checked = robotMode;
    modeMessageContainer.innerText = robotMode ? 'Игра с роботом' : 'Игра на одном компьютере';
    restartGame();
}

const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Функция для установки цвета при наведении на ячейку
const setHoverColor = () => {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener(isMobileDevice() ? 'touchstart' : 'mouseenter', () => {
            switch (currentPlayer) {
                case 'X':
                    cell.style.backgroundColor = 'lightblue';
                    break;
                case 'O':
                    cell.style.backgroundColor = 'salmon';
                    break;
            }
        });

        cell.addEventListener(isMobileDevice() ? 'touchend' : 'mouseleave', () => {
            cell.style.backgroundColor = '#ffffff';
        });
    });
};

window.addEventListener('beforeunload', function (event) {
    let userPointsLb;
    ysdk.getLeaderboards()
        .then(lb => lb.getLeaderboardPlayerEntry('userPoints'))
        .then(res => {
            userPointsLb = res;
            console.log(res)
        })
        .catch(err => {
            if (err.code === 'LEADERBOARD_PLAYER_NOT_PRESENT') {
                // Срабатывает, если у игрока нет записи в лидерборде
            }
        });
    if (xRobotWins > userPointsLb)
        ysdk.getLeaderboards()
            .then(lb => {
                // Без extraData
                lb.setLeaderboardScore('userPoints', xRobotWins);
            });
});


// Устанавливаем цвет при загрузке страницы
setHoverColor();

// Постоянная проверка каждые 100 миллисекунд
setInterval(() => {
    setHoverColor();
}, 100);