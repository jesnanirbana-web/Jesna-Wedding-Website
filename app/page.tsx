"use client"

import { useState } from "react"
import { OrderExperience } from "@/components/order-experience"

export default function Page() {
  const [isSuccess, setIsSuccess] = useState(false)

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#2c2c2c] scroll-smooth">
      
      {/* ==========================================
          HEADER / NAVIGASI UTAMA
          (Disembunyikan saat di halaman sukses pemesanan)
          ========================================== */}
      {!isSuccess && (
        <header className="relative z-40 border-b border-stone-200/60 bg-[#faf7f2]/95 px-4 pb-4 pt-4 md:sticky md:top-0 md:z-50 md:backdrop-blur-md md:px-12 md:py-5">
          <div className="mx-auto max-w-6xl md:flex md:items-center md:justify-between">
            <div className="flex items-center justify-between md:block">
              <span className="font-serif text-sm tracking-[0.25em] uppercase text-stone-900 font-normal">
                Jesna Wedding
              </span>
            </div>

            <nav className="mt-4 flex flex-col gap-2 md:mt-0 md:flex md:flex-row md:items-center md:gap-8">
              <a href="#katalog" className="flex items-center justify-start border-b border-stone-200/80 px-2 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-stone-700 transition-colors duration-200 hover:border-stone-900 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf7f2] md:justify-center md:border-b md:border-transparent md:px-0 md:py-1 md:text-xs md:focus-visible:ring-offset-0">
                Katalog
              </a>
              <a href="#panduan" className="flex items-center justify-start border-b border-stone-200/80 px-2 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-stone-700 transition-colors duration-200 hover:border-stone-900 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf7f2] md:justify-center md:border-b md:border-transparent md:px-0 md:py-1 md:text-xs md:focus-visible:ring-offset-0">
                Panduan & FAQ
              </a>
              <a href="#whatsapp" className="flex items-center justify-start border-b border-stone-200/80 px-2 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-stone-700 transition-colors duration-200 hover:border-stone-900 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf7f2] md:justify-center md:border-b md:border-transparent md:px-0 md:py-1 md:text-xs md:focus-visible:ring-offset-0">
                Konsultasi
              </a>
              <a href="#pesan" className="flex items-center justify-start border-b border-stone-200/80 px-2 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-stone-700 transition-colors duration-200 hover:border-stone-900 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf7f2] md:justify-center md:border-b md:border-transparent md:px-0 md:py-1 md:text-xs md:focus-visible:ring-offset-0">
                Pemesanan
              </a>
            </nav>

            <div className="hidden md:block">
              <a 
                href="#whatsapp" 
                className="text-xs uppercase tracking-[0.2em] px-5 py-2.5 bg-stone-900 text-stone-100 hover:bg-stone-800 transition-all duration-300 font-light"
              >
                Hubungi Kami
              </a>
            </div>
          </div>
        </header>
      )}

      {/* 1. Katalog & Form Pemesanan / Layar Sukses */}
      <div id="katalog" className={isSuccess ? "" : "scroll-mt-28"}>
        <div id="pesan" className={isSuccess ? "" : "pt-2 scroll-mt-28 [&>div>div:first-child]:hidden [&>div>div:last-child]:hidden"}>
          <OrderExperience onConfirmationChange={setIsSuccess} />
        </div>
      </div>

      {/* ==========================================
          INFORMASI SOP, FAQ, KONSULTASI & FOOTER
          (Disembunyikan saat di halaman sukses pemesanan)
          ========================================== */}
      {!isSuccess && (
        <>
          {/* 2. SOP & FAQ (Panduan) */}
          <div id="panduan">
            <SopAndFaqSection />
          </div>

          {/* 3. Tombol Konsultasi WhatsApp */}
          <div id="whatsapp">
            <WhatsAppConsultationCTA />
          </div>

          {/* 4. Footer */}
          <footer className="py-16 bg-[#faf7f2] border-t border-stone-200 text-center">
            <div className="max-w-md mx-auto space-y-3">
              <p className="text-xs font-serif tracking-[0.3em] text-stone-800 uppercase">Jesna Wedding Atelier</p>
              <p className="text-[11px] text-stone-600 tracking-wider font-light">
                Melayani wilayah Sidoarjo dan sekitarnya
              </p>
              <div className="w-6 h-[1px] bg-stone-300 mx-auto"></div>
              <p className="text-[10px] text-stone-400 tracking-[0.25em] uppercase">Quiet Luxury • Est. Sidoarjo 2022</p>
            </div>
          </footer>
        </>
      )}
    </main>
  )
}

