'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageIcon } from 'lucide-react';
import styles from './SafeImage.module.css';

interface SafeImageProps extends Omit<ImageProps, 'src' | 'onError' | 'onLoadingComplete'> {
    src: string | null | undefined;
    fallbackText?: string;
}

const SafeImage: React.FC<SafeImageProps> = (allProps) => {
    const {
        src,
        fallbackText = "Image to be uploaded",
        alt,
        ...props
    } = allProps;
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Reset error state if src changes
    useEffect(() => {
        setError(false);
        setIsLoading(true);
    }, [src]);

    const showPlaceholder = error || !src || src === "";

    return (
        <div className={`${styles.wrapper} ${props.className || ''}`}>
            {showPlaceholder ? (
                <div className={styles.placeholder}>
                    <ImageIcon className={styles.icon} size={40} strokeWidth={1} />
                    <span className={styles.text}>{fallbackText}</span>
                </div>
            ) : (
                <Image
                    {...props}
                    src={src}
                    alt={alt || "Parkside Villa"}
                    className={`${props.className || ''} ${styles.image} ${isLoading ? styles.loading : styles.loaded}`}
                    onLoadingComplete={() => setIsLoading(false)}
                    onError={() => setError(true)}
                />
            )}
        </div>
    );
};

export default SafeImage;
