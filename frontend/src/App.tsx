import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Sidebar } from "./components/Sidebar";
import { Login } from "./components/Login";
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
import { Promotions } from "./components/Promotions";
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/locations" element={<BusinessLocations />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/users" element={<Users />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/settings/*" element={<Settings />} />
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
