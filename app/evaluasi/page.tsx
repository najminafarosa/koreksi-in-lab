
"use client";

import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import AuthPanel from "./AuthPanel";
import { supabase } from "../lib/supabase";

type Kriteria = {
  nama: string;
  skor: number;
  bobot: number;
  alasan: string;
};

type HasilEvaluasi = {
  nilai: number;
  penilaian: string;
  kelebihan: string;
  kekurangan: string;
  saran: string;
  breakdown: Kriteria[];
  result: string;
};

type EvaluasiTersimpan = {
  id: string;
  tanggal: string;
  soal: string;
  rubrik: string;
  jawaban: string;
  hasil: HasilEvaluasi;
  skorFinal: number[];
};

type EvaluasiDatabase = {
  id: string;
  question: string;
  rubric: string | null;
  answer: string;
  original_result: HasilEvaluasi;
  final_result: { skorFinal?: number[]; nilai?: number; breakdown?: Kriteria[] } | null;
  created_at: string;
};

function dariBarisDatabase(row: EvaluasiDatabase): EvaluasiTersimpan {
  const skorFinal = Array.isArray(row.final_result?.skorFinal)
    ? row.final_result.skorFinal.map((skor) => Number(skor))
    : (row.original_result.breakdown ?? []).map((item) => Number(item.skor) || 0);

  return {
    id: row.id,
    tanggal: row.created_at,
    soal: row.question,
    rubrik: row.rubric ?? "",
    jawaban: row.answer,
    hasil: row.original_result,
    skorFinal,
  };
}

