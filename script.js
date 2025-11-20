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
        this.history.querySelector(".play-count").textContent = this.playCount;
    }

    updateHistoryList() {
        const li = document.createElement("li");
        li.textContent = `Score: ${this.tryCount}`;
        this.historyList.insertBefore(li, this.historyList.firstChild);
    }

    updateBoxCount(newCount) {
        // 数値を更新
        this.boxCount = newCount;

        // 統計情報をリセット
        this.playCount = 0;
        this.tryCount = 0;
        this.totalScore = 0;
        this.minTryCount = Infinity;
        this.maxTryCount = 0;

        // 履歴表示をクリア
        if (this.historyList) {
            this.historyList.innerHTML = "";
        }
        this.updateStats();

        // ゲーム盤面を作り直す
        this.setupGame();
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
    // --- 一撃成功をさせない処理 --- //
    // handleBoxClick(i, box) {
    //     // すでにめくられている場合は何もしない
    //     if (box.classList.contains("revealed")) {
    //         return;
    //     }

    //     box.classList.add("revealed");
    //     this.tryCount++; // 試行回数を増やす

    //     // ★追加ロジック： 1回目のクリック (tryCountが1) で、
    //     // かつ、当たり (i === winningBoxIndex) だった場合
    //     if (this.tryCount === 1 && i === this.winningBoxIndex) {

    //         // 1回目で当たってしまったら、当たりを「隣のボックス」にこっそり移動させる
    //         // (これで、今クリックした i は当たりではなくなる)
    //         // (boxCountで割った余りを使うと、最後のボックスでも0番に戻れる)
    //         this.winningBoxIndex = (this.winningBoxIndex + 1) % this.boxCount;

    //         // ※もし移動先(i+1)もたまたまクリック済みだったら...という心配は不要
    //         //   (1回目のクリックなので、i 以外は絶対にめくられていないため)
    //     }

    //     // --- ここからは、親クラス(Game)と全く同じ処理 ---
    //     // (1回目の当たり判定は、上の処理で強制的にfalseにされている)

    //     if (i === this.winningBoxIndex) {
    //         // あたりの場合 (1回目はここには絶対に来ない)
    //         box.textContent = "あたり";
    //         box.classList.add("win");
    //         this.endGame(); // ゲーム終了処理
    //     } else {
    //         // はずれの場合 (1回目は必ずここに来る)
    //         box.textContent = this.getHintText(i);
    //         box.classList.add("lose");
    //     }
    // }
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

    // --- ★ここから追加★ ---
    /**
     * 指定された範囲のボックスを「除外」としてマークするヘルパーメソッド
     * @param {number} startIndex - 除外開始インデックス
     * @param {number} endIndex - 除外終了インデックス
     * @param {HTMLCollection} boxes - ボックスのリスト
     */
    _markExcludedRange(startIndex, endIndex, boxes) {
        for (let i = startIndex; i <= endIndex; i++) {
            const box = boxes[i];
            // まだめくられていないボックス（＝数字のままのボックス）だけを対象
            if (box && !box.classList.contains("revealed")) {
                box.classList.add("excluded"); // グレーにするCSSクラス
                box.classList.add("revealed"); // クリック済みとして扱う
            }
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

            // 当たったかどうかを判定 (endGameが呼ばれるとresetButtonが有効になる)
            if (this.resetButton.disabled === false) {
                break; // 当たったのでループ終了
            }

            // --- 当たってない場合、ヒントに基づき範囲を狭める ---
            if (mid < this.winningBoxIndex) {
                // 「もっと後ろ」の場合
                this._markExcludedRange(low, mid - 1, boxes);
            } else {
                // 「もっと前」の場合
                this._markExcludedRange(mid + 1, high, boxes);
            }

            // 除外処理が画面に反映された状態で、1秒待機
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 待機が終わったら、次のループのために範囲を更新
            if (mid < this.winningBoxIndex) {
                // 「もっと後ろ」 (▶) の場合
                low = mid + 1; // 範囲の下限を mid の次 にする
            } else {
                // 「もっと前」 (◀) の場合
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

// BinarySearchGameを継承し、答えを「11」(index 10)に固定したクラス
class BinarySearchDefaultGame extends BinarySearchGame {

    // --- setupGame を上書き(オーバーライド) ---
    setupGame() {
        // 親(BinarySearchGame)の setupGame のロジックをほぼコピー
        this.gameBoard.innerHTML = "";
        this.resetButton.disabled = true;
        this.tryCount = 0;

        // ★★★ 変更点 ★★★
        // 当たりをランダム(Math.random) ではなく 10 (表示上は11) に固定する
        this.winningBoxIndex = 10;

        // (安全のため) もしボックス数が11未満なら、エラーを防ぐ
        if (this.boxCount <= this.winningBoxIndex) {
            console.warn(`BinarySearchDefaultGame: boxCount(${this.boxCount}) が 11 より少ないため、当たりを ${this.boxCount} (index ${this.boxCount - 1}) に変更します。`);
            this.winningBoxIndex = this.boxCount - 1;
        }

        // 自動探索ボタンを有効化
        if (this.autoSearchButton) {
            this.autoSearchButton.disabled = false;
        }

        // (親クラスと同様のボックス生成)
        for (let i = 0; i < this.boxCount; i++) {
            const box = document.createElement("div");
            box.classList.add("box");
            box.textContent = i + 1;
            // (クリックは無効化)
            this.gameBoard.appendChild(box);
        }
    }
}

// --- ゲームのインスタンスを生成 ---
const pageId = document.body.id;
if (pageId === "search1") {
    game1 = new Game("game-board-1", "history-1", "game-info-1", 15);
} else if (pageId === "search2") {
    game2 = new Game("game-board-2", "history-2", "game-info-2", 100);
} else if (pageId === "search4") {
    game3 = new LinearSearchGame("game-board-3", "history-3", "game-info-3", 15);
} else if (pageId === "search5") {
    game4 = new BinaryGame("game-board-4", "history-4", "game-info-4", 15);
    game5 = new BinarySearchDefaultGame("game-board-5", "history-5", "game-info-5", 15);
} else if (pageId === "search8") {
    const num_6 = parseInt(document.getElementById("game-num-6").value, 15);
    const reloadBtn_6 = document.getElementById("reload-btn-6");
    game6 = new LinearSearchGame("game-board-6", "history-6", "game-info-6", num_6);
    if (reloadBtn_6) {
        reloadBtn_6.addEventListener("click", () => {
            const newNum_6 = parseInt(document.getElementById("game-num-6").value, 15);

            if (!isNaN(newNum_6) && newNum_6 > 0) {
                game6.updateBoxCount(newNum_6);
            } else {
                alert("1以上の正しい数字を入力してください");
            }
        });
    }

    const num_7 = parseInt(document.getElementById("game-num-7").value, 15);
    const reloadBtn_7 = document.getElementById("reload-btn-7");
    game7 = new BinarySearchGame("game-board-7", "history-7", "game-info-7", num_7);
    if (reloadBtn_7) {
        reloadBtn_7.addEventListener("click", () => {
            const newNum_7 = parseInt(document.getElementById("game-num-7").value, 15);

            if (!isNaN(newNum_7) && newNum_7 > 0) {
                game7.updateBoxCount(newNum_7);
            } else {
                alert("1以上の正しい数字を入力してください");
            }
        });
    }
}