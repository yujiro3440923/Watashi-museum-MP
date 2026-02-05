import { Suspense, type FC, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Room } from './Room';
import { Frame } from './Frame';
import { Avatar } from './Avatar';
import { FirstPersonController } from './FirstPersonController';
import { PlayerSync } from '../../hooks/useMultiplayer';

interface MuseumSceneProps {
    isEditMode: boolean;
    onFrameClick?: (id: string) => void;
    framesData?: Record<string, { imageUrl: string }>;
    isInteractionDisabled?: boolean;
    otherPlayers?: { id: string; position: [number, number, number]; rotation: [number, number, number] }[];
    museumId?: string;
    playerId?: string;
}

export const MuseumScene: FC<MuseumSceneProps> = ({ isEditMode, onFrameClick, framesData = {}, isInteractionDisabled = false, otherPlayers = [], museumId, playerId }) => {

    // Generate frames programmatically
    const frames = useMemo(() => {
        const items = [];
        const wallOffset = 9.9;
        const spacing = 4;
        const countPerWall = 5;
        const startOffset = - ((countPerWall - 1) * spacing) / 2; // Center them

        // Back Wall (z = -10)
        for (let i = 0; i < countPerWall; i++) {
            items.push({
                id: `frame-back-${i}`,
                position: [startOffset + i * spacing, 2, -wallOffset] as [number, number, number],
                rotation: [0, 0, 0] as [number, number, number],
            });
        }

        // Left Wall (x = -10)
        for (let i = 0; i < countPerWall; i++) {
            items.push({
                id: `frame-left-${i}`,
                position: [-wallOffset, 2, startOffset + i * spacing] as [number, number, number],
                rotation: [0, Math.PI / 2, 0] as [number, number, number],
            });
        }

        // Right Wall (x = 10)
        for (let i = 0; i < countPerWall; i++) {
            items.push({
                id: `frame-right-${i}`,
                position: [wallOffset, 2, startOffset + i * spacing] as [number, number, number],
                rotation: [0, -Math.PI / 2, 0] as [number, number, number],
            });
        }

        // Front Wall (z = 10)
        for (let i = 0; i < countPerWall; i++) {
            items.push({
                id: `frame-front-${i}`,
                position: [startOffset + i * spacing, 2, wallOffset] as [number, number, number],
                rotation: [0, Math.PI, 0] as [number, number, number],
            });
        }

        return items;
    }, []);

    return (
        <div className="w-full h-full">
            <Canvas shadows camera={{ position: [0, 2, 8], fov: 60 }}>
                <color attach="background" args={['#f0f0f0']} />
                <fog attach="fog" args={['#f0f0f0', 0, 30]} />

                <Suspense fallback={null}>
                    <Environment preset="city" />
                    <ambientLight intensity={0.6} />

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

                    {/* Sync logic runs inside Canvas */}
                    {museumId && playerId && <PlayerSync museumId={museumId} playerId={playerId} />}

                    <FirstPersonController enabled={!isInteractionDisabled} />
                </Suspense>
            </Canvas>
        </div>
    );
};
