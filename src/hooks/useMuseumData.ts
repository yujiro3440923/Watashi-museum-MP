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
        if (!museumId) {
            console.error("museumIdが設定されていません");
            throw new Error("ミュージアムIDが設定されていません");
        }

        console.log("フレーム保存開始:", { frameId, hasFile: !!file, data });

        try {
            let finalImageUrl = data.imageUrl;

            // Upload image if a new file is provided
            if (file) {
                console.log("画像をアップロード中...", {
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type
                });

                const storagePath = `museums/${museumId}/${frameId}/${file.name}`;
                console.log("Storage path:", storagePath);

                const storageRef = ref(storage, storagePath);
                await uploadBytes(storageRef, file);
                console.log("アップロード完了、URLを取得中...");

                finalImageUrl = await getDownloadURL(storageRef);
                console.log("画像URL取得成功:", finalImageUrl);
            } else {
                console.log("ファイルなし、既存のURLを使用:", finalImageUrl);
            }

            // Save to Firestore
            console.log("Firestoreに保存中...");
            const frameRef = doc(db, 'museums', museumId, 'frames', frameId);
            await setDoc(frameRef, {
                title: data.title,
                description: data.description,
                imageUrl: finalImageUrl,
                updatedAt: new Date()
            }, { merge: true });

            console.log("Firestoreへの保存完了");

        } catch (e) {
            console.error("フレーム保存エラーの詳細:", e);
            if (e instanceof Error) {
                console.error("エラーメッセージ:", e.message);
                console.error("スタックトレース:", e.stack);
            }
            const errorMessage = e instanceof Error ? e.message : "不明なエラー";
            throw new Error(`保存に失敗しました: ${errorMessage}`);
        }
    };

    return { frames, saveFrame, loading };
};
