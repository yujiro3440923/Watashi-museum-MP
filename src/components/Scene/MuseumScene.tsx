import { Suspense, type FC, useMemo, useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Vector3, Euler, Quaternion } from 'three';
import { Room } from './Room';
import { Frame } from './Frame';
import { Avatar } from './Avatar';
import { FirstPersonController } from './FirstPersonController';
import { PlayerSync } from '../../hooks/useMultiplayer';
import { MobileControls } from '../UI/MobileControls';

interface MuseumSceneProps {
    isEditMode: boolean;
    onFrameClick?: (id: string) => void;
    framesData?: Record<string, { imageUrl: string; title?: string; description?: string; isRotated?: boolean }>;
    isInteractionDisabled?: boolean;
    otherPlayers?: { id: string; position: [number, number, number]; rotation: [number, number, number] }[];
    museumId?: string;
    playerId?: string;
}

export const MuseumScene: FC<MuseumSceneProps> = ({ isEditMode, onFrameClick, framesData = {}, isInteractionDisabled = false, otherPlayers = [], museumId, playerId }) => {
    const [isSlideshow, setIsSlideshow] = useState(false);

    // Mobile Controls Refs
    const mobileMoveRef = useRef({ x: 0, y: 0 });
    const mobileLookRef = useRef({ x: 0, y: 0 });

    const handleMobileMove = (v: { x: number; y: number }) => {
        mobileMoveRef.current = v;
    };

    const handleMobileLook = (v: { x: number; y: number }) => {
        // Accumulate delta for the FirstPersonController to consume
        mobileLookRef.current.x += v.x;
        mobileLookRef.current.y += v.y;
    };

    // Generate frames programmatically
    const frames = useMemo(() => {
        const items = [];
        const wallOffset = 9.9;
        const spacing = 4;
        const countPerWall = 5;
        const startOffset = - ((countPerWall - 1) * spacing) / 2;

        for (let i = 0; i < countPerWall; i++) {
            items.push({ id: `frame-back-${i}`, position: [startOffset + i * spacing, 2, -wallOffset], rotation: [0, 0, 0] });
        }
        for (let i = 0; i < countPerWall; i++) {
            items.push({ id: `frame-left-${i}`, position: [-wallOffset, 2, startOffset + i * spacing], rotation: [0, Math.PI / 2, 0] });
        }
        for (let i = 0; i < countPerWall; i++) {
            items.push({ id: `frame-right-${i}`, position: [wallOffset, 2, startOffset + i * spacing], rotation: [0, -Math.PI / 2, 0] });
        }
        for (let i = 0; i < countPerWall; i++) {
            items.push({ id: `frame-front-${i}`, position: [startOffset + i * spacing, 2, wallOffset], rotation: [0, Math.PI, 0] });
        }
        return items as { id: string; position: [number, number, number]; rotation: [number, number, number] }[];
    }, []);

    const activeFrames = useMemo(() => {
        return frames.filter(f => framesData[f.id]?.imageUrl).map((f, index) => ({ ...f, data: framesData[f.id], originalIndex: index }));
    }, [frames, framesData]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                setIsSlideshow(prev => {
                    if (!prev && activeFrames.length > 0) return true;
                    return false;
                });
            } else if (e.key === 'Escape') {
                setIsSlideshow(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeFrames]);

    // Current slide info for overlay
    // REVISION: Move state up
    const [currentSlideIndex, setCurrentSlideIndex] = useState(-1);

    useEffect(() => {
        let interval: any;
        if (isSlideshow && activeFrames.length > 0) {
            setCurrentSlideIndex(0);
            interval = setInterval(() => {
                setCurrentSlideIndex(prev => (prev + 1) % activeFrames.length);
            }, 8000);
        } else {
            setCurrentSlideIndex(-1);
        }
        return () => clearInterval(interval);
    }, [isSlideshow, activeFrames]);


    return (
        <div className="w-full h-full relative">
            {/* Slideshow Overlay */}
            {isSlideshow && activeFrames[currentSlideIndex] && (
                <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-end pb-20 px-20 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                    <div className="text-white animate-fadeInUp">
                        <h2 className="text-4xl font-serif tracking-widest mb-4 drop-shadow-lg">
                            {activeFrames[currentSlideIndex].data.title || '無題'}
                        </h2>
                        <p className="text-lg font-light opacity-90 leading-relaxed max-w-2xl drop-shadow-md whitespace-pre-wrap">
                            {activeFrames[currentSlideIndex].data.description}
                        </p>
                    </div>
                    <div className="absolute top-8 right-8 text-xs text-white/50 tracking-widest">
                        SLIDESHOW MODE (TAB/ESC to Exit)
                    </div>
                </div>
            )}

            {/* Mobile Controls (Always visible for now, or use CSS media queries to hide on desktop) */}
            {!isSlideshow && !isEditMode && !isInteractionDisabled && (
                <MobileControls onMove={handleMobileMove} onLook={handleMobileLook} />
            )}

            <Canvas shadows camera={{ position: [0, 2, 8], fov: 60 }}>
                <color attach="background" args={['#202020']} />
                {!isSlideshow && <color attach="background" args={['#f0f0f0']} />}
                <fog attach="fog" args={[isSlideshow ? '#101010' : '#f0f0f0', 0, 30]} />

                <Suspense fallback={null}>
                    <Environment preset={isSlideshow ? "night" : "city"} />
                    <ambientLight intensity={isSlideshow ? 0.2 : 0.6} />
                    {isSlideshow && <pointLight position={[0, 5, 0]} intensity={0.5} />}

                    <Room />

                    {frames.map((frame) => (
                        <Frame
                            key={frame.id}
                            id={frame.id}
                            position={frame.position}
                            rotation={frame.rotation}
                            isEditMode={isEditMode}
                            onClick={onFrameClick}
                            imageUrl={framesData[frame.id]?.imageUrl}
                            isRotated={framesData[frame.id]?.isRotated}
                        />
                    ))}

                    {otherPlayers.map((player) => (
                        <Avatar
                            key={player.id}
                            id={player.id}
                            position={player.position}
                            rotation={player.rotation}
                        />
                    ))}

                    {museumId && playerId && <PlayerSync museumId={museumId} playerId={playerId} />}

                    {!isSlideshow && <FirstPersonController
                        enabled={!isInteractionDisabled}
                        moveRef={mobileMoveRef}
                        lookRef={mobileLookRef}
                    />}

                    {isSlideshow && activeFrames.length > 0 && (
                        <CameraMover
                            targetPosition={activeFrames[currentSlideIndex].position}
                            targetRotation={activeFrames[currentSlideIndex].rotation}
                        />
                    )}
                </Suspense>
            </Canvas>
        </div>
    );
};

// Helper component to move camera inside Canvas
const CameraMover = ({ targetPosition, targetRotation }: { targetPosition: [number, number, number], targetRotation: [number, number, number] }) => {
    const { camera } = useThree();
    useFrame((_state, delta) => {
        const targetPos = new Vector3(...targetPosition);
        const targetRot = new Euler(...targetRotation);

        const offset = new Vector3(0, 0, 2);
        offset.applyEuler(targetRot);
        const camTargetPos = targetPos.clone().add(offset);

        camera.position.lerp(camTargetPos, 2 * delta);
        camera.quaternion.slerp(new Quaternion().setFromEuler(targetRot), 2 * delta);
    });
    return null;
};
