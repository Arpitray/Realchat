"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordClient({ token }: { token?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing token. Make sure you opened the link from your email.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const json = await res.json().catch(() => ({ error: "Unknown response" }));
    setLoading(false);

    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/auth/login"), 2000);
      return;
    }

    setError(json?.error || json?.message || "Failed to reset password");
  };

  if (done)
    return (
      <div className="min-h-screen flex items-center justify-center">Password updated! Redirecting...</div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow-xl">
        <h1 className="text-xl font-bold mb-4">Create new password</h1>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 p-3 rounded">{error}</div>
        )}

        <input
          type="password"
          placeholder="New password"
          className="p-3 w-full border rounded-lg mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="bg-black text-white p-3 w-full rounded-lg" disabled={loading}>
          {loading ? "Updating..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
