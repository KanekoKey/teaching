// --- 初期設定 ---
const gameBoard = document.getElementById("game-board");
const resetButton = document.getElementById("reset-button");
const historyList = document.getElementById("history-list");
const boxCount = 10;
let winningBoxIndex;
let playCount = 0;
let tryCount;
let minTryCount = Infinity;
let maxTryCount = 0;

// --- ゲームをセットアップする関数 ---
function setupGame() {
    gameBoard.innerHTML = "";
    winningBoxIndex = Math.floor(Math.random() * boxCount);

    // 「もう一度ボタン」を無効化
    resetButton.disabled = true;

    // 回数リセット
    tryCount = 0;

    for (let i = 0; i < boxCount; i++) {
        const box = document.createElement("div");
        box.classList.add("box");
        box.textContent = i + 1; // ボックスに番号を表示

        // ボックスがクリックされた時の処理を設定
        box.addEventListener(
            "click",
            function () {
                // すでに開封済みの場合は何もしない
                if (box.classList.contains("revealed")) {
                    return;
                }
                box.classList.add("revealed");

                // 回数カウント
                tryCount++;

                // あたりかどうかを判定
                if (i === winningBoxIndex) {
                    box.textContent = "あたり";
                    box.classList.add("win");
                    endGame();
                } else {
                    box.textContent = "外れ";
                    box.classList.add("lose");
                }
            },
            { once: true }
        );

        gameBoard.appendChild(box);
    }
}

function endGame() {
    playCount++;
    minTryCount = Math.min(minTryCount, tryCount);
    maxTryCount = Math.max(maxTryCount, tryCount);

    resetButton.disabled = false;
    const allBoxes = document.querySelectorAll(".box");
    allBoxes.forEach((b) => b.classList.add("revealed"));

    const li = document.createElement("li");
    li.textContent = `${tryCount}回`;
    historyList.insertBefore(li, historyList.firstChild);

    updateStats();
}

function updateStats() {
    // 最大・最小・平均を表示
    document.getElementById("max-try").textContent = maxTryCount;
    document.getElementById("min-try").textContent = minTryCount === Infinity ? 0 : minTryCount;

    // 履歴から平均を計算
    let sum = 0;
    let count = 0;
    historyList.querySelectorAll("li").forEach(li => {
        const n = parseInt(li.textContent);
        if (!isNaN(n)) {
            sum += n;
            count++;
        }
    });
    document.getElementById("avg-try").textContent = count ? (sum / count).toFixed(2) : 0;
}

// --- イベントリスナー ---
resetButton.addEventListener("click", setupGame);

// --- 最初のゲームを開始 ---
setupGame();
