import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';

const ResetPassword: React.FC = () => {
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token') || '';
    const emailParam = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailParam);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación: Contraseñas deben coincidir
        if (password !== passwordConfirmation) {
            setStatus('error');
            setMessage('Las contraseñas no coinciden.');
            return;
        }

        // Validación de reglas de la contraseña
        if (password.length < 8 || password.length > 12) {
            setStatus('error');
            setMessage(t('auth.register.validation.passwordMin')); // Reuse same logic for min/max for now
            return;
        } else if (!/[A-Z]/.test(password)) {
            setStatus('error');
            setMessage(t('auth.register.validation.passwordUpper'));
            return;
        } else if (!/[a-z]/.test(password)) {
            setStatus('error');
            setMessage(t('auth.register.validation.passwordLower'));
            return;
        } else if (!/\d/.test(password)) {
            setStatus('error');
            setMessage(t('auth.register.validation.passwordNumber'));
            return;
        } else if (!/[\W_]/.test(password)) {
            setStatus('error');
            setMessage(t('auth.register.validation.passwordSymbol'));
            return;
        }

        setStatus('loading');
        setMessage('');

        // Preparar datos para enviar
        const resetData = {
            token,
            email,
            password,
            password_confirmation: passwordConfirmation
        };

        try {
            await authService.resetPassword(resetData);
            setStatus('success');
            setMessage('Contraseña restablecida correctamente.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error: any) {
            setStatus('error');

            // DEBUG: Mostrar detalles completos del error
            console.error('❌ Error completo:', error);
            console.error('📋 Datos de respuesta:', error.response?.data);
            console.error('🚨 Errores de validación:', error.response?.data?.errors);

            // Construir mensaje de error detallado
            let errorMsg = error.response?.data?.message || 'Error al restablecer la contraseña.';

            if (error.response?.data?.errors) {
                const validationErrors = error.response.data.errors;
                errorMsg += '\n\nDetalles:\n';
                Object.keys(validationErrors).forEach(field => {
                    errorMsg += `• ${field}: ${validationErrors[field].join(', ')}\n`;
                });
            }

            setMessage(errorMsg);
        }
    };

    return (
        <div className="auth-card backdrop-blur-xl bg-white/95 shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/50">
            <div className="bg-gradient-to-r from-eco-primary-600 to-eco-primary-800 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 text-white">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                    </div>
                    <h2 className="text-2xl font-display font-bold mb-2">{t('auth.forgotPassword.title')}</h2>
                    <p className="text-eco-primary-100 text-sm font-light">{t('auth.forgotPassword.subtitle')}</p>
                </div>
            </div>

            <div className="p-8">
                {status === 'success' ? (
                    <div className="text-center animate-fade-in space-y-6">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-short border-4 border-green-100">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Éxito!</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
                            <p className="text-xs text-eco-primary-500 font-medium mt-2 animate-pulse">Redirigiendo al login...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                        {status === 'error' && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-3 animate-shake">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {message}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 pl-1">{t('auth.login.email')}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`auth-input pl-10 ${emailParam ? 'bg-gray-50' : ''}`}
                                    placeholder={t('auth.login.placeholderEmail')}
                                    readOnly={!!emailParam}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 pl-1">{t('home.profile.newPassword')}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="auth-input pl-10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 pl-1">{t('home.profile.confirmPassword')}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <input
                                    type="password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    className="auth-input pl-10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="auth-button shadow-xl shadow-eco-primary-600/20"
                        >
                            {status === 'loading' ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    {t('auth.forgotPassword.loading')}
                                </span>
                            ) : t('auth.forgotPassword.submit')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
