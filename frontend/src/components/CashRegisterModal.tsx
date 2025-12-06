import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Lock, Unlock, AlertTriangle, CheckCircle, Store } from 'lucide-react';
import { cajaApi } from '../services/api';
import { CajaSesion } from '../types';

interface CashRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    sucursalId: string;
}

export const CashRegisterModal: React.FC<CashRegisterModalProps> = ({
    isOpen,
    onClose,
    user,
    sucursalId
}) => {
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState<CajaSesion | null>(null);
    const [amount, setAmount] = useState('');
    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user && sucursalId) {
            checkStatus();
        }
    }, [isOpen, user, sucursalId]);

    const checkStatus = async () => {
        setLoading(true);
        try {
            const activeSession = await cajaApi.obtenerEstado(sucursalId, user.id);
            setSession(activeSession);
            setError(null);
        } catch (err) {
            console.error("Error checking register status:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const newSession = await cajaApi.abrir({
                sucursal_id: sucursalId,
                usuario_id: user.id,
                monto_inicial: parseFloat(amount),
                comentarios: comment
            });
            setSession(newSession);
            setSuccess("Caja abierta correctamente");
            setTimeout(() => setSuccess(null), 3000);
            setAmount('');
            setComment('');
        } catch (err: any) {
            setError(err.response?.data?.detail || "Error al abrir caja");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) return;

        setLoading(true);
        setError(null);
        try {
            const closedSession = await cajaApi.cerrar(session.id, {
                monto_final: parseFloat(amount),
                comentarios: comment
            });
            setSession(null);
            setSuccess(`Caja cerrada. Diferencia: ${closedSession.diferencia}`);
            setTimeout(() => {
                setSuccess(null);
                onClose();
            }, 3000);
            setAmount('');
            setComment('');
        } catch (err: any) {
            setError(err.response?.data?.detail || "Error al cerrar caja");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-[#F26522]/20 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-[#F26522]/10 bg-[#F26522]/5 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-[#1B1B1B] uppercase tracking-wide flex items-center gap-2">
                                <Store className="w-5 h-5 text-[#F26522]" />
                                Gestión de Caja
                            </h3>
                            <p className="text-xs text-[#1B1B1B]/60 font-medium mt-0.5">Control de apertura y cierre de turno</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-[#1B1B1B]/40 hover:text-[#EA5455] hover:bg-[#EA5455]/10 p-2 rounded-full transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {loading && !session && (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F26522] mx-auto"></div>
                                <p className="mt-3 text-[#1B1B1B]/60 text-sm font-medium">Sincronizando caja...</p>
                            </div>
                        )}

                        {!loading && (
                            <>
                                {success && (
                                    <div className="mb-6 p-4 bg-[#28C76F]/10 border border-[#28C76F]/20 rounded-lg flex items-center gap-3 text-[#28C76F] shadow-sm">
                                        <CheckCircle className="w-5 h-5 shrink-0" />
                                        <span className="font-semibold text-sm">{success}</span>
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-6 p-4 bg-[#EA5455]/10 border border-[#EA5455]/20 rounded-lg flex items-center gap-3 text-[#EA5455] shadow-sm">
                                        <AlertTriangle className="w-5 h-5 shrink-0" />
                                        <span className="font-semibold text-sm">{error}</span>
                                    </div>
                                )}

                                {session ? (
                                    // Closing Register View
                                    <form onSubmit={handleCloseRegister} className="space-y-6">
                                        <div className="text-center p-4 bg-[#F4F5F7] rounded-lg border border-[#F26522]/10">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#28C76F]/10 mb-3 shadow-sm">
                                                <Unlock className="w-6 h-6 text-[#28C76F]" />
                                            </div>
                                            <h4 className="text-[#1B1B1B] font-bold text-lg">Caja Abierta</h4>
                                            <div className="flex justify-center gap-4 mt-2 text-sm text-[#1B1B1B]/60">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs uppercase tracking-wide font-semibold opacity-70">Inicio</span>
                                                    <span className="font-bold text-[#1B1B1B]">Bs. {session.monto_inicial.toFixed(2)}</span>
                                                </div>
                                                <div className="w-px bg-[#1B1B1B]/10 h-8 self-center"></div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs uppercase tracking-wide font-semibold opacity-70">Hora</span>
                                                    <span className="font-bold text-[#1B1B1B]">{new Date(session.fecha_apertura).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-[#1B1B1B] mb-2 uppercase tracking-wide">Monto Final (Conteo)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-3 text-[#1B1B1B]/40 font-bold">Bs.</span>
                                                <input
                                                    type="number"
                                                    step="0.10"
                                                    required
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    className="w-full bg-white border border-[#F26522]/20 rounded-lg py-2.5 pl-10 pr-4 text-[#1B1B1B] placeholder-[#1B1B1B]/30 focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522] transition-all font-bold text-lg shadow-sm"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-[#1B1B1B] mb-2 uppercase tracking-wide">Comentarios</label>
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                className="w-full bg-white border border-[#F26522]/20 rounded-lg py-2 px-4 text-[#1B1B1B] placeholder-[#1B1B1B]/30 focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522] h-20 resize-none transition-all shadow-sm"
                                                placeholder="Observaciones del cierre..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 px-4 bg-[#EA5455] hover:bg-[#EA5455]/90 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-[#EA5455]/40 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                                        >
                                            {loading ? 'Procesando...' : (
                                                <>
                                                    <Lock className="w-4 h-4" />
                                                    Cerrar Turno
                                                </>
                                            )}
                                        </button>
                                    </form>
                                ) : (
                                    // Opening Register View
                                    <form onSubmit={handleOpenRegister} className="space-y-6">
                                        <div className="text-center p-4 bg-[#F4F5F7] rounded-lg border border-[#F26522]/10 h-full flex flex-col justify-center">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1B1B1B]/10 mb-3 mx-auto">
                                                <Lock className="w-6 h-6 text-[#1B1B1B]/60" />
                                            </div>
                                            <h4 className="text-[#1B1B1B] font-bold text-lg">Turno Cerrado</h4>
                                            <p className="text-sm text-[#1B1B1B]/60 mt-1 max-w-[200px] mx-auto">
                                                Ingresa el monto base de efectivo para comenzar las ventas.
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-[#1B1B1B] mb-2 uppercase tracking-wide">Monto Inicial (Base)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-3 text-[#1B1B1B]/40 font-bold">Bs.</span>
                                                <input
                                                    type="number"
                                                    step="0.10"
                                                    required
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    className="w-full bg-white border border-[#F26522]/20 rounded-lg py-2.5 pl-10 pr-4 text-[#1B1B1B] placeholder-[#1B1B1B]/30 focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522] transition-all font-bold text-lg shadow-sm"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-[#1B1B1B] mb-2 uppercase tracking-wide">Comentarios</label>
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                className="w-full bg-white border border-[#F26522]/20 rounded-lg py-2 px-4 text-[#1B1B1B] placeholder-[#1B1B1B]/30 focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522] h-20 resize-none transition-all shadow-sm"
                                                placeholder="Observaciones iniciales..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 px-4 bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-[#F26522]/40 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                                        >
                                            {loading ? 'Procesando...' : (
                                                <>
                                                    <Unlock className="w-4 h-4" />
                                                    Abrir Turno
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
