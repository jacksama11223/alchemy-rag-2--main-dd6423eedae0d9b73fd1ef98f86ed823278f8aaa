import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableZoneProps {
  id: string;
  type: 'NOTE' | 'GRAPH' | 'TUTOR' | 'AIR_ROOM' | 'ALCHEMY';
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
}

export const DroppableZone: React.FC<DroppableZoneProps> = ({ 
  id, 
  type, 
  children, 
  className = '',
  activeClassName = 'ring-2 ring-blue-500 bg-blue-50/50'
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      type,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 ${className} ${isOver ? activeClassName : ''}`}
    >
      {children}
    </div>
  );
};
