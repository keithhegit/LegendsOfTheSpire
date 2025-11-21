import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Heart, Coins } from 'lucide-react';

const Toast = ({ message, type = 'default', onClose }) => {
    const icons = {
        strength: <TrendingUp className="w-5 h-5" />,
        maxHp: <Heart className="w-5 h-5" />,
        gold: <Coins className="w-5 h-5" />
    };

    const styles = {
        strength: 'bg-gradient-to-r from-red-900/90 to-orange-900/90 border-red-500 text-red-100',
        maxHp: 'bg-gradient-to-r from-green-900/90 to-emerald-900/90 border-green-500 text-green-100',
        gold: 'bg-gradient-to-r from-yellow-900/90 to-amber-900/90 border-yellow-500 text-yellow-100',
        default: 'bg-gradient-to-r from-slate-800/90 to-slate-700/90 border-slate-500 text-slate-100'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`
                fixed top-24 left-1/2 -translate-x-1/2 z-[200]
                flex items-center gap-3 px-6 py-4 rounded-lg border-2
                shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-sm
                ${styles[type] || styles.default}
            `}
        >
            {icons[type] && <span className="flex-shrink-0">{icons[type]}</span>}
            <span className="font-bold text-lg tracking-wide">{message}</span>
        </motion.div>
    );
};

const ToastContainer = ({ toasts = [] }) => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[200]">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;

