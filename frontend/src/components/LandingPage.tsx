import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight, Brain, Zap, ShieldCheck, TrendingUp, UtensilsCrossed, Star, CheckCircle2 } from "lucide-react";
import LogoWeb from "../assets/LogoWeb.png";
import { motion } from "framer-motion";

export function LandingPage() {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Brain className="w-8 h-8 text-[#F26522]" />,
            title: "Innovación",
            description: "Uso de Inteligencia Artificial y análisis predictivo para potenciar tu cocina."
        },
        {
            icon: <Zap className="w-8 h-8 text-[#F26522]" />,
            title: "Eficiencia",
            description: "Optimización de inventarios, reducción de desperdicios y control total."
        },
        {
            icon: <ShieldCheck className="w-8 h-8 text-[#F26522]" />,
            title: "Confiabilidad",
            description: "Datos precisos sobre costos y ganancias para tomar decisiones seguras."
        }
    ];

    const testimonials = [
        { name: "La Casa del Camba", role: "Santa Cruz", text: "Ha transformado nuestra gestión de inventarios por completo." },
        { name: "Jardín de Asia", role: "La Paz", text: "La IA nos ayuda a predecir la demanda de los fines de semana." },
        { name: "Gustu", role: "La Paz", text: "Indispensable para mantener nuestros estándares de calidad y costos." }
    ];

    const trustedLogos = ["El Arriero", "Ona", "Propiedad Pública", "Hierro Brothers"];

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-[#F26522] selection:text-white">
            {/* Navbar */}
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="border-b border-[#F26522]/10 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={LogoWeb} alt="GastroSmart Logo" className="h-10 w-auto" />
                        <span className="text-xl font-bold tracking-tight text-[#1B1B1B]">
                            Gastro<span className="text-[#F26522]">Smart</span>
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-[#1B1B1B]/70 hover:text-[#F26522]"
                        >
                            Características
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => document.getElementById('social-proof')?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-[#1B1B1B]/70 hover:text-[#F26522]"
                        >
                            Clientes
                        </Button>
                        <Button
                            onClick={() => navigate("/login")}
                            className="bg-[#F26522] hover:bg-[#F26522]/90 text-white font-bold px-6 rounded-full shadow-lg shadow-[#F26522]/20 transition-all hover:scale-105"
                        >
                            Ingresar
                        </Button>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden bg-[#fafafa]">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl overflow-visible z-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#F26522]/5 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob"></div>
                    <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-[#F26522]/10 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-2000"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">

                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex-1 text-center lg:text-left"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F26522]/10 text-[#F26522] text-sm font-bold uppercase tracking-wider mb-6 border border-[#F26522]/20"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F26522] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F26522]"></span>
                                </span>
                                Tecnología para Restaurantes 4.0
                            </motion.div>

                            <h1 className="text-5xl md:text-7xl font-black text-[#1B1B1B] tracking-tight mb-6 leading-tight">
                                Ingeniería Inteligente para <br />
                                <span className="text-[#F26522]">
                                    Tu Restaurante
                                </span>
                            </h1>

                            <p className="text-xl text-[#1B1B1B]/70 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                Gestiona recetas, inventarios y ventas con el poder de la Inteligencia Artificial. Optimiza costos y maximiza tus ganancias.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Button
                                    onClick={() => navigate("/login")}
                                    size="lg"
                                    className="h-14 px-8 text-lg font-bold rounded-full bg-[#F26522] hover:bg-[#F26522]/90 text-white shadow-xl shadow-[#F26522]/25 hover:scale-105 transition-transform"
                                >
                                    Comenzar Ahora <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                                <Button
                                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                    variant="outline"
                                    size="lg"
                                    className="h-14 px-8 text-lg font-medium rounded-full border-2 border-[#1B1B1B]/10 text-[#1B1B1B] hover:bg-[#1B1B1B]/5 hover:border-[#1B1B1B]/30"
                                >
                                    Saber Más
                                </Button>
                            </div>
                        </motion.div>

                        {/* Visual Mockup */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="flex-1 w-full max-w-lg lg:max-w-none perspective-1000"
                        >
                            <div className="relative transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-all duration-700 ease-in-out">
                                <div className="bg-white rounded-2xl shadow-2xl border border-[#1B1B1B]/10 overflow-hidden w-full aspect-[4/3] relative">
                                    {/* Mockup Header */}
                                    <div className="h-8 bg-[#f4f4f5] border-b border-[#1B1B1B]/10 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#EA5455]"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#FF9F43]"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#28C76F]"></div>
                                    </div>
                                    {/* Mockup Body: Dashboard Simulation */}
                                    <div className="p-6 grid grid-cols-12 gap-4 h-full bg-[#fafafa]">
                                        {/* Sidebar */}
                                        <div className="col-span-3 bg-[#1B1B1B] rounded-lg p-3 flex flex-col gap-3 h-[90%]">
                                            <div className="h-6 w-24 bg-[#F26522] rounded mb-4 opacity-80"></div>
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="h-4 w-full bg-white/10 rounded"></div>
                                            ))}
                                        </div>
                                        {/* Main Content */}
                                        <div className="col-span-9 space-y-4">
                                            <div className="flex justify-between">
                                                <div className="h-8 w-32 bg-[#1B1B1B]/10 rounded"></div>
                                                <div className="h-8 w-8 bg-[#F26522] rounded-full"></div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="h-24 bg-white rounded-lg shadow-sm border border-[#1B1B1B]/5 p-3">
                                                        <div className="h-4 w-8 bg-[#F26522]/20 rounded mb-2"></div>
                                                        <div className="h-6 w-16 bg-[#1B1B1B]/80 rounded"></div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="h-40 bg-white rounded-lg shadow-sm border border-[#1B1B1B]/5 p-4 flex items-end gap-2">
                                                {[40, 60, 45, 75, 50, 80, 65, 90].map((h, i) => (
                                                    <div key={i} className="w-full bg-[#F26522]/80 rounded-t" style={{ height: `${h}%` }}></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Floating Badge */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                    className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-[#F26522]/20 flex items-center gap-3"
                                >
                                    <div className="p-2 bg-[#28C76F]/10 rounded-full">
                                        <TrendingUp className="w-6 h-6 text-[#28C76F]" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-[#1B1B1B]/60 uppercase font-bold">Ganancia Neta</div>
                                        <div className="text-lg font-bold text-[#1B1B1B]">+24% Mes</div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section id="social-proof" className="py-12 bg-white border-y border-[#1B1B1B]/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-[#1B1B1B]/40 text-sm font-bold uppercase tracking-widest mb-8">
                        Restaurantes que confían en nosotros
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {trustedLogos.map((logo, idx) => (
                            <span key={idx} className="text-xl md:text-2xl font-bold text-[#1B1B1B]/80 flex items-center gap-2">
                                <UtensilsCrossed className="w-5 h-5" /> {logo}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section id="philosophy" className="py-24 bg-[#1B1B1B] relative overflow-hidden text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">Nuestra Filosofía</h2>
                                <p className="text-white/70 text-lg leading-relaxed">
                                    Donde la <strong className="text-[#F26522]">Pasión Culinaria</strong> (el fuego) se encuentra con la <strong className="text-white">Inteligencia Artificial</strong> (el cerebro).
                                </p>
                            </motion.div>

                            <div className="space-y-6">
                                <motion.div
                                    whileHover={{ x: 10 }}
                                    className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#F26522]/50 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-[#F26522]/20 flex items-center justify-center shrink-0">
                                        <span className="text-2xl">🔥</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">Gastro (El Fuego)</h3>
                                        <p className="text-white/60">Representa el corazón de la cocina, la creatividad y la energía que mueve tu negocio.</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ x: 10 }}
                                    className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#F26522]/50 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                                        <span className="text-2xl">🧠</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">Smart (El Cerebro)</h3>
                                        <p className="text-white/60">La tecnología 4.0 que estructura, analiza y optimiza cada proceso para maximizar ganancias.</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        <div className="relative hidden md:block">
                            {/* Abstract visual representation of Philosophy */}
                            <div className="relative aspect-square rounded-full bg-gradient-to-tr from-[#F26522] to-purple-600 opacity-20 blur-3xl animate-pulse"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <img src={LogoWeb} alt="Filosofía" className="w-64 h-auto drop-shadow-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-[#fafafa]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1B1B1B] mb-4">¿Por qué GastroSmart?</h2>
                        <p className="text-[#1B1B1B]/60 max-w-2xl mx-auto text-lg">
                            Más que un software, somos tu socio tecnológico estratégico.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="p-8 rounded-2xl bg-white border border-[#1B1B1B]/10 shadow-sm hover:shadow-xl hover:border-[#F26522]/30 transition-all group"
                            >
                                <div className="mb-6 bg-[#F26522]/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-[#F26522] transition-colors duration-300">
                                    <div className="text-[#F26522] group-hover:text-white transition-colors duration-300">
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[#1B1B1B]">{feature.title}</h3>
                                <p className="text-[#1B1B1B]/70 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-white border-t border-[#1B1B1B]/5 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12 text-[#1B1B1B]">Lo que dicen nuestros clientes</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-[#fafafa] p-8 rounded-2xl border border-transparent hover:border-[#F26522]/20 transition-colors relative"
                            >
                                <div className="flex gap-1 mb-4 text-[#F26522]">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                                <p className="text-[#1B1B1B]/70 mb-6 italic">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#1B1B1B]/10 flex items-center justify-center font-bold text-[#1B1B1B]">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-[#1B1B1B]">{t.name}</div>
                                        <div className="text-xs text-[#1B1B1B]/50 uppercase font-bold">{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-[#F26522] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10 text-white">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">¿Listo para modernizar tu restaurante?</h2>
                    <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                        Únete a la revolución gastronómica y toma el control total de tu negocio hoy mismo.
                    </p>
                    <Button
                        onClick={() => navigate("/login")}
                        size="lg"
                        className="h-16 px-10 text-xl font-bold rounded-full bg-white text-[#F26522] hover:bg-[#1B1B1B] hover:text-white shadow-2xl transition-all hover:scale-105"
                    >
                        Empezar Prueba Gratuita
                    </Button>
                    <p className="mt-6 text-sm text-white/60 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Sin tarjeta de crédito requerida
                        <span className="mx-2">•</span>
                        <CheckCircle2 className="w-4 h-4" /> Cancelación en cualquier momento
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#1B1B1B] pt-16 pb-12 border-t border-white/10 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl font-bold">Gastro<span className="text-[#F26522]">Smart</span></span>
                        </div>
                        <p className="text-white/60 max-w-xs leading-relaxed">
                            Soluciones digitales para mejorar la gestión de restaurantes, brindando eficiencia y mejor servicio.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-white">Producto</h4>
                        <ul className="space-y-3 text-white/60">
                            <li className="hover:text-[#F26522] transition-colors cursor-pointer">Características</li>
                            <li className="hover:text-[#F26522] transition-colors cursor-pointer">Precios</li>
                            <li className="hover:text-[#F26522] transition-colors cursor-pointer">Demo</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-white">Contacto</h4>
                        <ul className="space-y-3 text-white/60">
                            <li className="hover:text-[#F26522] transition-colors cursor-pointer">info@gastrosmart.ai</li>
                            <li className="hover:text-[#F26522] transition-colors cursor-pointer">La Paz, Bolivia</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
                    © {new Date().getFullYear()} GastroSmart AI. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    );
}
