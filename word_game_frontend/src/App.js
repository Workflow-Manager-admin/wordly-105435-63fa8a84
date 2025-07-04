import React, { useState, useEffect, useRef } from 'react';
import './App.css';

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
  const [grid, setGrid] = useState(getBlankGrid());
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [guessResults, setGuessResults] = useState([]); // Array of feedback arrays
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [answer, setAnswer] = useState(getRandomWord);
  const [disableInput, setDisableInput] = useState(false);
  const [usedKeys, setUsedKeys] = useState({}); // {A: 'correct' | 'present' | 'absent'}

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
          setMessage('🎉 You Win! The word was: ' + answer);
          setDisableInput(true);
        } else if (currentRow + 1 === NUM_ROWS) {
          setGameOver(true);
          setMessage('❌ You Lose! The word was: ' + answer);
          setDisableInput(true);
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
          <div style={{ marginBottom: 16 }}>
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
          </div>
        </div>
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
        </div>
      </header>
    </div>
  );
}

export default App;

