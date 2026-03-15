import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function IslandSection() {
  return (
    <section className="py-24 px-6 bg-[#DDF4FF] dark:bg-[#1a3a4a] relative overflow-hidden">
      {/* Bird Silhouette Decoration */}
      <div className="absolute top-20 right-20 opacity-10 dark:opacity-5">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1763688506457-325a5103e3c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHRyb3BpY2FsJTIwYmlyZCUyMGZseWluZ3xlbnwxfHx8fDE3NzM1NTc5NDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Paille-en-queue"
          className="w-64 h-64 object-contain"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-[#1F2A37] dark:text-white">Notre île</h2>
          <p className="text-xl max-w-3xl mx-auto text-[#1F2A37]/80 dark:text-white/80 leading-relaxed">
            "Enraciné à Saint-Leu, TchoukLeu reflète l'énergie de l'île de la Réunion — 
            l'océan, le vent et la liberté de mouvement."
          </p>
        </motion.div>

        {/* Image Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl shadow-xl"
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1555979864-7a8f9b4fddf8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGNvYXN0bGluZSUyMHR1cnF1b2lzZSUyMHdhdGVyfGVufDF8fHx8MTc3MzU1Nzk0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Côte de Saint-Leu"
              className="w-full h-80 object-cover hover:scale-110 transition-transform duration-700"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl shadow-xl"
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1701785923773-1c6bc3d5ca80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwb2NlYW4lMjBob3Jpem9uJTIwc3Vuc2V0fGVufDF8fHx8MTc3MzU1Nzk0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Plage de Saint-Leu"
              className="w-full h-80 object-cover hover:scale-110 transition-transform duration-700"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
