import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { placesService } from '../../services/placesService';
import type { Category, PlaceImage } from '../../models/Place.model';
import Header from '../../components/layout/Header';
import { authService } from '../../services/authService';
import Alert from '../../components/common/Alert';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { getOptimizedImageUrl, compressImage } from '../../utils/imageUtils';

interface ImagePreview {
    id?: number; // Solo para imágenes existentes
    file?: File; // Solo para nuevas imágenes
    url: string;
    isPrimary: boolean;
    isExisting: boolean;
}

const PlaceForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;
    const user = authService.getCurrentUser();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form States
    const [name, setName] = useState('');
    const [shortDesc, setShortDesc] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [address, setAddress] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [difficulty, setDifficulty] = useState<string>('baja');
    const [duration, setDuration] = useState('');
    const [bestSeason, setBestSeason] = useState('');

    // Feedback States
    const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info', text: string } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    // Images State
    const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!user || (user.role !== 'partner' && user.role !== 'admin')) {
            navigate('/dashboard');
            return;
        }
        loadCategories();
        if (isEditing) {
            loadPlace(id!);
        }
    }, [id]);

    // Scroll to top when message changes
    useEffect(() => {
        if (formMessage) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [formMessage]);

    const loadCategories = async () => {
        try {
            const data = await placesService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error al cargar categorías', error);
            setFormMessage({ type: 'error', text: 'Error cargando categorías. Por favor recarga la página.' });
        }
    };

    const loadPlace = async (placeId: string) => {
        try {
            setLoading(true);
            const place = await placesService.getOne(placeId);
            setName(place.name);
            setShortDesc(place.short_description);
            setDescription(place.description);
            setCategoryId(place.category_id?.toString() || '');
            setAddress(place.address || '');
            setLatitude(place.latitude?.toString() || '');
            setLongitude(place.longitude?.toString() || '');
            setDifficulty(place.difficulty || 'baja');
            setDuration(place.duration || '');
            setBestSeason(place.best_season || '');

            // Cargar imágenes existentes
            if (place.images && place.images.length > 0) {
                const existingImages: ImagePreview[] = place.images.map((img: PlaceImage) => ({
                    id: img.id,
                    url: img.full_url ? getOptimizedImageUrl(img.full_url) : getOptimizedImageUrl(img.image_path),
                    isPrimary: img.is_primary || false,
                    isExisting: true
                }));
                setImagePreviews(existingImages);
            }
        } catch (error) {
            console.error('Error al cargar el lugar', error);
            setFormMessage({ type: 'error', text: 'Error cargando información del lugar.' });
            setTimeout(() => navigate('/dashboard'), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        await processFiles(files);
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const processFiles = async (files: FileList) => {
        setFormMessage(null);
        setLoading(true); // Mostrar loading mientras comprime imágenes pesadas
        const newPreviews: ImagePreview[] = [];
        let errorMsg = '';

        try {
            for (let i = 0; i < files.length; i++) {
                const rawFile = files[i];
                // Validar tipo
                if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(rawFile.type)) {
                    errorMsg += `Archivo ${rawFile.name} no es una imagen válida. `;
                    continue;
                }
                
                // Comprimir imagen pesada localmente (evita cuellos de botella en backend con 4K)
                const file = await compressImage(rawFile, 1200, 0.8);

                if (file.size > 5 * 1024 * 1024) {
                    errorMsg += `Archivo ${file.name} es demasiado grande. `;
                    continue;
                }

                newPreviews.push({
                    file,
                    url: URL.createObjectURL(file),
                isPrimary: imagePreviews.length === 0 && newPreviews.length === 0, // Primera imagen es primaria por defecto
                isExisting: false
            });
        }

        if (errorMsg) {
            setFormMessage({ type: 'warning', text: errorMsg });
        }

        // Máximo 10 imágenes
        const total = imagePreviews.length + newPreviews.length;
        if (total > 10) {
            setFormMessage({ type: 'warning', text: 'Máximo 10 imágenes por lugar. Se han descartado algunas imágenes.' });
            setImagePreviews(prev => [...prev, ...newPreviews.slice(0, 10 - prev.length)]);
            } else {
                setImagePreviews(prev => [...prev, ...newPreviews]);
            }
        } finally {
            setLoading(false);
        }
    };

    // Funciones para drag & drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (!files || files.length === 0) return;
        await processFiles(files);
    };

    const handleRemoveImage = (index: number) => {
        const img = imagePreviews[index];
        if (img.isExisting && img.id) {
            setImagesToDelete(prev => [...prev, img.id!]);
        }
        // Limpiar URL si es un blob
        if (!img.isExisting) {
            URL.revokeObjectURL(img.url);
        }

        const updated = imagePreviews.filter((_, i) => i !== index);
        // Si se elimina la imagen primaria, hacer la primera la nueva primaria
        if (img.isPrimary && updated.length > 0) {
            updated[0].isPrimary = true;
        }
        setImagePreviews(updated);
    };

    const handleSetPrimary = (index: number) => {
        setImagePreviews(prev => prev.map((img, i) => ({
            ...img,
            isPrimary: i === index
        })));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFormMessage(null);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('short_description', shortDesc);
        formData.append('description', description);
        formData.append('category_id', categoryId);
        if (address) formData.append('address', address);
        if (latitude) formData.append('latitude', latitude);
        if (longitude) formData.append('longitude', longitude);
        if (difficulty) formData.append('difficulty', difficulty);
        if (duration) formData.append('duration', duration);
        if (bestSeason) formData.append('best_season', bestSeason);

        // Agregar nuevas imágenes
        const newImages = imagePreviews.filter(img => !img.isExisting && img.file);
        newImages.forEach((img, index) => {
            formData.append('images[]', img.file!, img.file!.name);
            if (img.isPrimary) {
                // Ajustar índice basado en si es la única imagen o posición relativa
                // Mejor estrategia: enviar el nombre del archivo primario o un índice relativo correcto
                // El backend espera 'primary_image_index' relativo al array 'images[]' enviado
                formData.append('primary_image_index', index.toString());
            }
        });

        // Indicar imagen primaria existente (si aplica)
        const primaryExisting = imagePreviews.find(img => img.isExisting && img.isPrimary);
        if (primaryExisting && primaryExisting.id) {
            formData.append('primary_image_id', primaryExisting.id.toString());
        }

        // Imágenes a eliminar
        if (imagesToDelete.length > 0) {
            formData.append('delete_images', JSON.stringify(imagesToDelete));
        }

        try {
            if (isEditing) {
                await placesService.update(parseInt(id!), formData);

                // If partner edits, set to pending and notify
                if (user?.role === 'partner') {
                    await placesService.setPending(parseInt(id!));
                    setConfirmModal({
                        isOpen: true,
                        title: '¡Cambios Enviados a Revisión!',
                        message: 'Tu lugar ha sido actualizado y marcado como "Pendiente". Un administrador revisará los cambios antes de que vuelva a ser público. Puedes ver el estado en tu panel.',
                        onConfirm: () => navigate('/dashboard')
                    });
                } else {
                    setConfirmModal({
                        isOpen: true,
                        title: '¡Actualización Exitosa!',
                        message: 'El lugar ha sido actualizado correctamente. ¿Deseas volver al panel de administración?',
                        onConfirm: () => navigate('/dashboard')
                    });
                }
            } else {
                await placesService.create(formData);
                setConfirmModal({
                    isOpen: true,
                    title: '¡Lugar Publicado!',
                    message: 'El lugar ha sido creado correctamente y está pendiente de aprobación. ¿Deseas volver al panel?',
                    onConfirm: () => navigate('/dashboard')
                });
            }
        } catch (error: any) {
            console.error('Error al guardar el lugar', error);
            const msg = error.response?.data?.message || error.message || 'Error desconocido';
            const errors = error.response?.data?.errors;
            
            let finalMessage = `Error al guardar:\n${msg}`;

            // Si hay detalles de validación, usamos solo esos para evitar repetir
            // el 'message' principal de Laravel que suele ser igual al primer error.
            if (errors) {
                const errorDetails = Object.values(errors).flat().join('\n');
                finalMessage = `Error al guardar:\n${errorDetails}`;
            }

            setFormMessage({
                type: 'error',
                text: finalMessage
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-eco-bg font-sans">
            <Header />
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-eco-primary-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-4xl font-bold text-gray-800 font-display">
                        {isEditing ? 'Editar Lugar' : 'Publicar Nuevo Lugar'}
                    </h1>
                </div>

                {formMessage && (
                    <Alert
                        type={formMessage.type as any}
                        message={formMessage.text}
                        className="mb-8 shadow-xl"
                        onClose={() => setFormMessage(null)}
                    />
                )}

                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in-up">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Lugar *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white placeholder-gray-400"
                                    placeholder="Ej. Cascada Mágica del Bosque"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría *</label>
                                <div className="relative">
                                    <select
                                        value={categoryId}
                                        onChange={e => setCategoryId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Dificultad</label>
                                <div className="relative">
                                    <select
                                        value={difficulty}
                                        onChange={e => setDifficulty(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                    >
                                        <option value="baja">Baja</option>
                                        <option value="media">Media</option>
                                        <option value="alta">Alta</option>
                                        <option value="experto">Experto</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Descriptions */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción Corta *</label>
                            <input
                                type="text"
                                value={shortDesc}
                                onChange={e => setShortDesc(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                maxLength={1000}
                                placeholder="Resumen breve para tarjetas (máx 1000 caracteres)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción Detallada</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={5}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white resize-y"
                                maxLength={5000}
                                placeholder="Cuenta la historia completa del lugar, cómo llegar, qué esperar... (máx 5000 caracteres)"
                            ></textarea>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Horario Estimado</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={duration}
                                        onChange={e => setDuration(e.target.value)}
                                        className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="Ej: 3 horas, 2 días..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mejor Temporada</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={bestSeason}
                                        onChange={e => setBestSeason(e.target.value)}
                                        className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="Ej: Verano, Todo el año..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="border-t border-gray-100 pt-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 font-display flex items-center gap-2">
                                <svg className="w-6 h-6 text-eco-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Ubicación
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección / Referencia</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="Dirección exacta o referencia cercana"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Latitud</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={latitude}
                                        onChange={e => setLatitude(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="-12.0464"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Longitud</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={longitude}
                                        onChange={e => setLongitude(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="-77.0428"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="border-t border-gray-100 pt-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 font-display flex items-center gap-2">
                                <svg className="w-6 h-6 text-eco-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Imágenes
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">Máximo 10 imágenes. La imagen marcada como principal se mostrará en las tarjetas.</p>

                            {/* Image Previews Grid */}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {imagePreviews.map((img, index) => (
                                        <div key={index} className={`relative group rounded-xl overflow-hidden border-2 ${img.isPrimary ? 'border-eco-primary-500 ring-2 ring-eco-primary-200' : 'border-gray-200'}`}>
                                            <img src={img.url} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover" />

                                            {/* Primary Badge */}
                                            {img.isPrimary && (
                                                <div className="absolute top-2 left-2 bg-eco-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                    Principal
                                                </div>
                                            )}

                                            {/* Existing Badge */}
                                            {img.isExisting && (
                                                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                    Guardada
                                                </div>
                                            )}

                                            {/* Action Overlay */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {!img.isPrimary && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetPrimary(index)}
                                                        className="p-2 bg-white rounded-full text-eco-primary-600 hover:bg-eco-primary-50"
                                                        title="Marcar como principal"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                                                    title="Eliminar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload Area */}
                            {imagePreviews.length < 10 && (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all group cursor-pointer ${isDragging
                                        ? 'border-eco-primary-500 bg-eco-primary-50'
                                        : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <div className="space-y-1 text-center">
                                        <div className="mx-auto h-12 w-12 text-gray-400 group-hover:text-eco-primary-500 transition-colors">
                                            <svg className="w-12 h-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="flex text-sm text-gray-600">
                                            <span className="relative cursor-pointer bg-white rounded-md font-medium text-eco-primary-600 hover:text-eco-primary-500">
                                                Sube imágenes
                                            </span>
                                            <p className="pl-1">o arrastra y suelta</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, WEBP hasta 5MB ({10 - imagePreviews.length} restantes)
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-8 gap-4 border-t border-gray-100 mt-8">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="auth-button w-auto px-8 shadow-lg shadow-eco-primary-500/20"
                            >
                                {loading ? 'Guardando...' : (isEditing ? 'Actualizar Lugar' : 'Publicar Lugar')}
                            </button>
                        </div>
                    </form>
                </div>

                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    confirmText="Volver al Panel"
                    cancelText="Quedarse"
                    type="success"
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                />
            </div>
        </div>
    );
};

export default PlaceForm;
