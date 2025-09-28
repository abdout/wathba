'use client';

import { useState, useRef } from 'react';
import {
    upload,
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
} from '@imagekit/next';
import { Loader2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImageKitUpload({
    onUploadSuccess,
    folder = '/products',
    accept = 'image/*',
    maxSize = 5, // MB
    className = '',
    buttonText = 'Upload Image',
}) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    const abortControllerRef = useRef(null);

    const authenticator = async () => {
        try {
            const response = await fetch('/api/imagekit-auth');
            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.status}`);
            }

            const data = await response.json();
            return {
                signature: data.signature,
                expire: data.expire,
                token: data.token,
                publicKey: data.publicKey,
            };
        } catch (error) {
            console.error('Authentication error:', error);
            throw new Error('Failed to authenticate upload');
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
            toast.error(`File size must be less than ${maxSize}MB`);
            return;
        }

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }

        // Auto upload on file select
        handleUpload(file);
    };

    const handleUpload = async (file) => {
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        setUploading(true);
        setProgress(0);
        abortControllerRef.current = new AbortController();

        try {
            const authParams = await authenticator();

            const uploadResponse = await upload({
                ...authParams,
                file,
                fileName: file.name,
                folder,
                useUniqueFileName: true,
                onProgress: (event) => {
                    const percentage = Math.round((event.loaded / event.total) * 100);
                    setProgress(percentage);
                },
                abortSignal: abortControllerRef.current.signal,
            });

            toast.success('Image uploaded successfully!');

            if (onUploadSuccess) {
                onUploadSuccess({
                    url: uploadResponse.url,
                    fileId: uploadResponse.fileId,
                    filePath: uploadResponse.filePath,
                    thumbnail: uploadResponse.thumbnailUrl,
                    width: uploadResponse.width,
                    height: uploadResponse.height,
                });
            }

            // Reset after successful upload
            setPreviewUrl(null);
            setProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            let errorMessage = 'Upload failed';

            if (error instanceof ImageKitAbortError) {
                errorMessage = 'Upload cancelled';
            } else if (error instanceof ImageKitInvalidRequestError) {
                errorMessage = 'Invalid request: ' + error.message;
            } else if (error instanceof ImageKitUploadNetworkError) {
                errorMessage = 'Network error during upload';
            } else if (error instanceof ImageKitServerError) {
                errorMessage = 'Server error: ' + error.message;
            } else {
                errorMessage = error.message || 'Upload failed';
            }

            toast.error(errorMessage);
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
            abortControllerRef.current = null;
        }
    };

    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setPreviewUrl(null);
        setProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="hidden"
                    id="imagekit-file-input"
                />

                <label
                    htmlFor="imagekit-file-input"
                    className={`
                        inline-flex items-center gap-2 px-4 py-2 rounded-lg
                        cursor-pointer transition-colors
                        ${uploading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }
                    `}
                >
                    {uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Upload className="w-5 h-5" />
                    )}
                    <span>{uploading ? 'Uploading...' : buttonText}</span>
                </label>

                {uploading && (
                    <button
                        onClick={handleCancel}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel upload"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {uploading && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Upload progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {previewUrl && (
                <div className="relative inline-block">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-xs max-h-48 rounded-lg border border-gray-300"
                    />
                    {!uploading && (
                        <button
                            onClick={() => {
                                setPreviewUrl(null);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            }}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}