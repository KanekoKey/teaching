// --- あたりボックスゲーム (クラス版) ---
class Game {
    // ゲームの初期設定を行う部分
    constructor(gameBoardId, historyId, gameInfoId, boxCount) {
        // 各要素を取得して、this.変数に格納
        this.gameBoard = document.getElementById(gameBoardId);
        this.history = document.getElementById(historyId);
        this.gameInfo = document.getElementById(gameInfoId);
        this.gameScore = this.gameInfo.querySelector(".game-score");
        this.resetButton = this.gameInfo.querySelector(".reset-button");

        // ゲームが見つからなかったら処理を中断
        if (!this.gameBoard || !this.history || !this.gameInfo) {
            console.error("ゲームのHTML要素が見つかりません。IDを確認してください:", gameBoardId);
            return;
        }

        this.historyList = this.history.querySelector(".history-list");

        // ゲームの状態を管理する変数W
        this.boxCount = boxCount;
        this.winningBoxIndex = 0;
        this.playCount = 0;
        this.tryCount = 0;
        this.totalScore = 0;
        this.minTryCount = Infinity;
        this.maxTryCount = 0;

        // イベントリスナーを設定 (this.setupGameを束縛)
        this.resetButton.addEventListener("click", this.setupGame.bind(this));

        // 最初のゲームを開始
        this.setupGame();
    }

    // --- ゲームをセットアップする関数 ---
    setupGame() {
        this.gameBoard.innerHTML = "";
        this.winningBoxIndex = Math.floor(Math.random() * this.boxCount);
        this.resetButton.disabled = true;
        this.tryCount = 0;

        for (let i = 0; i < this.boxCount; i++) {
            const box = document.createElement("div");
            box.classList.add("box");
            box.textContent = i + 1;

            // ボックスがクリックされた時の処理
            const handleClick = () => {
                if (box.classList.contains("revealed")) {
                    return;
                }
                box.classList.add("revealed");
                this.tryCount++;

                if (i === this.winningBoxIndex) {
                    box.textContent = "あたり";
                    box.classList.add("win");
                    this.endGame();
                } else {
                    box.textContent = this.getHintText(i);
                    box.classList.add("lose");
                }
            };

            box.addEventListener("click", handleClick);
            this.gameBoard.appendChild(box);
        }
    }
    getHintText(clickedIndex) {
        // 通常のゲームでは、常に "外れ" を返す
        return "外れ";
    }

    // --- ゲーム終了時の処理 ---
    endGame() {
        this.playCount++;
        this.totalScore += this.tryCount;
        this.minTryCount = Math.min(this.minTryCount, this.tryCount);
        this.maxTryCount = Math.max(this.maxTryCount, this.tryCount);

        this.resetButton.disabled = false;

        // すべてのボックスをクリック不可に
        this.gameBoard.querySelectorAll(".box").forEach((b) => {
            if (!b.classList.contains("revealed")) {
                b.classList.add("revealed");
            }
        });

        this.updateScore();
        this.updateStats();
        this.updateHistoryList();
    }

    updateScore() {
        this.gameScore.textContent = `Score: ${this.tryCount}`;
    }

    // --- 統計情報を更新 ---
    updateStats() {
        this.history.querySelector(".max-try").textContent = this.maxTryCount;
        this.history.querySelector(".min-try").textContent = this.minTryCount === Infinity ? 0 : this.minTryCount;
        this.history.querySelector(".avg-try").textContent = this.totalScore ? (this.totalScore / this.playCount).toFixed(2) : 0;
    }

    updateHistoryList() {
        const li = document.createElement("li");
        li.textContent = `Score: ${this.tryCount}`;
        this.historyList.insertBefore(li, this.historyList.firstChild);
    }
}

class BinaryGame extends Game {
    // getHintText メソッドだけをオーバーライドする
    getHintText(clickedIndex) {
        // クリックした場所(clickedIndex)と正解(winningBoxIndex)を比較
        if (clickedIndex < this.winningBoxIndex) {
            return "もっと後ろ ▶";
        } else {
            return "もっと前 ◀";
        }
    }
}

// --- ゲームのインスタンスを生成 ---
const pageId = document.body.id;
if (pageId === "search1") {
    linearGame = new Game("linear-game-board", "linear-history", "linear-game-info", 10);
} else if (pageId === "search2") {
    binaryGame = new Game("binary-game-board", "binary-history", "binary-game-info", 100);
}