
import React, { useEffect, useRef } from 'react';

interface TagNebulaProps {
    tags: string[];
}

export const TagNebula: React.FC<TagNebulaProps> = ({ tags }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const tagsToRender = tags.length > 0 ? tags : ['LearnAI', 'Knowledge', 'Future', 'Deep Dive'];
        const particles: any[] = [];
        const numParticles = 40;

        for(let i=0; i<numParticles; i++) {
            particles.push({
                text: tagsToRender[i % tagsToRender.length],
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: Math.random() * 2 + 0.5, // Scale
                speed: (Math.random() * 0.5 + 0.1) * (Math.random() > 0.5 ? 1 : -1)
            });
        }

        let animationFrame: number;
        
        const animate = () => {
            if(!ctx || !canvas) return;
            // Use window size directly for fullscreen canvas logic
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            particles.forEach(p => {
                const dx = p.x - centerX;
                const dy = p.y - centerY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const angle = Math.atan2(dy, dx) + p.speed * 0.002;
                
                p.x = centerX + Math.cos(angle) * dist;
                p.y = centerY + Math.sin(angle) * dist;

                ctx.font = `${10 * p.z}px Lexend`;
                ctx.fillStyle = `rgba(201, 233, 246, ${p.z * 0.2})`; // Light blue tint
                ctx.textAlign = 'center';
                ctx.fillText(p.text, p.x, p.y);
            });

            animationFrame = requestAnimationFrame(animate);
        }
        
        animate();
        return () => cancelAnimationFrame(animationFrame);
    }, [tags]);

    return (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40 fixed z-0" />
    );
};
