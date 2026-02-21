import { useState, useEffect } from 'react';
import axios from 'axios';
import TeamPanel from './TeamPanel';
import TugOfWar from './TugOfWar';
import Timer from './Timer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const GameBoard = ({ sessionId, initialGameData, onGameEnd }) => {
  const [gameData, setGameData] = useState(initialGameData);
  const [timeLeft, setTimeLeft] = useState(initialGameData.duration);
  const [gameActive, setGameActive] = useState(true);

  // Timer countdown
  useEffect(() => {
    if (!gameActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameActive(false);
          onGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameActive, onGameEnd]);

  const handleAnswer = async (team, answer) => {
    try {
      const currentProblem = team === 1 
        ? gameData.current_team1_problem 
        : gameData.current_team2_problem;

      const response = await axios.post(`${API}/game/${sessionId}/answer`, {
        team,
        answer,
        problem_question: currentProblem.question
      });

      // Update game data with new problem and scores
      setGameData(prev => ({
        ...prev,
        [`team${team}_score`]: response.data.team_score,
        [`team${team}_correct`]: response.data.team_correct,
        tug_position: response.data.tug_position,
        [`current_team${team}_problem`]: response.data.new_problem
      }));

      return response.data.is_correct;
    } catch (error) {
      console.error('Error submitting answer:', error);
      return false;
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col" data-testid="game-board">
      {/* Header with Timer */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-4 px-8 flex justify-center items-center shadow-lg">
        <Timer timeLeft={timeLeft} totalTime={initialGameData.duration} />
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex">
        {/* Team 1 Panel */}
        <TeamPanel
          team={1}
          problem={gameData.current_team1_problem}
          score={gameData.team1_score}
          correctCount={gameData.team1_correct}
          onAnswer={handleAnswer}
          gameActive={gameActive}
        />

        {/* Center Tug-of-War */}
        <TugOfWar position={gameData.tug_position} />

        {/* Team 2 Panel */}
        <TeamPanel
          team={2}
          problem={gameData.current_team2_problem}
          score={gameData.team2_score}
          correctCount={gameData.team2_correct}
          onAnswer={handleAnswer}
          gameActive={gameActive}
        />
      </div>
    </div>
  );
};

export default GameBoard;
