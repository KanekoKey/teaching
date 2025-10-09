// --- あたりボックスゲーム (クラス版) ---
class Game {
    // ゲームの初期設定を行う部分
    constructor(gameBoardId, historyId, resetId) {
        // 各要素を取得して、this.変数に格納
        this.gameBoard = document.getElementById(gameBoardId);
        this.history = document.getElementById(historyId);
        this.resetButton = document.getElementById(resetId);

        // ゲームが見つからなかったら処理を中断
        if (!this.gameBoard || !this.history || !this.resetButton) {
            console.error("ゲームのHTML要素が見つかりません。IDを確認してください:", gameBoardId);
            return;
        }

        this.historyList = this.history.querySelector(".history-list");

        // ゲームの状態を管理する変数
        this.boxCount = 10;
        this.winningBoxIndex = 0;
        this.playCount = 0;
        this.tryCount = 0;
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
        this.minTryCount = Math.min(this.minTryCount, this.tryCount);
        this.maxTryCount = Math.max(this.maxTryCount, this.tryCount);

        this.resetButton.disabled = false;

        // すべてのボックスをクリック不可に
        this.gameBoard.querySelectorAll(".box").forEach((b) => {
            if (!b.classList.contains("revealed")) {
                b.classList.add("revealed");
            }
        });

        this.updateStats();
        this.updateHistoryList();
    }

    // --- 統計情報を更新 ---
    updateStats() {
        this.history.querySelector(".max-try").textContent = this.maxTryCount;
        this.history.querySelector(".min-try").textContent = this.minTryCount === Infinity ? 0 : this.minTryCount;

        let sum = 0;
        this.historyList.querySelectorAll("li").forEach(li => {
            const n = parseInt(li.textContent);
            if (!isNaN(n)) {
                sum += n;
            }
        });
        const count = this.historyList.children.length;
        this.history.querySelector(".avg-try").textContent = count ? (sum / count).toFixed(2) : 0;
    }

    updateHistoryList() {
        const li = document.createElement("li");
        li.textContent = `${this.tryCount}回`;
        this.historyList.insertBefore(li, this.historyList.firstChild);
    }
}

class BinaryGame extends Game {
    // getHintText メソッドだけをオーバーライドする
    getHintText(clickedIndex) {
        // クリックした場所(clickedIndex)と正解(winningBoxIndex)を比較
        if (clickedIndex < this.winningBoxIndex) {
            return "もっと右 ▶";
        } else {
            return "もっと左 ◀";
        }
    }
}

// --- ゲームのインスタンスを生成 ---
// 1つ目のゲームを作成
linearGame = new Game("linear-game-board", "linear-history", "linear-reset-button");

// 2つ目のゲームを作成
binaryGame = new BinaryGame("binary-game-board", "binary-history", "binary-reset-button");