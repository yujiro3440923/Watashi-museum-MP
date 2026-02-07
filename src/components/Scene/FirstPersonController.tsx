import { useRef, useEffect, type FC } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Euler } from 'three';

const MOVEMENT_SPEED = 0.15;
const ROTATION_SPEED = 0.002;
const MOBILE_ROTATION_SPEED = 0.005; // Slightly faster for touch

export const FirstPersonController: FC<{
    isLocked?: boolean;
    enabled?: boolean;
    moveRef?: React.MutableRefObject<{ x: number; y: number }>;
    lookRef?: React.MutableRefObject<{ x: number; y: number }>;
}> = ({ isLocked = false, enabled = true, moveRef, lookRef }) => {
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
            dragRef.current.active = true;
            dragRef.current.prevX = e.clientX;
            dragRef.current.prevY = e.clientY;
        };

        const handleMouseUp = () => {
            dragRef.current.active = false;
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!dragRef.current.active && !isLocked) return;

            const dx = Math.abs(e.clientX - dragRef.current.prevX);
            const dy = Math.abs(e.clientY - dragRef.current.prevY);
            if (dx < 2 && dy < 2) return;

            const movementX = isLocked ? e.movementX : e.clientX - dragRef.current.prevX;
            // const movementY = isLocked ? e.movementY : e.clientY - dragRef.current.prevY; 

            const euler = new Euler(0, 0, 0, 'YXZ');
            euler.setFromQuaternion(camera.quaternion);

            euler.y -= movementX * ROTATION_SPEED;
            // euler.x -= movementY * ROTATION_SPEED;

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

        // --- Rotation (Mobile) ---
        if (lookRef && (lookRef.current.x !== 0 || lookRef.current.y !== 0)) {
            const euler = new Euler(0, 0, 0, 'YXZ');
            euler.setFromQuaternion(camera.quaternion);

            // Apply look delta
            euler.y -= lookRef.current.x * MOBILE_ROTATION_SPEED;
            // euler.x -= lookRef.current.y * MOBILE_ROTATION_SPEED; // Optional Pitch

            camera.quaternion.setFromEuler(euler);

            // Reset delta
            lookRef.current = { x: 0, y: 0 };
        }

        // --- Movement ---
        const direction = new Vector3();

        // Keyboard inputs
        const kbForward = Number(moveState.current.backward) - Number(moveState.current.forward);
        const kbSide = Number(moveState.current.left) - Number(moveState.current.right);

        // Mobile inputs
        let mobForward = 0;
        let mobSide = 0;

        if (moveRef) {
            // Joystick y: negative is up (forward) usually in screen coords, 
            // but our MobileControls returns:
            // y < 0 (up), y > 0 (down)
            // In 3D: forward is negative Z. So y < 0 should map to negative Z.
            // So we add y directly?
            // Let's test: Stick Up -> y=-1. Z should be -1 (Forward). Correct.
            mobForward = moveRef.current.y;
            mobSide = moveRef.current.x;
        }

        const frontVector = new Vector3(0, 0, kbForward + mobForward);
        const sideVector = new Vector3(kbSide + mobSide, 0, 0);

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .applyEuler(camera.rotation);

        direction.y = 0;

        camera.position.addScaledVector(direction, MOVEMENT_SPEED);

        if (camera.position.y !== 2) camera.position.y = 2;
    });

    return null;
};
