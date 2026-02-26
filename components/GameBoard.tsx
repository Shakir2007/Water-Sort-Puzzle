import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TubeData, MoveHistory } from '../types';
import { generateLevel, getTimeForLevel } from '../utils/levelGenerator';
import { TUBE_CAPACITY } from '../constants';
import Tube from './Tube';
import Timer from './Timer';
import { UndoIcon } from './icons/UndoIcon';
import { RestartIcon } from './icons/RestartIcon';
import { PlusIcon } from './icons/PlusIcon';

interface GameBoardProps {
  level: number;
  onWin: () => void;
  onRestartRequest: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ level, onWin, onRestartRequest }) => {
  const [tubes, setTubes] = useState<TubeData[]>(() => generateLevel(level));
  const [selectedTubeIndex, setSelectedTubeIndex] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveHistory[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'failed'>('playing');
  const [extraTubeAdded, setExtraTubeAdded] = useState(false);
  
  const [timeLimit, setTimeLimit] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerId = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const tubeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const newTubes = generateLevel(level);
    const newTimeLimit = getTimeForLevel(level);
    
    setTubes(newTubes);
    setTimeLimit(newTimeLimit);
    setTimeLeft(newTimeLimit);
    
    setGameState('playing');
    setMoveHistory([]);
    setSelectedTubeIndex(null);
    setExtraTubeAdded(false);
    tubeRefs.current = new Array(newTubes.length);

  }, [level]);

  useEffect(() => {
    if (gameState === 'playing') {
      timerId.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerId.current!);
            setGameState('failed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerId.current) {
      clearInterval(timerId.current);
    }
    
    return () => {
      if (timerId.current) {
        clearInterval(timerId.current);
      }
    };
  }, [gameState]);

  const isGameWon = useMemo(() => {
    if (tubes.length === 0 || gameState !== 'playing') return false;
    return tubes.every(tube => {
      if (tube.colors.length === 0) return true;
      if (tube.colors.length === tube.capacity) {
        return tube.colors.every(color => color === tube.colors[0]);
      }
      return false;
    });
  }, [tubes, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && isGameWon) {
      setGameState('won');
      onWin();
    }
  }, [isGameWon, onWin, gameState]);

  const handleAddExtraTube = useCallback(() => {
    if (gameState !== 'playing' || extraTubeAdded) return;
    
    setTubes(currentTubes => {
        const newTube: TubeData = {
            id: Math.max(...currentTubes.map(t => t.id)) + 1, // unique ID
            colors: [],
            capacity: TUBE_CAPACITY,
        };
        return [...currentTubes, newTube];
    });

    setExtraTubeAdded(true);
  }, [gameState, extraTubeAdded]);
  
  const handleUndo = useCallback(() => {
    if (moveHistory.length === 0 || gameState !== 'playing') return;

    const lastMove = moveHistory[moveHistory.length - 1];
    setTubes(currentTubes => {
        const newTubes = JSON.parse(JSON.stringify(currentTubes));
        const fromTube = newTubes.find((t: TubeData) => t.id === lastMove.to);
        const toTube = newTubes.find((t: TubeData) => t.id === lastMove.from);
        if (fromTube && toTube) {
            const colorsToMove = fromTube.colors.splice(fromTube.colors.length - lastMove.count);
            toTube.colors.push(...colorsToMove);
        }
        return newTubes;
    });
    setMoveHistory(prev => prev.slice(0, -1));
  }, [moveHistory, gameState]);

  const handleTubeClick = (index: number) => {
    if (gameState !== 'playing') return;

    const clickedTube = tubes[index];

    if (selectedTubeIndex === null) {
      if (clickedTube.colors.length > 0) setSelectedTubeIndex(index);
    } else {
      if (selectedTubeIndex === index) {
        setSelectedTubeIndex(null);
        return;
      }
      const fromTube = tubes[selectedTubeIndex];
      const toTube = clickedTube;
      const topColor = fromTube.colors[fromTube.colors.length - 1];

      if (toTube.colors.length > 0 && toTube.colors[toTube.colors.length - 1] !== topColor) {
        setSelectedTubeIndex(index);
        return;
      }
      
      let pourableCount = 0;
      for (let i = fromTube.colors.length - 1; i >= 0; i--) {
        if (fromTube.colors[i] === topColor) pourableCount++;
        else break;
      }

      const availableSpace = toTube.capacity - toTube.colors.length;
      if (availableSpace > 0) {
        const amountToPour = Math.min(pourableCount, availableSpace);
        
        const fromIndex = selectedTubeIndex;
        const toIndex = index;

        setTubes(currentTubes => {
            const newTubes = JSON.parse(JSON.stringify(currentTubes));
            const newFromTube = newTubes[fromIndex];
            const newToTube = newTubes[toIndex];
            const pouredColors = newFromTube.colors.splice(newFromTube.colors.length - amountToPour);
            newToTube.colors.push(...pouredColors);
            return newTubes;
        });
        
        setMoveHistory(prev => [...prev, { from: tubes[fromIndex].id, to: tubes[toIndex].id, color: topColor, count: amountToPour }]);
      }
      setSelectedTubeIndex(null);
    }
  };
  
  const renderOverlay = (title: string, message: string, buttonText: string, onClick: () => void) => (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg">
        <h2 className="text-5xl font-bold text-yellow-300 animate-bounce">{title}</h2>
        <p className="text-xl text-white mt-2">{message}</p>
        {buttonText && <button onClick={onClick} className="mt-6 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105">{buttonText}</button>}
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
      <Timer timeLeft={timeLeft} timeLimit={timeLimit} />
      <div className="relative w-full flex justify-center items-start mb-8" style={{ minHeight: '400px' }}>
        {gameState === 'won' && renderOverlay('Complete!', 'Loading next level...', '', () => {})}
        {gameState === 'failed' && renderOverlay("Time's Up!", 'You ran out of time.', 'Try Again', onRestartRequest)}
        
        <div 
          className={`flex flex-wrap justify-center gap-4 md:gap-6 p-4 transition-opacity duration-500 ${gameState !== 'playing' ? 'opacity-50' : 'opacity-100'}`}
        >
          {tubes.map((tube, index) => (
            <Tube
              // Fix: The ref callback function should not return a value. 
              // Wrapping the assignment in curly braces changes it from an expression body to a statement body, 
              // which correctly returns undefined (void).
              ref={el => { tubeRefs.current[index] = el; }}
              key={tube.id}
              tubeData={tube}
              isSelected={selectedTubeIndex === index}
              onClick={() => handleTubeClick(index)}
            />
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <button onClick={handleUndo} disabled={moveHistory.length === 0 || gameState !== 'playing'} className="flex items-center justify-center w-28 h-12 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 text-white font-semibold rounded-lg shadow-md transition-all duration-200">
          <UndoIcon className="w-6 h-6 mr-2" />
          Undo
        </button>
        <button
          onClick={handleAddExtraTube}
          disabled={gameState !== 'playing' || extraTubeAdded}
          className="flex items-center justify-center w-28 h-12 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
          aria-label="Add extra tube"
        >
          <PlusIcon className="w-6 h-6 mr-2" />
          Tube
        </button>
        <button onClick={onRestartRequest} className="flex items-center justify-center w-28 h-12 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg shadow-md transition-all duration-200">
          <RestartIcon className="w-5 h-5 mr-2" />
          Restart
        </button>
      </div>
    </div>
  );
};

export default GameBoard;