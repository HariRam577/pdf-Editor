import React from "react";
import { Shield, Clock, FileText, HelpCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left: Status Indicators */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Online</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Last sync: 2s ago</span>
            </div>
          </div>

          {/* Center: Product Info */}
          <div className="flex items-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span>SSL Secured</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Auto-save enabled</span>
            </div>
          </div>

          {/* Right: Support & Legal */}
          <div className="flex items-center space-x-6 text-sm">
            <a
              href="#"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Support</span>
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Terms
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 mt-6 pt-4 text-xs text-gray-500 text-center md:text-left">
          © 2025 PDF Editor Pro. All rights reserved. | v2.1.3
        </div>
      </div>
    </footer>
  );
};

export default Footer;
