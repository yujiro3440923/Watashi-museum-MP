import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { MuseumScene } from '../components/Scene/MuseumScene';
import { ImageEditor } from '../components/UI/ImageEditor';
import { useRemotePlayers } from '../hooks/useMultiplayer';
import { useMuseumData } from '../hooks/useMuseumData';
import { useAuth } from '../hooks/useAuth';

export const Museum: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { hash } = useLocation();

    // Auth & Owner check
    const { user } = useAuth();
    const isOwner = user?.uid === id;

    // Edit mode is active if URL hash is #edit OR if user is the owner
    const [isEditModeState, setIsEditModeState] = useState(hash === '#edit');

    // Auto-enable edit mode for owner
    useEffect(() => {
        if (isOwner) {
            setIsEditModeState(true);
        }
    }, [isOwner]);

    const isEditMode = isEditModeState;

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

    const handleSaveEditor = async (data: { title: string; description: string; imageUrl: string; isRotated?: boolean; imageFile?: File }) => {
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
                <div className="space-y-1 pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg tracking-widest drop-shadow-md opacity-80">
                            Museo No. <span className="font-sans font-bold">{id?.slice(0, 8)}</span>
                        </h2>
                        <button
                            onClick={() => {
                                const url = `${window.location.origin}/museum/${id}`;
                                navigator.clipboard.writeText(url);
                                alert("共有用URLをコピーしました！\n誰かに送って、あなたの美術館に招待しましょう。");
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white text-[10px] px-2 py-1 rounded border border-white/10 transition-colors flex items-center gap-1"
                            title="招待用URLをコピー"
                        >
                            <span>🔗</span> 共有
                        </button>
                    </div>
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
                    {isOwner ? (
                        <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-500 text-xs tracking-widest backdrop-blur-md flex items-center gap-2">
                            <span>👑 OWNER MODE</span>
                        </div>
                    ) : (
                        <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-blue-400 text-xs tracking-widest backdrop-blur-md">
                            VISITOR
                        </div>
                    )}
                    {isEditMode && !isOwner && (
                        <div className="px-3 py-1 bg-white/10 border border-white/20 rounded text-gray-300 text-xs tracking-widest backdrop-blur-md">
                            PREVIEW
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
