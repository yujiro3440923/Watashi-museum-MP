import React, { useRef, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';

interface ImageEditorProps {
    onClose: () => void;
    onSave: (data: { title: string; description: string; imageUrl: string; imageFile?: File }) => void;
    initialData?: { title: string; description: string; imageUrl: string };
}


export const ImageEditor: React.FC<ImageEditorProps> = ({ onClose, onSave, initialData }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');

    // Image & Cropping State
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl || null);
    const [originalFileUrl, setOriginalFileUrl] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
        setCroppedAreaPixels(currentCroppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<string> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return '';
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
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

    const handleCropSave = async () => {
        if (originalFileUrl && croppedAreaPixels) {
            try {
                const croppedImage = await getCroppedImg(originalFileUrl, croppedAreaPixels);
                setPreviewUrl(croppedImage);
                setIsCropping(false);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleSave = async () => {
        if (previewUrl) {
            // Convert blob URL to File object if needed, or just pass the URL if it's external
            // For simplicity in this demo, we assume the upload logic handles blob URLs or we convert here.
            // But since our saveFrame expects a File object for new uploads, we might need to fetch the blob.

            let fileToUpload: File | undefined = undefined;
            if (previewUrl.startsWith('blob:')) {
                const response = await fetch(previewUrl);
                const blob = await response.blob();
                fileToUpload = new File([blob], "cropped_image.jpg", { type: "image/jpeg" });
            }

            onSave({ title, description, imageUrl: previewUrl, imageFile: fileToUpload });
        }
    };

    return (
        <div className="absolute top-0 right-0 h-full w-full md:w-[400px] z-50 p-6 flex items-center">
            {/* Glassmorphism Panel */}
            <div className="w-full h-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-white flex flex-col gap-6 animate-slideInRight relative">

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
                    <div className="flex flex-col gap-4 h-[400px]">
                        <div className="relative w-full h-[300px] bg-black/50 rounded-lg overflow-hidden border border-white/10">
                            <Cropper
                                image={originalFileUrl}
                                crop={crop}
                                zoom={zoom}
                                aspect={4 / 3}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs">Zoom</span>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <button
                            onClick={handleCropSave}
                            className="w-full py-2 bg-white text-black font-medium tracking-widest rounded hover:bg-gray-200 transition-colors"
                        >
                            切り抜く
                        </button>
                    </div>
                ) : (
                    <>
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
                    </>
                )}
            </div>
        </div>
    );
};
