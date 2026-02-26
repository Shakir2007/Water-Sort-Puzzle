import React, { useState, useCallback } from 'react';
import GameBoard from './components/GameBoard';

const App: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [gameKey, setGameKey] = useState(Date.now());

  const handleWin = useCallback(() => {
    // The win state is handled inside GameBoard, this is for advancing level
    setTimeout(() => {
        setLevel(prevLevel => prevLevel + 1);
        setGameKey(Date.now());
    }, 2000); // Wait for win animation
  }, []);

  const restartGame = useCallback(() => {
    setGameKey(Date.now());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 text-white flex flex-col items-center justify-start p-4 pt-8 font-sans">
      <header className="text-center mb-4 md:mb-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-cyan-300">
          Water Sort
        </h1>
        <p className="text-lg md:text-xl text-gray-400">Level {level}</p>
      </header>
      
      <GameBoard key={gameKey} level={level} onWin={handleWin} onRestartRequest={restartGame} />

      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Pour the colored water until each tube contains only one color.</p>
      </footer>
    </div>
  );
};

export default App;