import React, { useState } from 'react';
import './App.css';

const BOX_COUNT = 10;

function App() {
  const [winningIndex, setWinningIndex] = useState(Math.floor(Math.random() * BOX_COUNT));
  const [revealed, setRevealed] = useState(Array(BOX_COUNT).fill(false));
  const [tryCount, setTryCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ max: 0, min: 0, avg: 0 });
  const [gameEnded, setGameEnded] = useState(false);

  const resetGame = () => {
    setWinningIndex(Math.floor(Math.random() * BOX_COUNT));
    setRevealed(Array(BOX_COUNT).fill(false));
    setTryCount(0);
    setGameEnded(false);
  };

  const handleClick = (i) => {
    if (revealed[i] || gameEnded) return;
    const newRevealed = [...revealed];
    newRevealed[i] = true;
    setRevealed(newRevealed);
    const newTryCount = tryCount + 1;
    setTryCount(newTryCount);

    if (i === winningIndex) {
      setGameEnded(true);
      const newHistory = [newTryCount, ...history];
      setHistory(newHistory);
      const max = Math.max(...newHistory);
      const min = Math.min(...newHistory);
      const avg = (newHistory.reduce((a, b) => a + b, 0) / newHistory.length).toFixed(2);
      setStats({ max, min, avg });
    }
  };

  return (
    <div className="App">
      <h1>探索アルゴリズム</h1>
      <p>10個のボックスから1つだけある「あたり」を見つけよう！</p>
      <div id="game-board" className="game-board">
        {Array(BOX_COUNT).fill(null).map((_, i) => (
          <div
            key={i}
            className={`box ${revealed[i] ? (i === winningIndex ? 'win' : 'lose') : ''}`}
            onClick={() => handleClick(i)}
          >
            {revealed[i] ? (i === winningIndex ? 'あたり' : '外れ') : i + 1}
          </div>
        ))}
      </div>
      <button
        id="reset-button"
        onClick={resetGame}
        disabled={!gameEnded}
        style={{ margin: '20px auto', display: 'block' }}
      >
        もう一度
      </button>
      <div id="history" className="history">
        <div id="stats" className="stats">
          <div>
            最大回数: <span id="max-try">{stats.max}</span>
            最小回数: <span id="min-try">{stats.min}</span>
          </div>
          <div>
            平均回数: <span id="avg-try">{stats.avg}</span>
          </div>
          <div>履歴:</div>
        </div>
        <ul id="history-list" className="history-list">
          {history.map((h, idx) => (
            <li key={idx}>{h}回</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
