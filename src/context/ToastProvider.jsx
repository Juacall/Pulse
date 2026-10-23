import {useCallback, useState} from "react";
import {ToastContext} from "./ToastContext.jsx"

export function ToastProvider({ children }) {
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast UI fixed to top-right viewport */}
            {toast.show && (
                <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl shadow-2xl text-white border transition-all duration-300 pointer-events-none ${
                    toast.type === 'error'
                        ? 'bg-rose-900/95 border-rose-700 text-rose-100'
                        : 'bg-emerald-900/95 border-emerald-700 text-emerald-100'
                }`}>
                    <div className="flex items-center space-x-2.5 text-sm font-semibold">
                        <span>{toast.type === 'error' ? '❌' : '✅'}</span>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
}

