import type { FC } from 'react';

export const Room: FC = () => {
    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.1} />
            </mesh>

            {/* Walls */}
            {/* Back Wall */}
            <mesh position={[0, 5, -10]} receiveShadow>
                <planeGeometry args={[50, 20]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.2} />
            </mesh>

            {/* Left Wall */}
            <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[50, 20]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.2} />
            </mesh>

            {/* Right Wall */}
            <mesh position={[10, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[50, 20]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.2} />
            </mesh>

            {/* Front Wall (Behind camera start) */}
            <mesh position={[0, 5, 10]} rotation={[0, Math.PI, 0]} receiveShadow>
                <planeGeometry args={[50, 20]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.2} />
            </mesh>
        </group>
    );
};
