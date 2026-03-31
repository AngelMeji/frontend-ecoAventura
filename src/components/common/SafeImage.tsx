import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ 
    src, 
    fallbackSrc = '/assets/images/placeholder.jpg', 
    alt, 
    ...props 
}) => {
    const [currentSrc, setCurrentSrc] = useState(src);
    const [urlsToTry, setUrlsToTry] = useState<string[]>([]);
    const [hasFailed, setHasFailed] = useState(false);

    useEffect(() => {
        if (!src) {
            setCurrentSrc(fallbackSrc);
            return;
        }
        
        // Forzar HTTPS en producción
        const sanitize = (url: string) => 
            import.meta.env.PROD && url.startsWith('http://') 
                ? url.replace('http://', 'https://') 
                : url;
        
        const srcString = sanitize(String(src));
        const base = srcString.replace(/\.[^.]+$/, '');
        const currentExt = srcString.match(/\.[^.]+$/)?.[0]?.toLowerCase() || '';
        
        // Sequence of extensions to try, skipping the one it already has
        const exts = ['.webp', '.jpg', '.png', '.jpeg', '.JPG', '.PNG', '.JPEG'];
        const fallbackUrls = exts
            .filter(ext => ext !== currentExt)
            .map(ext => `${base}${ext}`);
        
        setUrlsToTry(fallbackUrls);
        setCurrentSrc(srcString);
        setHasFailed(false);
    }, [src, fallbackSrc]);

    const handleError = () => {
        if (urlsToTry.length > 0) {
            const nextUrl = urlsToTry[0];
            setUrlsToTry(urlsToTry.slice(1));
            setCurrentSrc(nextUrl);
        } else if (currentSrc !== fallbackSrc && !hasFailed) {
            setCurrentSrc(fallbackSrc);
            setHasFailed(true); // Prevent infinite loop if fallback also fails
        }
    };

    return (
        <img
            src={currentSrc}
            alt={alt || ''}
            onError={handleError}
            {...props}
        />
    );
};

export default SafeImage;
