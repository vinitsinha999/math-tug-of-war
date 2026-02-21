import { useState } from 'react';

const StartScreen = ({ onStart }) => {
  const [showGo, setShowGo] = useState(false);

  const handleStart = () => {
    setShowGo(true);
    setTimeout(() => {
      onStart();
    }, 1500);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      {!showGo ? (
        <div className="text-center animate-fadeIn">
          <h1 className="text-7xl font-bold text-white mb-8 drop-shadow-2xl">
            Math Tug-of-War
          </h1>
          <p className="text-3xl text-white mb-12 opacity-90">
            Two Teams. One Winner. Let's Go!
          </p>
          <button
            data-testid="start-game-button"
            onClick={handleStart}
            className="bg-green-500 hover:bg-green-600 text-white text-4xl font-bold py-6 px-16 rounded-full shadow-2xl transform transition hover:scale-110 active:scale-95"
          >
            START GAME
          </button>
        </div>
      ) : (
        <div className="text-center animate-bounce">
          <div className="text-9xl font-black text-green-400 drop-shadow-2xl">
            GO!
          </div>
        </div>
      )}
    </div>
  );
};

export default StartScreen;
