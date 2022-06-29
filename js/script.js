// game 
let blocksParent = document.getElementById(`game-blocks`);
let blocks = [...document.getElementById(`game-blocks`).children];
let activeBlocks = [];
let firstBlock, secondBlock;
let wrongTries = 0;
let confettiSettings = { target: 'my-canvas', rotate: true, max: 500, size: 1.3, respawn: false, clock: 50, start_from_edge: true };
let canvasEl = document.getElementById(`my-canvas`);
let bestScore = -1;
let won = 0;
let statusEl = document.getElementById(`status`);
let newGameBtn = document.getElementById(`new-game`);
let settings = document.getElementById(`settings`);
// for the timer
let minutesEl = document.getElementById(`minutes`);
let secondsEl = document.getElementById(`seconds`);
let timeLeftEl = document.getElementById(`time-left`);
let intervals = [];

const startNewGame = (settings) => {
    // default settings no time , no maximum tries , 2 seconds preview time , name is unknown
    if (!settings.name) settings.name = `unknown`;
    if (!settings.previewDuration) settings.previewDuration = 2;
    // status element
    statusEl.textContent = `waiting...`;
    // set the name of the player
    document.getElementById(`name`).textContent = settings.name;
    // lose if time ends
    if (settings.maximumTime) {
        timer(+settings.maximumTime);
        setTimeout(() => {
            if (!won) {
                new Audio('sounds/lose.wav').play();
                blocksParent.style.pointerEvents = `none`;
                statusEl.innerHTML = `You Lose &#x1F62B;`;
            }
        }, +settings.maximumTime * 60 * 1000);
    }
    // reset
    canvasEl.style.display = `none`;
    wrongTries = 0;
    document.getElementById(`wrong-tries`).textContent = wrongTries;

    // shuffle the blocks
    blocks.map((b, i) =>
        blocksParent.appendChild(blocksParent.children[Math.random() * (blocks.length - i) | 0])
    );

    // take a glance at the blocks
    blocks.map(block => block.classList.add(`active`));
    blocksParent.style.pointerEvents = `none`;
    setTimeout(() => {
        blocks.map(block => block.classList.remove(`active`));
        blocksParent.style.pointerEvents = `all`;
    }, +settings.previewDuration * 1000);

    // what will happen when you click on a block
    blocks.map((block, index) => {
        block.onclick = () => {
            if (!block.classList.contains(`active`)) {
                block.classList.add(`active`);
                activeBlocks.push(index);
                if (activeBlocks.length === 2) {
                    if (blocks[activeBlocks[0]].getAttribute(`data-tech`) !== blocks[activeBlocks[1]].getAttribute(`data-tech`)) {
                        firstBlock = blocks[activeBlocks[0]];
                        secondBlock = blocks[activeBlocks[1]];
                        setTimeout(() => {
                            firstBlock.classList.remove(`active`);
                            secondBlock.classList.remove(`active`);
                        }, 500);
                        document.getElementById(`wrong-tries`).textContent = ++wrongTries;
                        new Audio('sounds/wrong.wav').play();
                        if (wrongTries === +settings.maximumTries) {
                            new Audio('sounds/lose.wav').play();
                            blocksParent.style.pointerEvents = `none`;
                            statusEl.innerHTML = `You Lose &#128555;`;
                            // stop the timer
                            intervals.map(interval => clearInterval(interval));
                        }
                    } else {
                        new Audio('sounds/correct.wav').play();
                    }
                    activeBlocks = [];
                }
            }
            // if all is active start confetti ! YOU WON
            if (blocks.every(b => b.classList.contains(`active`))) {
                // update status
                won = 1;
                // update the status element
                statusEl.innerHTML = `You Won &#129327;`;
                // confetti canvas 
                canvasEl.style.display = `block`;
                let confetti = new ConfettiGenerator(confettiSettings);
                confetti.render();
                // start the won audio
                new Audio('sounds/You Won!!.wav').play();
                // stop the timer
                intervals.map(interval => clearInterval(interval));
                // check best score
                if (bestScore === -1) bestScore = wrongTries;
                else {
                    if (wrongTries < bestScore) bestScore = wrongTries;
                }
                document.getElementById(`best-score`).textContent = bestScore;
            }
        };
    });
};

newGameBtn.onclick = () => {
    let name = document.getElementById(`user-name`).value;
    let previewDuration = document.getElementById(`preview-duration`).value;
    let maximumTime = document.getElementById(`maximum-time`).value;
    let maximumTries = document.getElementById(`maximum-tries`).value;
    startNewGame({ name, previewDuration, maximumTime, maximumTries });
    settings.classList.remove(`active`);
};
document.getElementById(`toggle-settings`).onclick = () => {
    settings.classList.toggle(`active`);
};

const timer = (minutes) => {
    intervals.map(interval => clearInterval(interval));
    intervals = [];
    minutesEl.textContent = Math.trunc(minutes);
    secondsEl.textContent = Math.fround(minutes % 1);
    intervals.push(setInterval(() => {
        if (+secondsEl.textContent <= 0 && +minutesEl.textContent <= 0) {
            intervals.map(interval => clearInterval(interval));
            intervals = [];
        } else if (+secondsEl.textContent <= 0) {
            secondsEl.textContent = 59;
            minutesEl.textContent -= 1;
        } else {
            secondsEl.textContent -= 1;
        }
    }, 1000));
};
