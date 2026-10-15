
"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export default function AuthPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setMessage(
          data.session
            ? "Pendaftaran berhasil!"
            : "Pendaftaran berhasil. Periksa email untuk konfirmasi akun."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        setMessage("Login berhasil!");
      }
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    setMessage(error ? error.message : "Kamu sudah logout.");
    if (error) return;
    setUser(null);
  }

  if (loading && !user) {
    return <p className="text-slate-600">Memuat akun...</p>;
  }

  if (user) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Akun Dosen
        </h2>
        <p className="mt-2 break-all text-slate-600">
          Login sebagai {user.email}
        </p>
        <button
          onClick={handleLogout}
          className="mt-4 rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-700"
        >
          Logout
        </button>
        {message && <p className="mt-3 text-sm">{message}</p>}
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">
        {mode === "login" ? "Login Dosen" : "Daftar Akun Dosen"}
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        Masuk untuk menyiapkan akses penyimpanan evaluasi.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-3 text-slate-900"
            placeholder="dosen@kampus.ac.id"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Password
          </span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-3 text-slate-900"
            placeholder="Minimal 6 karakter"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Memproses..."
            : mode === "login"
              ? "Login"
              : "Daftar"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setMessage("");
        }}
        className="mt-4 text-sm font-medium text-blue-700 hover:underline"
      >
        {mode === "login"
          ? "Belum punya akun? Daftar"
          : "Sudah punya akun? Login"}
      </button>

      {message && (
        <p role="status" className="mt-4 break-words text-sm text-slate-700">
          {message}
        </p>
      )}
    </section>
  );
}