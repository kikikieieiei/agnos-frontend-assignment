import Link from "next/link";
import { Hospital, UserPlus, LayoutDashboard, Shield, Lock, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <Hospital className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
            Patient Intake System
          </h1>
          <p className="text-base text-gray-500 text-center mb-8">
            Secure &amp; Real-time Patient Registration
          </p>

          {/* Navigation */}
          <div className="space-y-3">
            <Link
              href="/patient"
              className="flex items-center justify-center gap-2 w-full h-11 px-4 rounded-md font-medium text-base bg-blue-600 hover:bg-blue-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserPlus className="w-5 h-5" />
              Patient Registration
            </Link>
            <Link
              href="/staff"
              className="flex items-center justify-center gap-2 w-full h-11 px-4 rounded-md font-medium text-base border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 bg-white text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              <LayoutDashboard className="w-5 h-5" />
              Staff Dashboard
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" />Secure</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" />Private</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" />Real-time</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
