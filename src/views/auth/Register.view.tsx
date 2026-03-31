import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import type { RegisterData } from '../../models/User.model';

/**
 * Vista de Registro
 */
const Register: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string }>({
        isOpen: false,
        title: '',
        message: ''
    });
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('auth.register.validation.nameRequired');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('auth.register.validation.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = t('auth.register.validation.emailInvalid');
        }

        if (!formData.password) {
            newErrors.password = t('auth.register.validation.passwordRequired');
        } else if (formData.password.length < 6) {
            newErrors.password = t('auth.register.validation.passwordMin');
        }

        if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = t('auth.register.validation.passwordMismatch');
        } else if (formData.password.length > 12) {
            newErrors.password = t('auth.register.validation.passwordMax');
        }

        if (!acceptTerms) {
            newErrors.terms = t('auth.register.validation.termsRequired') || 'Debes aceptar los términos y condiciones para crear tu cuenta.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await authService.register({ ...formData, acceptTerms });
            setConfirmModal({
                isOpen: true,
                title: '¡Registro Exitoso!',
                message: t('auth.register.success').replace('{name}', response.user.name)
            });
        } catch (err: any) {
            setErrors({
                general: err.message || t('auth.register.error'),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: '',
            });
        }
    };

    return (
        <div className="auth-card">
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-eco-primary-500 to-eco-primary-700 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                {t('auth.register.title')}
            </h2>
            <p className="text-center text-gray-600 mb-6">
                {t('auth.register.subtitle')}
            </p>

            {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('auth.register.name')}
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t('auth.register.placeholderName')}
                        required
                        className={`auth-input ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('auth.login.email')}
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t('auth.login.placeholderEmail')}
                        required
                        className={`auth-input ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('auth.login.password')}
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={t('auth.login.placeholderPassword')}
                            required
                            className={`auth-input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-eco-primary-600 focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showPassword ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.71-1.581c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('auth.register.confirmPassword')}
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="password_confirmation"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            placeholder={t('auth.login.placeholderPassword')}
                            required
                            className={`auth-input pr-10 ${errors.password_confirmation ? 'border-red-500' : ''}`}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-eco-primary-600 focus:outline-none"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showConfirmPassword ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.71-1.581c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.password_confirmation && (
                        <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                    )}
                </div>

                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="acceptTerms"
                            name="acceptTerms"
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => {
                                setAcceptTerms(e.target.checked);
                                if (e.target.checked && errors.terms) {
                                    setErrors({ ...errors, terms: '' });
                                }
                            }}
                            className={`w-4 h-4 rounded border-gray-300 text-eco-primary-600 focus:ring-eco-primary-500 ${errors.terms ? 'border-red-500' : ''}`}
                        />
                    </div>
                    <div className="ml-2 text-sm">
                        <label htmlFor="acceptTerms" className={`font-medium ${errors.terms ? 'text-red-600' : 'text-gray-700'}`}>
                            He leído y acepto los{' '}
                            <Link to="/terms" target="_blank" className="text-eco-primary-600 hover:text-eco-primary-500 hover:underline">
                                términos y condiciones
                            </Link>
                        </label>
                        {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms}</p>}
                    </div>
                </div>

                <button type="submit" disabled={loading} className="auth-button disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? t('auth.register.loading') : t('auth.register.submit')}
                </button>
            </form>

            <p className="text-center text-gray-600 mt-6">
                {t('auth.register.hasAccount')}{' '}
                <Link to="/login" className="auth-link">
                    {t('auth.register.login')}
                </Link>
            </p>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type="success"
                confirmText="Ir al Inicio"
                cancelText="Cerrar"
                onConfirm={() => navigate('/home')}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />
        </div>
    );
};

export default Register;
