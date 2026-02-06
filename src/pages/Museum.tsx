import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { MuseumScene } from '../components/Scene/MuseumScene';
import { ImageEditor } from '../components/UI/ImageEditor';
import { useRemotePlayers } from '../hooks/useMultiplayer';
import { useMuseumData } from '../hooks/useMuseumData';

export const Museum: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { hash } = useLocation();
    const isEditMode = hash === '#edit';
    const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);

    // Data Hooks
    const { frames, saveFrame, error } = useMuseumData(id);

    // Multiplayer Logic
    const [playerId] = useState(() => uuidv4());
    const others = useRemotePlayers(id, playerId);

    const handleFrameClick = (frameId: string) => {
        if (isEditMode) {
            setSelectedFrameId(frameId);
        }
    };

    const handleCloseEditor = () => {
        setSelectedFrameId(null);
    };

    const handleSaveEditor = async (data: { title: string; description: string; imageUrl: string; imageFile?: File }) => {
        if (selectedFrameId) {
            console.log('Saving frame:', selectedFrameId, data);
            await saveFrame(selectedFrameId, data, data.imageFile);
        }
        setSelectedFrameId(null);
    };

    return (
        <div className="w-full h-full bg-black text-white relative font-serif">
            {/* Header HUD */}
            <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
                <div className="space-y-1">
                    <h2 className="text-lg tracking-widest drop-shadow-md opacity-80">
                        Museo No. <span className="font-sans">{id?.slice(0, 8)}</span>
                    </h2>
                    <div className="text-xs text-gray-400 tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>来館者数: <span className="font-sans">{others.length + 1}</span>名</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 pointer-events-auto">
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-xs hover:bg-white/10 transition-colors tracking-widest"
                    >
                        ホームに戻る
                    </button>
                    {isEditMode && (
                        <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-500 text-xs tracking-widest backdrop-blur-md">
                            編集中
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto w-full max-w-lg">
                    <div className="bg-red-500/80 backdrop-blur-md text-white p-4 rounded-lg shadow-lg border border-red-400">
                        <h3 className="font-bold flex items-center gap-2">
                            <span>⚠️</span> データの読み込みに失敗しました
                        </h3>
                        <p className="text-sm mt-1">{error.message}</p>
                        {error.message.includes("Missing or insufficient permissions") && (
                            <div className="mt-2 text-xs bg-black/20 p-2 rounded">
                                <strong>管理者の方へ:</strong><br />
                                Firestoreのセキュリティルールが設定されていない可能性があります。<br />
                                <code>FIREBASE_RULES_UPDATE.md</code> を確認して、全ユーザーへの読み取り権限を許可してください。
                            </div>
                        )}
                    </div>
                </div>
            )}

            <MuseumScene
                isEditMode={isEditMode}
                onFrameClick={handleFrameClick}
                framesData={frames}
                isInteractionDisabled={!!selectedFrameId}
                otherPlayers={others}
                museumId={id}
                playerId={playerId}
            />

            {isEditMode && selectedFrameId && (
                <ImageEditor
                    onClose={handleCloseEditor}
                    onSave={handleSaveEditor}
                    initialData={frames[selectedFrameId]}
                />
            )}
        </div>
    );
};
