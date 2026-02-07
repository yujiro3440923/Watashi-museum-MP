import React, { useRef, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';

interface ImageEditorProps {
    onClose: () => void;
    onSave: (data: { title: string; description: string; imageUrl: string; isRotated?: boolean; imageFile?: File }) => Promise<void> | void;
    initialData?: { title: string; description: string; imageUrl: string; isRotated?: boolean };
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ onClose, onSave, initialData }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [isRotated, setIsRotated] = useState(initialData?.isRotated || false);

    // Image & Cropping State
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl || null);
    const [originalFileUrl, setOriginalFileUrl] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
        setCroppedAreaPixels(currentCroppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            // Only set crossOrigin for external URLs, not for blob URLs
            if (url.startsWith('http://') || url.startsWith('https://')) {
                image.setAttribute('crossOrigin', 'anonymous');
            }
            image.src = url;
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: Area, rotation = 0): Promise<string> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return '';
        }

        const maxSize = Math.max(image.width, image.height);
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

        canvas.width = safeArea;
        canvas.height = safeArea;

        // Translate and Rotate around center
        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        // Draw image centered in safe area
        ctx.drawImage(
            image,
            safeArea / 2 - image.width * 0.5,
            safeArea / 2 - image.height * 0.5
        );

        const data = ctx.getImageData(0, 0, safeArea, safeArea);

        // Resize canvas to final crop size
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        // Place the cropped image data into the resized canvas
        ctx.putImageData(
            data,
            Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
            Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(URL.createObjectURL(blob));
                }
            }, 'image/jpeg');
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setOriginalFileUrl(url); // Keep original to crop
            setPreviewUrl(url);
            setIsCropping(true); // Auto start cropping on upload
        }
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleCropSave = async () => {
        if (originalFileUrl && croppedAreaPixels) {
            setIsLoading(true);
            try {
                const croppedImage = await getCroppedImg(originalFileUrl, croppedAreaPixels, rotation);
                setPreviewUrl(croppedImage);
                setIsCropping(false);
            } catch (e) {
                console.error("Crop error:", e);
                alert("画像の切り抜きに失敗しました。");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSave = async () => {
        if (!previewUrl) {
            alert("画像を選択してください。");
            return;
        }

        if (!title.trim()) {
            alert("タイトルを入力してください。");
            return;
        }

        setIsLoading(true);
        try {
            console.log("保存処理を開始します...", { title, description, previewUrl, isRotated });

            let fileToUpload: File | undefined = undefined;
            if (previewUrl.startsWith('blob:')) {
                console.log("Blob URLから画像を取得中...");
                const response = await fetch(previewUrl);
                if (!response.ok) {
                    throw new Error(`画像の取得に失敗しました: ${response.status}`);
                }
                const blob = await response.blob();
                console.log("Blob取得成功:", blob.size, "bytes");
                fileToUpload = new File([blob], "cropped_image.jpg", { type: "image/jpeg" });
            }

            console.log("onSaveを呼び出します...", { fileToUpload: !!fileToUpload });
            await onSave({ title, description, imageUrl: previewUrl, isRotated, imageFile: fileToUpload });
            console.log("保存完了");
            onClose(); // 保存成功時に確実に閉じる
        } catch (e) {
            console.error("保存エラーの詳細:", e);
            const errorMessage = e instanceof Error ? e.message : "不明なエラー";
            alert(`保存に失敗しました。\n詳細: ${errorMessage}\n\nコンソールを確認してください。`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="absolute top-0 right-0 h-full w-full md:w-[400px] z-50 p-6 flex items-center">
            {/* Glassmorphism Panel */}
            <div className="w-full h-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-white flex flex-col gap-6 animate-slideInRight relative overflow-y-auto max-h-full">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h2 className="text-xl font-serif tracking-widest">{isCropping ? '位置を調整' : '作品を飾る'}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {isCropping && originalFileUrl ? (
                    <div className="flex flex-col gap-4">
                        <div className="relative w-full h-[300px] bg-black/50 rounded-lg overflow-hidden border border-white/10">
                            <Cropper
                                image={originalFileUrl}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={4 / 3}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                onRotationChange={setRotation}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-400">Zoom</label>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-400">Rotation</label>
                                <input
                                    type="range"
                                    value={rotation}
                                    min={0}
                                    max={360}
                                    step={1}
                                    onChange={(e) => setRotation(Number(e.target.value))}
                                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleCropSave}
                            disabled={isLoading}
                            className="w-full py-2 bg-white text-black font-medium tracking-widest rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? '処理中...' : '決定（切り抜き・回転）'}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Preview Area */}
                        <div
                            className="group relative w-full aspect-video bg-white/5 border border-dashed border-white/20 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {/* Rotation Container */}
                            <div className={`w-full h-full flex items-center justify-center transition-all duration-300 ${isRotated ? 'p-8' : ''}`}>
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className={`object-cover shadow-2xl transition-all duration-300 ${isRotated ? 'w-[75%] aspect-[3/4]' : 'w-full h-full'}`}
                                    />
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <span className="text-2xl block mb-2">📷</span>
                                        <span className="text-xs tracking-wider">画像を選択</span>
                                    </div>
                                )}
                            </div>

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

                        {/* Orientation Toggle */}
                        <div className="flex justify-center">
                            <button
                                onClick={() => setIsRotated(!isRotated)}
                                className={`px-4 py-2 rounded-full border text-xs tracking-widest transition-all flex items-center gap-2 ${isRotated
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'bg-transparent border-white/20 text-gray-400 hover:border-white/50 hover:text-white'
                                    }`}
                            >
                                <span>{isRotated ? '縦向き (Portrait)' : '横向き (Landscape)'}</span>
                                <span>🔄</span>
                            </button>
                        </div>

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
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 h-24 focus:outline-none focus:border-blue-400/50 transition-colors resize-none font-serif leading-relaxed"
                                    placeholder="この写真に込められた想いや記憶..."
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            onClick={handleSave}
                            disabled={!previewUrl || isLoading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                        >
                            {isLoading ? '保存中...' : '保存する'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

