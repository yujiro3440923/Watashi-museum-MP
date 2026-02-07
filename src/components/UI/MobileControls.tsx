import React, { useState, useRef, useEffect } from 'react';

interface MobileControlsProps {
    onMove: (vector: { x: number; y: number }) => void;
    onLook: (delta: { x: number; y: number }) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onMove, onLook }) => {
    // Joystick State
    const [stickPosition, setStickPosition] = useState({ x: 0, y: 0 });
    const [isMoving, setIsMoving] = useState(false);
    const joyBaseRef = useRef<HTMLDivElement>(null);
    const joyTouchIdRef = useRef<number | null>(null);
    const joyCenterRef = useRef({ x: 0, y: 0 });

    // Look State
    const lookTouchIdRef = useRef<number | null>(null);
    const lastLookRef = useRef({ x: 0, y: 0 });

    const MAX_RADIUS = 50;

    // Handle Joystick Touch
    const handleJoyStart = (e: React.TouchEvent) => {
        // Prevent default only if necessary, but here we want to prevent scrolling
        // e.preventDefault(); 

        const touch = e.changedTouches[0];
        joyTouchIdRef.current = touch.identifier;
        setIsMoving(true);

        if (joyBaseRef.current) {
            const rect = joyBaseRef.current.getBoundingClientRect();
            joyCenterRef.current = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        }

        // Initial move calculation (usually 0 if tapped center, but good to handle)
        updateStick(touch.clientX, touch.clientY);
    };

    const handleJoyMove = (e: React.TouchEvent) => {
        if (joyTouchIdRef.current === null) return;

        const touch = Array.from(e.changedTouches).find(t => t.identifier === joyTouchIdRef.current);
        if (touch) {
            updateStick(touch.clientX, touch.clientY);
        }
    };

    const handleJoyEnd = (e: React.TouchEvent) => {
        if (joyTouchIdRef.current === null) return;

        const touch = Array.from(e.changedTouches).find(t => t.identifier === joyTouchIdRef.current);
        if (touch) {
            joyTouchIdRef.current = null;
            setIsMoving(false);
            setStickPosition({ x: 0, y: 0 });
            onMove({ x: 0, y: 0 });
        }
    };

    const updateStick = (clientX: number, clientY: number) => {
        const dx = clientX - joyCenterRef.current.x;
        const dy = clientY - joyCenterRef.current.y;

        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const clampedDistance = Math.min(distance, MAX_RADIUS);

        const x = Math.cos(angle) * clampedDistance;
        const y = Math.sin(angle) * clampedDistance;

        setStickPosition({ x, y });

        // Normalize output (-1 to 1)
        onMove({
            x: x / MAX_RADIUS,
            y: y / MAX_RADIUS
        });
    };

    // Handle Look (Right side of screen)
    const handleLookStart = (e: React.TouchEvent) => {
        // Avoid conflict with joystick if multi-touch
        const touch = e.changedTouches[0];

        // Simple check: if touch is on the right half of screen, treat as look
        if (touch.clientX > window.innerWidth / 2) {
            lookTouchIdRef.current = touch.identifier;
            lastLookRef.current = { x: touch.clientX, y: touch.clientY };
        }
    };

    const handleLookMove = (e: React.TouchEvent) => {
        if (lookTouchIdRef.current === null) return;

        const touch = Array.from(e.changedTouches).find(t => t.identifier === lookTouchIdRef.current);
        if (touch) {
            const dx = touch.clientX - lastLookRef.current.x;
            const dy = touch.clientY - lastLookRef.current.y;

            onLook({ x: dx, y: dy });

            lastLookRef.current = { x: touch.clientX, y: touch.clientY };
        }
    };

    const handleLookEnd = (e: React.TouchEvent) => {
        if (lookTouchIdRef.current === null) return;

        const touch = Array.from(e.changedTouches).find(t => t.identifier === lookTouchIdRef.current);
        if (touch) {
            lookTouchIdRef.current = null;
            onLook({ x: 0, y: 0 }); // Optionally reset or specifically signal end
        }
    };

    // Attach Look listeners to window or a purely transparent overlay
    // We attach them to a overlay div primarily

    return (
        <div className="absolute inset-0 z-40 pointer-events-none select-none overflow-hidden touch-none">
            {/* Joystick Area (Bottom Left) */}
            <div
                className="absolute bottom-10 left-10 w-32 h-32 pointer-events-auto"
                onTouchStart={handleJoyStart}
                onTouchMove={handleJoyMove}
                onTouchEnd={handleJoyEnd}
                onTouchCancel={handleJoyEnd}
            >
                <div
                    ref={joyBaseRef}
                    className="w-full h-full rounded-full bg-white/10 border border-white/20 backdrop-blur-sm relative flex items-center justify-center"
                >
                    <div
                        className="w-12 h-12 rounded-full bg-white/50 shadow-lg absolute transition-transform duration-75 ease-out"
                        style={{
                            transform: `translate(${stickPosition.x}px, ${stickPosition.y}px)`
                        }}
                    />
                </div>
            </div>

            {/* Look Area (Right Side Overlay for easier triggering) */}
            <div
                className="absolute top-0 right-0 w-1/2 h-full pointer-events-auto opacity-0"
                onTouchStart={handleLookStart}
                onTouchMove={handleLookMove}
                onTouchEnd={handleLookEnd}
                onTouchCancel={handleLookEnd}
            />

            {/* Instruction (Optional) */}
            <div className="absolute bottom-4 w-full text-center text-white/30 text-xs pointer-events-none">
                Left: Move | Right: Look
            </div>
        </div>
    );
};
