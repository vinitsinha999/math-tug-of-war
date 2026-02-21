const TugOfWar = ({ position }) => {
  // Position ranges from -10 (Team 1 advantage) to +10 (Team 2 advantage)
  // Convert to percentage for visual display
  const percentage = ((position + 10) / 20) * 100; // 0-100%
  const ropePosition = percentage;

  return (
    <div className="flex-1 bg-gradient-to-b from-green-100 to-green-200 flex flex-col items-center justify-center p-8" data-testid="tug-of-war">
      {/* Title */}
      <div className="text-3xl font-bold text-gray-700 mb-8">TUG-OF-WAR</div>

      {/* Tug-of-War Visualization */}
      <div className="w-full max-w-2xl">
        {/* Teams */}
        <div className="relative flex justify-between items-center mb-8">
          {/* Team 1 Players */}
          <div className="flex flex-col items-center animate-slideInLeft">
            <div className="flex space-x-2">
              {[1, 2].map(i => (
                <div key={i} className="text-6xl" style={{ transform: `translateX(${Math.max(-position * 3, -30)}px)` }}>
                  \uD83E\uDDD1\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1
                </div>
              ))}
            </div>
            <div className="text-xl font-bold text-blue-600 mt-2">TEAM 1</div>
          </div>

          {/* Center Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-yellow-400 z-0" />

          {/* Team 2 Players */}
          <div className="flex flex-col items-center animate-slideInRight">
            <div className="flex space-x-2">
              {[1, 2].map(i => (
                <div key={i} className="text-6xl" style={{ transform: `translateX(${Math.min(position * 3, 30)}px)` }}>
                  \uD83E\uDDD1\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1
                </div>
              ))}
            </div>
            <div className="text-xl font-bold text-red-600 mt-2">TEAM 2</div>
          </div>
        </div>

        {/* Rope */}
        <div className="relative h-4 bg-gray-300 rounded-full mb-8 overflow-hidden">
          {/* Progress indicator */}
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-red-500 transition-all duration-500"
            style={{ width: `${ropePosition}%` }}
          />
          
          {/* Knot/Marker */}
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-500 rounded-full border-4 border-white shadow-lg transition-all duration-500 z-10"
            style={{ left: `${ropePosition}%` }}
            data-testid="rope-marker"
          />
        </div>

        {/* Position Indicator */}
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">
            {position < -3 && (
              <span className="text-blue-600">&larr; TEAM 1 WINNING!</span>
            )}
            {position > 3 && (
              <span className="text-red-600">TEAM 2 WINNING! &rarr;</span>
            )}
            {position >= -3 && position <= 3 && (
              <span className="text-gray-600">&#9878; TIED!</span>
            )}
          </div>
          <div className="text-sm text-gray-500 mt-2" data-testid="tug-position">
            Position: {position}
          </div>
        </div>
      </div>

      {/* Fun Facts */}
      <div className="mt-12 text-center">
        <div className="text-gray-600 text-lg">
          \uD83C\uDFAF Solve problems correctly to pull the rope!
        </div>
      </div>
    </div>
  );
};

export default TugOfWar;
