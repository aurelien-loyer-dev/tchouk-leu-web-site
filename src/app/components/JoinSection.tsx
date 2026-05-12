import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

export function JoinSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-[#5B7D95]/20 bg-gradient-to-br from-[#0d1520] via-[#0e1a27] to-[#0d1520] p-12 text-center"
        >
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#5B7D95]/15 blur-3xl rounded-full" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              {t("join.title")}
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              {t("join.description")}
            </p>
            <button
              onClick={() => navigate("/contact")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#5B7D95] hover:bg-[#4E6C83] text-white font-semibold text-base transition-all hover:scale-105 shadow-lg shadow-[#5B7D95]/25"
            >
              {t("join.contactUs")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
