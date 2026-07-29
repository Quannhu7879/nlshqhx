import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl transition transform z-50 flex items-center space-x-3 border border-slate-700 animate-bounce">
      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      <span className="text-xs font-semibold">{message}</span>
    </div>
  );
};