export default function Home() {
  const [soal, setSoal] = useState("");
  const [rubrik, setRubrik] = useState("");
  const [jawaban, setJawaban] = useState("");

  const [hasil, setHasil] = useState<HasilEvaluasi | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Skor dari AI disimpan sebagai data awal, sedangkan skorTersimpan
  // menampung nilai yang sedang dipakai setelah revisi dosen.
  const [skorTersimpan, setSkorTersimpan] = useState<number[]>([]);
  const [skorDraft, setSkorDraft] = useState<number[]>([]);
  const [modeEdit, setModeEdit] = useState(false);
  const [sudahDiedit, setSudahDiedit] = useState(false);
  const [riwayat, setRiwayat] = useState<EvaluasiTersimpan[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [authSiap, setAuthSiap] = useState(false);
  const [sedangSimpan, setSedangSimpan] = useState(false);
  const [sedangMuatRiwayat, setSedangMuatRiwayat] = useState(false);
  const [pesanSimpan, setPesanSimpan] = useState("");

  // Ikuti status login Supabase.
  useEffect(() => {
    let aktif = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!aktif) return;
      if (error) setPesanSimpan(`Gagal memeriksa sesi: ${error.message}`);
      setUserId(data.session?.user.id ?? null);
      setAuthSiap(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      setAuthSiap(true);
    });

    return () => {
      aktif = false;
      subscription.unsubscribe();
    };
  }, []);

  // Ambil riwayat dari database setiap kali status pengguna berubah.
  useEffect(() => {
    if (!authSiap) return;
    if (!userId) {
      setRiwayat([]);
      setSedangMuatRiwayat(false);
      return;
    }

    let aktif = true;
    async function muatRiwayat() {
      setSedangMuatRiwayat(true);
      const { data, error } = await supabase
        .from("evaluations")
        .select("id, question, rubric, answer, original_result, final_result, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!aktif) return;
      if (error) {
        setPesanSimpan(`Riwayat gagal dimuat: ${error.message}`);
      } else {
        setRiwayat((data ?? []).map((row) => dariBarisDatabase(row as EvaluasiDatabase)));
      }
      setSedangMuatRiwayat(false);
    }

    void muatRiwayat();
    return () => { aktif = false; };
  }, [authSiap, userId]);

  async function evaluasiJawaban() {
    if (!soal.trim() || !jawaban.trim()) {
      setError("Soal dan jawaban mahasiswa wajib diisi.");
      return;
    }

    setLoading(true);
    setHasil(null);
    setError("");

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: soal,
          rubrik,
          answer: jawaban,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan.");
      }

      const hasilBaru: HasilEvaluasi = {
        nilai: data.nilai ?? 0,
        penilaian: data.penilaian ?? "",
        kelebihan: data.kelebihan ?? "",
        kekurangan: data.kekurangan ?? "",
        saran: data.saran ?? "",
        breakdown: Array.isArray(data.breakdown)
          ? data.breakdown
          : [],
        result: data.result ?? "",
      };

      setHasil(hasilBaru);
      const skorAwal = hasilBaru.breakdown.map((item) => Number(item.skor) || 0);
      setSkorTersimpan(skorAwal);
      setSkorDraft(skorAwal);
      setModeEdit(false);
      setSudahDiedit(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Evaluasi gagal. Periksa terminal VS Code."
      );
    } finally {
      setLoading(false);
    }
  }

  const adaDataTerstruktur =
    hasil !== null &&
    (hasil.breakdown.length > 0 ||
      hasil.penilaian !== "" ||
      hasil.nilai > 0);

  const totalNilai = hasil?.breakdown.length
    ? skorTersimpan.reduce((total, skor) => total + skor, 0)
    : hasil?.nilai ?? 0;

  const skorDraftValid =
    hasil?.breakdown.every((item, index) => {
      const skor = skorDraft[index];
      return Number.isFinite(skor) && skor >= 0 && skor <= item.bobot;
    }) ?? false;

  function mulaiEditNilai() {
    setSkorDraft([...skorTersimpan]);
    setModeEdit(true);
    setError("");
  }

  function simpanEditNilai() {
    if (!hasil || !skorDraftValid) {
      setError("Pastikan setiap skor berada di antara 0 dan bobot kriterianya.");
      return;
    }

    setSkorTersimpan([...skorDraft]);
    setSudahDiedit(true);
    setModeEdit(false);
    setError("");
  }

  function batalEditNilai() {
    setSkorDraft([...skorTersimpan]);
    setModeEdit(false);
    setError("");
  }

  function eksporPDF() {
    if (!hasil) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const margin = 15;
    const lebarTeks = 180;
    let y = 20;

    function tambahTeks(teks: string, ukuran = 10, tebal = false) {
      doc.setFont("helvetica", tebal ? "bold" : "normal");
      doc.setFontSize(ukuran);

      const baris = doc.splitTextToSize(teks || "-", lebarTeks);
      for (const barisTeks of baris) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(barisTeks, margin, y);
        y += ukuran * 0.45 + 1.5;
      }
      y += 2;
    }

    function tambahBagian(judul: string, isi: string) {
      tambahTeks(judul, 12, true);
      tambahTeks(isi);
    }

    tambahTeks("EvalAI", 22, true);
    tambahTeks("Laporan Evaluasi Tugas Mahasiswa", 14, true);
    tambahTeks(`Tanggal laporan: ${new Date().toLocaleString("id-ID")}`);

    tambahBagian("1. Soal", soal);
    tambahBagian("2. Rubrik Penilaian", rubrik);
    tambahBagian("3. Jawaban Mahasiswa", jawaban);

    tambahTeks("4. Hasil Evaluasi", 12, true);
    tambahTeks(`Nilai akhir: ${totalNilai}/100`, 14, true);

    if (sudahDiedit) {
      tambahTeks(`Nilai awal AI: ${hasil.nilai}/100`);
      tambahTeks("Nilai akhir telah direvisi oleh dosen.");
    }

    if (hasil.breakdown.length > 0) {
      tambahTeks("5. Rincian Skor", 12, true);
      hasil.breakdown.forEach((item, index) => {
        const skor = skorTersimpan[index] ?? item.skor;
        tambahTeks(`${item.nama}: ${skor}/${item.bobot}`);
        tambahTeks(`Alasan: ${item.alasan}`);
      });
    }

    tambahBagian("Penilaian", hasil.penilaian);
    tambahBagian("Kelebihan", hasil.kelebihan);
    tambahBagian("Kekurangan", hasil.kekurangan);
    tambahBagian("Saran Perbaikan", hasil.saran);

    if (hasil.result) {
      tambahBagian("Hasil Tambahan", hasil.result);
    }

    const tanggal = new Date().toISOString().slice(0, 10);
    doc.save(`EvalAI-Laporan-${tanggal}.pdf`);
  }

  async function simpanEvaluasi() {
    if (!hasil) return;
    if (!userId) {
      setPesanSimpan("Silakan login terlebih dahulu untuk menyimpan evaluasi ke database.");
      return;
    }

    setSedangSimpan(true);
    setPesanSimpan("");

    try {
      const { data, error } = await supabase
        .from("evaluations")
        .insert({
          question: soal,
          rubric: rubrik || null,
          answer: jawaban,
          original_result: hasil,
          final_result: {
            nilai: totalNilai,
            skorFinal: [...skorTersimpan],
            breakdown: hasil.breakdown.map((item, index) => ({
              ...item,
              skor: skorTersimpan[index] ?? item.skor,
            })),
          },
        })
        .select("id, question, rubric, answer, original_result, final_result, created_at")
        .single();

      if (error) throw error;
      if (!data) throw new Error("Database tidak mengembalikan data evaluasi.");

      const catatanBaru = dariBarisDatabase(data as EvaluasiDatabase);
      setRiwayat((sebelumnya) => [catatanBaru, ...sebelumnya]);
      setPesanSimpan("Hasil evaluasi berhasil disimpan ke database Supabase.");
    } catch (err) {
      setPesanSimpan(
        err instanceof Error
          ? `Gagal menyimpan: ${err.message}`
          : "Gagal menyimpan evaluasi ke database."
      );
    } finally {
      setSedangSimpan(false);
    }
  }

  function bukaEvaluasiTersimpan(item: EvaluasiTersimpan) {
    setSoal(item.soal);
    setRubrik(item.rubrik);
    setJawaban(item.jawaban);
    setHasil(item.hasil);

    const skorPulih = item.hasil.breakdown.map((kriteria, index) =>
      Number.isFinite(item.skorFinal[index]) ? item.skorFinal[index] : kriteria.skor
    );
    setSkorTersimpan(skorPulih);
    setSkorDraft([...skorPulih]);
    setModeEdit(false);
    setSudahDiedit(item.hasil.breakdown.some((kriteria, index) => skorPulih[index] !== kriteria.skor));
    setError("");
    setPesanSimpan("Evaluasi tersimpan berhasil dibuka.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function hapusEvaluasiTersimpan(id: string) {
    if (!userId) {
      setPesanSimpan("Silakan login terlebih dahulu.");
      return;
    }

    const { error } = await supabase
      .from("evaluations")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setPesanSimpan(`Gagal menghapus evaluasi: ${error.message}`);
      return;
    }

    setRiwayat((sebelumnya) => sebelumnya.filter((item) => item.id !== id));
    setPesanSimpan("Evaluasi berhasil dihapus dari database.");
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-5 rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-blue-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> AI ACADEMIC ASSISTANT
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">EvalAI</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Asisten evaluasi tugas mahasiswa. Nilai jawaban, tinjau masukan AI, dan simpan laporan dalam satu tempat.
            </p>
          </div>

<a
  href="/tokens"
  className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-medium hover:bg-gray-100"
>
  🔑 Token Koreksi
</a>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 sm:min-w-48">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-100">Status aplikasi</p>
            <p className="mt-2 flex items-center gap-2 font-semibold">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Siap digunakan
            </p>
            <p className="mt-1 text-xs text-blue-100">Evaluasi · Revisi · Ekspor PDF</p>
          </div>
        </header>

        {/* Login panel */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">👤</div>
            <div>
              <h2 className="font-bold text-slate-900">Akun dosen</h2>
              <p className="text-sm text-slate-500">Login untuk menyimpan dan melihat riwayat evaluasi.</p>
            </div>
          </div>
          <AuthPanel />
        </section>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          {/* Form evaluasi */}
          <section className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg text-white shadow-md shadow-blue-200">✍️</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Langkah 1</p>
                <h2 className="text-xl font-bold text-slate-950">Siapkan evaluasi</h2>
                <p className="mt-1 text-sm text-slate-500">Isi soal, rubrik, dan jawaban mahasiswa.</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <InputCard title="Soal" description="Instruksi atau pertanyaan tugas.">
                <textarea
                  value={soal}
                  onChange={(e) => setSoal(e.target.value)}
                  className="field min-h-40"
                  placeholder="Contoh: Jelaskan pengertian algoritma dan berikan contoh penerapannya..."
                />
              </InputCard>

              <InputCard title="Rubrik penilaian" description="Kriteria dan bobot nilai (opsional).">
                <textarea
                  value={rubrik}
                  onChange={(e) => setRubrik(e.target.value)}
                  className="field min-h-40"
                  
placeholder={"Contoh:\nPengertian: 50 poin\nContoh penerapan: 30 poin\nUrutan langkah: 20 poin"}
                />
              </InputCard>
            </div>

            <InputCard title="Jawaban mahasiswa" description="Tempelkan jawaban yang ingin dinilai.">
              <textarea
                value={jawaban}
                onChange={(e) => setJawaban(e.target.value)}
                className="field min-h-56"
                placeholder="Masukkan jawaban mahasiswa di sini..."
              />
              <p className="mt-2 text-right text-xs text-slate-400">{jawaban.length} karakter</p>
            </InputCard>

            {error && (
              <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <span className="text-lg">⚠️</span><p>{error}</p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <button
                onClick={evaluasiJawaban}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
              >
                {loading ? "⏳ Sedang mengevaluasi..." : "✨ Evaluasi jawaban dengan AI"}
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-slate-500">Periksa kembali hasil AI sebelum menyimpan nilai akhir.</p>
            </div>
          </section>

          {/* Hasil evaluasi */}
          <section className="space-y-5 lg:sticky lg:top-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-lg text-white shadow-md shadow-violet-200">📊</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">Langkah 2</p>
                <h2 className="text-xl font-bold text-slate-950">Hasil evaluasi</h2>
                <p className="mt-1 text-sm text-slate-500">Tinjau skor dan umpan balik sebelum diekspor.</p>
              </div>
            </div>

            {!hasil ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/70 p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">📝</div>
                <h3 className="font-bold text-slate-800">Belum ada hasil</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">Lengkapi soal dan jawaban, lalu tekan tombol evaluasi. Hasil AI akan tampil di sini.</p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-5 text-white sm:p-6">
                    <p className="text-sm font-semibold text-blue-100">NILAI AKHIR</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-5xl font-extrabold tracking-tight">{totalNilai}</span>
                      <span className="pb-1 text-blue-100">/ 100</span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
                      <div className="h-full rounded-full bg-white transition-all" style={{ width: `${Math.max(0, Math.min(100, totalNilai))}%` }} />
                    </div>
                    {sudahDiedit && <p className="mt-3 text-xs text-blue-100">Nilai awal AI: {hasil.nilai}/100 · sudah direvisi dosen</p>}
                  </div>
                  <div className="grid gap-3 p-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={eksporPDF}
                      className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
                    >
                      ↓ Ekspor laporan PDF
                    </button>
                    <button
                      type="button"
                      onClick={simpanEvaluasi}
                      disabled={sedangSimpan || !userId}
                      className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {sedangSimpan ? "Menyimpan..." : "Simpan ke database"}
                    </button>
                  </div>
                  {!userId && <p className="px-4 pb-4 text-xs text-slate-500">Login sebagai dosen untuk menyimpan hasil ke Supabase.</p>}
                </div>

                {pesanSimpan && <p role="status" className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">{pesanSimpan}</p>}

                {adaDataTerstruktur && hasil.breakdown.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900">Rincian skor</h3>
                        <p className="mt-1 text-xs text-slate-500">Skor per kriteria penilaian</p>
                      </div>
                      {!modeEdit ? (
                        <button type="button" onClick={mulaiEditNilai} className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">Edit nilai</button>
                      ) : (
                        <div className="flex gap-2">
                          <button type="button" onClick={batalEditNilai} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
                          <button type="button" onClick={simpanEditNilai} disabled={!skorDraftValid} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300">Simpan</button>
                        </div>
                      )}
                    </div>
                    {modeEdit && <p className="mb-3 rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-800">Masukkan skor antara 0 dan bobot masing-masing kriteria.</p>}
                    <div className="space-y-4">
                      {hasil.breakdown.map((item, index) => (
                        <div key={`${item.nama}-${index}`} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800">{item.nama}</p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">{item.alasan}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              {modeEdit ? (
                                <input type="number" min={0} max={item.bobot} step={1} value={skorDraft[index] ?? 0} onChange={(e) => { const raw = e.target.value; const value = raw === "" ? 0 : Number(raw); setSkorDraft((prev) => prev.map((score, i) => i === index ? value : score)); }} aria-label={`Skor untuk ${item.nama}`} className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                              ) : <span className="font-bold text-blue-700">{skorTersimpan[index] ?? item.skor}</span>}
                              <span className="text-sm text-slate-400"> / {item.bobot}</span>
                            </div>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${item.bobot > 0 ? Math.max(0, Math.min(100, ((skorTersimpan[index] ?? item.skor) / item.bobot) * 100)) : 0}%` }} /></div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 p-3">
                      <span className="text-sm font-semibold text-slate-700">Total nilai</span>
                      <span className="text-lg font-extrabold text-blue-700">{totalNilai}/100</span>
                    </div>
                  </div>
                )}

                {[
                  ["Penilaian", hasil.penilaian, "📌"],
                  ["Kelebihan", hasil.kelebihan, "👍"],
                  ["Kekurangan", hasil.kekurangan, "🔎"],
                  ["Saran perbaikan", hasil.saran, "💡"],
                ].map(([judul, isi, ikon]) => isi && (
                  <article key={judul} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-2 flex items-center gap-2 font-bold text-slate-900"><span>{ikon}</span>{judul}</h3>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{isi}</p>
                  </article>
                ))}
                {!adaDataTerstruktur && hasil.result && <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="mb-2 font-bold">Hasil lengkap</h3><p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{hasil.result}</p></article>}
              </>
            )}
          </section>
        </div>

        {/* Riwayat */}
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-xl">🗂️</div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">Riwayat evaluasi</h2>
                <p className="mt-1 text-sm text-slate-500">Hasil yang pernah disimpan pada akun dosen ini.</p>
              </div>
            </div>
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">{riwayat.length} evaluasi</span>
          </div>

          {!authSiap ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Memeriksa status login...</p>
          ) : !userId ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="font-semibold text-slate-700">Login untuk melihat riwayat</p>
              <p className="mt-1 text-sm text-slate-500">Riwayat tersimpan terhubung ke akun dosen masing-masing.</p>
            </div>
          ) : sedangMuatRiwayat ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Memuat riwayat dari database...</p>
          ) : riwayat.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div className="mb-3 text-3xl">📚</div>
              <p className="font-semibold text-slate-700">Belum ada riwayat</p>
              <p className="mt-1 text-sm text-slate-500">Setelah evaluasi, klik “Simpan ke database” untuk menyimpan catatan.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {riwayat.map((item) => {
                const nilaiFinal = item.hasil.breakdown.length > 0 ? item.skorFinal.reduce((total, skor) => total + skor, 0) : item.hasil.nilai;
                return (
                  <article key={item.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold leading-6 text-slate-900">{item.soal.trim() ? item.soal.trim().slice(0, 100) : "Evaluasi tanpa judul"}{item.soal.trim().length > 100 ? "…" : ""}</p>
                        <p className="mt-1 text-xs text-slate-400">{new Date(item.tanggal).toLocaleString("id-ID")}</p>
                      </div>
                      <div className="shrink-0 rounded-xl bg-blue-50 px-3 py-2 text-center">
                        <p className="text-lg font-extrabold text-blue-700">{nilaiFinal}</p>
                        <p className="text-[10px] font-semibold uppercase text-blue-500">/ 100</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                      <button type="button" onClick={() => bukaEvaluasiTersimpan(item)} className="flex-1 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">Buka evaluasi</button>
                      <button type="button" onClick={() => hapusEvaluasiTersimpan(item.id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50">Hapus</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          {pesanSimpan && <p role="status" className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{pesanSimpan}</p>}
        </section>

        <footer className="py-8 text-center text-xs text-slate-400">
          EvalAI · Asisten Evaluasi Tugas Mahasiswa
        </footer>
      </div>

      <style jsx>{`
        .field {
          width: 100%;
          border: 1px solid #dbe2ea;
          border-radius: 14px;
          padding: 13px 14px;
          color: #0f172a;
          background: #f8fafc;
          outline: none;
          resize: vertical;
          font-size: 14px;
          line-height: 1.7;
          transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease;
        }
        .field::placeholder { color: #94a3b8; }
        .field:focus {
          border-color: #60a5fa;
          background: #fff;
          box-shadow: 0 0 0 3px #dbeafe;
        }
      `}</style>
    </main>
  );
}

function InputCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-base font-bold text-slate-900">
        {title}
      </h2>
      <p className="mb-4 mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
      {children}
    </section>
  );
}