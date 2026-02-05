import { useState, type FC } from 'react';
import { Html, Image } from '@react-three/drei';

interface FrameProps {
    id: string;
    position: [number, number, number];
    rotation: [number, number, number];
    isEditMode: boolean;
    onClick?: (id: string) => void;
    imageUrl?: string;
}

export const Frame: FC<FrameProps> = ({ id, position, rotation, isEditMode, onClick, imageUrl }) => {
    const [hovered, setHover] = useState(false);

    // Minimalist gray frame
    const frameColor = hovered && isEditMode ? '#ffbd2e' : '#555';
    const imageColor = '#e0e0e0';

    return (
        <group position={position} rotation={rotation}>
            <spotLight
                position={[0, 2, 0.5]}
                angle={0.6}
                penumbra={0.5}
                intensity={1.5}
                distance={5}
                color="#ffffff"
            />

            {/* Frame Border */}
            <mesh
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
                onClick={(e) => {
                    e.stopPropagation();
                    console.log('Frame clicked:', id, 'EditMode:', isEditMode);
                    if (isEditMode && onClick) onClick(id);
                }}
            >
                <boxGeometry args={[2.2, 1.7, 0.1]} />
                <meshStandardMaterial color={frameColor} />
            </mesh>

            {/* Image Canvas (Inset) */}
            {imageUrl ? (
                <Image
                    url={imageUrl}
                    position={[0, 0, 0.06]}
                    scale={[2, 1.5]}
                />
            ) : (
                <mesh position={[0, 0, 0.06]}>
                    <planeGeometry args={[2, 1.5]} />
                    <meshStandardMaterial color={imageColor} />
                </mesh>
            )}

            {isEditMode && hovered && (
                <Html position={[0, -1, 0.2]} center>
                    <div className="bg-black/80 text-white px-2 py-1 rounded text-xs select-none pointer-events-none whitespace-nowrap">
                        Click to Edit
                    </div>
                </Html>
            )}
        </group>
    );
};
