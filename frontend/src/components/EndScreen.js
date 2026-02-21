const EndScreen = ({ stats, onPlayAgain }) => {
  const getWinnerDisplay = () => {
    if (stats.winner === 'tie') {
      return {
        title: "IT'S A TIE!",
        emoji: '\uD83E\uDD1D',
        color: 'text-yellow-400'
      };
    }
    return {
      title: stats.winner === 'team1' ? 'TEAM 1 WINS!' : 'TEAM 2 WINS!',
      emoji: '\uD83C\uDFC6',
      color: stats.winner === 'team1' ? 'text-blue-400' : 'text-red-400'
    };
  };

  const winner = getWinnerDisplay();
  const minutes = Math.floor(stats.duration / 60);
  const seconds = stats.duration % 60;

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-3xl w-full mx-8 animate-fadeIn" data-testid="end-screen">
        {/* Winner Announcement */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">{winner.emoji}</div>
          <h1 className={`text-6xl font-black ${winner.color} mb-4`} data-testid="winner-title">
            {winner.title}
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Team 1 Stats */}
          <div className="bg-blue-50 rounded-xl p-6 border-4 border-blue-300">
            <div className="text-blue-600 text-3xl font-bold mb-4">TEAM 1</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-xl">Score:</span>
                <span className="text-blue-600 text-3xl font-bold" data-testid="team1-final-score">
                  {stats.team1_score}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-xl">Correct:</span>
                <span className="text-blue-600 text-3xl font-bold" data-testid="team1-final-correct">
                  {stats.team1_correct}
                </span>
              </div>
            </div>
          </div>

          {/* Team 2 Stats */}
          <div className="bg-red-50 rounded-xl p-6 border-4 border-red-300">
            <div className="text-red-600 text-3xl font-bold mb-4">TEAM 2</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-xl">Score:</span>
                <span className="text-red-600 text-3xl font-bold" data-testid="team2-final-score">
                  {stats.team2_score}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-xl">Correct:</span>
                <span className="text-red-600 text-3xl font-bold" data-testid="team2-final-correct">
                  {stats.team2_correct}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Time */}
        <div className="bg-purple-50 rounded-xl p-4 mb-8 text-center">
          <div className="text-gray-600 text-xl mb-2">Total Time</div>
          <div className="text-purple-600 text-4xl font-bold" data-testid="final-time">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        {/* Play Again Button */}
        <button
          data-testid="play-again-button"
          onClick={onPlayAgain}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-4xl font-bold py-6 rounded-2xl shadow-xl transform transition hover:scale-105 active:scale-95"
        >
          \uD83D\uDD04 PLAY AGAIN
        </button>
      </div>
    </div>
  );
};

export default EndScreen;
