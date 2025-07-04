# Product Requirements Document (PRD): 5-Letter Word Guessing Game

## 1. Product Overview

The 5-letter word guessing game is a web-based application designed for fun and cognitive challenge, inspired by the popular game Wordle. Players have 6 attempts to guess a randomly selected 5-letter word. After each guess, players receive visual feedback (via colored cells) indicating letter accuracy and position. Notable features include an on-screen keyboard, leaderboard with player rankings, a victory/defeat logic, and persistent storage of high scores. The game is implemented as a multi-container application consisting of a modern React frontend and a backend service providing game logic, state validation, and persistent leaderboard storage via REST APIs.

## 2. Goals

- Provide an intuitive, visually appealing, and responsive web experience for playing the 5-letter word guessing game.
- Enable fair and clear feedback for user guesses through color-coded hints.
- Allow users to track progress, compare scores, and compete through a persistent leaderboard.
- Support rapid play/replay cycles with one-click reset.
- Deliver a scalable solution that is maintainable and suitable for new features or platform expansion.

## 3. Functional Requirements

### 3.1. Game Mechanics

- Players have 6 attempts to guess a single 5-letter word randomly selected at the start of each round.
- After each guess, each letter cell is colored:
    - **Green**: Letter is in the correct position.
    - **Yellow**: Letter exists in the word but is in the wrong position.
    - **Gray**: Letter does not exist in the word.
- Game ends when the player guesses the word correctly (win) or uses all attempts (lose).
- Upon game end, a message displays whether the player won or lost, with an option to replay (reset).
- Prevents users from submitting invalid words (non-words and words not 5 letters long).

### 3.2. User Interface / Frontend

- Presents a 5x6 grid for guesses and answer feedback.
- Includes an on-screen keyboard for input (clickable keys).
- Accepts input from physical keyboard as well.
- Provides a reset button to start a new game at any time.
- Displays a popup/modal with win or loss message after game completion.
- Prompts successful players to enter their name for leaderboard submission.
- Includes a leaderboard view listing:
    - Player names (as submitted)
    - Attempts taken to guess the word (lower is better)
    - Player rank
- Responsive UI suitable for desktop, tablet, and mobile screens.
- Light (default) and dark theme toggle.

### 3.3. Interactivity and Navigation

- Ability to start a new game with a new word at any time (reset).
- Navigate to and from the leaderboard screen.
- Visual cues for invalid word entries or submission errors.
- Immediate (real-time) feedback after each guess.

### 3.4. Backend and APIs

- Provide REST API endpoints for:
    - Fetching a new random 5-letter word.
    - Accepting guesses and returning correctness feedback (by letter and position).
    - Storing and retrieving leaderboard entries (name, attempts, timestamp).
- Validate submitted guesses for being real words and enforce input rules.
- Persist leaderboard data across sessions (using a storage backend/database).
- Prevent manipulation of score submission (server-side validation).

### 3.5. Security & Data Integrity

- Validate all client input on the backend.
- Prevent duplicate or malicious leaderboard submissions.
- Ensure only valid game sessions can submit to the leaderboard.

## 4. Non-Functional Requirements

### 4.1. Usability

- Application should be intuitive to new players with minimal instructions.
- All key touchpoints (guess input, reset, submitting to leaderboard) are easily accessible.
- Accessibility features: color contrast guidelines, keyboard navigation support, screen-reader compatible labels.

### 4.2. Performance

- Game screen should load in under 2 seconds on standard broadband.
- Guess submissions, new word fetch, and leaderboard loading should give user feedback within 1 second.

### 4.3. Reliability

- System should gracefully handle backend failures (API errors, unavailable leaderboard) by notifying the user appropriately.
- All user actions that affect persistent data (leaderboard, score submission) must be robust to intermittent connectivity loss.

### 4.4. Scalability

- Backend should support at least 1,000 concurrent users (scalable via stateless REST and simple persistent storage).
- Frontend should perform smoothly on both desktop and mobile devices.

### 4.5. Security & Privacy

- No sensitive or personally identifiable information is collected except for player-chosen names.
- Leaderboard names must be sanitized for inappropriate input.
- API endpoints protected against common attacks (injection, XSS, CSRF).

## 5. Key User Flows

### 5.1. New Game Session

1. Player visits the game website.
2. System fetches a random 5-letter word from backend.
3. Game grid and on-screen keyboard displayed, ready for the first guess.

### 5.2. Making a Guess

1. Player inputs a word using keyboard/on-screen keys.
2. Frontend sends guess to backend for validation and feedback.
3. Backend responds with color-coded result and error message if input invalid.
4. UI updates grid and disables used keys on keyboard.

### 5.3. Win/Loss and Leaderboard Submission

1. If the correct word is guessed, player receives a victory message popup.
2. Player is prompted to enter their name to submit their score to the leaderboard.
3. UI submits score; backend validates and responds.
4. Leaderboard is updated and displayed with new rankings.
5. If player loses (all attempts used), defeat message shown with option to reset.

### 5.4. Viewing and Navigating Leaderboard

1. Player clicks or taps to view the leaderboard.
2. Frontend fetches leaderboard data from backend.
3. List of ranked player scores (name, attempts, rank) displayed.
4. Option to return to main game screen.

## 6. System Architecture

- **Frontend (React):** Handles user interaction, rendering, real-time feedback, theming, and API communication.
- **Backend:** Provides core game logic, input validation, word selection, persistent leaderboard, and API endpoints.

## 7. Out of Scope

- Multiplayer capabilities beyond leaderboard (i.e., real-time competition).
- User authentication or persistent user accounts.
- Monetization or ads.
- Native mobile applications (web only).

---

*This document forms the baseline for development, testing, and future enhancements. All implementation should be traceable to these requirements.*

