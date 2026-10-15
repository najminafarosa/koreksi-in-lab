
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function periksaLogin() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setEmail(data.user.email ?? "");
      setLoading(false);
    }

    void periksaLogin();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Memeriksa sesi dosen...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Link href="/" className="text-sm text-blue-400">
              EvalAI
            </Link>
            <h1 className="mt-2 text-3xl font-bold">
              Dashboard Dosen
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Login sebagai {email}
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800"
          >
            Logout
          </button>
        </header>

        <section className="mt-8 grid gap-5 sm:grid-cols-2">
          <Link
            href="/tokens"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500"
          >
            <div className="text-3xl">🔑</div>
            <h2 className="mt-4 text-xl font-semibold">
              Token Koreksi
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Buat token tugas untuk dibagikan kepada seluruh kelas.
            </p>
            <p className="mt-4 text-sm font-medium text-blue-400">
              Kelola token →
            </p>
          </Link>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-3xl">📊</div>
            <h2 className="mt-4 text-xl font-semibold">
              Hasil Evaluasi
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Tempat melihat jawaban dan hasil evaluasi mahasiswa.
            </p>
            <p className="mt-4 text-sm text-slate-500">
              Integrasi data menyusul.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}