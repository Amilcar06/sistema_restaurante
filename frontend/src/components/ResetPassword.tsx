import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { authApi } from '../services/api';
import { toast } from 'sonner';

export function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md bg-card/90 border-destructive/20 p-8 backdrop-blur-sm text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Enlace inválido</h1>
                    <p className="text-muted-foreground mb-6">
                        El enlace de recuperación no es válido o ha expirado.
                    </p>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link to="/forgot-password">Solicitar nuevo enlace</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setIsLoading(true);

        try {
            await authApi.resetPassword(token, password);
            setIsSuccess(true);
            toast.success('Contraseña actualizada correctamente');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            console.error('Error resetting password:', error);
            toast.error('Error al restablecer la contraseña. El enlace puede haber expirado.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10" />

            <Card className="w-full max-w-md bg-card/90 border-primary/20 p-8 backdrop-blur-sm relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Nueva Contraseña</h1>
                    <p className="text-muted-foreground">
                        Ingresa tu nueva contraseña para recuperar el acceso
                    </p>
                </div>

                {isSuccess ? (
                    <div className="text-center space-y-6">
                        <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                            <p className="text-foreground font-medium">
                                ¡Contraseña actualizada!
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Serás redirigido al inicio de sesión en unos segundos...
                        </p>
                        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Link to="/login">Ir al inicio de sesión</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-foreground">Nueva Contraseña</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 bg-muted/50 border-primary/10 text-foreground focus:border-primary"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Contraseña</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 bg-muted/50 border-primary/10 text-foreground focus:border-primary"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Actualizando...
                                </>
                            ) : (
                                'Restablecer Contraseña'
                            )}
                        </Button>

                        <div className="text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
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
