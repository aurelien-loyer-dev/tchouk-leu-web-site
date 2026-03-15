import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router";

export function JoinSection() {
  const navigate = useNavigate();

  return (
    <section id="contact" className="py-24 px-6 bg-[#BFE6FF] dark:bg-[#4C93C3]/20">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-bold mb-6 text-[#1F2A37] dark:text-white">
            Envie d'essayer le tchoukball ?
          </h2>
          <p className="text-xl mb-10 text-[#1F2A37]/80 dark:text-white/80">
            Contactez notre équipe et découvrez un sport dynamique, convivial et respectueux.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#4C93C3] hover:bg-[#3a7ba8] text-white px-8 py-6 text-lg"
              onClick={() => navigate("/contact")}
            >
              <Mail className="mr-2 h-5 w-5" />
              Nous contacter
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}