"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
    src: string;
    alt: string;
    fallbackSrc?: string;
    fill?: boolean;
    className?: string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    sizes?: string;
    width?: number;
    height?: number;
}

const SafeImage: React.FC<SafeImageProps> = ({
    src,
    alt,
    fallbackSrc = '/placeholder-service.svg',
    fill,
    className,
    priority,
    loading,
    placeholder,
    blurDataURL,
    sizes,
    width,
    height,
}) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError && imageSrc !== fallbackSrc) {
            setHasError(true);
            setImageSrc(fallbackSrc);
        }
    };

    const imageProps = {
        src: imageSrc,
        alt,
        className,
        priority,
        loading,
        placeholder,
        blurDataURL,
        onError: handleError,
        ...(fill && { fill: true }),
        ...(sizes && { sizes }),
        ...(width && height && !fill && { width, height }),
    };

    return <Image {...imageProps} />;
};

export default SafeImage; 