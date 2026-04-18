import { motion } from "motion/react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

export function JoinSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section id="contact" className="py-20 px-6 bg-[#5B7D95] dark:bg-[#3d5a6e]">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold mb-4 tracking-tight text-white">
            {t("join.title")}
          </h2>
          <p className="text-lg mb-8 text-white/80 leading-relaxed">
            {t("join.description")}
          </p>
          <Button
            size="lg"
            className="bg-white text-[#5B7D95] hover:bg-white/90 px-8 font-semibold"
            onClick={() => navigate("/contact")}
          >
            {t("join.contactUs")}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
