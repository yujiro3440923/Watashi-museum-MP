import { useState, type FC } from 'react';
import { Html, Image } from '@react-three/drei';

interface FrameProps {
    id: string;
    position: [number, number, number];
    rotation: [number, number, number];
    isEditMode: boolean;
    onClick?: (id: string) => void;
    isRotated?: boolean;
}

export const Frame: FC<FrameProps> = ({ id, position, rotation, isEditMode, onClick, imageUrl, isRotated = false }) => {
    const [hovered, setHover] = useState(false);

    // Minimalist gray frame
    const frameColor = hovered && isEditMode ? '#ffbd2e' : '#555';
    const imageColor = '#e0e0e0';

    // Landscape (Default) vs Portrait
    // Frame: [2.2, 1.7, 0.1] vs [1.7, 2.2, 0.1]
    const frameArgs: [number, number, number] = isRotated ? [1.7, 2.2, 0.1] : [2.2, 1.7, 0.1];
    // Image Plane: [2, 1.5] vs [1.5, 2]
    const imageArgs: [number, number] = isRotated ? [1.5, 2] : [2, 1.5];

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
                <boxGeometry args={frameArgs} />
                <meshStandardMaterial color={frameColor} />
            </mesh>

            {/* Image Canvas (Inset) */}
            {imageUrl ? (
                <FrameImage imageUrl={imageUrl} size={imageArgs} />
            ) : (
                <mesh position={[0, 0, 0.06]}>
                    <planeGeometry args={imageArgs} />
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

// Helper component to handle texture loading with error logging
const FrameImage = ({ imageUrl, size }: { imageUrl: string, size: [number, number] }) => {
    const isBlob = imageUrl.startsWith('blob:');

    if (isBlob) {
        return (
            <mesh position={[0, 0, 0.06]}>
                <planeGeometry args={size} />
                <meshStandardMaterial color="#880000" />
                <Html position={[0, 0, 0.1]} center>
                    <div className="bg-red-900/95 text-white text-[10px] p-2 rounded border border-red-500 text-center w-40 break-all leading-tight">
                        <strong>⚠️ ERROR</strong><br />
                        <span className="opacity-75">Failed to load:</span><br />
                        <span className="text-[8px] font-mono select-all">{imageUrl.slice(0, 30)}...</span>
                    </div>
                </Html>
            </mesh>
        );
    }

    // Simple debug approach:
    const img = new window.Image();
    img.src = imageUrl;
    img.onerror = (e) => console.error("Failed to load image texture:", imageUrl, e);

    return (
        <Image
            url={imageUrl}
            position={[0, 0, 0.06]}
            scale={size}
            transparent
            opacity={1}
        />
    );
};
