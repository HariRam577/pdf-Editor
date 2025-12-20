import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, User, LogOut, Menu, ChevronDown } from "lucide-react";

const Header = ({ user }) => {
  const { logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo & App Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5-.829 4.88a6.004 6.004 0 001.639-4.88zM10 18a8 8 0 100-16 8 8 0 000 16zm.936-12.97c.21-.94.498-1.82.837-2.646A6.004 6.004 0 0010 2c-.21 0-.465.032-.736.262C9.24 2.377 8.98 2.766 8.743 3.382c-.27.562-.494 1.39-.612 2.618H10.936z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                PDF Editor Pro
              </h1>
              <p className="text-xs text-gray-500 font-medium">Workspace</p>
            </div>
          </div>

          {/* Right: Actions */}
          <button
            onClick={logout}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-xs sm:text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
