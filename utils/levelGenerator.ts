import { TubeData } from '../types';
import { TUBE_CAPACITY, COLORS } from '../constants';

// Utility to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const generateLevel = (level: number): TubeData[] => {
  const numColors = Math.min(3 + Math.floor((level - 1) / 3), COLORS.length);
  const numTubes = numColors + 1; // Changed from +2 to +1 to ensure only one empty tube

  const levelColors = shuffleArray(COLORS).slice(0, numColors);

  // 1. Create the solved state
  let tubes: TubeData[] = [];
  levelColors.forEach((color, index) => {
    tubes.push({
      id: index,
      colors: Array(TUBE_CAPACITY).fill(color),
      capacity: TUBE_CAPACITY,
    });
  });
  // Add empty tubes
  for (let i = 0; i < numTubes - numColors; i++) {
    tubes.push({
      id: numColors + i,
      colors: [],
      capacity: TUBE_CAPACITY,
    });
  }

  // 2. Shuffle by making random "reverse" moves (transferring single blocks)
  // This guarantees a solvable state.
  const shuffleMoves = Math.min(40 + level * 7, 250);

  for (let i = 0; i < shuffleMoves; i++) {
    let fromIndex: number;
    let toIndex: number;
    let attempts = 0;

    // Find a source tube that is not empty and a destination tube that is not full
    do {
      fromIndex = Math.floor(Math.random() * numTubes);
      toIndex = Math.floor(Math.random() * numTubes);
      attempts++;
    } while (
      ( fromIndex === toIndex ||
        tubes[fromIndex].colors.length === 0 || // Can't pour from empty
        tubes[toIndex].colors.length === tubes[toIndex].capacity // Can't pour to full
      ) && attempts < 50
    );

    if (attempts >= 50) continue; // Could not find a valid pair, try next shuffle move

    // Perform the pour (move one block)
    const colorToMove = tubes[fromIndex].colors.pop();
    if (colorToMove) {
        tubes[toIndex].colors.push(colorToMove);
    }
  }

  // Ensure no tubes are fully solved at the start of the puzzle
  tubes.forEach((tube, index) => {
      if (tube.colors.length === TUBE_CAPACITY) {
          const firstColor = tube.colors[0];
          if (tube.colors.every(c => c === firstColor)) {
              // This tube is solved, so let's un-solve it to make the puzzle start
              // Find another tube to pour one block into that is not full
              const emptyTubeIndex = tubes.findIndex((t, idx) => idx !== index && t.colors.length < t.capacity);
              if (emptyTubeIndex !== -1) {
                  const color = tube.colors.pop();
                  if (color) {
                     tubes[emptyTubeIndex].colors.push(color);
                  }
              }
          }
      }
  });


  // Final shuffle of tube positions for more variety
  return shuffleArray(tubes).map((tube, index) => ({ ...tube, id: index }));
};

export const getTimeForLevel = (level: number): number => {
    // Base time + time that scales with level
    const numColors = Math.min(3 + Math.floor((level - 1) / 3), COLORS.length);
    const baseTime = 30; // 30 seconds base
    const timePerColor = 15;
    return baseTime + numColors * timePerColor;
};