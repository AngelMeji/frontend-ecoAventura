import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Header from '../components/layout/Header';
import { useLanguage } from '../context/LanguageContext';
import { getOptimizedImageUrl, compressImage } from '../utils/imageUtils';
import SafeImage from '../components/common/SafeImage';

const Profile: React.FC = () => {
    const { t } = useLanguage();
    const user = authService.getCurrentUser();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const [profileData, setProfileData] = useState<{
        name: string;
        email: string;
        bio: string;
        avatar: string;
        avatarFile?: File;
    }>({
        name: '',
        email: '',
        bio: '',
        avatar: ''
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                avatar: user.avatar || ''
            });
        }
    }, [user?.id]);

    // Estado para drag & drop
    const [isDragging, setIsDragging] = useState(false);

    // Prevenir comportamiento por defecto del navegador al arrastrar archivos
    useEffect(() => {
        const preventDefaults = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        // Prevenir que el navegador abra el archivo
        window.addEventListener('dragover', preventDefaults);
        window.addEventListener('drop', preventDefaults);

        return () => {
            window.removeEventListener('dragover', preventDefaults);
            window.removeEventListener('drop', preventDefaults);
        };
    }, []);

    // Funciones para manejar drag & drop
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
        if (files && files[0] && files[0].type.startsWith('image/')) {
            // Comprimir imagen pesada localmente antes de guardar (previene crashes de 4K)
            const compressedFile = await compressImage(files[0]);
            setProfileData({ ...profileData, avatarFile: compressedFile });
        }
    };

    if (!authService.isAuthenticated() || !user) {
        return <Navigate to="/login" replace />;
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', text: '' });

        try {
            let data: any = { name: profileData.name, bio: profileData.bio };

            // Si se seleccionó archivo, usar FormData
            if (profileData.avatarFile) {
                const formData = new FormData();
                formData.append('name', profileData.name);
                formData.append('bio', profileData.bio);
                formData.append('avatar', profileData.avatarFile);
                data = formData;
            }


            const response: any = await authService.updateProfile(data);

            // Verificar éxito según formato V2: { success: true, message: "...", user: {...} }
            if (response && response.success === true) {
                setMsg({ type: 'success', text: response.message || t('home.profile.messages.profileUpdateSuccess') });
                // Redirigir al dashboard tras breve pausa
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else if (response && response.id) {
                // Fallback: Si el backend devuelve el user directamente (sin wrapper)
                setMsg({ type: 'success', text: t('home.profile.messages.profileUpdateSuccess') });
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                setMsg({ type: 'error', text: t('home.profile.messages.profileUpdateError') });
            }

        } catch (error: any) {
            console.error('Error al actualizar:', error);
            console.error('Respuesta de error:', error.response?.data);

            // Manejo de errores de validación (422)
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                const errorMsg = errors ? Object.values(errors).flat().join(', ') : t('home.profile.messages.invalidData');
                setMsg({ type: 'error', text: errorMsg });
            } else {
                setMsg({ type: 'error', text: error.response?.data?.message || t('home.profile.messages.profileUpdateError') });
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación: Reglas de la contraseña
        const newPassword = passwordData.password;
        if (newPassword.length < 8 || newPassword.length > 12) {
            setMsg({ type: 'error', text: t('auth.register.validation.passwordMin') });
            return;
        } else if (!/[A-Z]/.test(newPassword)) {
            setMsg({ type: 'error', text: t('auth.register.validation.passwordUpper') });
            return;
        } else if (!/[a-z]/.test(newPassword)) {
            setMsg({ type: 'error', text: t('auth.register.validation.passwordLower') });
            return;
        } else if (!/\d/.test(newPassword)) {
            setMsg({ type: 'error', text: t('auth.register.validation.passwordNumber') });
            return;
        } else if (!/[\W_]/.test(newPassword)) {
            setMsg({ type: 'error', text: t('auth.register.validation.passwordSymbol') });
            return;
        }

        if (passwordData.password !== passwordData.password_confirmation) {
            setMsg({ type: 'error', text: t('home.profile.messages.passwordMismatch') });
            return;
        }
        setLoading(true);
        setMsg({ type: '', text: '' });
        try {
            const response = await authService.updatePassword(passwordData);

            // Limpiar campos del formulario
            setPasswordData({ current_password: '', password: '', password_confirmation: '' });

            // Limpiar sesión local directamente (los tokens ya fueron revocados en el backend)
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');

            // Mostrar alerta de confirmación con el mensaje del backend
            alert(response.message || t('home.profile.messages.passwordUpdateSuccess'));

            // Redirigir al login (replace fuerza recarga completa)
            window.location.replace('/login');
        } catch (error: any) {
            // Extraer mensaje de error en español
            let errorMessage = t('home.profile.messages.passwordUpdateError');

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const firstError = Object.values(errors)[0];
                if (Array.isArray(firstError) && firstError.length > 0) {
                    errorMessage = firstError[0] as string;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            setMsg({ type: 'error', text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in-up">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-eco-primary-100 rounded-2xl text-eco-primary-600">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-gray-800">{t('home.profile.title')}</h1>
                </div>

                {msg.text && (
                    <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 shadow-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {msg.type === 'success' ?
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> :
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        }
                        <span className="font-medium">{msg.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar / Profile Card */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                            <div className="bg-eco-primary-600 h-24 relative overflow-hidden">
                                <div className="absolute inset-0 bg-eco-primary-900/10"></div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                            </div>
                            <div className="px-6 pb-6 text-center -mt-12 relative">
                                <div
                                    className={`w-24 h-24 mx-auto bg-white p-1 rounded-full shadow-lg mb-4 transition-all ${isDragging ? 'ring-4 ring-eco-primary-500 scale-105' : ''
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <div className="w-full h-full rounded-full overflow-hidden bg-eco-primary-50 relative group">
                                        {profileData.avatar || profileData.avatarFile ? (
                                            <SafeImage
                                                src={
                                                    profileData.avatarFile
                                                        ? URL.createObjectURL(profileData.avatarFile)
                                                        : (user.full_avatar || getOptimizedImageUrl(profileData.avatar))
                                                }
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-4xl text-eco-primary-300 font-display font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-xl font-display font-bold text-gray-800">{user.name}</h3>
                                <p className="text-sm font-medium text-eco-primary-600 uppercase tracking-wider mb-4">{user.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Forms */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Profile Info */}
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                            <h2 className="text-xl font-display font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-eco-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                {t('home.profile.personalInfo')}
                            </h2>
                            <form onSubmit={handleProfileUpdate} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('home.profile.profilePhoto')}</label>
                                    <div className="flex items-center gap-4">
                                        <label className="cursor-pointer bg-eco-primary-50 hover:bg-eco-primary-100 text-eco-primary-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            {t('home.profile.uploadNewPhoto')}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    if (e.target.files?.[0]) {
                                                        const compressedFile = await compressImage(e.target.files[0]);
                                                        setProfileData({ ...profileData, avatarFile: compressedFile });
                                                    }
                                                }}
                                            />
                                        </label>
                                        {profileData.avatarFile && <span className="text-xs text-green-600 font-medium">{profileData.avatarFile.name}</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('home.profile.fullName')}</label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-eco-primary-500 focus:ring-4 focus:ring-eco-primary-500/10 transition-all p-3 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('home.profile.email')}</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            className="w-full rounded-xl border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed p-3 outline-none"
                                        />
                                    </div>
                                </div>



                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-eco-primary-600 text-white px-8 py-3 rounded-xl hover:bg-eco-primary-700 hover:shadow-lg disabled:opacity-50 font-bold transition-all transform active:scale-95 flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                {t('home.profile.saving')}
                                            </>
                                        ) : (
                                            <>
                                                {t('home.profile.saveChanges')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Password Change */}
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                            <h2 className="text-xl font-display font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-eco-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                {t('home.profile.security')}
                            </h2>
                            <form onSubmit={handlePasswordUpdate} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('home.profile.currentPassword')}</label>
                                    <input
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-eco-secondary focus:ring-4 focus:ring-eco-secondary/10 transition-all p-3 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('home.profile.newPassword')}</label>
                                        <input
                                            type="password"
                                            value={passwordData.password}
                                            onChange={e => setPasswordData({ ...passwordData, password: e.target.value })}
                                            className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-eco-secondary focus:ring-4 focus:ring-eco-secondary/10 transition-all p-3 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('home.profile.confirmPassword')}</label>
                                        <input
                                            type="password"
                                            value={passwordData.password_confirmation}
                                            onChange={e => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                            className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-eco-secondary focus:ring-4 focus:ring-eco-secondary/10 transition-all p-3 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-gray-800 text-white px-8 py-3 rounded-xl hover:bg-gray-900 shadow-lg disabled:opacity-50 font-bold transition-all transform active:scale-95 border-2 border-transparent"
                                    >
                                        {t('home.profile.updatePassword')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