// ==========================================
// KOMPONEN GABUNGAN: SOP & FAQ
// ==========================================
function SopAndFaqSection() {
  const sopSteps = [
    {
      step: "01",
      title: "Konsultasi & Pemilihan Paket",
      desc: "Diskusikan konsep pernikahanmu atau pilih langsung paket eksklusif (Seserahan, Mahar, Buket, Ringbox) melalui website."
    },
    {
      step: "02",
      title: "Konfirmasi & Catatan Desain",
      desc: "Setelah detail disetujui, kami mencatat pesananmu secara teliti untuk masuk ke tahap kurasi material pilihan."
    },
    {
      step: "03",
      title: "Proses Pengerjaan & Preview",
      desc: "Pengerjaan artistik dilakukan dengan presisi tinggi. Kami mengirimkan preview hasil jadi untuk kepastianmu."
    },
    {
      step: "04",
      title: "Pengambilan & Ketenangan",
      desc: "Barang siap diserahterimakan dengan prosedur yang ramah, aman, dan transparan demi kenyamanan sempurna."
    }
  ];

  const faqs = [
    {
      question: "Di mana lokasi atelier Jesna Wedding?",
      answer: "Atelier kami berpusat di Sidoarjo, Jawa Timur. Saat ini kami secara khusus melayani pemesanan untuk wilayah Sidoarjo, Surabaya, dan area sekitarnya guna memastikan keamanan pengiriman fisik."
    },
    {
      question: "Apakah bisa memesan dari luar Jawa Timur?",
      answer: "Mengingat produk kami berupa karya seni fisik (seserahan, mahar, hantaran) yang rentan jika dikirim jarak jauh Antar-Provinsi, saat ini kami hanya melayani pengiriman lokal demi menjaga kualitas barang tiba dengan sempurna."
    },
    {
      question: "Bagaimana cara melakukan pemesanan di Jesna Wedding?",
      answer: "Kamu dapat mengeksplorasi pilihan paket yang tersedia atau langsung terhubung dengan konsultan kami via WhatsApp untuk rancangan personal."
    },
    {
      question: "Apakah bisa melakukan kustomisasi desain?",
      answer: "Tentu. Setiap karya dapat disesuaikan sepenuhnya (custom) dengan palet warna, tema dekorasi, dan estetika impianmu."
    }
  ];

  return (
    <section className="py-24 px-6 bg-white border-t border-stone-200/60">
      <div className="max-w-4xl mx-auto space-y-20">
        
        <div>
          <div className="text-center space-y-2 mb-14">
            <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400">Prosedur Layanan</p>
            <h2 className="text-3xl font-serif tracking-wide text-stone-900">SOP & Alur Pemesanan</h2>
            <div className="w-8 h-[1px] bg-stone-300 mx-auto mt-4"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {sopSteps.map((item, index) => (
              <div key={index} className="p-8 rounded-none bg-[#faf7f2]/60 border border-stone-200/60 transition hover:border-stone-400">
                <span className="text-xl font-serif text-stone-400 font-light block mb-3">{item.step}</span>
                <h3 className="font-serif text-lg mb-2 text-stone-900">{item.title}</h3>
                <p className="text-stone-600 text-sm text-justify leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#faf7f2]/80 p-8 md:p-10 border border-stone-200/60 space-y-4">
            <h3 className="font-serif text-lg text-stone-900">Kenyamanan & Keamanan Bersama</h3>
            <p className="text-stone-600 text-sm text-justify leading-relaxed font-light">
              Demi ketenangan dan kenyamanan klien, kami menerapkan standar pelayanan yang bersahabat. Untuk peminjaman wadah atau properti fisik (seperti baki hantaran), kami menggunakan sistem pencatatan identitas yang ringan serta deposit jaminan berupa ktp dan uang sebesar Rp.100.000 yang sifatnya <em>fully refundable</em> (dikembalikan 100% utuh tanpa potongan saat barang kembali dalam kondisi aman).
            </p>
            <p className="text-stone-600 text-sm text-justify leading-relaxed font-light">
              Jika terjadi kendala di luar dugaan, mari kita diskusikan dengan baik-baik karena kepuasan dan rasa tenangmu adalah prioritas utama kami.
            </p>
          </div>
        </div>

        <div className="border-t border-stone-200/60 pt-20">
          <div className="text-center space-y-2 mb-14">
            <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400">Informasi Umum</p>
            <h2 className="text-3xl font-serif tracking-wide text-stone-900">Pertanyaan yang Sering Diajukan</h2>
            <div className="w-8 h-[1px] bg-stone-300 mx-auto mt-4"></div>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-[#faf7f2]/60 p-8 border border-stone-200/60">
                <h3 className="font-serif text-base mb-2 text-stone-900">{faq.question}</h3>
                <p className="text-stone-600 text-sm text-justify leading-relaxed font-light">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// ==========================================
// KOMPONEN: WHATSAPP CTA
// ==========================================
function WhatsAppConsultationCTA() {
  const phoneNumber = "6285645492105"; 
  const message = encodeURIComponent("Halo Jesna Wedding, saya dari Sidoarjo/Surabaya ingin berkonsultasi mengenai kebutuhan pernikahan saya.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <section className="py-24 bg-stone-900 text-stone-100 text-center px-6">
      <div className="max-w-xl mx-auto space-y-6">
        <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400">Personal Assistance</p>
        <h3 className="text-3xl font-serif tracking-wide">Konsultasikan Konsep Pernikahanmu</h3>
        <p className="text-stone-400 text-xs font-light leading-relaxed max-w-md mx-auto">
          Khusus melayani wilayah Sidoarjo dan sekitarnya. Mari berdiskusi secara personal dengan tim kami.
        </p>
        <div className="pt-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-stone-100 text-stone-900 hover:bg-white transition-all duration-300 text-xs uppercase tracking-[0.2em] font-medium"
          >
            <span>Mulai Konsultasi WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}