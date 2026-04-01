import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
// import Header from '../../components/layout/Header';
import AdminPartnerRequests from '../../components/dashboard/AdminPartnerRequests';
import Alert from '../../components/common/Alert';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const PartnerRequestsView: React.FC = () => {
    const user = authService.getCurrentUser();
    const navigate = useNavigate();
    // const { t } = useLanguage();
    const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
    const [modal, setModal] = useState<{ title: string; message: string; onConfirm: () => void; type?: 'danger' | 'warning' | 'info' | 'success' } | null>(null);

    if (!authService.isAuthenticated() || !user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <main className="container mx-auto px-4 py-8 relative">
                {/* Global Feedback */}
                {alert && (
                    <div className="fixed top-24 right-4 z-[10000] w-full max-w-sm animate-fade-in">
                        <Alert
                            type={alert.type}
                            message={alert.message}
                            onClose={() => setAlert(null)}
                        />
                    </div>
                )}

                {modal && (
                    <ConfirmationModal
                        isOpen={!!modal}
                        title={modal.title}
                        message={modal.message}
                        type={modal.type}
                        onConfirm={modal.onConfirm}
                        onCancel={() => setModal(null)}
                    />
                )}

                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
                    <div className="p-6 border-b border-gray-100 bg-teal-50/50 flex justify-between items-center">
                        <div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-sm text-gray-500 hover:text-teal-600 mb-2 flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                Volver al Dashboard
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                Solicitudes de Socios
                            </h2>
                        </div>
                    </div>
                    <div className="p-0">
                        <AdminPartnerRequests
                            onNotify={(a: any) => setAlert(a)}
                            onConfirm={(c: any) => setModal(c)}
                            onCloseModal={() => setModal(null)}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PartnerRequestsView;
