import { type FC } from 'react';
import { Html } from '@react-three/drei';

interface AvatarProps {
    id: string;
    position: [number, number, number];
    rotation: [number, number, number];
    isSelf?: boolean;
}

export const Avatar: FC<AvatarProps> = ({ id, position, rotation, isSelf = false }) => {
    if (isSelf) return null; // Don't render self

    return (
        <group position={position} rotation={rotation}>
            {/* Simple Capsule Avatar */}
            <mesh position={[0, 1, 0]}>
                <capsuleGeometry args={[0.3, 1, 4, 8]} />
                <meshStandardMaterial color="#4287f5" />
            </mesh>

            {/* Head */}
            <mesh position={[0, 1.8, 0]}>
                <sphereGeometry args={[0.25]} />
                <meshStandardMaterial color="#4287f5" />
            </mesh>

            {/* Label */}
            <Html position={[0, 2.3, 0]} center>
                <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                    Visitor {id.slice(0, 4)}
                </div>
            </Html>
        </group>
    );
};
