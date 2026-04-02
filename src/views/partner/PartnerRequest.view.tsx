import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { partnerService } from '../../services/partnerService';
import { authService } from '../../services/authService';

const PartnerRequest: React.FC = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const [formData, setFormData] = useState({
        place_name: '',
        place_address: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    if (!user) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        🔒
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Inicia sesión para continuar</h2>
                    <p className="text-gray-600 mb-6">Necesitas una cuenta para solicitar ser socio.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-eco-primary-600 text-white px-6 py-2 rounded-full font-bold hover:bg-eco-primary-700 transition w-full"
                    >
                        Ir al Login
                    </button>
                </div>
            </div>
        );
    }

    if (user.role === 'partner' || user.role === 'admin') {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        ✓
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">¡Ya eres socio!</h2>
                    <p className="text-gray-600 mb-6">Tu cuenta ya tiene permisos de socio o administrador.</p>
                    <button
                        onClick={() => navigate('/home')}
                        className="bg-eco-primary-600 text-white px-6 py-2 rounded-full font-bold hover:bg-eco-primary-700 transition w-full"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage('');

        try {
            await partnerService.createRequest(formData);
            setStatus('success');
        } catch (error: any) {
            console.error('Error al enviar la solicitud:', error);
            setStatus('error');
            setErrorMessage(error.response?.data?.message || 'Ocurrió un error al enviar la solicitud.');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full animate-fade-in-up">
                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        ✓
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">¡Solicitud Enviada!</h2>
                    <p className="text-gray-600 mb-6">
                        Hemos recibido tu solicitud para ser socio. Un administrador revisará tu información pronto.
                    </p>
                    <button
                        onClick={() => navigate('/home')}
                        className="bg-eco-primary-600 text-white px-6 py-2 rounded-full font-bold hover:bg-eco-primary-700 transition w-full"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 animate-fade-in-up">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-eco-primary-900 font-display mb-2">
                        Solicitud de Socio
                    </h1>
                    <p className="text-gray-600">
                        Únete a nuestra red de anfitriones y comparte tu destino ecoturístico con el mundo.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'error' && (
                        <div className={`p-4 rounded-xl border text-sm ${errorMessage.includes('límite') || errorMessage.includes('rechazadas')
                                ? 'bg-orange-50 text-orange-800 border-orange-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    {errorMessage.includes('límite') || errorMessage.includes('rechazadas') ? (
                                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold mb-1">
                                        {errorMessage.includes('límite') || errorMessage.includes('rechazadas')
                                            ? 'Solicitudes Bloqueadas Temporalmente'
                                            : errorMessage.includes('pendiente')
                                                ? 'Solicitud Pendiente'
                                                : 'Error'}
                                    </p>
                                    <p>{errorMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tu Nombre (Usuario)
                        </label>
                        <input
                            type="text"
                            value={user.name}
                            disabled
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label htmlFor="place_name" className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Lugar
                        </label>
                        <input
                            id="place_name"
                            type="text"
                            value={formData.place_name}
                            onChange={(e) => setFormData({ ...formData, place_name: e.target.value })}
                            required
                            placeholder="Ej. Hacienda La Esperanza"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-400 focus:border-eco-primary-400 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="place_address" className="block text-sm font-medium text-gray-700 mb-2">
                            Dirección del Lugar
                        </label>
                        <input
                            id="place_address"
                            type="text"
                            value={formData.place_address}
                            onChange={(e) => setFormData({ ...formData, place_address: e.target.value })}
                            required
                            placeholder="Ej. Vía Marsella Km 5"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-400 focus:border-eco-primary-400 transition-all outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            * Una vez aprobada tu solicitud, podrás agregar fotos, descripción detallada y ubicación exacta en el mapa.
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full bg-eco-primary-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-eco-primary-700 transition-all transform hover:scale-[1.01] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {status === 'submitting' ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enviando...
                                </span>
                            ) : 'Enviar Solicitud'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PartnerRequest;
