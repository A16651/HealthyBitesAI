"use client";

import { useState, useRef } from 'react';
import { X, Upload, Camera, Image as ImageIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getApiUrl } from '@/lib/config';

interface OCRModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (productId: string) => void;
}

export default function OCRModal({ isOpen, onClose, onSuccess }: OCRModalProps) {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraActive, setCameraActive] = useState(false);

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleCameraClick = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setCameraActive(true);
            }
        } catch (err) {
            setError('Camera access denied or not available');
            console.error('Camera error:', err);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
                    setSelectedImage(file);
                    setPreview(canvas.toDataURL());

                    // Stop camera
                    const stream = videoRef.current?.srcObject as MediaStream;
                    stream?.getTracks().forEach(track => track.stop());
                    setCameraActive(false);
                }
            }, 'image/jpeg');
        }
    };

    const handleSubmit = async () => {
        if (!selectedImage) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedImage);

            const response = await fetch(getApiUrl('OCR'), {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('OCR processing failed');

            const data = await response.json();

            // Assuming backend returns { product_id: string } or similar
            const productId = data.product_id || data.id || data.barcode;

            if (productId) {
                onSuccess(productId);
                handleClose();
            } else {
                throw new Error('No product ID returned from OCR');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process image');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Stop camera if active
        if (cameraActive && videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }

        setSelectedImage(null);
        setPreview(null);
        setCameraActive(false);
        setError(null);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={handleClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-lg rounded-xl border bg-card shadow-2xl animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b p-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                            <ImageIcon className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">Scan Ingredient Label</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="rounded-full p-2 hover:bg-secondary transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Camera View */}
                    {cameraActive && (
                        <div className="relative">
                            <video
                                ref={videoRef}
                                className="w-full rounded-lg"
                                autoPlay
                                playsInline
                            />
                            <button
                                onClick={capturePhoto}
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-primary p-4 text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                            >
                                <Camera className="h-6 w-6" />
                            </button>
                        </div>
                    )}

                    {/* Preview */}
                    {preview && !cameraActive && (
                        <div className="relative">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full rounded-lg border"
                            />
                            <div className="absolute top-2 right-2 rounded-full bg-green-500 p-2 shadow-lg">
                                <Check className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    {!preview && !cameraActive && (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleUploadClick}
                                className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-8 hover:bg-primary/10 hover:border-primary/50 transition-all"
                            >
                                <Upload className="h-8 w-8 text-primary" />
                                <span className="font-medium">Upload Image</span>
                            </button>

                            <button
                                onClick={handleCameraClick}
                                className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-8 hover:bg-primary/10 hover:border-primary/50 transition-all"
                            >
                                <Camera className="h-8 w-8 text-primary" />
                                <span className="font-medium">Take Photo</span>
                            </button>
                        </div>
                    )}

                    {/* Submit */}
                    {preview && !cameraActive && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setPreview(null);
                                    setSelectedImage(null);
                                }}
                                className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                Retake
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Analyze'}
                            </button>
                        </div>
                    )}

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            </div>
        </div>
    );
}
