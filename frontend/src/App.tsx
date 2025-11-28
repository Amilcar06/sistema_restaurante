import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Sidebar } from "./components/Sidebar";
import { Login } from "./components/Login";
import { ForgotPassword } from "./components/ForgotPassword";
import { ResetPassword } from "./components/ResetPassword";
import { Dashboard } from "./components/Dashboard";
import { Inventory } from "./components/Inventory";
import { Recipes } from "./components/Recipes";
import { Sales } from "./components/Sales";
import { Reports } from "./components/Reports";
import { Chatbot } from "./components/Chatbot";
import { Settings } from "./components/Settings";
import { BusinessLocations } from "./components/BusinessLocations";
import { Suppliers } from "./components/Suppliers";
import { Users } from "./components/Users";
import { Roles } from "./components/Roles";
import { Promotions } from "./components/Promotions";
import { PurchaseOrders } from "./components/PurchaseOrders";
import { Toaster } from "sonner";

function AppContent() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#020617]">
        <Sidebar />

        {/* Spacer for desktop sidebar */}
        <div className="hidden lg:block w-64 shrink-0" />

        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 p-4 lg:p-8 relative">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<ProtectedRoute permission="gestionar_inventario"><Inventory /></ProtectedRoute>} />
            <Route path="/recipes" element={<ProtectedRoute permission="gestionar_inventario"><Recipes /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute permission="gestionar_ventas"><Sales /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute permission="ver_reportes"><Reports /></ProtectedRoute>} />
            <Route path="/locations" element={<ProtectedRoute permission="admin"><BusinessLocations /></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute permission="gestionar_inventario"><Suppliers /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute permission="gestionar_usuarios"><Users /></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute permission="admin"><Roles /></ProtectedRoute>} />
            <Route path="/promotions" element={<ProtectedRoute permission="gestionar_ventas"><Promotions /></ProtectedRoute>} />
            <Route path="/purchase-orders" element={<ProtectedRoute permission="gestionar_inventario"><PurchaseOrders /></ProtectedRoute>} />
            <Route path="/settings/*" element={<ProtectedRoute permission="admin"><Settings /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        <Chatbot isOpen={isChatbotOpen} onToggle={() => setIsChatbotOpen(!isChatbotOpen)} />
        <Toaster position="top-right" richColors />
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
