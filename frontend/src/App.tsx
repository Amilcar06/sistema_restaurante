import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Inventory } from "./components/Inventory";
import { Recipes } from "./components/Recipes";
import { Sales } from "./components/Sales";
import { Reports } from "./components/Reports";
import { Chatbot } from "./components/Chatbot";
import { Settings } from "./components/Settings";
import { Toaster } from "sonner";

export default function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <BrowserRouter>
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
            <Route path="/settings/*" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        <Chatbot isOpen={isChatbotOpen} onToggle={() => setIsChatbotOpen(!isChatbotOpen)} />
        <Toaster position="top-right" richColors />
      </div>
    </BrowserRouter>
  );
}
