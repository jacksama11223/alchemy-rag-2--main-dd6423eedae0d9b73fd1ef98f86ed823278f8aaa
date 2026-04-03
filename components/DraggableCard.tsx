import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { IncomingAsset } from '../utils/dataProcessor';

interface DraggableCardProps {
  asset: IncomingAsset;
  children: React.ReactNode;
  className?: string;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({ asset, children, className = '' }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `drag-card-${asset.id}`,
    data: asset,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div
        {...listeners}
        {...attributes}
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 bg-gray-50 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical size={16} />
      </div>
      <div className="pl-8 p-4">
        {children}
      </div>
    </div>
  );
};
