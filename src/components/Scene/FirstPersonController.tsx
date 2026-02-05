import { useRef, useEffect, type FC } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Euler } from 'three';

const MOVEMENT_SPEED = 0.15;
const ROTATION_SPEED = 0.002;

export const FirstPersonController: FC<{ isLocked?: boolean; enabled?: boolean }> = ({ isLocked = false, enabled = true }) => {
    const { camera } = useThree();
    const moveState = useRef({
        forward: false,
        backward: false,
        left: false,
        right: false,
    });
    const dragRef = useRef({
        active: false,
        prevX: 0,
        prevY: 0,
    });

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'KeyW': moveState.current.forward = true; break;
                case 'KeyS': moveState.current.backward = true; break;
                case 'KeyA': moveState.current.left = true; break;
                case 'KeyD': moveState.current.right = true; break;
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'KeyW': moveState.current.forward = false; break;
                case 'KeyS': moveState.current.backward = false; break;
                case 'KeyA': moveState.current.left = false; break;
                case 'KeyD': moveState.current.right = false; break;
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            // Only start drag if not clicking on an interactive element?
            // Actually, we want to allow looking around anytime, but we need to differentiate "click" from "drag".
            dragRef.current.active = true;
            dragRef.current.prevX = e.clientX;
            dragRef.current.prevY = e.clientY;
        };

        const handleMouseUp = () => {
            dragRef.current.active = false;
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!dragRef.current.active && !isLocked) return;

            // Check if we moved significantly to consider it a drag
            const dx = Math.abs(e.clientX - dragRef.current.prevX);
            const dy = Math.abs(e.clientY - dragRef.current.prevY);
            if (dx < 2 && dy < 2) return; // Ignore tiny movements (clicks)

            const movementX = isLocked ? e.movementX : e.clientX - dragRef.current.prevX;
            // For Y, we might want to clamp or invert
            // const movementY = isLocked ? e.movementY : e.clientY - dragRef.current.prevY; 

            // Rotate camera (Yaw only for simple walking, or Yaw+Pitch)
            // Lets do simple Yaw (left/right) for now to keep floor level, 
            // or use Euler to handle both if we want to look up/down.
            const euler = new Euler(0, 0, 0, 'YXZ');
            euler.setFromQuaternion(camera.quaternion);

            euler.y -= movementX * ROTATION_SPEED;
            // euler.x -= movementY * ROTATION_SPEED; // Uncomment for look up/down

            camera.quaternion.setFromEuler(euler);

            if (!isLocked) {
                dragRef.current.prevX = e.clientX;
                dragRef.current.prevY = e.clientY;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [camera, isLocked, enabled]);

    useFrame(() => {
        if (!enabled) return;

        const direction = new Vector3();
        const frontVector = new Vector3(
            0,
            0,
            Number(moveState.current.backward) - Number(moveState.current.forward)
        );
        const sideVector = new Vector3(
            Number(moveState.current.left) - Number(moveState.current.right),
            0,
            0
        );

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .applyEuler(camera.rotation);

        // Keep movement on the XZ plane (prevent flying)
        direction.y = 0;

        camera.position.addScaledVector(direction, MOVEMENT_SPEED);

        // Floor constraint (simple)
        if (camera.position.y !== 2) camera.position.y = 2; // Eye level
    });

    return null;
};
