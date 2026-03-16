import { motion } from "motion/react";

export function WhitesSharkPage() {
  return (
    <section className="min-h-screen pt-32 pb-20 px-6 bg-gradient-to-b from-violet-200/70 via-violet-50/60 to-background dark:from-violet-950/35 dark:via-background dark:to-background text-foreground">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-violet-300/90 dark:border-violet-400/30 bg-violet-50/70 dark:bg-background/70 p-10 md:p-14 backdrop-blur-sm"
        >
          <img
            src="/images/WhiteSharksLogo.png"
            alt="Logo White Sharks"
            className="h-20 w-auto mx-auto mb-6 rounded-md"
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-violet-900 dark:text-foreground">White Sharks</h1>
          <p className="text-xl text-muted-foreground">Still working...</p>
        </motion.div>
      </div>
    </section>
  );
}