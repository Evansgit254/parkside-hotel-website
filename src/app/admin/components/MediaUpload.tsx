"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2, CheckCircle2 } from "lucide-react";
import styles from "../admin.module.css";
import { getCloudinarySignature } from "../../actions";
import { showToast } from "./AdminToast";

interface MediaUploadProps {
    value?: string | string[];
    onChange: (url: string) => void;
    onFilesChange?: (urls: string[]) => void;
    label?: string;
    type?: "image" | "video";
    placeholder?: string;
    multiple?: boolean;
}

export default function MediaUpload({ value, onChange, onFilesChange, label, type = "image", placeholder, multiple = false }: MediaUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const firstValue = Array.isArray(value) ? value[0] : value;
    const [mode, setMode] = useState<"upload" | "url">(firstValue && !firstValue.startsWith("/") ? "url" : "upload");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (multiple) {
            uploadFilesSequential(Array.from(files));
        } else {
            uploadFile(files[0]);
        }
    };

    const uploadFilesSequential = async (files: File[]) => {
        setUploading(true);
        setUploadProgress({ current: 0, total: files.length });
        const successfulUrls: string[] = [];
        let errorCount = 0;

        try {
            const sigData = await getCloudinarySignature();
            if (!sigData.success || !sigData.signature) {
                throw new Error(sigData.error || "Failed to get upload signature");
            }

            for (let i = 0; i < files.length; i++) {
                setUploadProgress({ current: i + 1, total: files.length });
                const file = files[i];

                const formData = new FormData();
                formData.append("file", file);
                formData.append("api_key", sigData.apiKey || "");
                formData.append("timestamp", String(sigData.timestamp));
                formData.append("signature", sigData.signature);
                formData.append("folder", sigData.folder || "parkside-villa-media");

                try {
                    const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`;
                    const response = await fetch(uploadUrl, {
                        method: "POST",
                        body: formData
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.secure_url) {
                            successfulUrls.push(result.secure_url);
                        } else {
                            errorCount++;
                        }
                    } else {
                        const err = await response.json();
                        console.error(`Upload ${i + 1} failed:`, err);
                        errorCount++;
                    }
                } catch (e) {
                    console.error(`Network error for file ${i + 1}:`, e);
                    errorCount++;
                }
            }

            if (successfulUrls.length > 0) {
                if (onFilesChange) {
                    onFilesChange(successfulUrls);
                } else if (onChange) {
                    // For multiple mode, prepend to existing or just send the new ones
                    // This depends on the parent, but usually onFilesChange is used for arrays
                    onChange(successfulUrls[0]);
                }

                if (errorCount > 0) {
                    showToast(`Uploaded ${successfulUrls.length} assets, but ${errorCount} failed.`, "error");
                } else {
                    showToast(`Successfully uploaded all ${successfulUrls.length} assets`, "success");
                }
            } else if (errorCount > 0) {
                showToast(`All ${errorCount} uploads failed. Please check your connection.`, "error");
            }

        } catch (error: any) {
            console.error("Batch upload failed", error);
            showToast(error.message || "An unexpected error occurred during batch upload.", "error");
        } finally {
            setUploading(false);
            setUploadProgress(null);
        }
    };

    const uploadFile = async (file: File) => {
        setUploading(true);
        setUploadProgress({ current: 1, total: 1 });
        try {
            const sigData = await getCloudinarySignature();
            if (!sigData.success || !sigData.signature) {
                throw new Error(sigData.error || "Failed to get upload signature");
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", sigData.apiKey || "");
            formData.append("timestamp", String(sigData.timestamp));
            formData.append("signature", sigData.signature);
            formData.append("folder", sigData.folder || "parkside-villa-media");

            const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`;
            const response = await fetch(uploadUrl, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errResult = await response.json();
                throw new Error(errResult.error?.message || "Cloudinary upload failed");
            }

            const result = await response.json();
            if (result.secure_url) {
                onChange(result.secure_url);
                showToast("Asset uploaded successfully", "success");
            }
        } catch (error: any) {
            console.error("Upload failed", error);
            showToast(error.message || "An unexpected error occurred during upload.", "error");
        } finally {
            setUploading(false);
            setUploadProgress(null);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const imageFiles = files.filter(f => f.type.startsWith("image/"));
            if (imageFiles.length > 0) {
                if (multiple) {
                    uploadFilesSequential(imageFiles);
                } else {
                    uploadFile(imageFiles[0]);
                }
            }
        }
    };

    return (
        <div className={styles.mediaUploadContainer}>
            {label && <label className={styles.label}>{label}</label>}

            <div className={styles.mediaUploadTabs}>
                <button
                    type="button"
                    className={`${styles.mediaUploadTab} ${mode === 'upload' ? styles.mediaUploadTabActive : ''}`}
                    onClick={() => setMode('upload')}
                >
                    <Upload size={14} /> Upload File
                </button>
                <button
                    type="button"
                    className={`${styles.mediaUploadTab} ${mode === 'url' ? styles.mediaUploadTabActive : ''}`}
                    onClick={() => setMode('url')}
                >
                    <LinkIcon size={14} /> Remote URL
                </button>
            </div>

            <div className={styles.mediaUploadBody}>
                {mode === 'upload' ? (
                    <div
                        className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''} ${value ? styles.dropzoneWithFile : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            multiple={multiple}
                            hidden
                        />

                        {uploading ? (
                            <div className={styles.uploadStatus}>
                                <Loader2 className={styles.spinner} size={32} />
                                <p>
                                    {uploadProgress
                                        ? `Processing asset ${uploadProgress.current} of ${uploadProgress.total}...`
                                        : "Processing high-resolution asset..."
                                    }
                                </p>
                            </div>
                        ) : firstValue ? (
                            <div className={styles.previewWrapper}>
                                <img src={firstValue} alt="Preview" className={styles.uploadPreview} />
                                <div className={styles.previewOverlay}>
                                    <div className={styles.previewInfo}>
                                        <CheckCircle2 size={16} className={styles.successIcon} />
                                        <span>Asset Ready</span>
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.removeBtn}
                                        onClick={(e) => { e.stopPropagation(); onChange(""); }}
                                    >
                                        <X size={14} /> Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.dropzonePlaceholder}>
                                <div className={styles.dropzoneIcon}>
                                    <Upload size={24} />
                                </div>
                                <h3>Drop your imagery here</h3>
                                <p>Drag and drop or click to browse local files</p>
                                <span className={styles.dropzoneNote}>Supports JPG, PNG, WEBP (Max 10MB)</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.urlInputWrapper}>
                        <div className={styles.urlInputIcon}>
                            <LinkIcon size={18} />
                        </div>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder={placeholder || "https://example.com/image.jpg"}
                            value={firstValue || ""}
                            onChange={(e) => onChange(e.target.value)}
                        />
                        {firstValue && (
                            <div className={styles.urlPreviewMini}>
                                <img src={firstValue} alt="" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
