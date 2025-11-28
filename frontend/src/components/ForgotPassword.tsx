import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { authApi } from '../services/api';
import { toast } from 'sonner';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await authApi.recoverPassword(email);
            setIsSubmitted(true);
            toast.success('Si el correo existe, recibirás un enlace de recuperación');
        } catch (error) {
            console.error('Error recovering password:', error);
            toast.error('Error al procesar la solicitud');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10" />

            <Card className="w-full max-w-md bg-[#0f172a]/90 border-[#FF6B35]/20 p-8 backdrop-blur-sm relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Recuperar Contraseña</h1>
                    <p className="text-white/60">
                        Ingresa tu correo electrónico y te enviaremos las instrucciones
                    </p>
                </div>

                {isSubmitted ? (
                    <div className="text-center space-y-6">
                        <div className="bg-[#FF6B35]/10 p-4 rounded-lg border border-[#FF6B35]/20">
                            <Mail className="w-12 h-12 text-[#FF6B35] mx-auto mb-2" />
                            <p className="text-white">
                                Hemos enviado un enlace de recuperación a <strong>{email}</strong>
                            </p>
                        </div>
                        <p className="text-sm text-white/60">
                            Revisa tu bandeja de entrada y carpeta de spam. El enlace expirará en 30 minutos.
                        </p>
                        <Button asChild variant="outline" className="w-full border-[#FF6B35]/20 text-[#FF6B35] hover:bg-[#FF6B35]/10">
                            <Link to="/login">Volver al inicio de sesión</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Correo Electrónico</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@gastrosmart.ai"
                                    className="pl-10 bg-white/5 border-white/10 text-white focus:border-[#FF6B35]"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white h-11"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Enviar enlace de recuperación'
                            )}
                        </Button>

                        <div className="text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center text-sm text-white/60 hover:text-[#FF6B35] transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
}
