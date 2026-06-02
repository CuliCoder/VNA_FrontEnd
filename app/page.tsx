import Link from 'next/link';
import { Logo } from '@/components/common';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="text-xl font-bold text-gray-900">VNA</span>
          </div>
          <div className="flex gap-4">
            <Link href="/demo" className="text-blue-600 hover:text-blue-700 font-medium">
              Components Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to VNA Frontend
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A modern Next.js + React + TypeScript application with reusable components
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/demo"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              View Components
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Components</h3>
            <p className="text-gray-600">
              Pre-built UI components (Button, Input, Card, Modal, Alert)
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Responsive</h3>
            <p className="text-gray-600">
              Fully responsive design with Tailwind CSS
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Ready</h3>
            <p className="text-gray-600">
              Structured for efficient team collaboration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
