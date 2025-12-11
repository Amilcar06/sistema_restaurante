
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    CreditCard,
    UtensilsCrossed,
    Coffee,
    ArrowLeft,
    ChefHat
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { recetasApi, ventasApi } from '../services/api';
import { Receta, Venta } from '../types';
import { useAuth } from '../contexts/AuthContext';

// --- Components ---

const ProductCard = ({ product, onAdd }: { product: Receta; onAdd: (p: Receta) => void }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAdd(product)}
            className="bg-white rounded-xl shadow-sm border border-[#1B1B1B]/5 overflow-hidden cursor-pointer hover:shadow-md hover:border-[#F26522]/30 transition-all group h-[180px] flex flex-col"
        >
            <div className="h-28 bg-[#1B1B1B]/5 relative overflow-hidden">
                {/* Placeholder for image - in real app would match product.image */}
                <div className="absolute inset-0 flex items-center justify-center text-[#1B1B1B]/10 group-hover:text-[#F26522]/20 transition-colors">
                    <UtensilsCrossed className="w-12 h-12" />
                </div>
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-[#1B1B1B] shadow-sm">
                    Bs. {product.precio.toFixed(2)}
                </div>
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-[#1B1B1B] leading-tight line-clamp-2 text-sm group-hover:text-[#F26522] transition-colors">
                    {product.nombre}
                </h3>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    {product.categoria}
                </span>
            </div>
        </motion.div>
    );
};

