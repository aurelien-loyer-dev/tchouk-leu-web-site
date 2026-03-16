import { motion } from "motion/react";

export function WhitesSharkPage() {
  return (
    <section className="min-h-screen pt-32 pb-20 px-6 bg-gradient-to-b from-[#DDF4FF] to-background dark:from-[#1a3a4a] dark:to-background">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-[#4C93C3]/20 bg-background/80 p-10 md:p-14"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">White Sharks</h1>
          <p className="text-xl text-muted-foreground">Still working... cette page est en cours de préparation.</p>
          <p className="mt-3 text-muted-foreground">Je vais continuer le travail sur une autre branche.</p>
        </motion.div>
      </div>
    </section>
  );
}