"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2, CheckCircle2 } from "lucide-react";
import styles from "../admin.module.css";
import { getCloudinarySignature } from "../../actions";
import { getLocalMedia } from "../../actions/media";
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit for Cloudinary basic tier

export default function MediaUpload({ value, onChange, onFilesChange, label, type = "image", placeholder, multiple = false }: MediaUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const firstValue = Array.isArray(value) ? value[0] : value;
    const [mode, setMode] = useState<"upload" | "url" | "local">(firstValue && firstValue.startsWith("/PARKSIDE VILLA MEDIA") ? "local" : (firstValue && !firstValue.startsWith("/") ? "url" : "upload"));
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [localFiles, setLocalFiles] = useState<{ path: string, name: string, folder: string, category: string, tags: string[] }[]>([]);
    const [loadingLocal, setLoadingLocal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (multiple) {
            const validFiles = Array.from(files).filter(file => {
                if (file.size > MAX_FILE_SIZE) {
                    showToast(`Skipping ${file.name}: Exceeds 10MB limit.`, "error");
                    return false;
                }
                return true;
            });
            if (validFiles.length > 0) {
                uploadFilesSequential(validFiles);
            }
        } else {
            const file = files[0];
            if (file.size > MAX_FILE_SIZE) {
                showToast(`File too large: ${file.name} is over 10MB. Please compress or use a smaller image.`, "error");
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            uploadFile(file);
        }
    };

    const uploadFilesSequential = async (files: File[]) => {
        setUploading(true);
        setUploadProgress({ current: 0, total: files.length });
        const successfulUrls: string[] = [];
        let errorCount = 0;
        let lastError = "";

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

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 300000); // 300s (5 min) timeout

                    const response = await fetch(uploadUrl, {
                        method: "POST",
                        body: formData,
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    if (response.ok) {
                        const result = await response.json();
                        successfulUrls.push(result.secure_url);
                    } else {
                        errorCount++;
                        try {
                            const err = await response.json();
                            lastError = err.error?.message || response.statusText;
                        } catch (e) {
                            lastError = response.statusText;
                        }
                    }
                } catch (err: any) {
                    errorCount++;
                    lastError = err.name === 'AbortError' ? "Timed out" : err.message;
                    console.error(`Upload error for file ${i}:`, err);
                }
            }

            if (successfulUrls.length > 0) {
                const existing = Array.isArray(value) ? value : (value ? [value] : []);
                onFilesChange?.([...existing, ...successfulUrls]);
                if (errorCount === 0) {
                    showToast(`Successfully uploaded ${successfulUrls.length} assets`, "success");
                } else {
                    showToast(`Uploaded ${successfulUrls.length}. Failed ${errorCount}: ${lastError}`, "error");
                }
            } else if (errorCount > 0) {
                showToast(lastError ? `Upload failed: ${lastError}` : `Upload failed (no error detail). Please check connection and Cloudinary settings. [v2]`, "error");
            }
        } catch (error: any) {
            console.error("Batch upload failed", error);
            showToast(error.message || "Bulk upload failed", "error");
        } finally {
            setUploading(false);
            setUploadProgress(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
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

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000); // 300s (5 min) timeout

            const response = await fetch(uploadUrl, {
                method: "POST",
                body: formData,
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorMsg = "Cloudinary upload failed";
                try {
                    const errResult = await response.json();
                    errorMsg = errResult.error?.message || errorMsg;
                    if (errorMsg.toLowerCase().includes("signature")) {
                        errorMsg += " (Check Vercel environment variables matches .env)";
                    }
                } catch (e) { }
                throw new Error(errorMsg);
            }

            const result = await response.json();
            if (result.secure_url) {
                onChange(result.secure_url);
                showToast("Asset uploaded successfully", "success");
            }
        } catch (error: any) {
            console.error("Upload failed", error);
            let msg = error.message || "An unexpected error occurred.";
            if (error.name === 'AbortError') {
                msg = "Upload timed out (5 min limit). Try a smaller file or faster connection.";
            } else if (msg.toLowerCase().includes("signature")) {
                msg += " (Check Vercel Environment Variables)";
            }
            showToast(msg, "error");
        } finally {
            setUploading(false);
            setUploadProgress(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const fetchLocalFiles = async () => {
        setLoadingLocal(true);
        try {
            const res = await getLocalMedia();
            if (res.success) {
                setLocalFiles(res.files);
            } else {
                showToast(res.error || "Failed to load local media", "error");
            }
        } catch (err) {
            showToast("Failed to fetch local media catalog", "error");
        }
        setLoadingLocal(false);
    };

    useEffect(() => {
        if (mode === 'local' && localFiles.length === 0) {
            fetchLocalFiles();
        }
    }, [mode, localFiles.length]);

    const filteredLocalFiles = localFiles.filter(f => {
        const matchesCategory = categoryFilter === "All" || f.category === categoryFilter;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
            f.name.toLowerCase().includes(searchLower) ||
            f.folder.toLowerCase().includes(searchLower) ||
            f.tags.some(t => t.includes(searchLower));
        return matchesCategory && matchesSearch;
    });

    const categories = ["All", ...Array.from(new Set(localFiles.map(f => f.category)))].sort();

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const imageFiles = files.filter(f => f.type.startsWith("image/"));
            if (imageFiles.length > 0) {
                if (multiple) {
                    const validFiles = imageFiles.filter(file => {
                        if (file.size > MAX_FILE_SIZE) {
                            showToast(`Skipping ${file.name}: Exceeds 10MB limit.`, "error");
                            return false;
                        }
                        return true;
                    });
                    if (validFiles.length > 0) {
                        uploadFilesSequential(validFiles);
                    }
                } else {
                    const file = imageFiles[0];
                    if (file.size > MAX_FILE_SIZE) {
                        showToast(`File too large: Over 10MB limit.`, "error");
                        return;
                    }
                    uploadFile(file);
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
                <button
                    type="button"
                    className={`${styles.mediaUploadTab} ${mode === 'local' ? styles.mediaUploadTabActive : ''}`}
                    onClick={() => setMode('local')}
                >
                    <ImageIcon size={14} /> Local Media (High-Res)
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
                        ) : (firstValue && mode === 'upload') ? (
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
                                <p>Drag and drop or click to browse files</p>
                                <span className={styles.dropzoneNote}>Supports JPG, PNG, WEBP (Max 10MB)</span>
                            </div>
                        )}
                    </div>
                ) : mode === 'local' ? (
                    <div className={styles.localExplorer}>
                        <div className={styles.explorerHeader}>
                            <div className={styles.searchBar}>
                                <input
                                    type="text"
                                    placeholder="Search local high-res..."
                                    className={styles.input}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                type="button"
                                className={styles.refreshBtn}
                                onClick={fetchLocalFiles}
                                disabled={loadingLocal}
                            >
                                <Loader2 size={12} className={loadingLocal ? styles.spinner : ''} /> Refresh
                            </button>
                        </div>

                        <div className={styles.categoryFilters}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`${styles.categoryBtn} ${categoryFilter === cat ? styles.categoryBtnActive : ''}`}
                                    onClick={() => setCategoryFilter(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className={styles.explorerGrid}>
                            {loadingLocal ? (
                                <div className={styles.explorerStatus}>Scanning server for assets...</div>
                            ) : filteredLocalFiles.length === 0 ? (
                                <div className={styles.explorerStatus}>No high-res assets found.</div>
                            ) : (
                                filteredLocalFiles.map((file, idx) => {
                                    const isSelected = Array.isArray(value) ? value.includes(file.path) : value === file.path;
                                    return (
                                        <div
                                            key={idx}
                                            className={`${styles.explorerItem} ${isSelected ? styles.explorerItemActive : ''}`}
                                            style={{ '--delay': `${Math.min(idx * 40, 600)}ms` } as React.CSSProperties}
                                            onClick={() => {
                                                const filePath = file.path;
                                                if (multiple) {
                                                    const existing = Array.isArray(value) ? value : (value ? [value] : []);
                                                    if (isSelected) {
                                                        onFilesChange?.(existing.filter(v => v !== filePath));
                                                    } else {
                                                        onFilesChange?.([...existing, filePath]);
                                                    }
                                                } else {
                                                    onChange(filePath);
                                                }
                                            }}
                                        >
                                            <div className={styles.explorerPreview}>
                                                {file.path.match(/\.(mp4|webm)$/i) ? (
                                                    <div className={styles.videoPlaceholder}>Video</div>
                                                ) : (
                                                    <SafeAdminImage src={file.path} />
                                                )}
                                                <span className={styles.categoryBadge}>{file.category}</span>
                                            </div>
                                            <div className={styles.explorerLabelStack}>
                                                <span className={styles.explorerFolder}>
                                                    {file.folder || "Root"}
                                                </span>
                                                <span className={styles.explorerLabel}>{file.name}</span>
                                            </div>
                                            {isSelected && <CheckCircle2 className={styles.selectedCheck} size={14} />}
                                        </div>
                                    );
                                })
                            )}
                        </div>
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
                            value={firstValue && !firstValue.startsWith("/") ? firstValue : ""}
                            onChange={(e) => onChange(e.target.value)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function SafeAdminImage({ src }: { src: string }) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <>
            {!isLoaded && <div className={styles.shimmer} />}
            <img
                src={encodeURI(src)}
                alt=""
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                className={isLoaded ? styles.loaded : ""}
            />
        </>
    );
}