const CartItemRow = ({ item, onUpdate, onRemove }: any) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#1B1B1B]/5 shadow-sm"
        >
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[#1B1B1B] text-sm truncate">{item.product.nombre}</h4>
                <div className="text-xs text-gray-500">Bs. {item.product.precio.toFixed(2)} c/u</div>
            </div>

            <div className="flex items-center gap-3 bg-[#F4F5F7] rounded-full px-2 py-1">
                <button
                    onClick={() => onUpdate(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-[#1B1B1B] shadow-sm hover:text-[#F26522] active:scale-90 transition-all"
                >
                    <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                <button
                    onClick={() => onUpdate(item.product.id, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-[#1B1B1B] text-white shadow-sm hover:bg-[#F26522] active:scale-90 transition-all"
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>

            <div className="text-right min-w-[60px]">
                <div className="font-bold text-[#1B1B1B]">
                    {((item.product.precio * item.quantity)).toFixed(2)}
                </div>
            </div>

            <button
                onClick={() => onRemove(item.product.id)}
                className="text-gray-400 hover:text-[#EA5455] p-1 transition-colors"
                title="Eliminar"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </motion.div>
    )
}

// --- Main Page ---

export default function POS() {
    const navigate = useNavigate();
    const { usuario } = useAuth();

    // State
    const [products, setProducts] = useState<Receta[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<{ product: Receta, quantity: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false); // Processing payment

    // Load Data
    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await recetasApi.obtenerTodos();
            const availableProducts = data.filter(p => p.disponible); // Only available items
            setProducts(availableProducts);

            // Extract unique categories
            const cats = Array.from(new Set(availableProducts.map(p => p.categoria))).sort();
            setCategories(['Todos', ...cats]);
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    };

    // Computeds
    const filteredProducts = useMemo(() => {
        let result = products;

        if (selectedCategory !== 'Todos') {
            result = result.filter(p => p.categoria === selectedCategory);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => p.nombre.toLowerCase().includes(query));
        }

        return result;
    }, [products, selectedCategory, searchQuery]);

    const cartTotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + (item.product.precio * item.quantity), 0);
    }, [cart]);

    // Handlers
    const addToCart = (product: Receta) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(item =>
            item.product.id === productId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!usuario?.sucursal_default_id) {
            alert("Error: Usuario no tiene sucursal asignada");
            return;
        }

        setProcessing(true);
        try {
            // Enforce Cash Register Check before selling
            // In a real generic POS, we might prompt login or check shift status here.
            // For now, allow sale. Backend deductions happen automatically in creating_venta.

            const ventaData: Partial<Venta> = {
                sucursal_id: usuario.sucursal_default_id,
                tipo_venta: 'LOCAL',
                estado: 'COMPLETADA',
                metodo_pago: 'Efectivo', // Default for Quick NOS
                subtotal: cartTotal, // Simplified tax logic for demo
                monto_descuento: 0,
                impuesto: 0,
                total: cartTotal,
                // Map cart items to ItemVenta format
                items: cart.map(item => ({
                    id: '', // Backend generates
                    venta_id: '',
                    receta_id: item.product.id,
                    nombre_item: item.product.nombre,
                    cantidad: item.quantity,
                    precio_unitario: item.product.precio,
                    total: item.product.precio * item.quantity
                })) as any
            };

            await ventasApi.crear(ventaData);

            // Reset and Feedback
            setCart([]);
            alert("¡Venta Registrada Correctamente!"); // Replace with proper Toast later
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Error al procesar la venta.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#F4F5F7] overflow-hidden font-sans">

            {/* --- LEFT SIDE: MENU (Grid) --- */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">

                {/* Header Bar */}
                <header className="bg-white border-b border-[#1B1B1B]/10 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" title="Volver al Dashboard">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-black text-[#1B1B1B] tracking-tight uppercase">
                            Gastro<span className="text-[#F26522]">POS</span>
                        </h1>
                        <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>

                        {/* Search Bar */}
                        <div className="relative hidden sm:block w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar producto..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#F4F5F7] border-none rounded-full py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-[#F26522]/20 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-bold text-[#1B1B1B]">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F4F5F7] rounded-lg">
                            <ChefHat className="w-4 h-4 text-[#F26522]" />
                            <span>{usuario?.nombre_completo?.split(' ')[0] || 'Mesero'}</span>
                        </div>
                    </div>
                </header>

                {/* Categories Tabs */}
                <div className="px-6 pt-4 pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0">
                    <div className="flex gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === cat
                                    ? 'bg-[#1B1B1B] text-white shadow-lg shadow-[#1B1B1B]/20 scale-105'
                                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="h-[180px] bg-white rounded-xl shadow-sm animate-pulse border border-gray-100"></div>
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Search className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-medium">No se encontraron productos</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-20">
                            <AnimatePresence>
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} onAdd={addToCart} />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* --- RIGHT SIDE: CART (Sticky) --- */}
            <div className="w-[380px] bg-white border-l border-[#1B1B1B]/10 flex flex-col shadow-2xl z-20 shrink-0">
                <div className="px-6 py-5 border-b border-[#1B1B1B]/5 bg-white">
                    <h2 className="text-lg font-black text-[#1B1B1B] flex items-center gap-2 uppercase tracking-wide">
                        <ShoppingCart className="w-5 h-5 text-[#F26522]" />
                        Orden Actual
                    </h2>
                    <p className="text-xs text-gray-400 font-bold mt-1 tracking-wider uppercase">Mesa # -- (Barra)</p>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#F9FAFB] scrollbar-thin">
                    <AnimatePresence initial={false}>
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                <Coffee className="w-16 h-16 mb-4 stroke-1" />
                                <p className="font-medium">El carrito está vacío</p>
                                <p className="text-xs mt-2">Selecciona productos del menú</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <CartItemRow
                                    key={item.product.id}
                                    item={item}
                                    onUpdate={updateQuantity}
                                    onRemove={removeFromCart}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer / Totals */}
                <div className="p-6 bg-white border-t border-[#1B1B1B]/10 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-gray-500 font-medium">Subtotal</span>
                        <span className="font-bold text-[#1B1B1B]">Bs. {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-6 text-xl">
                        <span className="font-black text-[#1B1B1B] uppercase tracking-wide">Total</span>
                        <span className="font-black text-[#F26522]">Bs. {cartTotal.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || processing}
                        className="w-full py-4 bg-[#1B1B1B] hover:bg-[#F26522] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-lg shadow-lg hover:shadow-[#F26522]/40 transition-all flex items-center justify-center gap-3 uppercase tracking-wide group"
                    >
                        {processing ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <CreditCard className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                Cobrar Orden
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
