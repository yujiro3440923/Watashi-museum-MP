import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
    doc,
    setDoc,
    onSnapshot,
    collection,
    serverTimestamp
} from 'firebase/firestore';
import { useThree, useFrame } from '@react-three/fiber';

export interface PlayerData {
    id: string;
    position: [number, number, number];
    rotation: [number, number, number];
    lastSeen: any;
}

// Hook for fetching other players (Runs outside Canvas)
export const useRemotePlayers = (museumId: string | undefined, playerId: string) => {
    const [others, setOthers] = useState<PlayerData[]>([]);

    useEffect(() => {
        if (!museumId) return;

        // Basic check to see if Firebase is configured (dummy check for now)
        if (db.app.options.apiKey === "API_KEY") {
            console.warn("Firebase is not configured. Multiplayer disabled.");
            return;
        }

        try {
            // Listen for other players
            const playersRef = collection(db, 'museums', museumId, 'players');
            const unsubscribe = onSnapshot(playersRef, (snapshot) => {
                const activePlayers: PlayerData[] = [];
                // const now = Date.now();

                snapshot.forEach((doc) => {
                    const data = doc.data() as PlayerData;
                    // Filter out self explicitly
                    if (doc.id !== playerId) {
                        const lastSeen = data.lastSeen?.toMillis?.() || 0;
                        // Shorten timeout to 10 seconds to remove ghosts quickly
                        if (Date.now() - lastSeen < 10000) {
                            activePlayers.push({ ...data, id: doc.id });
                        }
                    }
                });
                setOthers(activePlayers);
            }, (error) => {
                console.error("Firestore snapshot error:", error);
            });

            return () => {
                unsubscribe();
            };
        } catch (e) {
            console.error("Error in multiplayer effect:", e);
        }
    }, [museumId, playerId]);

    return others;
};

// Component for Syncing MY position (Must be inside Canvas)
export const PlayerSync = ({ museumId, playerId }: { museumId: string | undefined, playerId: string }) => {
    const { camera } = useThree();

    useFrame((state) => {
        if (!museumId) return;
        if (db.app.options.apiKey === "API_KEY") return;

        const frameCount = state.clock.getElapsedTime() * 60;
        if (Math.floor(frameCount) % 10 !== 0) return;

        try {
            const playerRef = doc(db, 'museums', museumId, 'players', playerId);
            const { x, y, z } = camera.position;
            const { x: rx, y: ry, z: rz } = camera.rotation;

            setDoc(playerRef, {
                id: playerId,
                position: [x, y, z],
                rotation: [rx, ry, rz],
                lastSeen: serverTimestamp()
            }, { merge: true }).catch(() => {
                // Suppress log spam
            });
        } catch (e) {
            // Silently fail
        }
    });

    return null;
};
