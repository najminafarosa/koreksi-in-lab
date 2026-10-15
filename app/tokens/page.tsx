
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TokensPage() {
  const [judul, setJudul] = useState("");
  const [soal, setSoal] = useState("");
  const [rubrik, setRubrik] = useState("");
  const [berlakuSampai, setBerlakuSampai] = useState("");
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");
  const [token, setToken] = useState("");

  async function buatToken(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setPesan("");
    setToken("");

    try {
      const { data: sesi } = await supabase.auth.getSession();

      if (!sesi.session) {
        setPesan("Silakan login terlebih dahulu.");
        return;
      }

      const { data, error } = await supabase.rpc(
        "create_correction_token",
        {
          p_title: judul,
          p_question: soal,
          p_rubric: rubrik || null,
          p_expires_at: berlakuSampai
            ? new Date(berlakuSampai).toISOString()
            : null,
        }
      );

      if (error) throw error;

      const hasil = Array.isArray(data) ? data[0] : data;

      setToken(hasil.token_code);
      setPesan("Token berhasil dibuat!");
      setJudul("");
      setSoal("");
      setRubrik("");
      setBerlakuSampai("");
    } catch (error) {
      setPesan(
        error instanceof Error
          ? error.message
          : "Gagal membuat token."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">
          Token Koreksi
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Buat satu token yang dapat digunakan seluruh kelas.
        </p>
      </div>

      <form onSubmit={buatToken} className="space-y-4">
        <div>
          <label className="mb-1 block font-medium">
            Judul tugas
          </label>
          <input
            required
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full rounded-lg border p-3"
            placeholder="Contoh: Tugas Algoritma"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Soal
          </label>
          <textarea
            required
            value={soal}
            onChange={(e) => setSoal(e.target.value)}
            className="min-h-28 w-full rounded-lg border p-3"
            placeholder="Masukkan soal tugas..."
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Rubrik penilaian
          </label>
          <textarea
            value={rubrik}
            onChange={(e) => setRubrik(e.target.value)}
            className="min-h-24 w-full rounded-lg border p-3"
            placeholder="Kriteria penilaian (opsional)"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Batas waktu (opsional)
          </label>
          <input
            type="datetime-local"
            value={berlakuSampai}
            onChange={(e) =>
              setBerlakuSampai(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 p-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Membuat token..." : "Buat Token"}
        </button>
      </form>

      {pesan && (
        <p className="break-words rounded-lg border p-3">
          {pesan}
        </p>
      )}

      {token && (
        <div className="space-y-3 rounded-lg border p-4">
          <p className="font-medium">
            Token untuk seluruh kelas:
          </p>
          <p className="break-all text-2xl font-bold tracking-widest">
            {token}
          </p>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(token);
              setPesan("Token disalin!");
            }}
            className="rounded-lg border px-4 py-2"
          >
            Salin Token
          </button>
        </div>
      )}
    </main>
  );
}