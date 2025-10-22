// --- 要素の取得 ---
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');

// --- 変数の設定 ---
const DURATION = 60; // タイマーの時間（60秒）
let remainingSeconds = DURATION; // 残り秒数
let timerId = null; // setIntervalのID
let isRunning = false; // タイマーが動作中か

// --- 関数の定義 ---

// 秒数を "分:秒" の形式にフォーマットする関数
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSec = seconds % 60;
    
    // padStart(2, '0') で、1桁の数字（例: 5）を "05" のように2桁表示にする
    return `${minutes}:${String(remainingSec).padStart(2, '0')}`;
}

// タイマー表示を更新する関数
function updateDisplay() {
    timerDisplay.textContent = formatTime(remainingSeconds);
}

// カウントダウンを実行する関数
function countdown() {
    if (remainingSeconds > 0) {
        remainingSeconds--;
        updateDisplay();
    } else {
        // 0秒になったらタイマーを停止
        stopTimer();
        alert('時間です！');
        startBtn.disabled = true; // 0秒になったらスタートを押せないようにする
    }
}

// スタート処理
function startTimer() {
    if (!isRunning && remainingSeconds > 0) {
        isRunning = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        
        // 1秒ごと (1000ミリ秒) に countdown 関数を実行
        timerId = setInterval(countdown, 1000);
    }
}

// ストップ（一時停止）処理
function stopTimer() {
    if (isRunning) {
        isRunning = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        
        // setInterval を停止
        clearInterval(timerId);
        timerId = null;
    }
}

// リセット処理
function resetTimer() {
    stopTimer(); // まずタイマーを止める
    remainingSeconds = DURATION; // 残り時間をリセット
    updateDisplay(); // 表示を "1:00" に戻す
    startBtn.disabled = false; // スタートボタンを押せるように戻す
    stopBtn.disabled = false;
}


// --- イベントリスナーの設定 ---
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);

// --- 初期表示 ---
updateDisplay(); // 最初に "1:00" を表示
stopBtn.disabled = true; // 最初はストップボタンを押せないようにする