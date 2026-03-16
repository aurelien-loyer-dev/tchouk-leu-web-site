import { motion } from "motion/react";

export function WhitesSharkPage() {
  return (
    <section className="min-h-screen pt-32 pb-20 px-6 bg-gradient-to-b from-violet-900 via-violet-800 to-violet-950 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-white/20 bg-white/10 p-10 md:p-14 backdrop-blur-sm"
        >
          <img
            src="/images/WhiteSharksLogo.jpg"
            alt="Logo White Sharks"
            className="h-20 w-auto mx-auto mb-6 rounded-md"
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">White Sharks</h1>
          <p className="text-xl text-white/90">Still working... cette page est en cours de préparation.</p>
          <p className="mt-3 text-white/80">Nouvelle direction artistique violet / blanc en préparation.</p>
        </motion.div>
      </div>
    </section>
  );
}