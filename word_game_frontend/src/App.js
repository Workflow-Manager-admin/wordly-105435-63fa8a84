import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Minimal modal component for popup dialogs
function Modal({ open, onClose, children, ariaLabel }) {
  if (!open) return null;
  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-label={ariaLabel || "Dialog"}
      style={{
        position: "fixed", zIndex: 999, top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(34,42,75,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}
      onClick={onClose}
      data-testid="modal-bg"
    >
      <div
        role="document"
        style={{
          minWidth: 300, maxWidth: "92vw", background: "var(--bg-primary)", color: "var(--text-primary)",
          borderRadius: 12, boxShadow: "0 6px 30px 4px rgba(28,38,55,0.21)",
          padding: 28, position: "relative",
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          aria-label="Close modal"
          style={{
            position: "absolute", top: 12, right: 12, border: "none", background: "transparent",
            fontSize: 20, color: "var(--text-secondary)", cursor: "pointer"
          }}
          onClick={onClose}
        >×</button>
        {children}
      </div>
    </div>
  );
}

// Minimal leaderboard UI (local only)
function LeaderboardModal({ open, onClose, entries }) {
  return (
    <Modal open={open} onClose={onClose} ariaLabel="Leaderboard">
      <h3 style={{ textAlign: "center", margin: 0, letterSpacing: 2 }}>Leaderboard</h3>
      <div style={{ margin: "12px 0 16px 0", fontSize: 13, color: "var(--text-secondary)", textAlign: "center" }}>
        Fastest wins, sorted by attempts (lower is better)
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
            <th style={{ textAlign: "left", padding: 4, fontWeight: 600 }}>Rank</th>
            <th style={{ textAlign: "left", padding: 4, fontWeight: 600 }}>Name</th>
            <th style={{ textAlign: "right", padding: 4, fontWeight: 600 }}>Tries</th>
          </tr>
        </thead>
        <tbody>
          {entries && entries.length ?
            entries.map((e, idx) => (
              <tr key={e.name + "-" + e.attempts + "-" + idx} style={{
                borderBottom: "1px solid var(--border-color)",
                background: idx === 0 ? "rgba(46,204,113,0.1)" : "transparent"
              }}>
                <td style={{ padding: 4, fontWeight: idx === 0 ? 700 : 400 }}>{idx + 1}</td>
                <td style={{ padding: 4 }}>{e.name || "Player"}</td>
                <td style={{ padding: 4, textAlign: "right" }}>{e.attempts}</td>
              </tr>
            ))
            : (
              <tr><td colSpan={3} style={{ textAlign: "center", padding: 10, color: "var(--text-secondary)" }}>No scores yet</td></tr>
            )}
        </tbody>
      </table>
      <div style={{ textAlign: "center", marginTop: 18 }}>
        <button
          className="btn"
          style={{
            padding: "7px 28px", background: "var(--button-bg)", color: "var(--button-text)",
            border: "none", borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: "pointer"
          }}
          onClick={onClose}
        >Back to Game</button>
      </div>
    </Modal>
  );
}

// Minimal input dialog for name
function NameInputModal({ open, onClose, onSubmit }) {
  const [name, setName] = useState("");
  // Reset input when reopened
  useEffect(() => { if (open) setName(""); }, [open]);
  return (
    <Modal open={open} onClose={onClose} ariaLabel="Submit Score">
      <h3 style={{ marginTop: 0, textAlign: "center" }}>Submit Score</h3>
      <div style={{ margin: "7px 0 14px 0", fontSize: 15 }}>
        Enter your name for the leaderboard:
      </div>
      <form
        onSubmit={e => { e.preventDefault(); onSubmit(name); }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
      >
        <input
          type="text"
          aria-label="Your name"
          value={name}
          maxLength={16}
          autoFocus
          style={{
            padding: "8px 12px",
            fontSize: 16,
            borderRadius: 5,
            border: "1px solid var(--border-color)",
            marginBottom: 10,
            width: 180
          }}
          required
          onChange={e => setName(e.target.value.replace(/[^a-z0-9 -]/gi,""))}
          placeholder="Name"
        />
        <button
          className="btn"
          style={{
            background: "var(--button-bg)", color: "var(--button-text)",
            border: "none", borderRadius: 5, fontWeight: 600, fontSize: 15, padding: "7px 23px", cursor: "pointer"
          }}
          type="submit"
        >Submit</button>
      </form>
    </Modal>
  );
}

// Color palette for cell feedback
const COLORS = {
  correct: '#2ecc71',    // green
  present: '#f1c40f',    // yellow
  absent: '#d6d8db',     // gray (light)
  border: 'var(--border-color)',
  text: 'var(--text-primary)',
};

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Enter','Z','X','C','V','B','N','M','Back'],
];

const NUM_ROWS = 6;
const NUM_COLS = 5;

const getBlankGrid = () =>
  Array.from({ length: NUM_ROWS }, () => Array(NUM_COLS).fill(''));

// Simulated backend feedback for demo; real version would call the backend
const mockCheckGuess = (guess, answer) => {
  // Returns array: 'correct' (green), 'present' (yellow), 'absent' (gray) per letter
  let out = Array(NUM_COLS).fill('absent');
  let taken = Array(NUM_COLS).fill(false);
  // First pass for correct
  for (let i = 0; i < NUM_COLS; ++i) {
    if (guess[i] === answer[i]) {
      out[i] = 'correct';
      taken[i] = true;
    }
  }
  // Second pass for present
  for (let i = 0; i < NUM_COLS; ++i) {
    if (out[i] !== 'correct') {
      for (let j = 0; j < NUM_COLS; ++j) {
        if (!taken[j] && guess[i] === answer[j]) {
          out[i] = 'present';
          taken[j] = true;
          break;
        }
      }
    }
  }
  return out;
};

// Returns a random 5-letter word for demonstration.
const getRandomWord = () => {
  // For demo, this can be a static set or in future from backend API.
  const WORD_LIST = ['PLANT', 'BRAVE', 'QUICK', 'LOGIC', 'MANGO', 'ROUTE', 'CANDY', 'SHINE', 'STORY', 'CHAIR', 'GROWL'];
  const idx = Math.floor(Math.random() * WORD_LIST.length);
  return WORD_LIST[idx];
};

// PUBLIC_INTERFACE
function App() {
  // Game state and feedback
  const [theme, setTheme] = useState('light');
  const [screen, setScreen] = useState('game'); // 'game' or 'leaderboard'
  const [grid, setGrid] = useState(getBlankGrid());
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [guessResults, setGuessResults] = useState([]); // Array of feedback arrays
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [answer, setAnswer] = useState(getRandomWord);
  const [disableInput, setDisableInput] = useState(false);
  const [usedKeys, setUsedKeys] = useState({}); // {A: 'correct' | 'present' | 'absent'}

  // Modals for win/lose popup and leaderboard/name dialog
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLoseModal, setShowLoseModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Simple local leaderboard as array [{name, attempts}]
  const [leaderboard, setLeaderboard] = useState([]);

  const boardRef = useRef(null);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle physical keyboard input
  useEffect(() => {
    if (disableInput) return;

    const handleKeyDown = (event) => {
      if (gameOver) return;
      let key = event.key;
      if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
        handleCharInput(key.toUpperCase());
      } else if (key === 'Backspace') {
        onBackspace();
      } else if (key === 'Enter') {
        onEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line
  }, [grid, currentRow, currentCol, gameOver, disableInput, answer, guessResults, usedKeys]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // PUBLIC_INTERFACE
  const startNewGame = () => {
    setGrid(getBlankGrid());
    setCurrentRow(0);
    setCurrentCol(0);
    setGuessResults([]);
    setGameOver(false);
    setMessage('');
    setDisableInput(false);
    setAnswer(getRandomWord());
    setUsedKeys({});
    setShowWinModal(false);
    setShowLoseModal(false);
    setShowNameModal(false);
    setScreen('game');
  };

  // PUBLIC_INTERFACE
  function handleCharInput(char) {
    if (currentCol < NUM_COLS && !gameOver && !disableInput) {
      setGrid(prev => {
        const newGrid = prev.map(arr => arr.slice());
        newGrid[currentRow][currentCol] = char;
        return newGrid;
      });
      setCurrentCol(c => c + 1);
    }
  }

  // PUBLIC_INTERFACE
  function onBackspace() {
    if (currentCol > 0 && !gameOver && !disableInput) {
      setGrid(prev => {
        const newGrid = prev.map(arr => arr.slice());
        newGrid[currentRow][currentCol-1] = '';
        return newGrid;
      });
      setCurrentCol(c => c - 1);
    }
  }

  // PUBLIC_INTERFACE
  function onEnter() {
    if (
      !disableInput &&
      !gameOver &&
      currentCol === NUM_COLS &&
      grid[currentRow].join('').length === NUM_COLS
    ) {
      let guess = grid[currentRow].join('').toUpperCase();
      // For demo: just check length; in full version, also check valid word via API.
      if (!/^[A-Z]{5}$/.test(guess)) {
        setMessage('Not a valid 5-letter word');
        return;
      }

      setDisableInput(true);

      // Here, we'd POST to backend to validate/score. Use mock for now.
      setTimeout(() => {
        const feedback = mockCheckGuess(guess, answer);
        setGuessResults(prev => [...prev, feedback]);

        // Update usedKeys status (keep "correct" if already found)
        setUsedKeys(prevUsed => {
          const updated = { ...prevUsed };
          for (let i = 0; i < NUM_COLS; ++i) {
            const k = guess[i];
            if (!updated[k] || updated[k] === 'present' && feedback[i] === 'correct' || updated[k] === 'absent' && feedback[i] !== 'absent') {
              updated[k] = feedback[i];
            }
          }
          return updated;
        });

        if (guess === answer) {
          setGameOver(true);
          setDisableInput(true);
          setTimeout(() => setShowWinModal(true), 350);
        } else if (currentRow + 1 === NUM_ROWS) {
          setGameOver(true);
          setDisableInput(true);
          setTimeout(() => setShowLoseModal(true), 350);
        } else {
          setCurrentRow(r => r + 1);
          setCurrentCol(0);
          setDisableInput(false);
        }
      }, 300);
    } else if (!disableInput && !gameOver && currentCol !== NUM_COLS) {
      setMessage('Not enough letters');
    }
  }

  // PUBLIC_INTERFACE
  function onKeyboardClick(key) {
    // Simulate click from on-screen keyboard
    if (key === 'Back') onBackspace();
    else if (key === 'Enter') onEnter();
    else handleCharInput(key);
  }

  // Effect to clear temporary messages after 2 seconds
  useEffect(() => {
    if (!message) return;
    const tid = setTimeout(() => setMessage(''), 1800);
    return () => clearTimeout(tid);
  }, [message]);

  // PUBLIC_INTERFACE
  function renderGrid() {
    // Shows guesses, their feedback, and the active row for typing
    return (
      <div className="game-board" ref={boardRef} aria-label="Guess Grid">
        {grid.map((row, rowIdx) => (
          <div className="board-row" key={rowIdx}>
            {row.map((char, colIdx) => {
              const feedback = guessResults[rowIdx]?.[colIdx] || '';
              let cellStyle = {
                borderColor: COLORS.border,
                color: COLORS.text,
                background: 'transparent',
              };
              if (feedback === 'correct') cellStyle.background = COLORS.correct;
              else if (feedback === 'present') cellStyle.background = COLORS.present;
              else if (feedback === 'absent' && char) cellStyle.background = COLORS.absent;

              // For better feel, add subtle border and animation
              return (
                <div
                  className="cell"
                  key={colIdx}
                  style={{
                    ...cellStyle,
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    fontWeight: 'bold',
                    width: 48,
                    height: 48,
                    margin: 3,
                    borderRadius: 8,
                    fontSize: 28,
                    textTransform: 'uppercase',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.3s, color 0.3s, border-color 0.3s'
                  }}
                  aria-label={char || 'empty'}
                  aria-live={rowIdx === currentRow ? "polite" : undefined}
                  tabIndex={rowIdx === currentRow && colIdx === currentCol ? 0 : -1}
                  data-testid={`cell-${rowIdx}-${colIdx}`}
                >
                  {char}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function renderKeyboard() {
    return (
      <div className="keyboard" aria-label="On-Screen Keyboard">
        {KEYBOARD_ROWS.map((row, i) => (
          <div key={i} className="keyboard-row" style={{ display: "flex", justifyContent: 'center', marginBottom: 8 }}>
            {row.map((key) => {
              let keyStatus = usedKeys[key] || '';
              let style = {
                width: key === 'Enter' || key === 'Back' ? 56 : 40,
                height: 46,
                margin: 3,
                borderRadius: 6,
                textAlign: 'center',
                fontWeight: 600,
                textTransform: 'uppercase',
                background: '#ececec',
                color: '#222',
                border: 'none',
                cursor: (disableInput || gameOver) ? 'not-allowed' : 'pointer',
                opacity: (disableInput || gameOver) ? 0.7 : 1,
                transition: 'background 0.25s, color 0.25s'
              };
              if (keyStatus === 'correct') style.background = COLORS.correct;
              else if (keyStatus === 'present') style.background = COLORS.present;
              else if (keyStatus === 'absent') {
                style.background = COLORS.absent;
                style.color = '#888'
              }

              if (key === 'Enter' || key === 'Back') style.fontSize = 16;
              else style.fontSize = 18;

              return (
                <button
                  className="kbd"
                  key={key}
                  style={style}
                  onClick={() => !disableInput && !gameOver && onKeyboardClick(key)}
                  disabled={disableInput || gameOver}
                  aria-label={key}
                  data-testid={`kbd-${key}`}
                  tabIndex={0}
                >
                  {key === 'Back' ? '⌫' : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // PUBLIC_INTERFACE
  return (
    <div className="App" style={{ minHeight: '100vh', minWidth: '100vw' }}>
      <header className="App-header" style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          data-testid="theme-toggle"
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <div style={{ width: '100%', padding: '32px 0 8px 0', textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontWeight: 800, letterSpacing: 4, color: 'var(--text-primary)' }}>WORDLY</h2>
          <div style={{ margin: '8px 0', fontSize: 16, color: 'var(--text-secondary)', fontWeight: 400 }}>Guess the 5-letter word in 6 tries</div>
          <div style={{ marginBottom: 16, display: "flex", gap: 14, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={startNewGame} className="btn" style={{
              padding: '8px 20px',
              background: 'var(--button-bg)',
              color: 'var(--button-text)',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer'
            }} aria-label="Reset game">Reset</button>
            <button
              onClick={() => setScreen('leaderboard')}
              className="btn"
              style={{
                padding: '8px 18px',
                background: 'var(--kavia-orange, #E87A41)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer'
              }}
              aria-label="Leaderboard"
              data-testid="btn-leaderboard"
            >Leaderboard</button>
          </div>
        </div>
        {/* Main Content: switch between leaderboard and main game */}
        {screen === 'leaderboard' ? (
          <LeaderboardModal
            open={true}
            onClose={() => setScreen('game')}
            entries={leaderboard}
          />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 12,
            width: '100%',
            flex: 'none'
          }}>
            {renderGrid()}
            <div style={{ height: 10 }} />
            {renderKeyboard()}
            <div style={{marginTop: 8, minHeight: 25}}>
              {message && (
                <div className="game-message" style={{
                  color: gameOver ? COLORS.correct : '#f39c12',
                  fontWeight: 'bold',
                  fontSize: 18,
                  background: 'rgba(255,255,0,0.08)',
                  borderRadius: 6,
                  margin: '8px auto 0 auto',
                  padding: gameOver ? '8px 18px' : '6px 12px',
                  minHeight: 30,
                }}>
                  {message}
                </div>
              )}
            </div>
            {/* Win Modal */}
            <Modal open={showWinModal} onClose={() => setShowWinModal(false)} ariaLabel="Win">
              <div style={{ textAlign: "center", minWidth: 210, maxWidth: 300 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 8 }}>You Win!</div>
                <div style={{ margin: "0 0 10px 0", fontSize: 15, color: "var(--text-secondary)" }}>
                  The word was <b>{answer}</b>. <br />
                  Attempts: <b>{currentRow + 1}</b>
                </div>
                <button
                  className="btn"
                  style={{
                    background: "var(--kavia-orange, #E87A41)", color: "#fff",
                    border: "none", borderRadius: 6, fontWeight: 600, fontSize: 15, padding: "7px 23px",
                    marginBottom: 10, marginTop: 6, cursor: "pointer"
                  }}
                  onClick={() => { setShowWinModal(false); setShowNameModal(true); }}
                  data-testid="btn-submit-leaderboard"
                  autoFocus
                >Submit Score</button>
                <div>
                  <button
                    className="btn"
                    style={{
                      background: "var(--button-bg)", color: "var(--button-text)",
                      border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13, padding: "7px 18px",
                      marginRight: 3, marginLeft: 2, marginTop: 2, cursor: "pointer"
                    }}
                    onClick={startNewGame}
                  >Play Again</button>
                </div>
              </div>
            </Modal>
            {/* Lose Modal */}
            <Modal open={showLoseModal} onClose={() => setShowLoseModal(false)} ariaLabel="Lose">
              <div style={{ textAlign: "center", minWidth: 215, maxWidth: 320 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>❌</div>
                <div style={{ fontWeight: 600, fontSize: 20 }}>You Lose!</div>
                <div style={{ fontSize: 16, color: "var(--text-secondary)" }}>
                  The word was <b>{answer}</b>
                </div>
                <button
                  className="btn"
                  style={{
                    background: "var(--button-bg)", color: "var(--button-text)",
                    border: "none", borderRadius: 6, fontWeight: 600, fontSize: 15, padding: "7px 23px",
                    marginTop: 14, cursor: "pointer"
                  }}
                  onClick={() => { setShowLoseModal(false); startNewGame(); }}
                >Try Again</button>
              </div>
            </Modal>
            {/* Name input dialog */}
            <NameInputModal
              open={showNameModal}
              onClose={() => setShowNameModal(false)}
              onSubmit={name => {
                // Add score to local leaderboard
                setShowNameModal(false);
                // Sanitize name (1-16 chars, no bad words for demo)
                let sanitized = (name||"").trim().slice(0,16).replace(/[^a-z0-9 -]/gi, "");
                if (!sanitized) sanitized = "Player";
                setLeaderboard(prev => {
                  let updated = [...prev, { name: sanitized, attempts: currentRow + 1 }];
                  updated.sort((a, b) => a.attempts - b.attempts); // Lower is better
                  return updated.slice(0, 25); // Limit to top 25 for demo
                });
                setTimeout(() => setScreen("leaderboard"), 400);
              }}
            />
          </div>
        )}
      </header>
    </div>
  );
}

export default App;

