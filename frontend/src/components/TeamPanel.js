import { useState } from 'react';
import Keypad from './Keypad';

const TeamPanel = ({ team, problem, score, correctCount, onAnswer, gameActive }) => {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);

  const bgColor = team === 1 ? 'bg-blue-50' : 'bg-red-50';
  const accentColor = team === 1 ? 'bg-blue-600' : 'bg-red-600';
  const textColor = team === 1 ? 'text-blue-600' : 'text-red-600';

  const handleKeypadClick = (value) => {
    if (!gameActive) return;
    
    if (value === 'clear') {
      setInput('');
    } else if (value === 'backspace') {
      setInput(prev => prev.slice(0, -1));
    } else {
      if (input.length < 3) {
        setInput(prev => prev + value);
      }
    }
  };

  const handleSubmit = async () => {
    if (!gameActive || !input) return;

    const answer = parseInt(input);
    const isCorrect = await onAnswer(team, answer);

    // Show feedback
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => setFeedback(null), 1000);

    // Clear input
    setInput('');
  };

  return (
    <div className={`flex-1 ${bgColor} p-6 flex flex-col items-center justify-between`}>
      {/* Team Header */}
      <div className="text-center w-full">
        <div className={`${accentColor} text-white text-3xl font-bold py-3 rounded-lg shadow-lg mb-4`}>
          TEAM {team}
        </div>
        <div className="flex justify-around mb-6">
          <div className="text-center">
            <div className="text-gray-600 text-sm font-semibold">SCORE</div>
            <div className={`${textColor} text-4xl font-bold`} data-testid={`team${team}-score`}>
              {score}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 text-sm font-semibold">CORRECT</div>
            <div className={`${textColor} text-4xl font-bold`} data-testid={`team${team}-correct`}>
              {correctCount}
            </div>
          </div>
        </div>
      </div>

      {/* Problem Display */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 w-full max-w-md">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-3 font-semibold">SOLVE THIS:</div>
          <div className={`${textColor} text-7xl font-bold mb-4`} data-testid={`team${team}-problem`}>
            {problem?.question || '? + ?'}
          </div>
          <div className="text-gray-400 text-xl mb-4">=</div>
          <div className="bg-gray-100 rounded-lg p-4 min-h-[80px] flex items-center justify-center">
            <div className={`${textColor} text-6xl font-bold`} data-testid={`team${team}-input`}>
              {input || '_'}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mb-4 text-3xl font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'} animate-pulse`}>
          {feedback === 'correct' ? '\u2713 CORRECT!' : '\u2717 TRY AGAIN!'}
        </div>
      )}

      {/* Keypad */}
      <Keypad 
        onKeyClick={handleKeypadClick} 
        onSubmit={handleSubmit}
        disabled={!gameActive}
        team={team}
      />
    </div>
  );
};

export default TeamPanel;
