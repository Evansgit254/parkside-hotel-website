"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2, CheckCircle2 } from "lucide-react";
import styles from "../admin.module.css";
import { uploadImage, getCloudinarySignature } from "../../actions";
import { showToast } from "./AdminToast";

interface MediaUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    type?: "image" | "video";
    placeholder?: string;
}

export default function MediaUpload({ value, onChange, label, type = "image", placeholder }: MediaUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [mode, setMode] = useState<"upload" | "url">(value && !value.startsWith("/") ? "url" : "upload");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        setUploading(true);
        try {
            // 1. Get signature
            const sigData = await getCloudinarySignature();
            if (!sigData.success || !sigData.signature) {
                throw new Error(sigData.error || "Failed to get upload signature");
            }

            // 2. Prepare Form Data
            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", sigData.apiKey || "");
            formData.append("timestamp", String(sigData.timestamp));
            formData.append("signature", sigData.signature);
            formData.append("folder", sigData.folder || "parkside_villa");

            // 3. Direct POST
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
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            uploadFile(file);
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
                            hidden
                        />

                        {uploading ? (
                            <div className={styles.uploadStatus}>
                                <Loader2 className={styles.spinner} size={32} />
                                <p>Processing high-resolution asset...</p>
                            </div>
                        ) : value ? (
                            <div className={styles.previewWrapper}>
                                <img src={value} alt="Preview" className={styles.uploadPreview} />
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
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                        />
                        {value && (
                            <div className={styles.urlPreviewMini}>
                                <img src={value} alt="" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
