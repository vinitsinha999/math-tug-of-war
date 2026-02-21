const Keypad = ({ onKeyClick, onSubmit, disabled, team }) => {
  const buttonColor = team === 1 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600';

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <div className="w-full max-w-md">
      {/* Number Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {numbers.map(num => (
          <button
            key={num}
            data-testid={`team${team}-key-${num}`}
            onClick={() => onKeyClick(num.toString())}
            disabled={disabled}
            className={`${buttonColor} text-white text-4xl font-bold py-6 rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          data-testid={`team${team}-clear`}
          onClick={() => onKeyClick('clear')}
          disabled={disabled}
          className="bg-gray-500 hover:bg-gray-600 text-white text-2xl font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50"
        >
          CLEAR
        </button>
        <button
          data-testid={`team${team}-submit`}
          onClick={onSubmit}
          disabled={disabled}
          className="bg-green-500 hover:bg-green-600 text-white text-2xl font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50"
        >
          \u2713 SUBMIT
        </button>
      </div>
    </div>
  );
};

export default Keypad;
