
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Eval<span className="text-blue-400">AI</span>
        </Link>

        <span className="text-sm text-slate-400">
          Asisten Evaluasi Tugas Mahasiswa
        </span>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-32">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-300">
            Evaluasi tugas berbantuan AI
          </p>

          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            Evaluasi tugas lebih mudah dengan{" "}
            <span className="text-blue-400">EvalAI.</span>
          </h1>

          <p className="mt-6 max-w-xl leading-7 text-slate-300">
            EvalAI membantu dosen mengevaluasi jawaban mahasiswa
            berdasarkan soal dan rubrik penilaian. Mahasiswa dapat
            mengumpulkan tugas menggunakan token kelas, sementara
            dosen dapat mengelola tugas dan meninjau hasil evaluasi.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold transition hover:bg-blue-500"
            >
              Login sebagai Dosen
            </Link>

            <Link
              href="/pengumpulan"
              className="rounded-xl border border-slate-600 px-6 py-3 text-center font-semibold transition hover:bg-slate-800"
            >
              Token Tugas →
            </Link>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Praktis untuk dosen, mudah diakses mahasiswa.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">
                Platform evaluasi
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                Bagaimana EvalAI bekerja?
              </h2>
            </div>

            <div className="rounded-xl bg-blue-500/15 p-3 text-2xl">
              ✨
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                1
              </div>
              <div>
                <h3 className="font-semibold">Dosen membuat tugas</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Soal dan rubrik disiapkan untuk menjadi acuan evaluasi.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                2
              </div>
              <div>
                <h3 className="font-semibold">Mahasiswa memasukkan token</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Token kelas mengarahkan mahasiswa ke tugas yang sesuai.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                3
              </div>
              <div>
                <h3 className="font-semibold">AI membantu evaluasi</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Jawaban dianalisis berdasarkan soal dan rubrik.
                  Dosen tetap dapat meninjau hasilnya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      

<footer className="border-t border-slate-800 px-6 py-6 text-center text-sm text-slate-500">
  EvalAI - Asisten Evaluasi Tugas Mahasiswa
</footer>
    </main>
  );
}