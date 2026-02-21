import { useState } from 'react';
import './App.css';
import axios from 'axios';
import StartScreen from './components/StartScreen';
import GameBoard from './components/GameBoard';
import EndScreen from './components/EndScreen';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

function App() {
  const [gameState, setGameState] = useState('start'); // start, playing, end
  const [sessionId, setSessionId] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [gameStats, setGameStats] = useState(null);

  const startNewGame = async () => {
    try {
      const response = await axios.post(`${API}/game/start`, {
        duration: 120 // 2 minutes
      });
      
      setSessionId(response.data.id);
      setGameData(response.data);
      setGameState('playing');
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const endGame = async () => {
    try {
      const response = await axios.post(`${API}/game/${sessionId}/end`);
      setGameStats(response.data);
      setGameState('end');
    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  const resetGame = () => {
    setGameState('start');
    setSessionId(null);
    setGameData(null);
    setGameStats(null);
  };

  return (
    <div className="App">
      {gameState === 'start' && <StartScreen onStart={startNewGame} />}
      {gameState === 'playing' && (
        <GameBoard 
          sessionId={sessionId} 
          initialGameData={gameData} 
          onGameEnd={endGame}
        />
      )}
      {gameState === 'end' && (
        <EndScreen 
          stats={gameStats} 
          onPlayAgain={resetGame}
        />
      )}
    </div>
  );
}

export default App;
