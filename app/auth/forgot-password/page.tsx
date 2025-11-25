"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setIsLoading(false);

    // If the API returns a token (only in development), navigate directly to reset page
    if (res.ok) {
      try {
        const json = await res.json();
        if (json?.token) {
          // route to /auth/reset-password/[token]
          router.push(`/auth/reset-password/${json.token}`);
          return;
        }
      } catch (err) {
        // ignore JSON parse errors and fall back to submitted state
      }
    }

    setIsSubmitted(true);
  };


  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-b from-amber-200 to-amber-300 border-4 border-amber-600 rounded-2xl shadow-2xl overflow-hidden">
            {/* Window Header */}
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 border-b-4 border-amber-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full border border-red-600"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-600"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full border border-green-600"></div>
                </div>
                <Link href="/auth/login" className="text-amber-800 hover:text-amber-900 text-xl font-bold">
                  ×
                </Link>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-b from-orange-50 to-orange-100 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-200 border-3 border-green-600 rounded-full mx-auto flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-amber-800 mb-2">Check your email!</h1>
                <p className="text-amber-700">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
              </div>

              <Link
                href="/auth/login"
                className="inline-block py-3 px-6 bg-gradient-to-b from-yellow-400 to-yellow-500 
                         border-3 border-yellow-600 rounded-xl text-yellow-900 font-bold
                         hover:from-yellow-300 hover:to-yellow-400 hover:border-yellow-700
                         active:transform active:scale-95 transition-all duration-200
                         shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-yellow-300"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-b from-amber-200 to-amber-300 border-4 border-amber-600 rounded-2xl shadow-2xl overflow-hidden">
          {/* Window Header */}
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 border-b-4 border-amber-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full border border-red-600"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-600"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full border border-green-600"></div>
              </div>
              <Link href="/auth/login" className="text-amber-800 hover:text-amber-900 text-xl font-bold">
                ×
              </Link>
            </div>
          </div>

          <div className="p-8 bg-gradient-to-b from-orange-50 to-orange-100">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-amber-800 mb-2">Forgot Password?</h1>
              <p className="text-amber-700">Enter your email to reset your password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 bg-pink-100 border-3 border-amber-600 rounded-xl 
                           text-amber-900 placeholder-amber-600 font-medium
                           focus:outline-none focus:ring-4 focus:ring-amber-300 focus:border-amber-700
                           shadow-inner transition-all duration-200"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gradient-to-b from-yellow-400 to-yellow-500 
                         border-3 border-yellow-600 rounded-xl text-yellow-900 font-bold text-lg
                         hover:from-yellow-300 hover:to-yellow-400 hover:border-yellow-700
                         active:transform active:scale-95 transition-all duration-200
                         shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-4 focus:ring-yellow-300"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-yellow-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="text-amber-700 hover:text-amber-900 font-medium underline 
                         hover:no-underline transition-all duration-200"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>

        {/* Retro Computer Styling */}
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}