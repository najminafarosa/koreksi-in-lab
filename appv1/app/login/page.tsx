
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setPesan("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setPesan(
        error instanceof Error
          ? error.message
          : "Login gagal. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm text-blue-400 hover:underline">
          ← Kembali ke beranda
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-2xl font-bold">
              Eval<span className="text-blue-400">AI</span>
            </p>

            <h1 className="mt-5 text-2xl font-bold">
              Login Dosen
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Masuk untuk mengelola token tugas dan melihat hasil evaluasi.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dosen@kampus.ac.id"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>

              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 outline-none focus:border-blue-500"
              />
            </div>

            {pesan && (
              <p role="alert" className="break-words text-sm text-red-400">
                {pesan}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 p-3 font-semibold transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Sedang masuk..." : "Login"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
          Akun dosen harus sudah terdaftar di Supabase Authentication.
        </p>
      </div>
    </main>
  );
}