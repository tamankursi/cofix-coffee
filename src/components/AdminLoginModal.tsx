import React, { useState } from 'react';
import { authService } from '../services/authService';
import { X, ShieldCheck, Lock, Mail, Loader2 } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('admin@cofix.com');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await authService.loginAdmin(email, password);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-stone-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1C1917] text-[#C49A6C] mx-auto flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-stone-900">Masuk Portal Admin</h2>
          <p className="text-xs text-stone-500 mt-1">
            Khusus pengelola kedai COFIX untuk manajemen stok &amp; pesanan.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
              Email Admin
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cofix.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 font-medium focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 font-medium focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600">
            💡 <strong>Akun bawaan default:</strong>
            <br />
            Email: <code className="text-[#8B5A2B]">admin@cofix.com</code>
            <br />
            Password: <code className="text-[#8B5A2B]">admin123</code>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#1C1917] hover:bg-stone-800 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#C49A6C]" />
            ) : (
              <span>Masuk ke Dashboard</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
