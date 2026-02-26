import React from 'react';

interface TimerProps {
  timeLeft: number;
  timeLimit: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, timeLimit }) => {
  const percentage = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 0;
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const barColor = percentage > 50 ? 'bg-green-500' : percentage > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="w-full max-w-sm mb-4">
      <div className="flex justify-between items-center mb-1 text-gray-300">
        <span className="font-semibold">Time</span>
        <span className="font-mono text-lg">{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ease-linear ${barColor}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Timer;
