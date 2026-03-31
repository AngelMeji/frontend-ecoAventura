import React, { useEffect } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'danger'
}) => {
    useEffect(() => {
        if (isOpen) {
            const currentCount = parseInt(document.body.dataset.modalCount || '0', 10);
            document.body.dataset.modalCount = (currentCount + 1).toString();
            document.body.style.overflow = 'hidden';

            return () => {
                const newCount = parseInt(document.body.dataset.modalCount || '0', 10) - 1;
                document.body.dataset.modalCount = newCount.toString();
                if (newCount <= 0) {
                    document.body.style.overflow = 'unset';
                    document.body.dataset.modalCount = '0';
                }
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const colors = {
        danger: {
            bg: 'bg-red-50',
            text: 'text-red-800',
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-200',
            icon: (
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto text-red-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
            )
        },
        warning: {
            bg: 'bg-yellow-50',
            text: 'text-yellow-800',
            button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-200',
            icon: (
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4 mx-auto text-yellow-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
            )
        },
        info: {
            bg: 'bg-blue-50',
            text: 'text-blue-800',
            button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-200',
            icon: (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            )
        },
        success: {
            bg: 'bg-green-50',
            text: 'text-green-800',
            button: 'bg-green-600 hover:bg-green-700 focus:ring-green-200',
            icon: (
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 mx-auto text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
            )
        }
    };

    const style = colors[type];

    return (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up border border-gray-100 p-6 text-center">
                {style.icon}

                <h3 className="text-xl font-bold font-display text-gray-900 mb-2">
                    {title}
                </h3>

                <p className="text-gray-500 mb-6 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200 outline-none"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-5 py-2.5 rounded-xl text-white font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 outline-none focus:ring-2 focus:ring-offset-2 ${style.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
