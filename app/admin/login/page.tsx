 "use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    window.location.href = "/admin";
  }

  async function handleForgotPassword() {
    setError("");
    setMessage("");

    if (!email) {
      setError("Enter your admin email first.");
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo:
          "http://localhost:3000/admin/update-password",
      },
    );

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Password reset email sent.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md"
      >
        <h1 className="text-5xl font-light italic">
          Admin
        </h1>

        <div className="mt-12 space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border-b border-white/30 bg-transparent px-0 py-3 text-xl outline-none placeholder:text-white/30 focus:border-white"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border-b border-white/30 bg-transparent px-0 py-3 text-xl outline-none placeholder:text-white/30 focus:border-white"
            required
          />

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          {message && (
            <p className="text-sm text-green-400">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="text-2xl font-light italic text-white"
          >
            Sign in
          </button>

          <button
            type="button"
            onClick={handleForgotPassword}
            className="block text-base font-light italic text-white/50 transition hover:text-white"
          >
            Forgot password?
          </button>
        </div>
      </form>
    </main>
  );
}