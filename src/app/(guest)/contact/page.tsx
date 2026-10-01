"use client";

import React, { useState } from "react";
import { Mail, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { ScrollReveal, ScrollRevealItem } from "@/components/ui/scroll-reveal";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Gagal mengirim pesan.");
        }

        setSubmitted(true);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <ScrollReveal direction="up" distance={25} className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-navy-900">Hubungi Kami</h1>
        <p className="text-neutral-600 text-sm">
          Punya pertanyaan atau butuh bantuan teknis? Tim kami siap membantu kamu.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <ScrollRevealItem delay={0.1}>
          <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6 h-full">
            <h2 className="text-lg font-bold text-navy-900">Kirim Pesan</h2>

            {submitted ? (
              <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                <h3 className="font-bold text-green-900 text-sm">Pesan Berhasil Dikirim!</h3>
                <p className="text-xs text-green-700">
                  Terima kasih. Tim support kami akan membalas ke email kamu secepatnya.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-navy-900">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama kamu"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-navy-900">Alamat Email</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-navy-900">Pesan / Pertanyaan</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tuliskan kendala atau pertanyaanmu di sini..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  ></textarea>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-navy-800 hover:bg-navy-900 disabled:opacity-70 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow transition-all hover:-translate-y-0.5"
                >
                  <Send className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
                  <span>{loading ? "Mengirim..." : "Kirim Pesan"}</span>
                </button>
              </form>
            )}
          </div>
        </ScrollRevealItem>

        {/* Direct Channel Info */}
        <ScrollRevealItem delay={0.25}>
          <div className="space-y-6 h-full">
            <div className="p-6 bg-blue-100/40 border border-blue-200/60 rounded-2xl space-y-4 h-full">
              <h2 className="text-lg font-bold text-navy-900">Saluran Komunitas</h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Bergabung dengan komunitas mahasiswa & developer kami untuk diskusi, tanya-jawab cepat, dan tips seputar deployment.
              </p>

              <div className="space-y-3 pt-2">
                <a
                  href="https://wa.me/6289515954530"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:border-green-400 hover:-translate-y-0.5 transition-all shadow-sm"
                >
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-navy-900">WhatsApp CS</h3>
                    <p className="text-[11px] text-neutral-500">+62 895 1595 4530</p>
                  </div>
                </a>

                <a
                  href="mailto:rupacloudarim@gmail.com"
                  className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:border-blue-400 hover:-translate-y-0.5 transition-all shadow-sm"
                >
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-navy-900">Email Direct Support</h3>
                    <p className="text-[11px] text-neutral-500">rupacloudarim@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </ScrollRevealItem>
      </div>
    </div>
  );
}
