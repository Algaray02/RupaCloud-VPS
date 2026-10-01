import React from "react";
import { StickyScrollReveal } from "@/components/ui/sticky-scroll-reveal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useLanguage } from "@/lib/i18n/language-context";

export const CloudValuesSection = () => {
  const { t } = useLanguage();

  const values = [
    {
      id: "cost",
      letter: "C",
      title: t("Cost-Friendly", "Cost-Friendly"),
      description: t(
        "Harga ramah untuk semua kalangan dan cocok untuk kebutuhan jangka pendek.",
        "Budget-friendly pricing for everyone, perfectly suited for short-term needs."
      ),
    },
    {
      id: "learning",
      letter: "L",
      title: t("Learning-Oriented", "Learning-Oriented"),
      description: t(
        "Mendukung pengguna belajar cloud, server, deployment, dan DevOps dasar.",
        "Supports users in learning cloud, servers, deployment, and basic DevOps."
      ),
    },
    {
      id: "ondemand",
      letter: "O",
      title: t("On-Demand", "On-Demand"),
      description: t(
        "VPS bisa disewa harian atau mingguan sesuai kebutuhan, tanpa kontrak bulanan.",
        "Rent VPS daily or weekly as needed, with no monthly contracts."
      ),
    },
    {
      id: "userfriendly",
      letter: "U",
      title: t("User-Friendly", "User-Friendly"),
      description: t(
        "Proses order, setup, dan penggunaan dibuat mudah untuk pemula.",
        "The ordering, setup, and usage process is made simple for beginners."
      ),
    },
    {
      id: "deployment",
      letter: "D",
      title: t("Deployment-Ready", "Deployment-Ready"),
      description: t(
        "Server siap pakai dengan pilihan environment seperti Node.js, Python, atau LAMP.",
        "Ready-to-use servers with environment choices like Node.js, Python, or LAMP."
      ),
    },
  ];

  return (
    <section className="bg-blue-50 relative">
      <StickyScrollReveal 
        content={values} 
        title={
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-navy-900">
              {t("Nilai Inti Kami", "Our Core Values")}
            </h2>
            <p className="text-navy-800 max-w-xl mx-auto text-sm sm:text-base">
              {t(
                "Lima prinsip yang membentuk fondasi platform RuPa Cloud.",
                "The five principles that form the foundation of the RuPa Cloud platform."
              )}
            </p>
          </div>
        }
      />
    </section>
  );
};
