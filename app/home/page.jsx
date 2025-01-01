"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";

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
      <nav className="bg-white/80 backdrop-blur-md shadow-md fixed w-full z-10">
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
                href="/login"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition duration-300 hover:-translate-y-0.5"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-16">
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

      {/* Features Section */}
      <div id="features" className="py-20 bg-white/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Everything You Need to Manage Events
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Smart Event Creation",
                description:
                  "Create detailed event proposals with custom forms and automated validation.",
                icon: "📝",
                color: "bg-blue-50",
                iconBg: "bg-blue-500",
              },
              {
                title: "Streamlined Approvals",
                description:
                  "Track multi-level approvals in real-time with automatic notifications.",
                icon: "✅",
                color: "bg-green-50",
                iconBg: "bg-green-500",
              },
              {
                title: "Resource Management",
                description:
                  "Efficiently manage venues, equipment, and staff assignments.",
                icon: "🎯",
                color: "bg-orange-50",
                iconBg: "bg-orange-500",
              },
              {
                title: "Real-time Tracking",
                description:
                  "Get live updates on event status and progress for better decision-making.",
                icon: "📊",
                color: "bg-purple-50",
                iconBg: "bg-purple-500",
              },
              {
                title: "Role-based Access",
                description:
                  "HODs, staff, and students get tailored access to streamline responsibilities.",
                icon: "👥",
                color: "bg-yellow-50",
                iconBg: "bg-yellow-500",
              },
              {
                title: "Email Notifications",
                description:
                  "Stay updated with automated email alerts for approvals and tasks.",
                icon: "✉️",
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
            Simple 4-Step Process
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            {[
              {
                step: "1",
                title: "Sign In",
                description: "Secure institutional login.",
              },
              {
                step: "2",
                title: "Create Event",
                description: "Use intuitive forms to submit details.",
              },
              {
                step: "3",
                title: "Get Approved",
                description: "Quick multi-level approval system.",
              },
              {
                step: "4",
                title: "Execute Event",
                description: "Coordinate resources efficiently.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300"
              >
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold">
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-6 mb-4">
            <Image
              src="/assets/images/SairamEOMS.png"
              width={200}
              height={80}
              quality={100}
              priority
              alt="Sairam EOMS Logo"
            />
            <div className="border-l border-gray-600 h-8"></div>
            <Image
              src="/assets/images/logo.png"
              width={200}
              height={80}
              quality={100}
              priority
              alt="Eventify Logo"
            />
          </div>
          <p className="text-gray-400">
            © {new Date().getFullYear()} Eventify - Transforming College Event
            Management.
          </p>
        </div>
      </footer>
    </div>
  );
}
