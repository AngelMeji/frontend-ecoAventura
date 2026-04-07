const STORAGE_URL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '/storage') || 'http://localhost:8000/storage';

// Forzar HTTPS en producción para evitar Mixed Content
const forceHttps = (url: string): string => {
    if (import.meta.env.PROD && url.startsWith('http://')) {
        return url.replace('http://', 'https://');
    }
    return url;
};

export const getOptimizedImageUrl = (path: string | undefined | null): string => {
    if (!path) return '/assets/logo_Ecoaventura_fondo.jpeg'; // Fallback to existing logo

    // Si ya es una URL absoluta
    if (path.startsWith('http')) {
        let finalPath = path;
        // Si apunta a storage/places/, también forzar .webp (el servidor las optimiza)
        if (path.includes('/storage/places/')) {
            finalPath = path.replace(/\.(jpe?g|png|gif)(\?.*)?$/i, '.webp');
        }
        return forceHttps(finalPath);
    }

    // Si es un asset local (ruta relativa que empieza por /assets o assets/)
    if (path.startsWith('assets/') || path.startsWith('/assets/')) {
        return path.startsWith('/') ? path : `/${path}`;
    }

    // Para rutas de almacenamiento, asegurar que no haya doble prefijo 'storage'
    // El backend suele devolver 'avatars/xxx.png' o 'places/xxx.webp'
    let cleanPath = path.startsWith('/') ? path.substring(1) : path;

    // Forzar extensión .webp para lugares ya que el servidor siempre los optimiza así
    if (cleanPath.startsWith('places/') || cleanPath.startsWith('storage/places/')) {
        cleanPath = cleanPath.replace(/\.(jpe?g|png|gif)$/i, '.webp');
    }

    // Si la ruta ya incluye 'storage/', no la duplicamos
    if (cleanPath.startsWith('storage/')) {
        const pathWithoutStorage = cleanPath.replace(/^storage\//, '');
        return forceHttps(`${STORAGE_URL}/${pathWithoutStorage}`);
    }

    return forceHttps(`${STORAGE_URL}/${cleanPath}`);
};

/**
 * Comprime y redimensiona una imagen en el cliente antes de enviarla al servidor.
 * Evita la sobrecarga de memoria en el backend y los envíos lentos al cargar imágenes 4K.
 */
export const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
        // Solo comprimir imágenes
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Solo redimensionar si es más grande que el máximo
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                // Usar canvas para redimensionar y comprimir
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file); // Fallback: enviar original si no hay soporte de canvas
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Exportar como WebP si es posible, o JPEG
                // Para simplificar y mantener la compatibilidad transparente con FormData,
                // mantenemos el mismo nombre pero podemos cambiar a webp/jpeg.
                const outFormat = 'image/webp'; // WebP reduce mucho más el tamaño
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        // Crear un nuevo File con el blob comprimido
                        const newFilename = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                        const compressedFile = new File([blob], newFilename, { type: outFormat });
                        resolve(compressedFile);
                    } else {
                        resolve(file); // Fallback en caso de error
                    }
                }, outFormat, quality);
            };
            img.onerror = (e) => reject(e);
        };
        reader.onerror = (e) => reject(e);
    });
};
