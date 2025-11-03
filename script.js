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

            box.addEventListener("click", this.handleBoxClick.bind(this, i, box));
            this.gameBoard.appendChild(box);
        }
    }

    // (setupGame 内にあった handleClick のロジックを移動)
    handleBoxClick(i, box) {
        // すでにめくられている場合は何もしない
        if (box.classList.contains("revealed")) {
            return;
        }
        
        box.classList.add("revealed");
        this.tryCount++; // 試行回数を増やす

        if (i === this.winningBoxIndex) {
            // あたりの場合
            box.textContent = "あたり";
            box.classList.add("win");
            this.endGame(); // ゲーム終了処理
        } else {
            // はずれの場合
            box.textContent = this.getHintText(i);
            box.classList.add("lose");
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
            return "▶";
        } else {
            return "◀";
        }
    }
}

// --- 線形探索のコード ---
class LinearSearchGame extends Game {

    constructor(gameBoardId, historyId, gameInfoId, boxCount) {
        // 親クラス(Game)の constructor を実行
        super(gameBoardId, historyId, gameInfoId, boxCount);

        // HTMLで追加した「自動で探す」ボタンを取得
        this.autoSearchButton = this.gameInfo.querySelector(".linear-button");
        if (this.autoSearchButton) {
            // ボタンがクリックされたら startAutoSearch メソッドを実行
            this.autoSearchButton.addEventListener("click", this.startAutoSearch.bind(this));
        }
    }

    // --- setupGame を上書き(オーバーライド) ---
    // (自動探索デモ用に、ボックスのクリックを無効化する)
    setupGame() {
        // 親の setupGame のロジックをほぼコピー
        this.gameBoard.innerHTML = "";
        this.winningBoxIndex = Math.floor(Math.random() * this.boxCount);
        this.resetButton.disabled = true;
        this.tryCount = 0;

        // 自動探索ボタンを有効化
        if (this.autoSearchButton) {
            this.autoSearchButton.disabled = false;
        }

        for (let i = 0; i < this.boxCount; i++) {
            const box = document.createElement("div");
            box.classList.add("box");
            box.textContent = i + 1;
            
            // ★★★ 親と違う点 ★★★
            // box.addEventListener を実行しない
            // これにより、個別のボックスをクリックできなくする
            
            this.gameBoard.appendChild(box);
        }
    }

    // --- 自動探索を実行するメソッド (async) ---
    async startAutoSearch() {
        // 探索中はリセットボタンと自動探索ボタンを無効化
        this.resetButton.disabled = true;
        if (this.autoSearchButton) {
            this.autoSearchButton.disabled = true;
        }

        const boxes = this.gameBoard.children;
        let found = false;

        for (let i = 0; i < this.boxCount; i++) {
            const box = boxes[i];
            
            // 親クラスの「ボックスをめくる」処理を呼び出す
            this.handleBoxClick(i, box);

            // もし「あたり」なら found を true にする
            if (i === this.winningBoxIndex) {
                found = true;
            }

            // --- ここで遅延を発生させる ---
            // 300ミリ秒 (0.3秒) 待つ
            await new Promise(resolve => setTimeout(resolve, 300));

            // 「あたり」を見つけたらループを抜ける
            if (found) {
                break;
            }
        }

        // ループが終わったらリセットボタンだけ有効化
        this.resetButton.disabled = false;
    }

    // --- endGame も上書き ---
    // (自動探索ボタンを無効化するため)
    endGame() {
        super.endGame(); // まず親の endGame を実行
        if (this.autoSearchButton) {
            this.autoSearchButton.disabled = true;
        }
    }
}

// --- 二分探索のコード ---
class BinarySearchGame extends BinaryGame { // ★GameではなくBinaryGameを継承
    
    constructor(gameBoardId, historyId, gameInfoId, boxCount) {
        // 親クラス(BinaryGame)の constructor を実行
        super(gameBoardId, historyId, gameInfoId, boxCount);

        // HTMLで追加した「自動で探す」ボタンを取得
        this.autoSearchButton = this.gameInfo.querySelector(".binary-button");
        if (this.autoSearchButton) {
            // ボタンがクリックされたら startAutoSearch メソッドを実行
            this.autoSearchButton.addEventListener("click", this.startAutoSearch.bind(this));
        }
    }

    // --- setupGame を上書き(オーバーライド) ---
    // (自動探索デモ用に、ボックスのクリックを無効化する)
    setupGame() {
        // 親の setupGame のロジックをほぼコピー
        this.gameBoard.innerHTML = "";
        this.winningBoxIndex = Math.floor(Math.random() * this.boxCount);
        this.resetButton.disabled = true;
        this.tryCount = 0;

        // 自動探索ボタンを有効化
        if (this.autoSearchButton) {
            this.autoSearchButton.disabled = false;
        }

        for (let i = 0; i < this.boxCount; i++) {
            const box = document.createElement("div");
            box.classList.add("box");
            box.textContent = i + 1;
            
            // ★★★ 親と違う点 ★★★
            // box.addEventListener を実行せず、手動クリックを無効化
            
            this.gameBoard.appendChild(box);
        }
    }

    // --- 自動二分探索を実行するメソッド (async) ---
    async startAutoSearch() {
        // 探索中はリセットボタンと自動探索ボタンを無効化
        this.resetButton.disabled = true;
        if (this.autoSearchButton) {
            this.autoSearchButton.disabled = true;
        }

        const boxes = this.gameBoard.children;

        // 二分探索の範囲
        let low = 0;
        let high = this.boxCount - 1;

        // low <= high の間、ループを続ける
        while (low <= high) {
            // 真ん中のインデックスを計算
            const mid = Math.floor((low + high) / 2);
            
            const box = boxes[mid];

            // 親クラスの「ボックスをめくる」処理を呼び出す
            this.handleBoxClick(mid, box);

            // --- ここで遅延を発生させる ---
            // 二分探索は飛ぶので、ゆっくり 0.8秒 待つ
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 当たったかどうかを判定 (endGameが呼ばれるとresetButtonが有効になる)
            if (this.resetButton.disabled === false) {
                break; // 当たったのでループ終了
            }

            // --- 当たってない場合、ヒントに基づき範囲を狭める ---
            if (mid < this.winningBoxIndex) {
                // 「もっと後ろ」の場合
                low = mid + 1; // 範囲の下限を mid の次 にする
            } else {
                // 「もっと前」の場合
                high = mid - 1; // 範囲の上限を mid の前 にする
            }
        }
        
        // ループが終わったらリセットボタンを有効化 (念のため)
        this.resetButton.disabled = false;
    }

    // --- endGame も上書き ---
    // (自動探索ボタンを無効化するため)
    endGame() {
        super.endGame(); // まず親の endGame を実行
        if (this.autoSearchButton) {
            this.autoSearchButton.disabled = true;
        }
    }
}

// --- ゲームのインスタンスを生成 ---
const pageId = document.body.id;
if (pageId === "search1") {
    game1 = new Game("game-board-1", "history-1", "game-info-1", 15);
} else if (pageId === "search2") {
    binaryGame = new Game("binary-game-board", "binary-history", "binary-game-info", 100);
} else if (pageId === "search4") {
    game3 = new LinearSearchGame("game-board-3", "history-3", "game-info-3", 15);
} else if (pageId === "search5") {
    game3 = new BinarySearchGame("game-board-4", "history-4", "game-info-4", 15);
}
