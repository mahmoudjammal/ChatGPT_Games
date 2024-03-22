document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const rollDiceButton = document.getElementById('roll-dice');
    const diceResult = document.getElementById('dice-result');
    const gameMessages = document.getElementById('game-messages');
    const scoreboard = document.getElementById('scoreboard');

    let player = { name: "Player", position: 0, treasures: 0, isHuman: true };
    let pc = { name: "PC", position: 0, treasures: 0, isHuman: false };
    let currentPlayerTurn = true;
    const winningTreasures = 5;

    // Initialize the game board
    for (let i = 0; i < 25; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        if (i === 0) {
            tile.style.backgroundColor = "green";
        } else {
            const random = Math.random();
            if (random < 0.15) tile.classList.add('treasure');
            else if (random < 0.3) tile.classList.add('challenge');
            else if (random < 0.45) tile.classList.add('event');
            else if (random < 0.6) tile.classList.add('portal');
        }
        board.appendChild(tile);
    }

    function updateBoard() {
        document.querySelectorAll('.tile').forEach((tile, index) => {
            tile.textContent = '';
            if (player.position === index) tile.textContent = 'P';
            if (pc.position === index) tile.textContent += tile.textContent ? '&PC' : 'PC';
        });
    }

    function updateScoreboard() {
        scoreboard.innerHTML = `${player.name}: ${player.treasures} Treasures, ${pc.name}: ${pc.treasures} Treasures`;
    }

    function checkForWin() {
        if (player.treasures >= winningTreasures) {
            alert(`${player.name} wins!`);
            window.location.reload();
        } else if (pc.treasures >= winningTreasures) {
            alert(`${pc.name} wins!`);
            window.location.reload();
        }
    }

    function rollDice() {
        return Math.floor(Math.random() * 6) + 1;
    }

    function moveCharacter(character) {
        const roll = rollDice();
        character.position = (character.position + roll) % 25;
        const currentTile = board.children[character.position];
        handleTileEffect(currentTile, character);

        diceResult.textContent = `${character.name} rolled: ${roll}`;
        updateBoard();
        updateScoreboard();
        checkForWin();

        if (character.isHuman) {
            currentPlayerTurn = false;
            pcTurn();
        } else {
            currentPlayerTurn = true;
        }
    }

    function handleTileEffect(tile, character) {
        if (tile.classList.contains('treasure')) {
            character.treasures++;
            tile.classList.remove('treasure');
            gameMessages.textContent = `${character.name} found a treasure!`;
        } else if (tile.classList.contains('challenge') && character.isHuman) {
            handleChallenge(character);
        } else if (tile.classList.contains('event')) {
            handleEvent(character);
        } else if (tile.classList.contains('portal')) {
            handlePortal(character);
        }
    }

    function handleChallenge(character) {
        if (!character.isHuman) return; // Skip challenge for PC
        const answer = prompt("What is the capital of France?");
        if (answer && answer.toLowerCase() === "paris") {
            character.treasures++;
            alert("Correct! You earned a treasure.");
        } else {
            alert("Incorrect. The correct answer is Paris.");
        }
    }

    function handleEvent(character) {
        const eventOutcome = Math.random();
        if (eventOutcome < 0.5) {
            character.treasures = Math.max(0, character.treasures - 1);
            gameMessages.textContent = `${character.name} encountered a thief and lost a treasure!`;
        } else {
            character.treasures++;
            gameMessages.textContent = `${character.name} found a hidden treasure!`;
        }
    }

    function handlePortal(character) {
        const newPosition = Math.floor(Math.random() * 24) + 1; // Avoid teleporting to the starting tile
        character.position = newPosition;
        gameMessages.textContent = `${character.name} used a magic portal and teleported!`;
    }

    function pcTurn() {
        if (!currentPlayerTurn) {
            setTimeout(() => {
                moveCharacter(pc);
            }, 1000);
        }
    }

    rollDiceButton.addEventListener('click', () => {
        if (currentPlayerTurn) moveCharacter(player);
    });

    updateBoard();
    updateScoreboard();
});
