let startTime, attempts, secretCode, currentLevel = 1, timerInterval;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startGame').addEventListener('click', () => {
        startGame();
    });

    document.getElementById('submitGuess').addEventListener('click', () => {
        const guess = document.getElementById('guessInput').value;
        attemptGuess(guess);
    });

    document.getElementById('giveUp').addEventListener('click', giveUp);

    // Initially display all leaderboards on load
    for (let i = 1; i <= 3; i++) {
        displayLeaderboard(i);
    }
});

function startGame() {
    currentLevel = parseInt(document.getElementById('levelSelect').value, 10);
    secretCode = generateSecretCode(currentLevel);
    attempts = 0;
    document.getElementById('history').innerHTML = ''; // Clear history
    document.getElementById('gamePlayArea').classList.remove('hidden');
    document.getElementById('giveUp').classList.remove('hidden');
    document.getElementById('startGame').disabled = true; // Disable start until game is reset or advanced to next level
    resetTimer();
    console.log(`Secret Code for Level ${currentLevel}: ${secretCode}`); // For debugging, remove for production
}

function generateSecretCode(level) {
    let code = "";
    let characters;
    switch (level) {
        case 1:
            characters = "0123456789"; // Numbers only
            for (let i = 0; i < 4; i++) {
                code += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            break;
        case 2:
            characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; // Numbers and letters
            for (let i = 0; i < 5; i++) {
                code += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            break;
        case 3:
            characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()"; // Including symbols
            for (let i = 0; i < 6; i++) {
                code += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            break;
        default:
            code = "0000"; // Default case to avoid errors
    }
    return code;
}


function attemptGuess(guess) {
    if (!timerInterval) startTimer(); // Start or restart the timer
    attempts++;
    const feedback = checkGuess(guess, secretCode);
    updateHistory(guess, feedback);

    if (feedback.correctPositions === secretCode.length) {
        const timeTaken = stopTimer();
        const playerName = prompt("Great job! Enter your name for the leaderboard:");
        const score = calculateScore(timeTaken, attempts);
        updateLeaderboard(playerName, score, currentLevel);
        displayLeaderboard(currentLevel);
        
        if (currentLevel < 3) {
            currentLevel++;
            alert(`Moving on to Level ${currentLevel}. Get ready!`);
            setupLevel(currentLevel); // Prepare next level
        } else {
            alert("You've completed all levels!");
            endGame();
        }
    }
}

function giveUp() {
    alert("Better luck next time!");
    endGame();
}

function endGame() {
    currentLevel = 1; // Reset to level 1 for a new game
    setupLevel(currentLevel);
    document.getElementById('gamePlayArea').classList.add('hidden');
    document.getElementById('giveUp').classList.add('hidden');
    document.getElementById('startGame').disabled = false;
    stopTimer();
}

function setupLevel(level) {
    secretCode = generateSecretCode(level);
    console.log(`Secret Code for Level ${level}: ${secretCode}`);
    resetTimer(); // Ensure this is being called correctly
    startTimer(); // Start the timer after resetting it
}

function checkGuess(guess, code) {
    let correctPositions = 0, correctDigits = 0;
    let guessDigits = guess.split('');
    let codeDigits = code.split('');

    guessDigits.forEach((digit, index) => {
        if (digit === codeDigits[index]) {
            correctPositions++;
            guessDigits[index] = codeDigits[index] = '-';
        }
    });

    guessDigits.forEach((digit, index) => {
        if (digit !== '-' && codeDigits.includes(digit)) {
            correctDigits++;
            codeDigits[codeDigits.indexOf(digit)] = '-';
        }
    });

    return { correctPositions, correctDigits };
}

function updateHistory(guess, feedback) {
    const historyElement = document.getElementById('history');
    historyElement.innerHTML += `<div>Guess ${attempts}: ${guess} - Correct Positions: ${feedback.correctPositions}, Correct Digits: ${feedback.correctDigits}</div>`;
}

function calculateScore(timeTaken, attempts) {
    const baseScore = 10000;
    const timePenalty = timeTaken * 50;
    const attemptPenalty = (attempts - 1) * 100;
    return Math.max(baseScore - timePenalty - attemptPenalty, 0);
}

function updateLeaderboard(name, score, level) {
    const leaderboardKey = `leaderboardLevel${level}`;
    const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard.slice(0, 10))); // Keep top 10
}

function displayLeaderboard(level) {
    const leaderboardList = document.getElementById(`leaderboardLevel${level}`);
    leaderboardList.innerHTML = `<h3>Level ${level} Top Scores</h3>`; // Clear current leaderboard entries
    const leaderboardKey = `leaderboardLevel${level}`;
    const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];
    leaderboard.forEach((entry, index) => {
        leaderboardList.innerHTML += `<li>${index + 1}. ${entry.name}: ${entry.score}</li>`;
    });
}

function startTimer() {
    const timerElement = document.getElementById('timer');
    startTime = new Date();
    timerInterval = setInterval(() => {
        const now = new Date();
        const elapsedTime = Math.round((now - startTime) / 1000);
        timerElement.textContent = `Time: ${formatTime(elapsedTime)}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    const now = new Date();
    return Math.round((now - startTime) / 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    document.getElementById('timer').textContent = "Time: 00:00";
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
