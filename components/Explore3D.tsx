
import React, { useState, useEffect, useRef } from 'react';
import { calculateNodeMastery } from '../services/sm2Service';
import { KnowledgeNode } from '../types';

// Import Modular Groups
import { SpaceHeader } from './Explore3D/SpaceHeader';
import { SpaceHUD } from './Explore3D/SpaceHUD';
import { SpaceNode } from './Explore3D/SpaceNode';
import { ConstellationLine } from './Explore3D/ConstellationLine';
import { Environment } from './Explore3D/Environment';

// NEW IMPORTS
import * as Bodies from './Explore3D/Bodies';
import * as Cockpit from './Explore3D/Cockpit';
import * as VFX from './Explore3D/VFX';
import * as Interaction from './Explore3D/Interaction';
import * as Physics from './Explore3D/Physics';
import * as Media from './Explore3D/SpatialMedia';
import * as Social from './Explore3D/Social';
import * as System from './Explore3D/System';
import * as Utilities from './Explore3D/Utilities';

interface Explore3DProps {
    onBack: () => void;
    onShowAbout: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    userNodes?: KnowledgeNode[]; 
    activeFilter?: string | null;
    onNodeClick?: (node: KnowledgeNode) => void;
    focusedNodeId?: string | null;
}

const getComplexityScore = (type: string): number => {
    switch (type) {
        case 'Flashcard': return 1; 
        case 'Fill-in-the-blanks': return 2;
        case 'Spot the Error': return 3;
        case 'Quiz': return 3;
        case 'Mixed': return 4;
        case 'Case Study': return 5;
        default: return 1;
    }
};

