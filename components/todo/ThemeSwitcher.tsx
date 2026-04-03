
import React from 'react';

interface ThemeSwitcherProps {
    currentAccent: string;
    onAccentChange: (color: string) => void;
}

const ACCENTS = [
    { name: 'Amber', class: 'text-amber-400', hex: '#fbbf24' },
    { name: 'Blue', class: 'text-blue-400', hex: '#60a5fa' },
    { name: 'Green', class: 'text-green-400', hex: '#4ade80' },
    { name: 'Purple', class: 'text-purple-400', hex: '#c084fc' },
    { name: 'Rose', class: 'text-rose-400', hex: '#fb7185' },
];

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentAccent, onAccentChange }) => {
    return (
        <div className="flex gap-2 p-2 bg-[#1a1a1a] rounded-full border border-[#333] w-fit mx-auto mt-4">
            {ACCENTS.map(acc => (
                <button
                    key={acc.name}
                    onClick={() => onAccentChange(acc.name)}
                    className={`w-4 h-4 rounded-full transition-transform hover:scale-110 ${currentAccent === acc.name ? 'ring-2 ring-white scale-110' : ''}`}
                    style={{ backgroundColor: acc.hex }}
                    title={acc.name}
                />
            ))}
        </div>
    );
};
