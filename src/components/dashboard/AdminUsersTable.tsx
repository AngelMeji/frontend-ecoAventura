import React, { useEffect, useState } from 'react';
import { placesService } from '../../services/placesService';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import SafeImage from '../common/SafeImage';

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

interface AdminUsersTableProps {
    onNotify: (alert: { type: 'success' | 'error' | 'warning' | 'info'; message: string }) => void;
    onConfirm: (config: { title: string; message: string; onConfirm: () => void; type?: 'danger' | 'warning' | 'info' | 'success' }) => void;
    initialUsers?: any;
}

const AdminUsersTable: React.FC<AdminUsersTableProps> = ({ onNotify, onConfirm, initialUsers }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(!initialUsers);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Create Mode States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'user' });
    const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (initialUsers) {
            if (initialUsers.data && Array.isArray(initialUsers.data)) {
                setUsers(initialUsers.data);
                setCurrentPage(initialUsers.current_page || 1);
                setLastPage(initialUsers.last_page || 1);
                setTotalUsers(initialUsers.total || 0);
            } else if (Array.isArray(initialUsers)) {
                setUsers(initialUsers);
                setTotalUsers(initialUsers.length);
            }
            setLoading(false);
        } else {
            loadUsers();
        }
    }, [initialUsers]);

    const loadUsers = (page: number = 1) => {
        setLoading(true);
        placesService.getAllUsers(page)
            .then((data: any) => {
                if (data.data && Array.isArray(data.data)) {
                    setUsers(data.data);
                    setCurrentPage(data.current_page);
                    setLastPage(data.last_page);
                    setTotalUsers(data.total || 0);
                } else if (Array.isArray(data)) {
                    setUsers(data);
                    setTotalUsers(data.length);
                } else {
                    setUsers([]);
                    setTotalUsers(0);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    // Pagination handlers
    const handleNextPage = () => {
        if (currentPage < lastPage) {
            loadUsers(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            loadUsers(currentPage - 1);
        }
    };

    const handleDelete = async (id: number) => {
        onConfirm({
            title: 'Eliminar Usuario',
            message: '¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await placesService.deleteUser(id);
                    // Refresh current page
                    loadUsers(currentPage);
                    onNotify({ type: 'success', message: 'Usuario eliminado correctamente' });
                } catch (error) {
                    onNotify({ type: 'error', message: 'Error eliminando usuario' });
                }
            }
        });
    };

    const handleEdit = (user: any) => {
        setEditingUser({ ...user }); // Copy
        setIsEditOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await placesService.updateUser(editingUser.id, editingUser);
            onNotify({ type: 'success', message: 'Usuario actualizado correctamente' });
            setIsEditOpen(false);
            loadUsers(currentPage);
        } catch (error) {
            onNotify({ type: 'error', message: 'Error actualizando usuario' });
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormMessage(null);

        // Validar contraseñas
        if (newUser.password !== newUser.password_confirmation) {
            setFormMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }

        try {
            await placesService.createUser(newUser);
            setFormMessage({ type: 'success', text: '¡Usuario creado con éxito!' });

            // Limpiar formulario después de un breve delay para que vean el mensaje
            setTimeout(() => {
                if (isCreateOpen) {
                    setIsCreateOpen(false);
                    setNewUser({ name: '', email: '', password: '', password_confirmation: '', role: 'user' });
                    setFormMessage(null);
                    loadUsers();
                }
            }, 2000);

        } catch (error: any) {
            console.error(error);
            setFormMessage({
                type: 'error',
                text: (error.response?.data?.message || 'Error al crear usuario. Verifica los datos.')
            });
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Cargando usuarios...</div>;

    return (
        <div className="overflow-x-auto">
            <div className="flex justify-end mb-4 px-4 bg-gray-50 py-2 border-b">
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 shadow-sm flex items-center gap-2 text-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Crear Nuevo Usuario
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="p-4 border-b">ID</th>
                            <th className="p-4 border-b">Usuario</th>
                            <th className="p-4 border-b">Email</th>
                            <th className="p-4 border-b">Rol</th>
                            <th className="p-4 border-b text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-500">#{u.id}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {u.avatar ? (
                                                <SafeImage
                                                    src={u.full_avatar || getOptimizedImageUrl(u.avatar)}
                                                    alt={u.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : <span className="text-gray-500 font-bold">{u.name[0]}</span>}
                                        </div>
                                        <span className="font-medium text-gray-900">{u.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600">{u.email}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                        u.role === 'partner' ? 'bg-eco-teal-100 text-eco-teal-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {u.role === 'admin' ? (
                                            <>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                                Admin
                                            </>
                                        ) : u.role === 'partner' ? (
                                            <>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                Socio
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                Usuario
                                            </>
                                        )}
                                    </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleEdit(u)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    {u.role !== 'admin' && (
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {users.map(u => (
                    <div key={u.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {u.avatar ? (
                                        <SafeImage
                                            src={u.full_avatar || getOptimizedImageUrl(u.avatar)}
                                            alt={u.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : <span className="text-gray-500 font-bold">{u.name[0]}</span>}
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 block">{u.name}</span>
                                    <span className="text-xs text-gray-500">#{u.id}</span>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                u.role === 'partner' ? 'bg-eco-teal-100 text-eco-teal-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                {u.role === 'admin' ? 'Admin' : u.role === 'partner' ? 'Socio' : 'Usuario'}
                            </span>
                        </div>

                        <div className="text-sm text-gray-600 break-all">
                            {u.email}
                        </div>

                        <div className="flex justify-end pt-2 border-t border-gray-50 gap-2">
                            <button
                                onClick={() => handleEdit(u)}
                                className="px-3 py-1.5 text-blue-600 bg-blue-50 rounded-lg text-sm font-medium"
                            >
                                Editar
                            </button>
                            {u.role !== 'admin' && (
                                <button
                                    onClick={() => handleDelete(u.id)}
                                    className="px-3 py-1.5 text-red-600 bg-red-50 rounded-lg text-sm font-medium"
                                >
                                    Eliminar
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>



            {/* Advanced Pagination Controls */}
            {lastPage > 1 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex flex-col md:flex-row items-center justify-between gap-4 mt-4 rounded-xl shadow-sm">
                    <div className="text-sm text-gray-500">
                        Mostrando página <span className="font-bold text-gray-700">{currentPage}</span> de <span className="font-bold text-gray-700">{lastPage}</span>
                        <span className="ml-1 text-xs">({totalUsers} usuarios en total)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Anterior
                        </button>
                        <div className="hidden sm:flex items-center bg-gray-100 rounded-xl p-1">
                            {Array.from({ length: lastPage }, (_, i) => i + 1)
                                .filter(p => {
                                    // Show first, last, and pages around current
                                    return p === 1 || p === lastPage || Math.abs(p - currentPage) <= 1;
                                })
                                .map((p, index, array) => (
                                    <React.Fragment key={p}>
                                        {index > 0 && array[index - 1] !== p - 1 && (
                                            <span className="px-2 text-gray-400">...</span>
                                        )}
                                        <button
                                            onClick={() => loadUsers(p)}
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
                            onClick={handleNextPage}
                            disabled={currentPage === lastPage}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Editar Usuario">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            className="w-full p-2 border rounded-lg"
                            value={editingUser?.name || ''}
                            onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            className="w-full p-2 border rounded-lg"
                            type="email"
                            value={editingUser?.email || ''}
                            onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <select
                            className="w-full p-2 border rounded-lg"
                            value={editingUser?.role || 'user'}
                            onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                        >
                            <option value="user">Usuario</option>
                            <option value="partner">Socio</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-bold shadow-sm">Guardar Cambios</button>
                    </div>
                </form>
            </Modal>

            {/* Create Modal */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Crear Nuevo Usuario">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input
                            className="w-full p-2 border rounded-lg"
                            value={newUser.name}
                            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                            placeholder="Ej. Juan Pérez"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                            className="w-full p-2 border rounded-lg"
                            type="email"
                            value={newUser.email}
                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="juan@ejemplo.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                        <input
                            className="w-full p-2 border rounded-lg"
                            type="password"
                            value={newUser.password}
                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="Mínimo 6 caracteres"
                            minLength={6}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Repetir Contraseña *</label>
                        <input
                            className="w-full p-2 border rounded-lg"
                            type="password"
                            value={newUser.password_confirmation}
                            onChange={e => setNewUser({ ...newUser, password_confirmation: e.target.value })}
                            placeholder="Confirma la contraseña"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <select
                            className="w-full p-2 border rounded-lg"
                            value={newUser.role}
                            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <option value="user">Usuario</option>
                            <option value="partner">Socio</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={() => { setIsCreateOpen(false); setFormMessage(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-sm">Crear Usuario</button>
                    </div>

                    {formMessage && (
                        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 animate-fade-in ${formMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {formMessage.type === 'success' ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                            )}
                            <span className="text-sm font-medium">{formMessage.text}</span>
                        </div>
                    )}
                </form>
            </Modal>
        </div >
    );
};

export default AdminUsersTable;
