import React, { useEffect, useState } from 'react';
import { partnerService, type PartnerRequest } from '../../services/partnerService';

interface AdminPartnerRequestsProps {
    onNotify: (alert: { type: 'success' | 'error', message: string }) => void;
    onConfirm: (modal: { title: string, message: string, type: 'success' | 'danger', onConfirm: () => void }) => void;
    onCloseModal: () => void;
}

const AdminPartnerRequests: React.FC<AdminPartnerRequestsProps> = ({ onNotify, onConfirm, onCloseModal }) => {
    const [requests, setRequests] = useState<PartnerRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalRequests, setTotalRequests] = useState(0);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async (page: number = 1) => {
        setLoading(true);
        try {
            const data = await partnerService.getAllRequests(page);
            if (data.data && Array.isArray(data.data)) {
                setRequests(data.data);
                setCurrentPage(data.current_page);
                setLastPage(data.last_page);
                setTotalRequests(data.total);
            } else if (Array.isArray(data)) {
                setRequests(data);
                setTotalRequests(data.length);
            }
        } catch (error) {
            console.error('Error al obtener solicitudes de socios:', error);
            onNotify({ type: 'error', message: 'Error cargando solicitudes de socios.' });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (id: number) => {
        onConfirm({
            title: 'Aprobar Solicitud',
            message: '¿Estás seguro de que deseas aprobar esta solicitud? El usuario se convertirá en socio y se creará un lugar borrador.',
            type: 'success',
            onConfirm: async () => {
                try {
                    await partnerService.approveRequest(id);
                    onNotify({
                        type: 'success',
                        message: '¡Usuario aprobado correctamente! Ahora tiene acceso al panel de socios, puede crear lugares turísticos y gestionar sus reservas.'
                    });
                    loadRequests();
                    onCloseModal(); // Close modal on success
                } catch (error) {
                    onNotify({ type: 'error', message: 'Error aprobando solicitud.' });
                    onCloseModal(); // Close on error too, rely on toast
                }
            }
        });
    };

    const handleReject = (id: number) => {
        onConfirm({
            title: 'Rechazar Solicitud',
            message: '¿Estás seguro de que deseas rechazar esta solicitud?',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await partnerService.rejectRequest(id);
                    onNotify({ type: 'success', message: 'Solicitud rechazada. El usuario ha sido notificado.' });
                    loadRequests();
                    onCloseModal();
                } catch (error) {
                    onNotify({ type: 'error', message: 'Error rechazando solicitud.' });
                    onCloseModal();
                }
            }
        });
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando solicitudes...</div>;
    }

    if (requests.length === 0) {
        return <div className="p-8 text-center text-gray-500">No hay solicitudes pendientes.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold tracking-wider">
                    <tr>
                        <th className="p-4">Usuario</th>
                        <th className="p-4">Lugar propuesto</th>
                        <th className="p-4">Dirección</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                                <div className="font-bold text-gray-900">{req.user?.name}</div>
                                <div className="text-xs text-gray-500">{req.user?.email}</div>
                            </td>
                            <td className="p-4 font-medium text-gray-800">{req.place_name}</td>
                            <td className="p-4 text-sm text-gray-600">{req.place_address}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {req.status === 'pending' ? 'Pendiente' :
                                        req.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                                </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                                {req.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(req.id)}
                                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors"
                                        >
                                            APROBAR
                                        </button>
                                        <button
                                            onClick={() => handleReject(req.id)}
                                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                                        >
                                            RECHAZAR
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Advanced Pagination Controls */}
            {lastPage > 1 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex flex-col md:flex-row items-center justify-between gap-4 mt-4 rounded-xl shadow-sm">
                    <div className="text-sm text-gray-500">
                        Mostrando página <span className="font-bold text-gray-700">{currentPage}</span> de <span className="font-bold text-gray-700">{lastPage}</span>
                        <span className="ml-1 text-xs">({totalRequests} solicitudes en total)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => loadRequests(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Anterior
                        </button>
                        <div className="hidden sm:flex items-center bg-gray-100 rounded-xl p-1">
                            {Array.from({ length: lastPage }, (_, i) => i + 1)
                                .filter(p => {
                                    return p === 1 || p === lastPage || Math.abs(p - currentPage) <= 1;
                                })
                                .map((p, index, array) => (
                                    <React.Fragment key={p}>
                                        {index > 0 && array[index - 1] !== p - 1 && (
                                            <span className="px-2 text-gray-400">...</span>
                                        )}
                                        <button
                                            onClick={() => loadRequests(p)}
                                            className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === p
                                                ? 'bg-eco-primary-600 text-white shadow-md scale-110'
                                                : 'text-gray-600 hover:bg-white hover:text-eco-primary-600'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    </React.Fragment>
                                ))}
                        </div>
                        <button
                            onClick={() => loadRequests(currentPage + 1)}
                            disabled={currentPage === lastPage}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPartnerRequests;
