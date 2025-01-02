"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";
import "../styles/doodle.css";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [activeFeature, setActiveFeature] = useState(0);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-md fixed w-full z-50">
        <div className="w-full px-4">
          <div className="flex justify-between items-center h-16">
            <Image
              src="/assets/images/logo.png"
              width={185}
              height={100}
              quality={100}
              alt="Eventify Logo"
              priority
            />
            {session ? (
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition duration-300 hover:-translate-y-0.5"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition duration-300 hover:-translate-y-0.5"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-16 relative doodle-background">
        <div className="relative z-10 pt-8">
          <div className="max-w-6xl mx-auto text-center px-4 mt-8">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-800 mb-8 leading-tight">
              Transform Your
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                College Events
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-2xl mx-auto">
              Streamline planning, approvals, and management in one powerful
              platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-lg hover:shadow-lg transition duration-300 hover:-translate-y-0.5 text-lg font-semibold"
              >
                Get Started Now
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto bg-white text-gray-800 px-8 py-4 rounded-lg hover:shadow-lg transition duration-300 hover:-translate-y-0.5 border border-gray-200 text-lg font-semibold"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Comprehensive Event Management Features
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Smart Event Forms",
                description:
                  "Create and edit event proposals with customizable forms and detailed planning options.",
                icon: "📝",
                color: "bg-blue-50",
                iconBg: "bg-blue-500",
              },
              {
                title: "Venue Management",
                description:
                  "Book venues, check availability, and manage reservations with calendar integration.",
                icon: "🏛️",
                color: "bg-green-50",
                iconBg: "bg-green-500",
              },
              {
                title: "Approval Tracking",
                description:
                  "Real-time tracking of multi-level approvals with status updates and history.",
                icon: "✅",
                color: "bg-orange-50",
                iconBg: "bg-orange-500",
              },
              {
                title: "Post-Event Documentation",
                description:
                  "Collect event photos, attendance records, and OD lists through structured forms.",
                icon: "📸",
                color: "bg-purple-50",
                iconBg: "bg-purple-500",
              },
              {
                title: "Email Notifications",
                description:
                  "Automated alerts for approvals, rejections, and important updates.",
                icon: "✉️",
                color: "bg-yellow-50",
                iconBg: "bg-yellow-500",
              },
              {
                title: "Report Generation",
                description:
                  "Generate comprehensive reports for multiple events with custom filters.",
                icon: "📊",
                color: "bg-red-50",
                iconBg: "bg-red-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`${feature.color} p-6 rounded-xl shadow-sm hover:shadow-xl transition duration-300 transform hover:-translate-y-1 cursor-pointer`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div
                  className={`${feature.iconBg} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                >
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Event Management Workflow
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            {[
              {
                step: "1",
                title: "Create Event Request",
                description: "Submit detailed event proposals using smart forms.",
              },
              {
                step: "2",
                title: "Book Venue",
                description: "Check availability and reserve venues for your dates.",
              },
              {
                step: "3",
                title: "Track Approvals",
                description: "Monitor approval status across different levels.",
              },
              {
                step: "4",
                title: "Conduct Event",
                description: "Execute event and submit post-event documentation.",
              },
              {
                step: "5",
                title: "Generate Reports",
                description: "Create comprehensive event reports and analytics.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300"
              >
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold shrink-0 aspect-square">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-6">
            <div className="w-48 md:w-auto">
              <Image
                src="/assets/images/SairamEOMS.png"
                width={180}
                height={70}
                quality={100}
                priority
                alt="Sairam EOMS Logo"
                className="object-contain"
              />
            </div>
            <div className="hidden md:block border-l border-gray-600 h-16"></div>
            <div className="w-48 md:w-auto">
              <Image
                src="/assets/images/logo.png"
                width={180}
                height={70}
                quality={100}
                priority
                alt="Eventify Logo"
                className="object-contain"
              />
            </div>
          </div>
          <div className="h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-gray-500 to-transparent mb-6"></div>
          <p className="text-gray-400">
            © {new Date().getFullYear()} Eventify - Sairam Institutions.
          </p>
        </div>
      </footer>
    </div>
  );
}
