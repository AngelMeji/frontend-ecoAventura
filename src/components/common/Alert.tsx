import React from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    type: AlertType;
    message?: string;
    children?: React.ReactNode;
    className?: string;
    onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, children, className = '', onClose }) => {
    const styles = {
        success: {
            container: 'bg-green-50 border-green-200 text-green-800',
            icon: (
                <svg className="w-5 h-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )
        },
        error: {
            container: 'bg-red-50 border-red-200 text-red-800',
            icon: (
                <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        warning: {
            container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            icon: (
                <svg className="w-5 h-5 flex-shrink-0 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        info: {
            container: 'bg-blue-50 border-blue-200 text-blue-800',
            icon: (
                <svg className="w-5 h-5 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    };

    const currentStyle = styles[type];

    return (
        <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm transition-all animate-fade-in ${currentStyle.container} ${className}`}>
            <div className="mt-0.5">
                {currentStyle.icon}
            </div>
            <div className="flex-grow">
                {message && <p className="whitespace-pre-line font-medium">{message}</p>}
                {children}
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-black/5 rounded-full transition-colors"
                >
                    <svg className="w-4 h-4 opacity-50 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default Alert;
