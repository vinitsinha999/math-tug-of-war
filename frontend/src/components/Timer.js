const Timer = ({ timeLeft, totalTime }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const percentage = (timeLeft / totalTime) * 100;
  
  let colorClass = 'text-green-400';
  if (percentage < 30) {
    colorClass = 'text-red-400';
  } else if (percentage < 60) {
    colorClass = 'text-yellow-400';
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="text-white text-2xl font-semibold">\u23F1\uFE0F TIME:</div>
      <div className={`${colorClass} text-5xl font-bold tabular-nums`} data-testid="timer">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
};

export default Timer;
