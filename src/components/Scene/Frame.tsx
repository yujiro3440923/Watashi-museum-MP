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
                <FrameImage imageUrl={imageUrl} />
            ) : (
                <mesh position={[0, 0, 0.06]}>
                    <planeGeometry args={[2, 1.5]} />
                    <meshStandardMaterial color={imageColor} />
                </mesh>
            )}
        </group>
    );
};

// Helper component to handle texture loading with error logging
const FrameImage = ({ imageUrl }: { imageUrl: string }) => {
    const [error, setError] = useState(false);

    if (error) {
        return (
            <mesh position={[0, 0, 0.06]}>
                <planeGeometry args={[2, 1.5]} />
                <meshStandardMaterial color="#ff0000" />
                <Html position={[0, 0, 0.1]} center>
                    <div className="bg-black/80 text-white text-xs p-1 rounded">Image Load Error</div>
                </Html>
            </mesh>
        );
    }

    // Note: zwei's Image component handles loading internally but doesn't expose easy onError.
    // For debugging, we can stick with Image but adding a key to force re-mount if url changes.
    // To truly catch error, standard <mesh> with useTexture is better, but Image has nice shader props.
    // Let's wrap it in an error boundary logic or just use simple logging via a side-effect texture loader for debugging.

    // Simple debug approach:
    const img = new window.Image();
    img.src = imageUrl;
    img.onerror = (e) => console.error("Failed to load image texture:", imageUrl, e);

    return (
        <Image
            url={imageUrl}
            position={[0, 0, 0.06]}
            scale={[2, 1.5]}
            transparent
            opacity={1}
        />
    );
};

{
    isEditMode && hovered && (
        <Html position={[0, -1, 0.2]} center>
            <div className="bg-black/80 text-white px-2 py-1 rounded text-xs select-none pointer-events-none whitespace-nowrap">
                Click to Edit
            </div>
        </Html>
    )
}
        </group >
    );
};
