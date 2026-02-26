import React, { forwardRef } from 'react';
import { TubeData } from '../types';

interface TubeProps {
  tubeData: TubeData;
  isSelected: boolean;
  onClick: () => void;
}

const Tube = forwardRef<HTMLDivElement, TubeProps>(({ tubeData, isSelected, onClick }, ref) => {
  const { colors, capacity } = tubeData;

  // We always render `capacity` segments. Empty ones are transparent and scaled to zero height.
  const segments = Array.from({ length: capacity }).map((_, i) => colors[i] || null);

  const tubeClasses = [
    'flex flex-col-reverse justify-start w-12 h-48 md:w-16 md:h-64',
    'bg-gray-200 bg-opacity-20 border-2 border-gray-400 rounded-b-3xl rounded-t-lg',
    'cursor-pointer transition-transform duration-300 ease-in-out overflow-hidden',
    isSelected ? 'transform -translate-y-5 scale-110 shadow-lg shadow-cyan-400/50' : 'hover:scale-105',
  ].join(' ');

  return (
    <div ref={ref} className={tubeClasses} onClick={onClick}>
      {segments.map((color, index) => (
        <div
          key={index}
          className="w-full origin-bottom transition-all duration-500 ease-in-out"
          style={{ 
            backgroundColor: color || 'transparent', 
            height: `${100 / capacity}%`,
            transform: color ? 'scaleY(1)' : 'scaleY(0)',
          }}
        />
      ))}
    </div>
  );
});

export default Tube;
