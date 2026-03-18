import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Patient Intake System
        </h1>
        <p className="text-gray-600 mb-8">
          Real-time patient form with staff monitoring capabilities
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/patient"
            className="block p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Patient Form</h2>
            <p className="text-blue-100">
              Fill out your information
            </p>
          </Link>

          <Link
            href="/staff"
            className="block p-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Staff Dashboard</h2>
            <p className="text-indigo-100">
              Monitor patient forms in real-time
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
