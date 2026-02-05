import { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import {
    doc,
    onSnapshot,
    setDoc,
    collection
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage';

export interface FrameData {
    title: string;
    description: string;
    imageUrl: string;
}

export const useMuseumData = (museumId: string | undefined) => {
    const [frames, setFrames] = useState<Record<string, FrameData>>({});
    const [loading, setLoading] = useState(true);

    // Load frames from properties collection
    useEffect(() => {
        if (!museumId) return;
        if (db.app.options.apiKey === "API_KEY") {
            setLoading(false);
            return;
        }

        try {
            // Using a subcollection 'frames' for scalability, 
            // or we could store all in one document if small.
            // Let's use a subcollection: museums/{museumId}/frames/{frameId}
            const framesRef = collection(db, 'museums', museumId, 'frames');

            const unsubscribe = onSnapshot(framesRef, (snapshot) => {
                const newFrames: Record<string, FrameData> = {};
                snapshot.forEach((doc) => {
                    newFrames[doc.id] = doc.data() as FrameData;
                });
                setFrames(newFrames);
                setLoading(false);
            }, (err) => {
                console.error("Error fetching frames:", err);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (e) {
            console.error("Error setting up museum listener:", e);
            setLoading(false);
        }
    }, [museumId]);

    const saveFrame = async (frameId: string, data: FrameData, file?: File) => {
        if (!museumId) return;

        try {
            let finalImageUrl = data.imageUrl;

            // Upload image if a new file is provided
            if (file) {
                const storageRef = ref(storage, `museums/${museumId}/${frameId}/${file.name}`);
                await uploadBytes(storageRef, file);
                finalImageUrl = await getDownloadURL(storageRef);
            }

            // Save to Firestore
            const frameRef = doc(db, 'museums', museumId, 'frames', frameId);
            await setDoc(frameRef, {
                title: data.title,
                description: data.description,
                imageUrl: finalImageUrl,
                updatedAt: new Date()
            }, { merge: true });

        } catch (e) {
            console.error("Error saving frame:", e);
            alert("Failed to save changes. Check console for details.");
        }
    };

    return { frames, saveFrame, loading };
};
