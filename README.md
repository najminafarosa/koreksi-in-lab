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

```
---
## Workflow
flowchart LR
    classDef dosen fill:#2b5c8f,color:#fff,stroke:#1a365d;
    classDef mhs fill:#2e7d32,color:#fff,stroke:#1b5e20;
    classDef engine fill:#e65100,color:#fff,stroke:#bf360c;
    classDef db fill:#4a148c,color:#fff,stroke:#311b92;

    subgraph Input ["1. Pengumpulan"]
        A[Dosen: Buat Room Code]:::dosen --> B[Mhs: Input Code & Upload PDF]:::mhs
    end

    subgraph Processing ["2. n8n & AI Pipeline"]
        B --> C[(Supabase Storage)]:::db
        C --> D[n8n: Extract Text PDF]:::engine
        D --> E[Check Plagiasi Kelas]:::engine
        E --> F[Gemini API: Rubric Match]:::engine
    end

    subgraph Output ["3. Review & Approval"]
        F --> G[(Database Result)]:::db
        G --> H[Split-Screen Review]:::dosen
        H --> I[One-Click Approve / Override]:::dosen
    end

---
## Struktur
koreksi-in/
├── 📁 src/
│   ├── 📁 app/                 # Next.js App Router (Pages & API Routes)
│   │   ├── 📁 (auth)/          # Authentication pages (Dosen Login)
│   │   ├── 📁 dashboard/       # Split-Screen Review & Analytics
│   │   └── 📁 room/            # Zero-Login Student Portal
│   ├── 📁 components/          # Reusable UI Components (Shadcn UI)
│   ├── 📁 lib/                 # Supabase client & Helper utility functions
│   └── 📁 types/               # TypeScript interfaces & type definitions
├── 📁 n8n-workflows/           # Exported n8n JSON pipeline for Gemini API
├── 📁 public/                  # Static assets & brand logos
├── .env.example                # Template Environment Variables
├── README.md                   # Documentation
└── package.json



