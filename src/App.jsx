import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PDFProvider } from "./context/PDFContext";

import LoginScreen from "./components/auth/LoginScreen";
import Header from "./components/layout/Header";
import Toolbar from "./toolbar/Toolbar";
import Sidebar from "./pdf/Sidebar";
import PDFViewer from "./pdf/PDFViewer";

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <LoginScreen />;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Toolbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpen={() => setSidebarOpen(true)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm">
            <PDFViewer />
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <PDFProvider>
        <AppContent />
      </PDFProvider>
    </AuthProvider>
  );
}

export default App;
