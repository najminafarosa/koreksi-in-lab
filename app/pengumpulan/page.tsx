
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Tugas = {
  id: string;
  title: string;
  question: string;
  rubric: string | null;
};

export default function PengumpulanPage() {
  const [token, setToken] = useState("");
  const [tugas, setTugas] = useState<Tugas | null>(null);
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");
  const [nama, setNama] = useState("");
  const [nim, setNim] = useState("");
  const [jawaban, setJawaban] = useState("");
  const [mengirim, setMengirim] = useState(false);
  const [hasil, setHasil] = useState("");

  async function periksaToken(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setPesan("");
    setTugas(null);
    setHasil("");

    try {
      const { data, error } = await supabase.rpc(
        "validate_correction_token",
        {
          p_token_code: token.trim(),
        }
      );

      if (error) throw error;

      if (!data || data.length === 0) {
        setPesan(
          "Token tidak valid, sudah dinonaktifkan, atau kedaluwarsa."
        );
        return;
      }

      setTugas(data[0] as Tugas);
    } catch (error) {
      setPesan(
        error instanceof Error
          ? error.message
          : "Gagal memeriksa token."
      );
    } finally {
      setLoading(false);
    }
  }

  async function kirimJawaban(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!tugas) return;

    setMengirim(true);
    setPesan("");
    setHasil("");

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: tugas.question,
          rubrik: tugas.rubric || "",
          answer: jawaban,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Evaluasi gagal.");
      }

      const teksHasil =
        typeof data.hasil === "string"
          ? data.hasil
          : typeof data.result === "string"
            ? data.result
            : typeof data.evaluation === "string"
              ? data.evaluation
              : "";

      if (!teksHasil) {
        throw new Error("Hasil evaluasi tidak ditemukan.");
      }

      const { error: simpanError } = await supabase
        .from("correction_submissions")
        .insert({
          token_id: tugas.id,
          student_name: nama.trim(),
          student_nim: nim.trim(),
          answer: jawaban,
          evaluation_result: teksHasil,
        });

      if (simpanError) throw simpanError;

      setHasil(teksHasil);
    } catch (error) {
      setPesan(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengirim jawaban."
      );
    } finally {
      setMengirim(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <a
            href="/"
            className="text-sm text-blue-400 hover:underline"
          >
            ← Kembali ke beranda
          </a>

          <h1 className="mt-5 text-3xl font-bold">
            Pengumpulan Tugas
          </h1>

          <p className="mt-3 text-slate-400">
            Masukkan token dari dosen untuk membuka tugas.
          </p>
        </div>

        <form
          onSubmit={periksaToken}
          className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <label
            htmlFor="token"
            className="block font-medium"
          >
            Token Tugas
          </label>

          <input
            id="token"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Masukkan token dari dosen"
            autoComplete="off"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 p-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Memeriksa..." : "Periksa Token"}
          </button>

          {pesan && (
            <p
              role="alert"
              className="break-words text-sm text-red-400"
            >
              {pesan}
            </p>
          )}
        </form>

        {tugas && (
          <section className="space-y-4 rounded-2xl border border-emerald-800 bg-slate-900 p-6">
            <p className="text-sm font-medium text-emerald-400">
              Token valid
            </p>

            <h2 className="text-2xl font-bold">
              {tugas.title}
            </h2>

            <div>
              <h3 className="mb-2 font-semibold">
                Soal Tugas
              </h3>
              <p className="whitespace-pre-wrap leading-7 text-slate-300">
                {tugas.question}
              </p>
            </div>

            {tugas.rubric && (
              <div>
                <h3 className="mb-2 font-semibold">
                  Petunjuk Penilaian
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-400">
                  {tugas.rubric}
                </p>
              </div>
            )}

            <form
              onSubmit={kirimJawaban}
              className="space-y-4 border-t border-slate-800 pt-5"
            >
              <h3 className="text-lg font-semibold">
                Kumpulkan Jawaban
              </h3>

              <div>
                <label
                  htmlFor="nama"
                  className="mb-2 block text-sm"
                >
                  Nama mahasiswa
                </label>
                <input
                  id="nama"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
                  placeholder="Nama lengkap"
                />
              </div>

              <div>
                <label
                  htmlFor="nim"
                  className="mb-2 block text-sm"
                >
                  NIM
                </label>
                <input
                  id="nim"
                  required
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
                  placeholder="Nomor induk mahasiswa"
                />
              </div>

              <div>
                <label
                  htmlFor="jawaban"
                  className="mb-2 block text-sm"
                >
                  Jawaban tugas
                </label>
                <textarea
                  id="jawaban"
                  required
                  value={jawaban}
                  onChange={(e) => setJawaban(e.target.value)}
                  className="min-h-48 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
                  placeholder="Tuliskan jawabanmu di sini..."
                />
              </div>

              <button
                type="submit"
                disabled={mengirim}
                className="w-full rounded-xl bg-blue-600 p-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
              >
                {mengirim
                  ? "Sedang mengevaluasi..."
                  : "Kirim dan Evaluasi"}
              </button>

              {hasil && (
                <div className="rounded-xl border border-emerald-800 p-4">
                  <h3 className="mb-3 font-semibold text-emerald-400">
                    Hasil Evaluasi
                  </h3>
                  <p className="whitespace-pre-wrap leading-7">
                    {hasil}
                  </p>
                </div>
              )}

              {pesan && (
                <p
                  role="alert"
                  className="break-words text-sm text-red-400"
                >
                  {pesan}
                </p>
              )}
            </form>
          </section>
        )}
      </div>
    </main>
  );
}