const Explore3D: React.FC<Explore3DProps> = ({ 
    onBack, onShowAbout, onLogout, onShowFAQ, onShowAccount, 
    userNodes = [], activeFilter, onNodeClick, focusedNodeId 
}) => {
    // Camera State
    const [position, setPosition] = useState({ x: 0, y: 0, z: -800 });
    const keysPressed = useRef<Set<string>>(new Set());
    const frameRef = useRef<number>(0);
    const [speedMultiplier, setSpeedMultiplier] = useState(1);
    const [autoOrbit, setAutoOrbit] = useState(false);
    
    // UI State
    const [zenMode, setZenMode] = useState(false);
    const [selectedNode3D, setSelectedNode3D] = useState<string | null>(null);
    const [showSearch, setShowSearch] = useState(false); 
    const [showTools, setShowTools] = useState(true);

    // Mapped 3D Data
    const [nodes, setNodes] = useState<any[]>([]);
    const [constellations, setConstellations] = useState<{x1:number, y1:number, z1:number, x2:number, y2:number, z2:number, color:string}[]>([]);

    // --- DATA MAPPING LOGIC ---
    useEffect(() => {
        if (userNodes.length === 0) return;

        const timestamps = userNodes.map(n => new Date(n.timestamp).getTime());
        const minTime = Math.min(...timestamps);
        const maxTime = Math.max(...timestamps);
        const timeRange = maxTime - minTime || 1;

        const mappedNodes = userNodes.map(n => {
            const timeX = ((new Date(n.timestamp).getTime() - minTime) / timeRange - 0.5) * 2000;
            const complexity = getComplexityScore(n.type);
            const compY = (complexity - 3) * 300; 
            const jitterY = compY + (Math.random() - 0.5) * 100;
            const mastery = calculateNodeMastery(n);
            const mastZ = 500 - (mastery * 20); 

            // Use assigned coordinates if available (from Alchemy randomizer), else map spatially
            const finalX = n.x ? (n.x - 50) * 20 : timeX;
            const finalY = n.y ? (n.y - 50) * 20 : -jitterY;

            const tag = n.tags && n.tags.length > 0 ? n.tags[0] : 'General';
            let colorHash = 0;
            for(let i=0; i<tag.length; i++) colorHash = tag.charCodeAt(i) + ((colorHash << 5) - colorHash);
            const color = '#' + '00000'.substring(0, 6 - (colorHash & 0x00FFFFFF).toString(16).toUpperCase().length) + (colorHash & 0x00FFFFFF).toString(16).toUpperCase();

            return {
                ...n,
                x: finalX,
                y: finalY,
                z: mastZ,
                color: color,
                label: n.title,
                mastery: mastery
            };
        });

        setNodes(mappedNodes);

        const lines: any[] = [];
        const nodesByTag: {[key: string]: any[]} = {};
        
        mappedNodes.forEach(n => {
            const tag = n.tags && n.tags[0] ? n.tags[0] : 'Other';
            if (!nodesByTag[tag]) nodesByTag[tag] = [];
            nodesByTag[tag].push(n);
        });

        Object.keys(nodesByTag).forEach(tag => {
            const group = nodesByTag[tag].sort((a, b) => a.x - b.x); 
            for (let i = 0; i < group.length - 1; i++) {
                const dist = Math.sqrt(Math.pow(group[i].x - group[i+1].x, 2) + Math.pow(group[i].y - group[i+1].y, 2) + Math.pow(group[i].z - group[i+1].z, 2));
                if (dist < 800) {
                    lines.push({
                        x1: group[i].x, y1: group[i].y, z1: group[i].z,
                        x2: group[i+1].x, y2: group[i+1].y, z2: group[i+1].z,
                        color: group[i].color
                    });
                }
            }
        });
        setConstellations(lines);

    }, [userNodes]);

    // --- AUTO-FLY TO FOCUSED NODE ---
    useEffect(() => {
        if (focusedNodeId && nodes.length > 0) {
            const target = nodes.find(n => n.id === focusedNodeId);
            if (target) {
                // Turn off auto-orbit to focus
                setAutoOrbit(false);
                
                const startPos = { ...position };
                // Target: slightly offset from node so we can see it
                const targetPos = { x: -target.x, y: -target.y, z: -target.z - 400 }; 
                
                let t = 0;
                const flyAnimation = () => {
                    t += 0.05;
                    if (t >= 1) {
                        setPosition(targetPos);
                        setSelectedNode3D(focusedNodeId);
                        return;
                    }
                    
                    // Simple Lerp
                    setPosition({
                        x: startPos.x + (targetPos.x - startPos.x) * t,
                        y: startPos.y + (targetPos.y - startPos.y) * t,
                        z: startPos.z + (targetPos.z - startPos.z) * t
                    });
                    requestAnimationFrame(flyAnimation);
                };
                flyAnimation();
            }
        }
    }, [focusedNodeId, nodes.length]);

    // --- GAME LOOP & INPUT ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keysPressed.current.add(e.key.toLowerCase());
            if (e.key === 'Shift') setSpeedMultiplier(5); 
            if (e.key === '/') setShowSearch(true);
            if (e.key === 'Escape') setShowSearch(false);
            if (e.key.toLowerCase() === 'h') setShowTools(prev => !prev);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keysPressed.current.delete(e.key.toLowerCase());
            if (e.key === 'Shift') setSpeedMultiplier(1);
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        let angle = 0;
        const loop = () => {
            const speed = 10 * speedMultiplier;

            if (autoOrbit) {
                angle += 0.002;
                setPosition(prev => ({
                    x: Math.cos(angle) * 1200,
                    y: Math.sin(angle * 0.5) * 300,
                    z: Math.sin(angle) * 1200 - 500
                }));
            } else {
                setPosition(prev => {
                    let { x, y, z } = prev;
                    if (keysPressed.current.has('w')) z += speed;
                    if (keysPressed.current.has('s')) z -= speed;
                    if (keysPressed.current.has('a')) x += speed; 
                    if (keysPressed.current.has('d')) x -= speed;
                    if (keysPressed.current.has('q')) y += speed;
                    if (keysPressed.current.has('e')) y -= speed;
                    return { x, y, z };
                });
            }

            frameRef.current = requestAnimationFrame(loop);
        };
        loop();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(frameRef.current);
        };
    }, [autoOrbit, speedMultiplier]);

    const handleNodeClickInternal = (node: any) => {
        setSelectedNode3D(node.id === selectedNode3D ? null : node.id);
        if (onNodeClick) onNodeClick(node);
    };

    return (
        <div className="relative flex h-screen w-screen bg-[#020410] text-slate-200 font-display overflow-hidden select-none">
            {/* Global Styles for 3D Elements */}
            <style>{`
                .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                .warp-speed { animation: warp 0.2s linear infinite; opacity: 0.8; }
                .spatial-label { position: absolute; color: rgba(255,255,255,0.3); font-size: 100px; font-weight: 900; text-transform: uppercase; pointer-events: none; white-space: nowrap; transform-style: preserve-3d; }
                .axis-line { position: absolute; background: rgba(255,255,255,0.1); pointer-events: none; }
                @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes rain { 0% { transform: translateY(0) rotate(45deg); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(200px) rotate(45deg); opacity: 0; } }
                @keyframes stream { 0% { transform: translateX(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(-100px); opacity: 0; } }
            `}</style>

            {/* 1. HEADER */}
            <SpaceHeader 
                onBack={onBack} 
                activeFilter={activeFilter} 
                autoOrbit={autoOrbit} 
                setAutoOrbit={setAutoOrbit} 
                zenMode={zenMode} 
                setZenMode={setZenMode} 
                onShowAccount={onShowAccount} 
            />

            {/* 2. MAIN 3D VIEWPORT */}
            <main className="absolute inset-0 z-0 bg-black perspective-[1000px] overflow-hidden">
                
                {/* Background Atmosphere */}
                <VFX.StardustParticles />
                <VFX.AuroraBorealisLayer />
                <VFX.VignetteOverlay />
                <VFX.GlitchEffectShader active={false} />

                {/* The 3D World Container */}
                <div 
                    className="relative w-full h-full transform-style-3d" 
                    style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
                >
                    <div 
                        className="absolute top-1/2 left-1/2 w-0 h-0 transform-style-3d"
                        style={{ 
                            transform: `translateZ(${position.z}px) translateX(${position.x}px) translateY(${position.y}px)`,
                            transition: autoOrbit ? 'transform 0.1s linear' : 'none'
                        }}
                    >
                        <Environment speedMultiplier={speedMultiplier} />
                        
                        {/* Physics & Grid */}
                        <VFX.GridFloor3D />
                        <VFX.LensFlareFilter />
                        <Physics.GravityWellGrid />
                        <Physics.OrbitPathLine rx={1200} ry={1200} />

                        {/* Celestial Bodies (Decor) */}
                        <Bodies.SunNode x={0} y={0} z={0} label="ROOT" />
                        <Bodies.AsteroidBelt />
                        <Bodies.BlackHoleArchive x={800} y={500} z={-500} />
                        <Bodies.NebulaCluster x={-500} y={-200} z={-800} color="bg-purple-500" />
                        <Bodies.BinaryStarSystem x={600} y={-400} z={200} />
                        
                        {/* USER DATA NODES */}
                        {nodes.map(node => {
                            // SYNC: Filter logic in 3D
                            const isFiltered = activeFilter && (!node.tags || !node.tags.includes(activeFilter));
                            if (isFiltered) return null; 
                            
                            return (
                                <React.Fragment key={node.id}>
                                    <SpaceNode 
                                        node={node} 
                                        isSelected={selectedNode3D === node.id} 
                                        onClick={handleNodeClickInternal} 
                                    />
                                    <VFX.ShadowProjector x={node.x} z={node.z} />
                                    {node.mastery > 90 && <Bodies.MoonNode parentSize={40} />}
                                    {node.id === selectedNode3D && <Interaction.SelectionBoundingBox />}
                                </React.Fragment>
                            );
                        })}

                        {/* Links */}
                        {constellations.map((line, idx) => (
                            <ConstellationLine key={`line-${idx}`} {...line} />
                        ))}

                        {/* Interactive Elements (World Space) */}
                        <Media.VideoMonolith x={-300} y={200} z={-200} />
                        <Media.ImageGalleryCube x={300} y={-200} z={100} />
                        <Social.PlayerShipAvatar x={100} y={100} z={-300} name="Friend_1" />
                        <Utilities.ClusterLabel3D x={0} y={-300} z={0} label="CORE CONCEPTS" />
                    </div>
                </div>
            </main>

            {/* 3. HEADS-UP DISPLAY (UI OVERLAYS) */}
            {!zenMode && showTools && (
                <>
                    {/* Top Right: System Stats */}
                    <div className="absolute top-20 right-6 flex flex-col gap-2 pointer-events-auto">
                        <System.FPSCounterHUD />
                        <System.MemoryUsageBar />
                        <div className="flex gap-2 justify-end">
                            <System.QualitySettingsGear />
                            <System.CacheStatusIndicator />
                        </div>
                    </div>

                    {/* Left Panel: Navigation Data */}
                    <div className="absolute top-20 left-6 z-30 pointer-events-auto">
                        <SpaceHUD speedMultiplier={speedMultiplier} visible={true} />
                        <div className="mt-4">
                            <Social.MissionObjectiveHUD />
                        </div>
                    </div>

                    {/* Bottom Center: Cockpit Controls */}
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-end gap-4 pointer-events-auto z-40">
                        {/* Throttle */}
                        <div className="flex flex-col items-center">
                            <Cockpit.SpeedThrottleLever />
                        </div>
                        
                        {/* Main Dash */}
                        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex gap-6 items-center shadow-2xl">
                            <Cockpit.RadarScreen />
                            <div className="h-16 w-px bg-white/10"></div>
                            <div className="flex flex-col gap-2">
                                <Cockpit.WarpDriveButton />
                                <div className="flex gap-2 justify-center">
                                    <Cockpit.CameraResetThruster />
                                    <Cockpit.AutoPilotToggle />
                                </div>
                            </div>
                            <div className="h-16 w-px bg-white/10"></div>
                            <Cockpit.GyroscopeWidget />
                        </div>
                    </div>

                    {/* Right Panel: Tools */}
                    <div className="absolute bottom-32 right-6 flex flex-col gap-3 pointer-events-auto z-30">
                        <Cockpit.FOVController />
                        <Interaction.QuickTagBlaster />
                        <div className="bg-black/40 p-2 rounded-xl border border-white/10 flex flex-col gap-2">
                            <Utilities.ScreenshotDrone />
                            <Utilities.DimensionPortalSelector onSwitch={onBack} />
                        </div>
                    </div>

                    {/* Screen Center Overlays */}
                    <Cockpit.LookAtTargetReticle />
                    <Interaction.TractorBeamCursor x={window.innerWidth/2} y={window.innerHeight/2} />
                    <Interaction.SearchHoloKeyboard visible={showSearch} />
                    
                    {/* Context Sensitive */}
                    {selectedNode3D && (
                        <>
                            <Interaction.HoloContextMenu x={window.innerWidth/2 + 60} y={window.innerHeight/2} visible={true} />
                            <Interaction.DetailInspectorPanel isOpen={true} />
                        </>
                    )}
                </>
            )}

            {/* 4. NAVIGATION DOCK */}
        </div>
    );
};

export default React.memo(Explore3D);
