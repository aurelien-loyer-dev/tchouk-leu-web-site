import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router";

export function Hero() {
  const navigate = useNavigate();

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <section id="accueil" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="images/OIBOI.png"
          alt="OIBOI"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F6FBFF]/72 via-[#DDF4FF]/38 to-background/72 dark:from-[#0f1d2a]/55 dark:via-[#102733]/35 dark:to-background/80" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative z-10 text-center px-6 max-w-4xl"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex justify-center"
        >
          <img src="/images/logo.png" alt="Logo Tchouk'Leu" className="h-72 md:h-88 w-auto object-contain" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-3 text-2xl md:text-3xl font-semibold text-[#0F172A] dark:text-white"
        >
          Tchoukball Club – Saint-Leu, Réunion
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="bg-[#0F172A] hover:bg-[#1e293b] text-white px-8 py-6 text-lg"
            onClick={scrollToContent}
          >
            Découvrir le club
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-[#0F172A] bg-[#F6FBFF]/80 text-[#0F172A] backdrop-blur-sm hover:bg-[#DDF4FF] px-8 py-6 text-lg dark:border-white/70 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            onClick={() => navigate("/contact")}
          >
            Nous contacter
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
        onClick={scrollToContent}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-10 w-10 text-[#0F172A] dark:text-white" />
        </motion.div>
      </motion.div>
    </section>
  );
}