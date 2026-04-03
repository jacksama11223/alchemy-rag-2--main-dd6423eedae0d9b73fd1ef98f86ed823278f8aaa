import React from 'react';
import { useLearningContext } from '../../hooks/useLearningContext';

interface NodeMiniPlayerProps {
  nodeId: string;
  topic: string;
  onClose: () => void;
}

export const NodeMiniPlayer: React.FC<NodeMiniPlayerProps> = ({ nodeId, topic, onClose }) => {
  const { setActiveNode } = useLearningContext();

  const handleFocus = () => {
    setActiveNode(nodeId, topic);
    onClose();
  };

  return (
    <div className="absolute bg-gray-800 border border-gray-600 text-white p-3 rounded shadow-lg z-50">
      <div className="flex justify-between items-center mb-2">
        <strong className="text-sm">{topic}</strong>
        <button onClick={onClose} className="text-gray-400 hover:text-white px-2">×</button>
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={handleFocus} className="bg-blue-600 hover:bg-blue-500 text-xs px-3 py-1.5 rounded">Focus Context</button>
        <button className="bg-green-600 hover:bg-green-500 text-xs px-3 py-1.5 rounded">Open in NoteLab</button>
        <button className="bg-orange-600 hover:bg-orange-500 text-xs px-3 py-1.5 rounded">Create Task</button>
      </div>
    </div>
  );
};
