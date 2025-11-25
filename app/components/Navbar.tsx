"use client";

import React from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { ModeToggle } from "./toggle";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="w-full bg-amber-200 border-b-4 border-amber-600">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-amber-800"> 
              Bando
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-amber-700 hover:text-amber-900 font-medium"
            >
              Home
            </Link>

            {status === "loading" ? (
              <div className="text-amber-700">Checking…</div>
            ) : session ? (
              <div className="flex items-center space-x-3">
                <div className="text-amber-800 font-medium">
                  {session.user?.name || session.user?.email}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="py-1 px-3 bg-yellow-400 border-2 border-yellow-600 rounded-md text-yellow-900 font-semibold hover:bg-yellow-300"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="py-1 px-3 bg-blue-100 border-2 border-blue-600 rounded-md text-blue-900 font-semibold hover:bg-blue-50"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="py-1 px-3 bg-yellow-400 border-2 border-yellow-600 rounded-md text-yellow-900 font-semibold hover:bg-yellow-300"
                >
                  Sign up
                </Link>
                
              </div>
            )}
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}