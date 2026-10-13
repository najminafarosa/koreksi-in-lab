<div align="center">

  # 📝 Koreksi.in
  ### *Smart AI-Powered Grading Assistant with Zero-Login Room Code Architecture*

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![n8n](https://img.shields.io/badge/n8n-Workflow%20Automation-FF6D5A?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n.io/)
  [![Gemini API](https://img.shields.io/badge/Google%20Gemini-1.5%20Flash-8E75B2?style=for-the-badge&logo=googlecloud&logoColor=white)](https://ai.google.dev/)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

  <p align="center">
    <b>Koreksi.in</b> memangkas waktu pengoreksian tugas esai hingga <b>80%</b> melalui otomatisasi AI, deteksi plagiarisme internal kelas, dan portal pengumpulan tugas instan berbasis <b>Room Code</b> tanpa ribet registrasi.
    <br />
    <br />
    <a href="#-fitur-utama"><strong>Jelajahi Fitur »</strong></a>
    ·
    <a href="#-arsitektur--workflow"><strong>Alur Kerja »</strong></a>
    ·
    <a href="#-instalasi--pengembangan"><strong>Panduan Setup »</strong></a>
  </p>

</div>

---

## 📌 Latar Belakang & Masalah

Pengajar sering kali menghabiskan waktu bertumpuk-tumpuk jam hanya untuk memeriksa tugas esai secara manual. Di sisi lain, maraknya tindakan *copy-paste* antar-mahasiswa (*intra-class plagiarism*) serta penggunaan AI generasi tanpa batas menjadi tantangan besar dalam menjaga integritas akademik. 

**Koreksi.in** hadir sebagai **AI Co-Pilot** untuk pengajar—bukan menggantikan peran pendidik, melainkan mengotomatisasi pra-pemeriksaan, menyajikan draf penilaian berbasis rubrik, serta memetakan *insight* pemahaman kelas secara real-time.

---

## 🚀 Fitur Utama

| Fitur | Deskripsi | Sisi Pengguna |
| :--- | :--- | :---: |
| 🔑 **Zero-Login Gateway** | Mahasiswa mengumpulkan tugas PDF hanya dengan **Room Code** & NIM tanpa perlu registrasi/login akun. | Mahasiswa |
| 📑 **Intra-Class Plagiarism Detection** | Membandingkan kemiripan teks antar-seluruh tugas yang diunggah dalam satu *room code* yang sama. | System / AI |
| 🤖 **AI Rubric Scoring** | Evaluasi esai otomatis berbasis rubrik dengan model `gemini-1.5-flash` melalui orchestrator **n8n**. | System / AI |
| 🖥️ **Split-Screen Dashboard** | Antarmuka khusus pengajar: PDF di sisi kiri dan draf evaluasi AI di sisi kanan untuk *One-Click Approval*. | Dosen / Guru |
| 📊 **Class Learning Analytics** | Diagram pemetaan otomatis untuk melihat topik materi yang paling belum dipahami oleh seluruh kelas. | Dosen / Guru |

---

## 🛠️ Tech Stack & Infrastruktur

```text
 ┌────────────────┐       ┌────────────────┐       ┌────────────────┐
 │  Next.js 14    │ ────► │    Supabase    │ ────► │  n8n Engine    │
 │ (Frontend App) │       │ (DB & Storage) │       │ (VPS + Tunnel) │
 └────────────────┘       └────────────────┘       └───────┬────────┘
                                                           │
                                                           ▼
                                                   ┌────────────────┐
                                                   │   Gemini API   │
                                                   │  (AI Scoring)  │
                                                   └────────────────┘# koreksi-in-lab


