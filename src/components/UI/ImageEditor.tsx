import React, { useRef, useState } from 'react';

interface ImageEditorProps {
    onClose: () => void;
    onSave: (data: { title: string; description: string; imageUrl: string; imageFile?: File }) => void;
    initialData?: { title: string; description: string; imageUrl: string };
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ onClose, onSave, initialData }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl || null);
    const [selectedFile, setSelectedFile] = useState<File | undefined>();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setSelectedFile(file);
        }
    };

    const handleSave = () => {
        if (previewUrl) {
            onSave({ title, description, imageUrl: previewUrl, imageFile: selectedFile });
        }
    };

    return (
        <div className="absolute top-0 right-0 h-full w-full md:w-[400px] z-50 p-6 flex items-center">
            {/* Glassmorphism Panel */}
            <div className="w-full h-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-white flex flex-col gap-6 animate-slideInRight">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h2 className="text-xl font-serif tracking-widest">作品を飾る</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Preview Area */}
                <div
                    className="group relative w-full aspect-video bg-white/5 border border-dashed border-white/20 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center text-gray-400">
                            <span className="text-2xl block mb-2">📷</span>
                            <span className="text-xs tracking-wider">画像を選択</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-white tracking-widest">画像を変更</span>
                    </div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {/* Inputs */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 tracking-wider">タイトル</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400/50 transition-colors font-serif"
                            placeholder="作品のタイトル"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 tracking-wider">解説・想い</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 h-32 focus:outline-none focus:border-blue-400/50 transition-colors resize-none font-serif leading-relaxed"
                            placeholder="この写真に込められた想いや記憶..."
                        />
                    </div>
                </div>

                {/* Actions */}
                <button
                    onClick={handleSave}
                    disabled={!previewUrl}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                >
                    保存する
                </button>

            </div>
        </div>
    );
};
