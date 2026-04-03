
import React from 'react';

interface MilestoneMarkerProps {
    isCompleted: boolean;
}

export const MilestoneMarker: React.FC<MilestoneMarkerProps> = ({ isCompleted }) => {
    return (
        <div className={`w-4 h-4 rotate-45 border-2 flex items-center justify-center transition-colors ${isCompleted ? 'bg-amber-500 border-amber-600' : 'bg-transparent border-amber-500'}`}>
            {isCompleted && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
        </div>
    );
};
