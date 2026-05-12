import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { GlassButton } from "./ui/apple-tahoe-liquid-glass-button";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

export function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section id="accueil" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="images/OIBOI.png"
          alt="OIBOI"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b12]/70 via-[#070b12]/50 to-[#070b12]/85" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.1 }}
        className="relative z-10 text-center px-6 max-w-4xl"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex justify-center"
        >
          <img
            src="/images/logo.png"
            alt="Logo Tchouk'Leu"
            className="h-64 md:h-80 w-auto object-contain drop-shadow-2xl"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mb-10 text-xl md:text-2xl font-medium text-slate-300 tracking-wide"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <GlassButton
            size="lg"
            onClick={scrollToContent}
            glassColor="rgba(91,125,149,0.35)"
          >
            {t("hero.discover")}
          </GlassButton>
          <GlassButton
            size="lg"
            onClick={() => navigate("/contact")}
            glassColor="rgba(255,255,255,0.07)"
          >
            {t("hero.contactUs")}
          </GlassButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
        onClick={scrollToContent}
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className="h-8 w-8 text-white/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
